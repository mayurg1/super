import { createContext, useContext } from 'react';
import type { MarketplaceCategory, MarketplaceProduct, MarketplaceStatus } from '@supercampus/supabase';

export interface CreateProductFields {
  title: string;
  description: string;
  condition: string;
  price: number;
  categoryId?: string | null;
  media?: readonly { assetId: string }[];
}

export interface UpdateProductFields {
  title?: string;
  description?: string;
  condition?: string;
  price?: number;
  categoryId?: string | null;
  status?: MarketplaceStatus;
}

export interface MarketplaceContextValue {
  products: readonly MarketplaceProduct[];
  categories: readonly MarketplaceCategory[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  activeCategoryId: string | null;
  pendingFavoriteIds: ReadonlySet<string>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setCategory: (categoryId: string | null) => void;
  getProduct: (productId: string) => Promise<MarketplaceProduct | null>;
  createProduct: (input: CreateProductFields) => Promise<boolean>;
  updateProduct: (productId: string, input: UpdateProductFields) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  toggleFavorite: (productId: string) => Promise<boolean>;
  reportProduct: (productId: string, reason: string) => Promise<boolean>;
  hasReported: (productId: string) => Promise<boolean>;
  uploadProductImages: (files: readonly File[]) => Promise<string[] | null>;
  getMediaUrls: (assetIds: readonly string[]) => Promise<Record<string, string>>;
}

export const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function useMarketplace(): MarketplaceContextValue {
  const value = useContext(MarketplaceContext);
  if (!value) throw new Error('useMarketplace must be used inside MarketplaceProvider');
  return value;
}
