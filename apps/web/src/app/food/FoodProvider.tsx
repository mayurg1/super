import { useCallback, useEffect, useMemo, useState } from 'react';
import { createFoodService, useAuth, useProfile, useSupabase } from '@supercampus/supabase';
import { FoodContext, type FoodContextValue } from './FoodContext';
import { useFoodVendors } from './useFoodVendors';
import { useFoodMenu } from './useFoodMenu';
import { useFoodCart } from './useFoodCart';
import { useFoodOrders } from './useFoodOrders';
import { getReadableFoodError, type FoodCartLine } from './foodUtils';

export function FoodProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const client = useSupabase();
  const { user } = useAuth();
  const { profile } = useProfile();
  const service = useMemo(() => createFoodService(client), [client]);
  const campusId = profile?.campus_id ?? null;

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [pendingVendorChangeId, setPendingVendorChangeId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { vendors, loading: vendorsLoading, error: vendorsError, refresh: refreshVendors } = useFoodVendors(
    service,
    campusId,
  );
  const menuState = useFoodMenu(service, selectedVendorId);
  const cart = useFoodCart(selectedVendorId);
  const orderState = useFoodOrders(service, user?.id ?? null, client);

  // Auto-select: pick the first valid vendor, or recover when the current one disappears.
  useEffect(() => {
    if (vendorsLoading) return;
    if (vendors.length > 0 && (!selectedVendorId || !vendors.some((vendor) => vendor.id === selectedVendorId))) {
      const fallback = vendors[0]!;
            if (selectedVendorId && cart.lines.length > 0) cart.clearCart();
      setSelectedVendorId(fallback.id);
      setPendingVendorChangeId(null);
    } else if (vendors.length === 0) {
      setSelectedVendorId(null);
      setPendingVendorChangeId(null);
    }
        }, [vendors, vendorsLoading, selectedVendorId, cart.lines.length, cart.clearCart]);

  const changeVendor = useCallback(
    (vendorId: string): boolean => {
      if (!vendorId || vendorId === selectedVendorId) return true;
      if (cart.lines.length > 0) {
        setPendingVendorChangeId(vendorId);
        return false;
      }
      setSelectedVendorId(vendorId);
      return true;
    },
    [selectedVendorId, cart.lines.length],
  );

  const confirmVendorChange = useCallback(() => {
    if (!pendingVendorChangeId) return;
    const next = pendingVendorChangeId;
        cart.clearCart();
    setSelectedVendorId(next);
    setPendingVendorChangeId(null);
    }, [pendingVendorChangeId, cart.clearCart]);

  const cancelVendorChange = useCallback(() => {
    setPendingVendorChangeId(null);
  }, []);

  const isCartEmpty = cart.lines.length === 0;
  const canCheckout = !isCartEmpty && !placing && !!selectedVendorId && !menuState.loading && !!menuState.menu;

  const placeOrder = useCallback(
    async (deliveryLocation?: string | null): Promise<boolean> => {
      if (!user) {
        setGlobalError('You must be signed in to place an order.');
        return false;
      }
      if (!selectedVendorId) {
        setGlobalError('Select a vendor before checking out.');
        return false;
      }
      if (placing) return false;
      setPlacing(true);
      setGlobalError(null);
      try {
        if (cart.lines.length === 0) {
          setGlobalError('Your cart is empty.');
          return false;
        }
        const invalidQuantity = cart.lines.some(
          (line) => !Number.isInteger(line.quantity) || line.quantity <= 0,
        );
        if (invalidQuantity) {
          setGlobalError('One of your items has an invalid quantity.');
          return false;
        }
        if (!menuState.menu) {
          setGlobalError('The menu is still loading. Please try again.');
          return false;
        }
        for (const line of cart.lines) {
          const item = menuState.menu.items.find((menuItem) => menuItem.id === line.menuItemId);
          if (!item || !item.isAvailable) {
            setGlobalError(`"${line.title}" is no longer available. Please refresh the menu.`);
            return false;
          }
        }
        if (!deliveryLocation?.trim()) {
          setGlobalError('Enter a delivery location before placing your order.');
          return false;
        }
        const result = await service.placeOrder({
          buyerId: user.id,
          vendorId: selectedVendorId,
          fulfillmentType: 'delivery',
          deliveryLocation,
          items: cart.lines.map((line) => ({ menuItemId: line.menuItemId, quantity: line.quantity })),
        });
        if (!result.data) {
          setGlobalError(result.error);
          return false;
        }
                cart.clearCart();
        void orderState.refresh();
        void menuState.refresh();
        return true;
      } catch (err) {
        setGlobalError(getReadableFoodError(err, 'Your order could not be placed. Please try again.'));
        return false;
      } finally {
        setPlacing(false);
      }
    },
            [cart.lines, cart.clearCart, menuState.menu, menuState.refresh, orderState.refresh, placing, service, selectedVendorId, user],
  );

  const cancelOrder = useCallback(
    async (orderId: string): Promise<boolean> => {
      if (!user) {
        setGlobalError('You must be signed in to manage orders.');
        return false;
      }
      const result = await service.cancelOrder(orderId, user.id);
      if (result.error) {
        setGlobalError(result.error);
        return false;
      }
      await orderState.refresh();
      return true;
    },
    [service, user, orderState.refresh],
  );

  const clearError = useCallback(() => {
    setGlobalError(null);
  }, []);

  const value = useMemo<FoodContextValue>(
    () => ({
      vendors,
      vendorsLoading,
      vendorsError,
      retryVendors: refreshVendors,
      selectedVendorId,
      pendingVendorChangeId,
      changeVendor,
      confirmVendorChange,
      cancelVendorChange,
      menu: menuState.menu,
      menuLoading: menuState.loading,
      menuRefreshing: menuState.refreshing,
      menuError: menuState.error,
      refreshMenu: menuState.refresh,
      retryMenu: menuState.refresh,
      cartLines: cart.lines as readonly FoodCartLine[],
      cartItemCount: cart.itemCount,
      cartSubtotal: cart.subtotal,
      cartTax: cart.tax,
      cartDeliveryFee: cart.deliveryFee,
      cartGrandTotal: cart.grandTotal,
      isCartEmpty,
      canCheckout,
      addToCart: cart.addToCart,
      removeFromCart: cart.removeFromCart,
      setCartQuantity: cart.setCartQuantity,
      clearCart: cart.clearCart,
      orders: orderState.orders,
      activeOrders: orderState.groups.active,
      completedOrders: orderState.groups.completed,
      cancelledOrders: orderState.groups.cancelled,
      ordersLoading: orderState.loading,
      ordersError: orderState.error,
      hasActiveOrder: orderState.hasActiveOrder,
      placing,
      retryOrders: orderState.refresh,
      placeOrder,
      cancelOrder,
      error: globalError,
      clearError,
    }),
    [
      cancelOrder,
      cancelVendorChange,
      cart.itemCount,
      cart.subtotal,
      cart.tax,
      cart.deliveryFee,
      cart.grandTotal,
      cart.lines,
      cart.addToCart,
      cart.removeFromCart,
      cart.setCartQuantity,
      cart.clearCart,
      canCheckout,
      changeVendor,
      confirmVendorChange,
      globalError,
      isCartEmpty,
      menuState.error,
      menuState.loading,
      menuState.menu,
      menuState.refresh,
      menuState.refreshing,
      orderState.error,
      orderState.groups.active,
      orderState.groups.cancelled,
      orderState.groups.completed,
      orderState.hasActiveOrder,
      orderState.loading,
      orderState.orders,
      orderState.refresh,
      pendingVendorChangeId,
      placing,
      placeOrder,
      refreshVendors,
      selectedVendorId,
      vendors,
      vendorsError,
      vendorsLoading,
    ],
  );

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
}


