-- ---------------------------------------------------------------------------
-- 0035 Fix chat membership RLS infinite recursion
-- ---------------------------------------------------------------------------
-- WHY:
--   0014 added SELECT policies on conversations / conversation_members /
--   messages that verify membership via direct subqueries into
--   conversation_members. critically, members_read referenced the very table
--   it protects:
--
--     members_read (on conversation_members, for select):
--       using ( exists(
--         select 1 from public.conversation_members m
--         where m.conversation_id = conversation_id
--           and m.user_id = auth.uid()
--       ) )
--
--   When the RLS engine evaluates that USING it re-enters conversation_members'
--   SELECT policy, which references conversation_members again => infinite
--   recursion (42P17: "infinite recursion detected in policy"). PostgREST hit
--   it on POST /rest/v1/conversations: the insert passes its sole check
--   (conversation_insert: creator_id = auth.uid()), but PostgREST's
--   .select('id') forces INSERT ... RETURNING, and returned rows are subject to
--   the SELECT policy conversations_read, whose member-subquery routes through
--   members_read -> self-recursion. conversations_read / messages_read /
--   messages_insert all funnel through conversation_members the same way, so
--   any client read of conversation_members (listConversations,
--   findDirectConversationId, loadPartner) would hit the same error.
--
-- FIX (same pattern already used in 0020 / 0022 for the profiles cycle):
--   route every membership check through a single SECURITY DEFINER helper
--   is_user_conversation_member(). SECURITY DEFINER executes the inner query as
--   the function owner (the migration role, unaffected by RLS), so the
--   membership scan does NOT re-trigger members_read. Each policy is reduced to
--   one scalar function call instead of a self/quasi-referential subquery, so
--   the RLS evaluation graph becomes a finite two-step chain
--   (policy -> helper -> query) with no cycle. Search path is locked to public
--   and execute is granted only to authenticated.
--
--   NOTE on conversations_read: we also allow the CREATOR to see a conversation
--   they just created (creator_id = auth.uid()). startConversation inserts the
--   conversation first and adds the two members in a *separate* request, so at
--   the instant of the conversation INSERT no member rows exist yet. Without
--   this clause the RETURNING id would be suppressed by the membership check
--   and the thread could never be created. The creator is also who 0034 allows
--   to create, so this grants no new authority -- only visibility of one's own
--   empty thread before members are inserted.
-- ---------------------------------------------------------------------------

create or replace function public.is_user_conversation_member(
  target_conversation_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.conversation_members m
    where m.conversation_id = target_conversation_id
      and m.user_id = target_user_id
      and m.left_at is null
  )
$$;

revoke all on function public.is_user_conversation_member(uuid, uuid) from public;
grant execute on function public.is_user_conversation_member(uuid, uuid) to authenticated;

-- conversations: allow participants OR the creator (see NOTE above).
drop policy if exists conversations_read on public.conversations;
create policy conversations_read
on public.conversations
for select
to authenticated
using (
  public.is_user_conversation_member(id, auth.uid())
  or creator_id = auth.uid()
);

-- conversation_members: break the self-reference (the root cause of 42P17).
drop policy if exists members_read on public.conversation_members;
create policy members_read
on public.conversation_members
for select
to authenticated
using (public.is_user_conversation_member(conversation_id, auth.uid()));

-- messages: re-route the same membership subquery through the helper.
drop policy if exists messages_read on public.messages;
create policy messages_read
on public.messages
for select
to authenticated
using (public.is_user_conversation_member(messages.conversation_id, auth.uid()));

drop policy if exists messages_insert on public.messages;
create policy messages_insert
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and public.is_user_conversation_member(messages.conversation_id, auth.uid())
);
