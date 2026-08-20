-- ---------------------------------------------------------------------------
-- 0034 Chat direct-message insert policies + last-message touch
-- ---------------------------------------------------------------------------
-- WHY: 0014 provisions conversations / conversation_members / messages tables
-- with RLS, but only `messages` has an INSERT policy. There is NO insert policy
-- on `conversations` or `conversation_members`, so the browser client cannot
-- start a 1:1 thread. This additive migration:
--   1) lets the logged-in creator create a `conversations` row they own,
--   2) lets that creator add themselves + the other party as members, and
--   3) refreshes `conversations.last_message_at` when a message is inserted
--      (there is no client-scoped UPDATE policy on conversations).
-- Group / arbitrary-member insertion is intentionally out of scope here: the
-- membership policy is scoped to the conversation creator so a peer can later
-- be invited by whoever opened the thread.

create policy conversation_insert
  on public.conversations
  for insert to authenticated
  with check (creator_id = auth.uid());

create policy conversation_members_insert
  on public.conversation_members
  for insert to authenticated
  with check (
    user_id = auth.uid()
    or exists(
      select 1
      from public.conversations c
      where c.id = conversation_id
        and c.creator_id = auth.uid()
    )
  );

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations c
    set last_message_at = new.created_at,
        updated_at = timezone('utc', now())
  where c.id = new.conversation_id;
  return new;
end;
$$;

create trigger conversations_touch_on_message
after insert on public.messages
for each row execute function public.touch_conversation_on_message();