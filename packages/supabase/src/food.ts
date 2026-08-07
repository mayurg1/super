import type { SupercampusSupabaseClient } from './client.js';
import type { Tables } from './database.types.js';

type VendorRow = Tables<'food_vendors'>;
type MenuCategoryRow = Tables<'food_menu_categories'>;
type MenuItemRow = Tables<'food_menu_items'>;
type OrderItemRow = Tables<'food_order_items'>;

export type FoodOrderStatus = 'draft' | 'placed' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type FoodPaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type FoodFulfillmentType = 'pickup' | 'delivery';

export interface FoodVendor {
  id: string;
  campusId: string;
  name: string;
  contact: string | null;
  status: string;
}

export interface FoodMenuCategory {
  id: string;
  vendorId: string;
  name: string;
  position: number;
  isActive: boolean;
}

export interface FoodMenuItem {
  id: string;
  vendorId: string;
  categoryId: string | null;
  name: string;
  description: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  mediaAssetId: string | null;
}

export interface FoodMenu {
  vendorId: string;
  categories: FoodMenuCategory[];
  items: FoodMenuItem[];
}

export interface FoodOrderItem {
  id: string;
  menuItemId: string | null;
  title: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface FoodOrder {
  id: string;
  buyerId: string;
  vendorId: string;
  vendorName: string;
  fulfillmentType: string;
  deliveryLocation: string | null;
  totalAmount: number;
  currency: string;
  orderStatus: FoodOrderStatus;
  paymentStatus: FoodPaymentStatus;
  createdAt: string;
  updatedAt: string;
  items: FoodOrderItem[];
}

export interface FoodOrderLineInput {
  menuItemId: string;
  quantity: number;
}

export interface CreateFoodOrderInput {
  buyerId: string;
  vendorId: string;
  fulfillmentType: string;
  deliveryLocation?: string | null;
  items: readonly FoodOrderLineInput[];
}

export type FoodResult<T> = { data: T; error: null } | { data: null; error: string };

const VALID_ORDER_STATUSES = new Set<string>(['draft', 'placed', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);
const VALID_PAYMENT_STATUSES = new Set<string>(['pending', 'paid', 'refunded', 'failed']);

function vendorError(): string {
  return 'We could not load the food vendors. Please try again.';
}

function menuError(): string {
  return 'The menu could not be loaded right now. Please try again.';
}

function orderError(): string {
  return 'Your order could not be placed. Please try again.';
}

function toOrderStatus(value: string): FoodOrderStatus {
  return VALID_ORDER_STATUSES.has(value) ? (value as FoodOrderStatus) : 'placed';
}

function toPaymentStatus(value: string): FoodPaymentStatus {
  return VALID_PAYMENT_STATUSES.has(value) ? (value as FoodPaymentStatus) : 'pending';
}

function toVendor(row: VendorRow): FoodVendor {
  return {
    id: row.id,
    campusId: row.campus_id,
    name: row.name,
    contact: row.contact,
    status: row.status,
  };
}

function toMenuCategory(row: MenuCategoryRow): FoodMenuCategory {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    position: row.position,
    isActive: row.is_active,
  };
}

function toMenuItem(row: MenuItemRow): FoodMenuItem {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    price: row.price,
    currency: row.currency,
    isAvailable: row.is_available,
    mediaAssetId: row.media_asset_id,
  };
}

function toOrderItem(row: OrderItemRow): FoodOrderItem {
  return {
    id: row.id,
    menuItemId: row.menu_item_id,
    title: row.title_snapshot,
    unitPrice: row.unit_price,
    quantity: row.quantity,
    lineTotal: row.line_total,
  };
}

