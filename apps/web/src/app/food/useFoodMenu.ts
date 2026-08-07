import { useCallback, useEffect, useRef, useState } from 'react';
import type { FoodMenu, FoodService } from '@supercampus/supabase';
import { getReadableFoodError } from './foodUtils';

export interface UseFoodMenuResult {
  menu: FoodMenu | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFoodMenu(
  service: FoodService,
  vendorId: string | null,
): UseFoodMenuResult {
  const [menu, setMenu] = useState<FoodMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef(new Map<string, FoodMenu>());
  const requestRef = useRef(0);

  useEffect(() => {
    if (!vendorId) {
      setMenu(null);
      setLoading(false);
      setError(null);
      return;
    }
    const cached = cacheRef.current.get(vendorId);
    if (cached) {
      setMenu(cached);
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
    }
    const id = ++requestRef.current;
    let active = true;
    void (async () => {
      try {
        const result = await service.getMenu(vendorId);
        if (!active || requestRef.current !== id) return;
        if (result.data) {
          cacheRef.current.set(vendorId, result.data);
          setMenu(result.data);
        } else if (!cached) {
          setError(result.error ?? 'The menu could not be loaded. Please try again.');
        }
      } catch (err) {
        if (!active || requestRef.current !== id) return;
        if (!cached) setError(getReadableFoodError(err, 'The menu could not be loaded. Please try again.'));
      } finally {
        if (active && requestRef.current === id) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [service, vendorId]);

  const refresh = useCallback(async () => {
    if (!vendorId) return;
    const id = ++requestRef.current;
    setRefreshing(true);
    setError(null);
    try {
      const result = await service.getMenu(vendorId);
      if (requestRef.current !== id) return;
      if (result.data) {
        cacheRef.current.set(vendorId, result.data);
        setMenu(result.data);
      } else {
        setError(result.error ?? 'The menu could not be refreshed. Please try again.');
      }
    } catch (err) {
      if (requestRef.current !== id) return;
      setError(getReadableFoodError(err, 'The menu could not be refreshed. Please try again.'));
    } finally {
      if (requestRef.current === id) setRefreshing(false);
    }
  }, [service, vendorId]);

  return { menu, loading, refreshing, error, refresh };
}
