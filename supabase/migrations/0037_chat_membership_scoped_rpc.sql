-- ---------------------------------------------------------------------------
-- 0037 Scoped conversation_members insertion via SECURITY DEFINER RPC
-- ---------------------------------------------------------------------------
-- WHY:
--   0034's conversation_members_insert policy was:
--
--     with check ( user_id = auth.uid()
--                  or exists(select 1 from conversations c
--                            where c.id = conversation_id
--                              and c.creator_id = auth.uid()) )
--
--   When startConversation inserts [creator, target] in a single call, the
--   target row fails: `user_id = auth.uid()` is false, and the exists() arm
--   must read `conversations` through its own RLS (conversations_read). At the
--   very first insert there are no conversation_members rows yet, so the read
--   policy cannot admit the caller -> the subquery returns no row -> 403
--   "new row violates row-level security policy".
--
-- FIX:
--   Route the two-party membership creation through a SECURITY DEFINER RPC
--   (same pattern as 0035's is_user_conversation_member / 0036's directory
--   helpers). Inside the function the membership INSERT is not gated by the
--   table's own INSERT policy, but the function re-establishes the exact
--   scope in PL/pgSQL where it is provable:
--     * the caller MUST be the conversation's creator,
--     * the conversation must still be a 'direct' thread,
--     * total direct members may never exceed 2.
--   Arbitrary client-side member insertion is disallowed (policy is now
--   `with check (false)`); membership is only creatable via this RPC.
-- ---------------------------------------------------------------------------

-- Block direct client INSERTs into conversation_members entirely.
drop policy if exists conversation_members_insert on public.conversation_members;
create policy conversation_members_insert
  on public.conversation_members
  for insert to authenticated
  with check (false);

create or replace function public.add_conversation_members(
  p_conversation_id uuid,
  p_member_user_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator_id uuid;
  v_type text;
  v_existing_count int;
  v_to_add int;
  v_added int;
begin
  select creator_id, conversation_type
    into v_creator_id, v_type
    from public.conversations
   where id = p_conversation_id;

  if v_creator_id is null then
    return jsonb_build_object('ok', false, 'error', 'CONVERSATION_NOT_FOUND', 'added', 0);
  end if;
  if v_creator_id <> public.current_profile_id() then
    return jsonb_build_object('ok', false, 'error', 'NOT_CREATOR', 'added', 0);
  end if;
  if v_type <> 'direct' then
    return jsonb_build_object('ok', false, 'error', 'NOT_DIRECT', 'added', 0);
  end if;

  select count(*)
    into v_existing_count
    from public.conversation_members
   where conversation_id = p_conversation_id
     and left_at is null;

  v_to_add := array_length(coalesce(p_member_user_ids, '{}'::uuid[]), 1);
  if coalesce(v_to_add, 0) = 0 then
    return jsonb_build_object('ok', false, 'error', 'NO_MEMBERS', 'added', 0);
  end if;
  if v_existing_count + v_to_add > 2 then
    return jsonb_build_object('ok', false, 'error', 'DIRECT_LIMIT_EXCEEDED', 'added', 0);
  end if;

  insert into public.conversation_members (conversation_id, user_id)
  select p_conversation_id, u
    from unnest(coalesce(p_member_user_ids, '{}'::uuid[])) as u
  on conflict (conversation_id, user_id) do nothing;
  get diagnostics v_added = row_count;

  return jsonb_build_object('ok', true, 'error', null, 'added', v_added);
end;
$$;

revoke all on function public.add_conversation_members(uuid, uuid[]) from public;
grant execute on function public.add_conversation_members(uuid, uuid[]) to authenticated;