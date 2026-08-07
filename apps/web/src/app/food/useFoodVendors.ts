import { useCallback, useEffect, useRef, useState } from 'react';
import type { FoodService, FoodVendor } from '@supercampus/supabase';
import { getReadableFoodError } from './foodUtils';

export interface UseFoodVendorsResult {
  vendors: FoodVendor[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFoodVendors(
  service: FoodService,
  campusId: string | null,
): UseFoodVendorsResult {
  const [vendors, setVendors] = useState<FoodVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!campusId) {
      setVendors([]);
      setLoading(false);
      setError(null);
      return;
    }
    const id = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await service.getVendors(campusId);
      if (requestRef.current !== id) return;
      if (result.data) setVendors(result.data);
      else {
        setError(result.error);
        setVendors([]);
      }
    } catch (err) {
      if (requestRef.current !== id) return;
      setError(getReadableFoodError(err, 'We could not load the food vendors. Please try again.'));
    } finally {
      if (requestRef.current === id) setLoading(false);
    }
  }, [campusId, service]);

  useEffect(() => {
    let active = true;
    if (!campusId) {
      setVendors([]);
      setLoading(false);
      setError(null);
      return;
    }
    const id = ++requestRef.current;
    setLoading(true);
    setError(null);
    void service
      .getVendors(campusId)
      .then((result) => {
        if (!active || requestRef.current !== id) return;
        if (result.data) setVendors(result.data);
        else {
          setError(result.error);
          setVendors([]);
        }
      })
      .catch((err: unknown) => {
        if (!active || requestRef.current !== id) return;
        setError(getReadableFoodError(err, 'We could not load the food vendors. Please try again.'));
      })
      .finally(() => {
        if (active && requestRef.current === id) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refresh]);

  return { vendors, loading, error, refresh };
}
