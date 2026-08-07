import { createContext, useContext } from 'react';
import type { FoodMenu, FoodMenuItem, FoodOrder, FoodVendor } from '@supercampus/supabase';
import type { FoodCartLine } from './foodUtils';

export interface FoodContextValue {
  // Vendors
  vendors: FoodVendor[];
  vendorsLoading: boolean;
  vendorsError: string | null;
  retryVendors: () => Promise<void>;
  selectedVendorId: string | null;
  pendingVendorChangeId: string | null;
  changeVendor: (vendorId: string) => boolean;
  confirmVendorChange: () => void;
  cancelVendorChange: () => void;
  // Menu
  menu: FoodMenu | null;
  menuLoading: boolean;
  menuRefreshing: boolean;
  menuError: string | null;
  refreshMenu: () => Promise<void>;
  retryMenu: () => Promise<void>;
  // Cart
  cartLines: readonly FoodCartLine[];
  cartItemCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartDeliveryFee: number;
  cartGrandTotal: number;
  isCartEmpty: boolean;
  canCheckout: boolean;
  addToCart: (item: FoodMenuItem, quantity?: number) => void;
  removeFromCart: (menuItemId: string) => void;
  setCartQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  // Orders
  orders: FoodOrder[];
  activeOrders: FoodOrder[];
  completedOrders: FoodOrder[];
  cancelledOrders: FoodOrder[];
  ordersLoading: boolean;
  ordersError: string | null;
  hasActiveOrder: boolean;
  placing: boolean;
  retryOrders: () => Promise<void>;
  placeOrder: (deliveryLocation?: string | null) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  // Global
  error: string | null;
  clearError: () => void;
}

export const FoodContext = createContext<FoodContextValue | null>(null);

export function useFood(): FoodContextValue {
  const value = useContext(FoodContext);
  if (!value) throw new Error('useFood must be used inside FoodProvider');
  return value;
}