export function createFoodService(client: SupercampusSupabaseClient) {
  async function getVendors(campusId: string): Promise<FoodResult<FoodVendor[]>> {
    const { data, error } = await client
      .from('food_vendors')
      .select('*')
      .eq('campus_id', campusId)
      .eq('status', 'active')
      .order('name', { ascending: true });
    if (error || !data) return { data: null, error: vendorError() };
    return { data: data.map(toVendor), error: null };
  }

  async function getMenu(vendorId: string): Promise<FoodResult<FoodMenu>> {
    const [categories, items] = await Promise.all([
      client
        .from('food_menu_categories')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('is_active', true)
        .order('position', { ascending: true }),
      client.from('food_menu_items').select('*').eq('vendor_id', vendorId).order('name', { ascending: true }),
    ]);
    if (categories.error || items.error) return { data: null, error: menuError() };
    return {
      data: {
        vendorId,
        categories: (categories.data ?? []).map(toMenuCategory),
        items: (items.data ?? []).map(toMenuItem),
      },
      error: null,
    };
  }

  async function loadOrders(query: { orderId?: string; buyerId: string }): Promise<FoodResult<FoodOrder[]>> {
    let request = client
      .from('food_orders')
      .select('*')
      .eq('buyer_id', query.buyerId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (query.orderId) request = request.eq('id', query.orderId);

    const { data: orderRows, error: ordersError } = await request;
    if (ordersError || !orderRows) return { data: null, error: orderError() };
    if (orderRows.length === 0) return { data: [], error: null };

    const orderIds = orderRows.map((order) => order.id);
    const vendorIds = [...new Set(orderRows.map((order) => order.vendor_id))];
    const [itemsResult, vendorsResult] = await Promise.all([
      client
        .from('food_order_items')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: true }),
      client.from('food_vendors').select('id, name').in('id', vendorIds),
    ]);
    if (itemsResult.error || vendorsResult.error) return { data: null, error: orderError() };

    const vendorNames = new Map((vendorsResult.data ?? []).map((vendor) => [vendor.id, vendor.name]));
    const itemsByOrder = new Map<string, FoodOrderItem[]>();
    (itemsResult.data ?? []).forEach((item) => {
      const target = itemsByOrder.get(item.order_id) ?? [];
      target.push(toOrderItem(item));
      itemsByOrder.set(item.order_id, target);
    });

    const orders = orderRows.map((order) => ({
      id: order.id,
      buyerId: order.buyer_id,
      vendorId: order.vendor_id,
      vendorName: vendorNames.get(order.vendor_id) ?? 'Campus kitchen',
      fulfillmentType: order.fulfillment_type,
      deliveryLocation: order.delivery_location,
      totalAmount: order.total_amount,
      currency: order.currency,
      orderStatus: toOrderStatus(order.order_status),
      paymentStatus: toPaymentStatus(order.payment_status),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: itemsByOrder.get(order.id) ?? [],
    }));
    return { data: orders, error: null };
  }

  return {
    getVendors,
    getMenu,
    getOrders(buyerId: string): Promise<FoodResult<FoodOrder[]>> {
      return loadOrders({ buyerId });
    },
    async placeOrder(input: CreateFoodOrderInput): Promise<FoodResult<FoodOrder>> {
      if (input.items.length === 0) return { data: null, error: 'Your cart is empty.' };
      for (const line of input.items) {
        if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
          return { data: null, error: 'One of your items has an invalid quantity.' };
        }
      }

      const menuResult = await getMenu(input.vendorId);
      if (!menuResult.data) return { data: null, error: menuResult.error ?? orderError() };
      const byId = new Map(menuResult.data.items.map((item) => [item.id, item]));

      let currency = 'INR';
      let totalAmount = 0;
      const orderItems: {
        menu_item_id: string | null;
        title_snapshot: string;
        unit_price: number;
        quantity: number;
        line_total: number;
      }[] = [];
      for (const line of input.items) {
        const item = byId.get(line.menuItemId);
        if (!item || !item.isAvailable) {
          return { data: null, error: 'An item in your cart is no longer available. Please refresh the menu.' };
        }
        currency = item.currency;
        const lineTotal = item.price * line.quantity;
        totalAmount += lineTotal;
        orderItems.push({
          menu_item_id: item.id,
          title_snapshot: item.name,
          unit_price: item.price,
          quantity: line.quantity,
          line_total: lineTotal,
        });
      }

      const { data: created, error: createError } = await client
        .from('food_orders')
        .insert({
          buyer_id: input.buyerId,
          vendor_id: input.vendorId,
          fulfillment_type: input.fulfillmentType,
          delivery_location: input.deliveryLocation?.trim() || null,
          total_amount: totalAmount,
          currency,
          order_status: 'draft',
          payment_status: 'pending',
        })
        .select('id')
        .single();
      if (createError || !created) return { data: null, error: orderError() };

      const { error: itemsError } = await client.from('food_order_items').insert(
        orderItems.map((line) => ({ ...line, order_id: created.id })),
      );
      if (itemsError) return { data: null, error: orderError() };

      const { error: placedError } = await client
        .from('food_orders')
        .update({ order_status: 'placed', updated_at: new Date().toISOString() })
        .eq('id', created.id);
      if (placedError) return { data: null, error: orderError() };

      await client.from('food_order_events').insert({ order_id: created.id, actor_id: input.buyerId, status: 'placed' });

      const result = await loadOrders({ orderId: created.id, buyerId: input.buyerId });
      if (!result.data || !result.data[0]) return { data: null, error: result.error ?? orderError() };
      return { data: result.data[0], error: null };
    },
    async cancelOrder(orderId: string, buyerId: string): Promise<FoodResult<void>> {
      const result = await loadOrders({ orderId, buyerId });
      if (!result.data) return { data: null, error: result.error ?? orderError() };
      const order = result.data[0];
      if (!order) return { data: null, error: 'This order could not be found.' };
      if (order.orderStatus === 'cancelled') return { data: undefined, error: null };
      if (order.orderStatus === 'completed') return { data: null, error: 'Completed orders can no longer be cancelled.' };

      const { error } = await client
        .from('food_orders')
        .update({ order_status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('buyer_id', buyerId);
      if (error) return { data: null, error: orderError() };
      await client.from('food_order_events').insert({ order_id: orderId, actor_id: buyerId, status: 'cancelled' });
      return { data: undefined, error: null };
    },
  };
}

export type FoodService = ReturnType<typeof createFoodService>;

