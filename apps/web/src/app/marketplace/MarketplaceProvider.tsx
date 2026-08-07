import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createMarketplaceService,
  useAuth,
  useProfile,
  useSupabase,
  type MarketplaceCategory,
  type MarketplaceProduct,
} from '@supercampus/supabase';
import { MarketplaceContext, type CreateProductFields, type MarketplaceContextValue, type UpdateProductFields } from './MarketplaceContext';

function setMember(current: ReadonlySet<string>, id: string, present: boolean): Set<string> {
  const next = new Set(current);
  if (present) next.add(id);
  else next.delete(id);
  return next;
}

export function MarketplaceProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const client = useSupabase();
  const { user } = useAuth();
  const { profile } = useProfile();
  const service = useMemo(() => createMarketplaceService(client), [client]);

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ createdAt: string } | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState<ReadonlySet<string>>(new Set());
  const categoriesLoadedForUser = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setProducts([]);
      setCursor(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await service.getProducts({
      campusId: profile?.campus_id,
      categoryId: activeCategoryId,
      viewerId: user.id,
    });
    if (!result.data) {
      setError(result.error ?? 'Unable to load the marketplace.');
      setProducts([]);
      setCursor(null);
    } else {
      setProducts(result.data.products);
      setCursor(result.data.nextCursor);
    }
    setLoading(false);
  }, [activeCategoryId, profile?.campus_id, service, user]);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setCursor(null);
      setLoading(false);
      return;
    }
    void refresh();
  }, [refresh, user]);

  useEffect(() => {
    if (!user) {
      categoriesLoadedForUser.current = null;
      return;
    }
    if (categoriesLoadedForUser.current === user.id) return;
    categoriesLoadedForUser.current = user.id;
    void (async () => {
      const result = await service.getCategories();
      if (result.data) setCategories(result.data);
    })();
  }, [service, user]);

  const loadMore = useCallback(async () => {
    if (!user || !cursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    const result = await service.getProducts({
      campusId: profile?.campus_id,
      categoryId: activeCategoryId,
      cursor,
      viewerId: user.id,
    });
    if (!result.data) {
      setError(result.error ?? 'Unable to load the marketplace.');
    } else {
      setProducts((current) => [
        ...current,
        ...result.data.products.filter((product) => !current.some((item) => item.id === product.id)),
      ]);
      setCursor(result.data.nextCursor);
    }
    setLoadingMore(false);
  }, [activeCategoryId, cursor, loadingMore, profile?.campus_id, service, user]);

  const setCategory = useCallback((categoryId: string | null) => {
    setActiveCategoryId(categoryId);
  }, []);

  const createProduct = useCallback(
    async (input: CreateProductFields): Promise<boolean> => {
      if (!user || !profile) return false;
      if (!profile.campus_id) {
        setError('Finish onboarding with a campus before listing an item.');
        return false;
      }
      setError(null);
      const result = await service.createProduct({
        sellerId: user.id,
        campusId: profile.campus_id,
        categoryId: input.categoryId ?? null,
        title: input.title,
        description: input.description,
        condition: input.condition,
        price: input.price,
      });
      if (!result.data) {
        setError(result.error ?? 'Your listing could not be published.');
        return false;
      }
      setProducts((current) => [result.data, ...current]);
      return true;
    },
    [profile, service, user],
  );

  const updateProduct = useCallback(
    async (productId: string, input: UpdateProductFields): Promise<boolean> => {
      if (!user) return false;
      const original = products.find((product) => product.id === productId);
      if (!original) return false;
      setError(null);
      const result = await service.updateProduct(productId, input, user.id);
      if (!result.data) {
        setError(result.error ?? 'Your listing could not be saved.');
        return false;
      }
      setProducts((current) => current.map((product) => (product.id === productId ? result.data : product)));
      return true;
    },
    [products, service, user],
  );

  const deleteProduct = useCallback(
    async (productId: string): Promise<boolean> => {
      const original = products.find((product) => product.id === productId);
      if (!original) return false;
      setError(null);
      setProducts((current) => current.filter((product) => product.id !== productId));
      const result = await service.deleteProduct(productId);
      if (!result.data && result.error) {
        setProducts((current) => [original, ...current]);
        setError(result.error);
        return false;
      }
      return true;
    },
    [products, service],
  );

  const toggleFavorite = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!user || pendingFavoriteIds.has(productId)) return false;
      const original = products.find((product) => product.id === productId);
      if (!original) return false;
      const optimistic = {
        ...original,
        favoritedByMe: !original.favoritedByMe,
        favoriteCount: Math.max(0, original.favoriteCount + (original.favoritedByMe ? -1 : 1)),
      };
      setPendingFavoriteIds((current) => setMember(current, productId, true));
      setError(null);
      setProducts((current) => current.map((product) => (product.id === productId ? optimistic : product)));
      const result = original.favoritedByMe
        ? await service.unfavoriteProduct(productId, user.id)
        : await service.favoriteProduct(productId, user.id);
      setPendingFavoriteIds((current) => setMember(current, productId, false));
      if (!result.data && result.error) {
        setProducts((current) => current.map((product) => (product.id === productId ? original : product)));
        setError(result.error);
        return false;
      }
      return true;
    },
    [pendingFavoriteIds, products, service, user],
  );

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      products,
      categories,
      loading,
      loadingMore,
      error,
      hasMore: cursor !== null,
      activeCategoryId,
      pendingFavoriteIds,
      refresh,
      loadMore,
      setCategory,
      createProduct,
      updateProduct,
      deleteProduct,
      toggleFavorite,
    }),
    [
      activeCategoryId,
      categories,
      createProduct,
      cursor,
      deleteProduct,
      error,
      loadMore,
      loading,
      loadingMore,
      pendingFavoriteIds,
      products,
      refresh,
      setCategory,
      toggleFavorite,
      updateProduct,
    ],
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

