-- Allow buyers to manage the lifecycle of their own orders (draft -> placed, cancellations).
-- The original 0013 schema only granted read + order insert; order transitions and event
-- logging were impossible under RLS without these policies.
create policy orders_buyer_update on public.food_orders for update to authenticated
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());

-- Let buyers record status events on their own orders (e.g. placed, cancelled).
create policy order_events_buyer_insert on public.food_order_events for insert to authenticated
  with check (exists (
    select 1 from public.food_orders o where o.id = order_id and o.buyer_id = auth.uid()
  ));

-- Publish order changes over realtime so buyers stay in sync across devices.
alter publication supabase_realtime add table public.food_orders;
