alter publication supabase_realtime add table public.notifications, public.conversations, public.conversation_members, public.messages, public.message_receipts, public.event_registrations;
revoke all on function public.has_permission(text,uuid), public.has_feature(text,uuid) from public;
grant execute on function public.has_permission(text,uuid), public.has_feature(text,uuid) to authenticated;
