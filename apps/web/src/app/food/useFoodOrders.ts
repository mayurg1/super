import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SupercampusSupabaseClient, FoodOrder, FoodService } from '@supercampus/supabase';
import { getReadableFoodError, groupOrders, type FoodOrderGroups } from './foodUtils';

export interface UseFoodOrdersResult {
  orders: FoodOrder[];
  loading: boolean;
  error: string | null;
  groups: FoodOrderGroups;
  hasActiveOrder: boolean;
  refresh: () => Promise<void>;
  cancelOrder: (orderId: string) => Promise<boolean>;
}

export function useFoodOrders(
  service: FoodService,
  userId: string | null,
  client: SupercampusSupabaseClient,
): UseFoodOrdersResult {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      setError(null);
      return;
    }
    const id = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await service.getOrders(userId);
      if (requestRef.current !== id) return;
      if (result.data) setOrders(result.data);
      else {
        setError(result.error);
        setOrders([]);
      }
    } catch (err) {
      if (requestRef.current !== id) return;
      setError(getReadableFoodError(err, 'Your orders could not be loaded. Please try again.'));
    } finally {
      if (requestRef.current === id) setLoading(false);
    }
  }, [service, userId]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setOrders([]);
      setLoading(false);
      setError(null);
      return;
    }
    const id = ++requestRef.current;
    setLoading(true);
    setError(null);
    void service
      .getOrders(userId)
      .then((result) => {
        if (!active || requestRef.current !== id) return;
        if (result.data) setOrders(result.data);
        else {
          setError(result.error);
          setOrders([]);
        }
      })
      .catch((err: unknown) => {
        if (!active || requestRef.current !== id) return;
        setError(getReadableFoodError(err, 'Your orders could not be loaded. Please try again.'));
      })
      .finally(() => {
        if (active && requestRef.current === id) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!userId) return;
    const channel = client
      .channel(`food-orders-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_orders', filter: `buyer_id=eq.${userId}` },
        () => {
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [client, refresh, userId]);

  const groups = useMemo(() => groupOrders(orders), [orders]);

  const cancelOrder = useCallback(
    async (orderId: string): Promise<boolean> => {
      if (!userId) return false;
      const result = await service.cancelOrder(orderId, userId);
      if (result.error) {
        setError(result.error);
        return false;
      }
      await refresh();
      return true;
    },
    [refresh, service, userId],
  );

  return {
    orders,
    loading,
    error,
    groups,
    hasActiveOrder: groups.active.length > 0,
    refresh,
    cancelOrder,
  };
}
