import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FoodMenuItem } from '@supercampus/supabase';
import {
  clearPersistedCart,
  computeCartTotals,
  FOOD_CART_CONFIG,
  loadPersistedCart,
  savePersistedCart,
  type FoodCartLine,
} from './foodUtils';

export interface UseFoodCartResult {
  lines: FoodCartLine[];
  itemCount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  grandTotal: number;
  isCartEmpty: boolean;
  addToCart: (item: FoodMenuItem, quantity?: number) => void;
  removeFromCart: (menuItemId: string) => void;
  setCartQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
}

export function useFoodCart(vendorId: string | null): UseFoodCartResult {
  const [lines, setLines] = useState<FoodCartLine[]>([]);
  const linesRef = useRef<FoodCartLine[]>([]);
  const vendorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!vendorId) {
      linesRef.current = [];
      vendorRef.current = null;
      setLines([]);
      return;
    }
    vendorRef.current = vendorId;
    const persisted = loadPersistedCart(vendorId);
    linesRef.current = persisted;
    setLines(persisted);
  }, [vendorId]);

  const commit = useCallback((next: FoodCartLine[]): void => {
    linesRef.current = next;
    setLines(next);
    const vendor = vendorRef.current;
    if (vendor) savePersistedCart(vendor, next);
  }, []);

  const addToCart = useCallback(
    (item: FoodMenuItem, quantity = 1): void => {
      if (!item.isAvailable || !Number.isInteger(quantity) || quantity <= 0) return;
      const current = linesRef.current;
      const existing = current.find((line) => line.menuItemId === item.id);
      let next: FoodCartLine[];
      if (existing) {
        const combined = Math.min(existing.quantity + quantity, FOOD_CART_CONFIG.maxQuantityPerItem);
        next = current.map((line) =>
          line.menuItemId === item.id ? { ...line, quantity: combined } : line,
        );
      } else {
        const quantityClamped = Math.min(quantity, FOOD_CART_CONFIG.maxQuantityPerItem);
        next = [
          ...current,
          {
            menuItemId: item.id,
            title: item.name,
            unitPrice: item.price,
            currency: item.currency,
            quantity: quantityClamped,
          },
        ];
      }
      commit(next);
    },
    [commit],
  );

  const removeFromCart = useCallback(
    (menuItemId: string): void => {
      commit(linesRef.current.filter((line) => line.menuItemId !== menuItemId));
    },
    [commit],
  );

  const setCartQuantity = useCallback(
    (menuItemId: string, quantity: number): void => {
      let changed = false;
      const next = linesRef.current
        .map((line) => {
          if (line.menuItemId !== menuItemId) return line;
          if (!Number.isInteger(quantity) || quantity <= 0) {
            changed = true;
            return null;
          }
          const clamped = Math.min(quantity, FOOD_CART_CONFIG.maxQuantityPerItem);
          if (clamped === line.quantity) return line;
          changed = true;
          return { ...line, quantity: clamped };
        })
        .filter((line): line is FoodCartLine => line !== null);
      if (changed) commit(next);
    },
    [commit],
  );

  const clearCart = useCallback((): void => {
    linesRef.current = [];
    setLines([]);
    const vendor = vendorRef.current;
    if (vendor) clearPersistedCart(vendor);
  }, []);

  const totals = useMemo(() => computeCartTotals(lines), [lines]);

  return {
    lines,
    itemCount: totals.itemCount,
    subtotal: totals.subtotal,
    tax: totals.tax,
    deliveryFee: totals.deliveryFee,
    grandTotal: totals.grandTotal,
    isCartEmpty: lines.length === 0,
    addToCart,
    removeFromCart,
    setCartQuantity,
    clearCart,
  };
}
