import { isSupabaseError } from '@supercampus/supabase';
import type { FoodOrder } from '@supercampus/supabase';

export interface FoodCartLine {
  menuItemId: string;
  title: string;
  unitPrice: number;
  currency: string;
  quantity: number;
}

export const FOOD_CART_CONFIG = {
  maxQuantityPerItem: 20,
  taxRate: 0.05,
  deliveryFee: 30,
  freeDeliveryThreshold: 300,
} as const;

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  grandTotal: number;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeCartTotals(
  lines: readonly Pick<FoodCartLine, 'unitPrice' | 'quantity'>[],
): CartTotals {
  let itemCount = 0;
  let subtotal = 0;
  for (const line of lines) {
    itemCount += line.quantity;
    subtotal += line.unitPrice * line.quantity;
  }
  const tax = roundMoney(subtotal * FOOD_CART_CONFIG.taxRate);
  const deliveryFee =
    subtotal === 0 || subtotal >= FOOD_CART_CONFIG.freeDeliveryThreshold
      ? 0
      : FOOD_CART_CONFIG.deliveryFee;
  return { itemCount, subtotal: roundMoney(subtotal), tax, deliveryFee, grandTotal: roundMoney(subtotal + tax + deliveryFee) };
}

const CART_PREFIX = 'food-cart-';

export function cartStorageKey(vendorId: string): string {
  return `${CART_PREFIX}${vendorId}`;
}

function isCartLine(value: unknown): value is FoodCartLine {
  if (!value || typeof value !== 'object') return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.menuItemId === 'string' &&
    typeof line.title === 'string' &&
    typeof line.unitPrice === 'number' &&
    typeof line.currency === 'string' &&
    typeof line.quantity === 'number'
  );
}

export function loadPersistedCart(vendorId: string): FoodCartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(cartStorageKey(vendorId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

export function savePersistedCart(vendorId: string, lines: readonly FoodCartLine[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(cartStorageKey(vendorId), JSON.stringify(lines));
  } catch {
    // Storage can be unavailable (private mode); the in-memory cart still works.
  }
}

export function clearPersistedCart(vendorId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(cartStorageKey(vendorId));
  } catch {
    // Ignore storage failures.
  }
}

export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export interface FoodOrderGroups {
  active: FoodOrder[];
  completed: FoodOrder[];
  cancelled: FoodOrder[];
}

function newestFirst(left: FoodOrder, right: FoodOrder): number {
  return right.createdAt.localeCompare(left.createdAt);
}

export function groupOrders(orders: readonly FoodOrder[]): FoodOrderGroups {
  const active: FoodOrder[] = [];
  const completed: FoodOrder[] = [];
  const cancelled: FoodOrder[] = [];
  for (const order of orders) {
    if (order.orderStatus === 'cancelled') cancelled.push(order);
    else if (order.orderStatus === 'completed') completed.push(order);
    else active.push(order);
  }
  active.sort(newestFirst);
  completed.sort(newestFirst);
  cancelled.sort(newestFirst);
  return { active, completed, cancelled };
}

const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  PGRST116: 'We could not find the requested records.',
  23505: 'That action conflicts with an existing record.',
};

export function getReadableFoodError(error: unknown, fallback: string): string {
  if (isSupabaseError(error)) {
    const mapped = error.code ? SUPABASE_ERROR_MESSAGES[error.code] : undefined;
    return mapped ?? (error.message || fallback);
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
