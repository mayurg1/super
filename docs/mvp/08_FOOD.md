# 08 — Food

## Flow
Buyer selects vendor → browses menu (categories + items) → adds to cart → checks out with a
delivery location → order placed (draft→placed, price/title snapshots) → order history / cancel;
realtime refresh on the buyer's orders.

## UI
`FoodPage` (heading) → `VendorChangeConfirm`, `VendorPicker`, `<MenuList>`, `<CartPanel>`,
`OrderHistory`. Components: `MenuItemCard`, `CartPanel`, `VendorPicker`, `VendorChangeConfirm`,
`OrderHistory`; hooks `useFoodVendors`, `useFoodMenu`, `useFoodCart`, `useFoodOrders`.

## APIs (`createFoodService`, `packages/supabase/src/food.ts`)
`getVendors(campusId)`, `getMenu(vendorId)`, `getOrders(buyerId)`, `placeOrder(input)` (draft→placed +
`food_order_items` snapshots + `food_order_events`), `cancelOrder`.

## Database
`food_vendors` (manager_id, status), `food_menu_categories` (position, is_active),
`food_menu_items` (price, currency, media_asset_id, is_available), `food_orders` (order_status
draft/placed/confirmed/preparing/ready/completed/cancelled; payment_status pending/paid/refunded/failed;
total_amount, currency, delivery_location), `food_order_items` (snapshots), `food_order_events`.
RLS: vendors read active/manager; menu items read available; orders read buyer or vendor manager
(+ buyer update 0025); realtime published on `food_orders`.

## Cart
`useFoodCart` persists per-vendor cart to localStorage (`food-cart-{vendorId}`); totals via
`computeCartTotals` (tax 5%, delivery fee with free-delivery threshold).

## State
`FoodProvider` (`useFood`): vendors, selected vendor, menu, cart, orders, placing, errors;
realtime order refresh via a `food_orders` channel subscription in `useFoodOrders`.
