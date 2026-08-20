-- ---------------------------------------------------------------------------
-- 0039 Chat: prune orphaned/duplicate direct conversations + hygiene RPC
-- ---------------------------------------------------------------------------
-- WHY:
--   The dev/demo DB contained direct `conversations` rows with ZERO
--   conversation_members rows -- leftovers from failed pre-0037 attempts
--   (the bulk membership INSERT was atomic, so a 403 aborted it entirely
--   and no member row landed). It also contained one duplicate 1:1 thread
--   (same active member pair) created by the demo seed. Neither condition is
--   visible in the chat list (listConversations derives ids from memberships),
--   but the empty rows pollute `conversations` and a duplicate pair can make
--   each side land on a different thread.
--
--   This migration:
--     1) deletes orphaned direct conversations (no members, no messages),
--     2) collapses duplicate direct threads by moving their messages onto a
--        single canonical conversation, then deleting the superseded row,
--     3) exposes a SECURITY DEFINER RPC so the app can prune the caller's own
--        empty threads at runtime (same pattern as 0035/0036/0037).
--   All steps are idempotent and safe to re-run.
-- ---------------------------------------------------------------------------

-- 1) Prune orphaned direct conversations (no members, no messages).
delete from public.conversations c
where c.conversation_type = 'direct'
  and not exists (select 1 from public.conversation_members m where m.conversation_id = c.id)
  and not exists (select 1 from public.messages m where m.conversation_id = c.id);

-- 2) Collapse duplicate 1:1 threads that share the same active member pair.
--    Message rows move to the canonical conversation (the lexicographically
--    smallest conversation id); message_attachments / message_receipts follow
--    their message rows by id, so no further re-pointing is needed.
do $$
declare
  rec record;
  pair_key text;
  keep_id uuid;
  dup_id uuid;
begin
  for rec in
    with two_member as (
      select cm.conversation_id,
             string_agg(cm.user_id::text, ',' order by cm.user_id::text) as pair
      from public.conversation_members cm
      where cm.left_at is null
      group by cm.conversation_id
      having count(*) = 2
    )
    select pair, min(conversation_id::text)::uuid as keep_id
    from two_member
    group by pair
    having count(*) > 1
  loop
    pair_key := rec.pair;
    keep_id := rec.keep_id;
    for dup_id in
      select cm.conversation_id
      from public.conversation_members cm
      where cm.left_at is null
        and cm.conversation_id <> keep_id
        and (
          select string_agg(m.user_id::text, ',' order by m.user_id::text)
          from public.conversation_members m
          where m.conversation_id = cm.conversation_id
            and m.left_at is null
        ) = pair_key
    loop
      update public.messages
         set conversation_id = keep_id
       where conversation_id = dup_id;
      -- Deleting the superseded conversation cascades its conversation_members.
      delete from public.conversations where id = dup_id;
    end loop;
  end loop;
end;
$$;

-- 3) Runtime hygiene: delete the caller's own empty direct threads.
create or replace function public.prune_empty_direct_conversations()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int := 0;
begin
  delete from public.conversations c
   where c.conversation_type = 'direct'
     and c.creator_id = public.current_profile_id()
     and not exists (select 1 from public.conversation_members m where m.conversation_id = c.id)
     and not exists (select 1 from public.messages m where m.conversation_id = c.id);
  get diagnostics v_deleted = row_count;
  return jsonb_build_object('ok', true, 'deleted', v_deleted, 'error', null);
end;
$$;

revoke all on function public.prune_empty_direct_conversations() from public;
grant execute on function public.prune_empty_direct_conversations() to authenticated;