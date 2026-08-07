import type { SupercampusSupabaseClient } from './client.js';
import type { Tables, TablesUpdate } from './database.types.js';

type ProductRow = Tables<'marketplace_products'>;
type ProfileRow = Tables<'profiles'>;
type CategoryRow = Tables<'marketplace_categories'>;
type ProductMediaRow = Tables<'product_media'>;
type ProductFavoriteRow = Tables<'product_favorites'>;

export type MarketplaceStatus = 'draft' | 'active' | 'reserved' | 'sold' | 'hidden' | 'removed';

export interface MarketplaceSeller {
  id: string;
  displayName: string;
  handle: string;
  avatarAssetId: string | null;
}

export interface ProductMedia {
  id: string;
  assetId: string;
  position: number;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface MarketplaceProduct {
  id: string;
  sellerId: string;
  seller: MarketplaceSeller;
  campusId: string;
  categoryId: string | null;
  title: string;
  description: string;
  condition: string;
  price: number;
  currency: string;
  status: MarketplaceStatus;
  createdAt: string;
  updatedAt: string;
  media: ProductMedia[];
  favoriteCount: number;
  favoritedByMe: boolean;
}

export interface MarketplaceCursor {
  createdAt: string;
}

export interface MarketplaceQuery {
  campusId?: string | null;
  categoryId?: string | null;
  /** Set to browse a specific seller's own listings (bypasses the active-only filter). */
  sellerId?: string | null;
  cursor?: MarketplaceCursor | null;
  limit?: number;
  viewerId?: string | null;
}

export interface MarketplacePage {
  products: MarketplaceProduct[];
  nextCursor: MarketplaceCursor | null;
}

export interface ProductMediaInput {
  assetId: string;
}

export interface CreateProductInput {
  sellerId: string;
  campusId: string;
  categoryId?: string | null;
  title: string;
  description: string;
  condition: string;
  price: number;
  currency?: string;
  media?: readonly ProductMediaInput[];
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  condition?: string;
  price?: number;
  categoryId?: string | null;
  status?: MarketplaceStatus;
}

export type MarketplaceResult<T> = { data: T; error: null } | { data: null; error: string };

const DEFAULT_PAGE_SIZE = 20;
const VALID_STATUSES = new Set<MarketplaceStatus>(['draft', 'active', 'reserved', 'sold', 'hidden', 'removed']);

function browseError(): string {
  return 'Unable to load the marketplace. Please try again.';
}

function mutationError(): string {
  return 'Unable to save your listing. Please try again.';
}

function toStatus(value: string): MarketplaceStatus {
  return VALID_STATUSES.has(value as MarketplaceStatus) ? (value as MarketplaceStatus) : 'active';
}

function toSeller(
  profile: Pick<ProfileRow, 'id' | 'display_name' | 'handle' | 'avatar_asset_id'> | undefined,
  sellerId: string,
): MarketplaceSeller {
  return {
    id: sellerId,
    displayName: profile?.display_name || 'Campus member',
    handle: profile?.handle || 'member',
    avatarAssetId: profile?.avatar_asset_id ?? null,
  };
}

function normalizeMedia(row: ProductMediaRow): ProductMedia {
  return { id: row.id, assetId: row.media_asset_id, position: row.position };
}

function groupByProductId(rows: readonly { product_id: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  rows.forEach((row) => counts.set(row.product_id, (counts.get(row.product_id) ?? 0) + 1));
  return counts;
}

export function createMarketplaceService(client: SupercampusSupabaseClient) {
  async function loadProducts(
    query: MarketplaceQuery & { productId?: string },
  ): Promise<MarketplaceResult<MarketplacePage>> {
    const limit = Math.max(1, Math.min(query.limit ?? DEFAULT_PAGE_SIZE, 50));
    let request = client
      .from('marketplace_products')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(query.productId ? 1 : limit + 1);

    if (query.productId) request = request.eq('id', query.productId);
    if (query.campusId) request = request.eq('campus_id', query.campusId);
    if (query.categoryId) request = request.eq('category_id', query.categoryId);
    if (query.sellerId) request = request.eq('seller_id', query.sellerId);
    else if (!query.productId) request = request.eq('status', 'active');
    if (query.cursor) request = request.lt('created_at', query.cursor.createdAt);

    const { data: productRows, error: productsError } = await request;
    if (productsError || !productRows) return { data: null, error: browseError() };

    const visible = query.productId ? productRows : productRows.slice(0, limit);
    if (visible.length === 0) return { data: { products: [], nextCursor: null }, error: null };

    const productIds = visible.map((product) => product.id);
    const sellerIds = [...new Set(visible.map((product) => product.seller_id))];
    const requests = await Promise.all([
      client.from('profiles').select('id, display_name, handle, avatar_asset_id').in('id', sellerIds),
      client.from('product_media').select('*').in('product_id', productIds).order('position', { ascending: true }),
      client.from('product_favorites').select('product_id').in('product_id', productIds),
      query.viewerId
        ? client.from('product_favorites').select('product_id').eq('user_id', query.viewerId).in('product_id', productIds)
        : Promise.resolve({ data: [] as Pick<ProductFavoriteRow, 'product_id'>[], error: null }),
    ]);

    const [profiles, media, favorites, viewerFavorites] = requests;
    if (profiles.error || media.error || favorites.error || viewerFavorites.error) {
      return { data: null, error: browseError() };
    }

    const profileMap = new Map((profiles.data ?? []).map((profile) => [profile.id, profile]));
    const mediaMap = new Map<string, ProductMedia[]>();
    (media.data ?? []).forEach((item) => {
      const current = mediaMap.get(item.product_id) ?? [];
      current.push(normalizeMedia(item));
      mediaMap.set(item.product_id, current);
    });
    const favoriteCounts = groupByProductId(favorites.data ?? []);
    const favoritedIds = new Set((viewerFavorites.data ?? []).map((favorite) => favorite.product_id));

    const products = visible.map(
      (product: ProductRow): MarketplaceProduct => ({
        id: product.id,
        sellerId: product.seller_id,
        seller: toSeller(profileMap.get(product.seller_id), product.seller_id),
        campusId: product.campus_id,
        categoryId: product.category_id,
        title: product.title,
        description: product.description,
        condition: product.condition,
        price: product.price,
        currency: product.currency,
        status: toStatus(product.status),
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        media: mediaMap.get(product.id) ?? [],
        favoriteCount: favoriteCounts.get(product.id) ?? 0,
        favoritedByMe: favoritedIds.has(product.id),
      }),
    );

    const next = !query.productId && productRows.length > limit ? visible.at(-1) : undefined;
    return { data: { products, nextCursor: next ? { createdAt: next.created_at } : null }, error: null };
  }

  return {
    getProducts(query: MarketplaceQuery = {}): Promise<MarketplaceResult<MarketplacePage>> {
      return loadProducts(query);
    },
    async getProduct(id: string, viewerId?: string | null): Promise<MarketplaceResult<MarketplaceProduct | null>> {
      const result = await loadProducts({ productId: id, viewerId });
      if (!result.data) return { data: null, error: result.error ?? browseError() };
      return { data: result.data.products[0] ?? null, error: null };
    },
    async getCategories(): Promise<MarketplaceResult<MarketplaceCategory[]>> {
      const { data, error } = await client
        .from('marketplace_categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error || !data) return { data: null, error: browseError() };
      return {
        data: data.map((row: CategoryRow) => ({ id: row.id, name: row.name, slug: row.slug, parentId: row.parent_id })),
        error: null,
      };
    },
    async createProduct(input: CreateProductInput): Promise<MarketplaceResult<MarketplaceProduct>> {
      const title = input.title.trim();
      const description = input.description.trim();
      if (!title) return { data: null, error: 'Give your listing a title before publishing.' };
      if (!Number.isFinite(input.price) || input.price < 0) return { data: null, error: 'Enter a valid price.' };

      const { data: created, error } = await client
        .from('marketplace_products')
        .insert({
          seller_id: input.sellerId,
          campus_id: input.campusId,
          category_id: input.categoryId ?? null,
          title,
          description,
          condition: input.condition,
          price: input.price,
          currency: input.currency ?? 'INR',
          status: 'active',
        })
        .select('id')
        .single();
      if (error || !created) return { data: null, error: mutationError() };

      if (input.media?.length) {
        const { error: mediaError } = await client.from('product_media').insert(
          input.media.map((media, position) => ({
            product_id: created.id,
            media_asset_id: media.assetId,
            position,
          })),
        );
        if (mediaError) return { data: null, error: mutationError() };
      }

      const result = await loadProducts({ productId: created.id, viewerId: input.sellerId });
      if (!result.data || !result.data.products[0]) return { data: null, error: result.error ?? mutationError() };
      return { data: result.data.products[0], error: null };
    },
    async updateProduct(
      id: string,
      input: UpdateProductInput,
      viewerId?: string | null,
    ): Promise<MarketplaceResult<MarketplaceProduct>> {
      const patch: TablesUpdate<'marketplace_products'> = {};
      if (input.title !== undefined) {
        const title = input.title.trim();
        if (!title) return { data: null, error: 'A listing needs a title.' };
        patch.title = title;
      }
      if (input.description !== undefined) patch.description = input.description.trim();
      if (input.condition !== undefined) patch.condition = input.condition;
      if (input.categoryId !== undefined) patch.category_id = input.categoryId;
      if (input.status !== undefined) patch.status = input.status;
      if (input.price !== undefined) {
        if (!Number.isFinite(input.price) || input.price < 0) return { data: null, error: 'Enter a valid price.' };
        patch.price = input.price;
      }

      const { error } = await client.from('marketplace_products').update(patch).eq('id', id);
      if (error) return { data: null, error: mutationError() };
      const result = await loadProducts({ productId: id, viewerId });
      if (!result.data || !result.data.products[0]) return { data: null, error: result.error ?? mutationError() };
      return { data: result.data.products[0], error: null };
    },
    async deleteProduct(id: string): Promise<MarketplaceResult<void>> {
      const { error } = await client
        .from('marketplace_products')
        .update({ status: 'removed', deleted_at: new Date().toISOString() })
        .eq('id', id);
      return error ? { data: null, error: mutationError() } : { data: undefined, error: null };
    },
    async favoriteProduct(productId: string, userId: string): Promise<MarketplaceResult<void>> {
      const { error } = await client
        .from('product_favorites')
        .upsert({ product_id: productId, user_id: userId }, { onConflict: 'product_id,user_id' });
      return error ? { data: null, error: mutationError() } : { data: undefined, error: null };
    },
    async unfavoriteProduct(productId: string, userId: string): Promise<MarketplaceResult<void>> {
      const { error } = await client.from('product_favorites').delete().eq('product_id', productId).eq('user_id', userId);
      return error ? { data: null, error: mutationError() } : { data: undefined, error: null };
    },
    async reportProduct(productId: string, reporterId: string, reason: string): Promise<MarketplaceResult<void>> {
      const { error } = await client.from('product_reports').insert({ product_id: productId, reporter_id: reporterId, reason });
      return error ? { data: null, error: 'Unable to submit your report. Please try again.' } : { data: undefined, error: null };
    },
  };
}

export type MarketplaceService = ReturnType<typeof createMarketplaceService>;

