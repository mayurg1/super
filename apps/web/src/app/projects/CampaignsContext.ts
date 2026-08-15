import { createContext, useContext } from 'react';
import type { CampaignBrowseResult } from '@supercampus/supabase';

export interface CampaignContextValue {
  campaigns: readonly CampaignBrowseResult[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const CampaignContext = createContext<CampaignContextValue | null>(null);

export function useCampaigns(): CampaignContextValue {
  const value = useContext(CampaignContext);
  if (!value) throw new Error('useCampaigns must be used inside CampaignsProvider');
  return value;
}