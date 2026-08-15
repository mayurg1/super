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
  console.log('MarketplaceProvider rendered'); // TEMP TASK2
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

  const getProduct = useCallback(
    async (productId: string): Promise<MarketplaceProduct | null> => {
      if (!user || !productId) return null;
      setError(null);
      const result = await service.getProduct(productId, user.id);
      if (!result.data) {
        setError(result.error ?? 'This listing could not be loaded.');
        return null;
      }
      return result.data;
    },
    [service, user],
  );

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
        media: input.media,
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
      setError(null);
      const result = await service.updateProduct(productId, input, user.id);
      if (!result.data) {
        setError(result.error ?? 'Your listing could not be saved.');
        return false;
      }
      setProducts((current) => current.map((product) => (product.id === productId ? result.data : product)));
      return true;
    },
    [service, user],
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

  const hasReported = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!user || !productId) return false;
      const { data } = await client
        .from('product_reports')
        .select('id')
        .eq('product_id', productId)
        .eq('reporter_id', user.id)
        .limit(1)
        .maybeSingle();
      return Boolean(data);
    },
    [client, user],
  );

  const reportProduct = useCallback(
    async (productId: string, reason: string): Promise<boolean> => {
      if (!user || !productId || !reason.trim()) return false;
      setError(null);
      const result = await service.reportProduct(productId, user.id, reason.trim());
      if (result.error) {
        setError(result.error);
        return false;
      }
      return true;
    },
    [service, user],
  );

  const uploadProductImages = useCallback(
    async (files: readonly File[]): Promise<string[] | null> => {
      if (!user || files.length === 0) return [];
      const bucket = 'marketplace-media';
      const assetIds: string[] = [];
      const paths: string[] = [];
      const fail = async (): Promise<null> => {
        if (paths.length > 0) await client.storage.from(bucket).remove(paths);
        return null;
      };
      for (const file of files) {
        const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
        const objectPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await client.storage
          .from(bucket)
          .upload(objectPath, file, { contentType: file.type || 'image/jpeg', upsert: false });
        if (uploadError) return fail();
        paths.push(objectPath);
        const { data: asset, error: insertError } = await client
          .from('media_assets')
          .insert({
            owner_id: user.id,
            bucket,
            object_path: objectPath,
            mime_type: file.type || 'image/jpeg',
            byte_size: file.size,
            status: 'pending',
          })
          .select('id')
          .single();
        if (insertError || !asset) return fail();
        // Claim the asset as ready after the upload is registered.
        await client.from('media_assets').update({ status: 'active' }).eq('id', asset.id);
        assetIds.push(asset.id);
      }
      return assetIds;
    },
    [client, user],
  );

  const getMediaUrls = useCallback(
    async (assetIds: readonly string[]): Promise<Record<string, string>> => {
      const result: Record<string, string> = {};
      if (assetIds.length === 0) return result;
      const { data } = await client.from('media_assets').select('id, bucket, object_path').in('id', [...assetIds]);
      if (data) {
        await Promise.all(
          data.map(async (asset) => {
            const { data: signed } = await client.storage
              .from(asset.bucket)
              .createSignedUrl(asset.object_path, 3600);
            if (signed) result[asset.id] = signed.signedUrl;
          }),
        );
      }
      return result;
    },
    [client],
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
      getProduct,
      createProduct,
      updateProduct,
      deleteProduct,
      toggleFavorite,
      reportProduct,
      hasReported,
      uploadProductImages,
      getMediaUrls,
    }),
    [
      activeCategoryId,
      categories,
      createProduct,
      cursor,
      deleteProduct,
      error,
      getMediaUrls,
      getProduct,
      hasReported,
      loadMore,
      loading,
      loadingMore,
      pendingFavoriteIds,
      products,
      refresh,
      reportProduct,
      setCategory,
      toggleFavorite,
      updateProduct,
      uploadProductImages,
    ],
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

