import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createCampaignService,
  useAuth,
  useProfile,
  useSupabase,
  type CampaignBrowseResult,
} from '@supercampus/supabase';
import { CampaignContext, type CampaignContextValue } from './CampaignsContext';

export function CampaignsProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const client = useSupabase();
  const { user } = useAuth();
  const { profile } = useProfile();
  const service = useMemo(() => createCampaignService(client), [client]);

  const [campaigns, setCampaigns] = useState<CampaignBrowseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ createdAt: string } | null>(null);
  const initializedForUser = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setCampaigns([]);
      setCursor(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await service.getCampaigns({ campusId: profile?.campus_id });
    if (!result.data) {
      setError(result.error ?? 'Unable to load campaigns.');
      setCampaigns([]);
      setCursor(null);
    } else {
      setCampaigns(result.data.campaigns);
      setCursor(result.data.nextCursor);
    }
    setLoading(false);
  }, [profile?.campus_id, service, user]);

  useEffect(() => {
    if (!user) {
      initializedForUser.current = null;
      setCampaigns([]);
      setCursor(null);
      setLoading(false);
      return;
    }
    if (initializedForUser.current !== user.id) {
      initializedForUser.current = user.id;
      void refresh();
    }
  }, [refresh, user]);

  const loadMore = useCallback(async () => {
    if (!user || !cursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    const result = await service.getCampaigns({ campusId: profile?.campus_id, cursor });
    if (!result.data) {
      setError(result.error ?? 'Unable to load more campaigns.');
    } else {
      setCampaigns((current) =>
        [...current, ...result.data.campaigns.filter((item) => !current.some((existing) => existing.id === item.id))],
      );
      setCursor(result.data.nextCursor);
    }
    setLoadingMore(false);
  }, [cursor, loadingMore, profile?.campus_id, service, user]);

  const value = useMemo<CampaignContextValue>(
    () => ({
      campaigns,
      loading,
      loadingMore,
      error,
      hasMore: cursor !== null,
      refresh,
      loadMore,
    }),
    [campaigns, cursor, error, loadMore, loading, loadingMore, refresh],
  );

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
}