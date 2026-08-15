import type { SupercampusSupabaseClient } from './client.js';
import type { Tables, TablesUpdate } from './database.types.js';

type CampaignRow = Tables<'campaigns'>;
type CampaignContributionRow = Tables<'campaign_contributions'>;
type ProjectRow = Tables<'projects'>;

export interface CampaignResult {
  id: string;
  projectId: string;
  creatorId: string;
  goalAmount: number;
  currency: string;
  startsAt: string;
  endsAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  raisedTotal: number;
  contributorCount: number;
}

export interface CampaignContribution {
  id: string;
  campaignId: string;
  contributorId: string | null;
  amount: number;
  currency: string;
  paymentReference: string | null;
  status: string;
  createdAt: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  authorId: string;
  author: { displayName: string; handle: string };
  body: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface CampaignBrowseResult {
  id: string;
  projectId: string;
  creatorId: string;
  goalAmount: number;
  currency: string;
  startsAt: string;
  endsAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  raisedTotal: number;
  contributorCount: number;
  projectTitle: string;
  projectSummary: string;
  projectCategory: string;
}

export interface CampaignCursor {
  createdAt: string;
}

export interface CampaignQuery {
  campusId?: string | null;
  cursor?: CampaignCursor | null;
  limit?: number;
  status?: string;
}

export interface CampaignPage {
  campaigns: CampaignBrowseResult[];
  nextCursor: CampaignCursor | null;
}

export interface CreateCampaignInput {
  projectId: string;
  creatorId: string;
  goalAmount: number;
  currency?: string;
  startsAt: string;
  endsAt: string;
  status?: string;
}

export interface UpdateCampaignInput {
  goalAmount?: number;
  currency?: string;
  startsAt?: string;
  endsAt?: string;
  status?: string;
}

export type CampaignResultGeneric<T> = { data: T; error: null } | { data: null; error: string };

const DEFAULT_CAMPAIGN_PAGE_SIZE = 20;

function browseError(): string {
  return 'Unable to load campaigns. Please try again.';
}

function campaignError(): string {
  return 'Unable to load campaign data. Please try again.';
}

function mutationError(): string {
  return 'Unable to save this campaign. Please try again.';
}

function toCampaign(row: CampaignRow, raised: number, contributors: number): CampaignResult {
  return {
    id: row.id,
    projectId: row.project_id,
    creatorId: row.creator_id,
    goalAmount: row.goal_amount,
    currency: row.currency,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    raisedTotal: raised,
    contributorCount: contributors,
  };
}

function toCampaignBrowse(
  row: CampaignRow,
  project: Pick<ProjectRow, 'title' | 'summary' | 'category'>,
  stats: { total: number; count: number },
): CampaignBrowseResult {
  return {
    id: row.id,
    projectId: row.project_id,
    creatorId: row.creator_id,
    goalAmount: row.goal_amount,
    currency: row.currency,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    raisedTotal: stats.total,
    contributorCount: stats.count,
    projectTitle: project.title,
    projectSummary: project.summary,
    projectCategory: project.category,
  };
}

function toContribution(row: CampaignContributionRow): CampaignContribution {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    contributorId: row.contributor_id,
    amount: row.amount,
    currency: row.currency,
    paymentReference: row.payment_reference,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function getContributionStats(client: SupercampusSupabaseClient, campaignId: string): Promise<{ total: number; count: number }> {
  const { data } = await client.from('campaign_contributions').select('amount, status').eq('campaign_id', campaignId).in('status', ['pending', 'authorized', 'settled']);
  if (!data) return { total: 0, count: 0 };
  const active = data.filter((c) => c.status !== 'failed' && c.status !== 'refunded');
  return { total: active.reduce((sum, c) => sum + Number(c.amount), 0), count: active.length };
}

async function getContributionStatsBatch(
  client: SupercampusSupabaseClient,
  campaignIds: readonly string[],
): Promise<Map<string, { total: number; count: number }>> {
  const stats = new Map<string, { total: number; count: number }>();
  for (const id of campaignIds) stats.set(id, { total: 0, count: 0 });
  if (campaignIds.length === 0) return stats;
  const { data, error } = await client
    .from('campaign_contributions')
    .select('campaign_id, amount, status')
    .in('campaign_id', [...campaignIds])
    .in('status', ['pending', 'authorized', 'settled']);
  if (error || !data) return stats;
  for (const row of data) {
    if (row.status === 'failed' || row.status === 'refunded') continue;
    const current = stats.get(row.campaign_id);
    if (!current) continue;
    current.total += Number(row.amount);
    current.count += 1;
    stats.set(row.campaign_id, current);
  }
  return stats;
}

export function createCampaignService(client: SupercampusSupabaseClient) {
  return {
    async getCampaign(projectId: string): Promise<CampaignResultGeneric<CampaignResult | null>> {
      const { data: campaignRows, error } = await client.from('campaigns').select('*').eq('project_id', projectId).limit(1);
      if (error) return { data: null, error: campaignError() };
      if (!campaignRows || campaignRows.length === 0) return { data: null, error: null };
      const campaign = campaignRows[0]!;
      const stats = await getContributionStats(client, campaign.id);
      return { data: toCampaign(campaign, stats.total, stats.count), error: null };
    },
    async getCampaigns(query: CampaignQuery = {}): Promise<CampaignResultGeneric<CampaignPage>> {
      const limit = Math.max(1, Math.min(query.limit ?? DEFAULT_CAMPAIGN_PAGE_SIZE, 50));

      // campaigns is the driving table — since campaigns.project_id is UNIQUE,
      // every campaign row maps to exactly one project, so only projects that
      // have a campaign will appear in the browse view.

      // If filtering by campus, resolve the set of project IDs first so we can
      // filter on campaigns.project_id directly (keeps the query type-safe and
      // avoids touching the joined projects table for filtering).
      let projectIds: string[] | null = null;
      if (query.campusId) {
        const { data: campusProjectRows, error: campusError } = await client
          .from('projects')
          .select('id')
          .eq('campus_id', query.campusId)
          .not('status', 'eq', 'removed');
        if (campusError || !campusProjectRows) return { data: null, error: browseError() };
        if (campusProjectRows.length === 0) return { data: { campaigns: [], nextCursor: null }, error: null };
        projectIds = campusProjectRows.map((p) => p.id);
      }

      const filterStatus = query.status ?? 'active';
      let request = client
        .from('campaigns')
        .select('*')
        .eq('status', filterStatus)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1);

      if (projectIds) request = request.in('project_id', projectIds);
      if (query.cursor) {
        request = request.lt('created_at', query.cursor.createdAt);
      }

      const { data: campaignRows, error } = await request;
      if (error || !campaignRows) return { data: null, error: browseError() };

      const visible = campaignRows.slice(0, limit);
      if (visible.length === 0) return { data: { campaigns: [], nextCursor: null }, error: null };

      // Batch-fetch project metadata for all visible campaigns
      const campaignProjectIds = [...new Set(visible.map((c) => c.project_id))];
      const { data: projectRows, error: projectError } = await client
        .from('projects')
        .select('id, title, summary, category')
        .in('id', campaignProjectIds);
      if (projectError || !projectRows) return { data: null, error: browseError() };
      const projectMap = new Map(projectRows.map((p) => [p.id, p]));

      // Batch-fetch contribution stats for all visible campaigns
      // NOTE: contributions_read RLS (contributor_id=auth.uid() or crowdfunding.manage)
      // limits these stats to the current user's own contributions unless the
      // user has crowdfunding.manage. Only managers see accurate totals.
      const campaignIds = visible.map((c) => c.id);
      const statsMap = await getContributionStatsBatch(client, campaignIds);

      const next = campaignRows.length > limit ? campaignRows[campaignRows.length - 1] : undefined;
      const nextCursor = next ? { createdAt: next.created_at } : null;

      return {
        data: {
          campaigns: visible.map((row) => {
            const project = projectMap.get(row.project_id);
            return toCampaignBrowse(
              row,
              project ?? { title: '', summary: '', category: '' },
              statsMap.get(row.id) ?? { total: 0, count: 0 },
            );
          }),
          nextCursor,
        },
        error: null,
      };
    },
    async createCampaign(input: CreateCampaignInput): Promise<CampaignResultGeneric<CampaignResult>> {
      const { data, error } = await client.from('campaigns').insert({
        project_id: input.projectId, creator_id: input.creatorId, goal_amount: input.goalAmount,
        currency: input.currency ?? 'INR', starts_at: input.startsAt, ends_at: input.endsAt,
        status: input.status ?? 'draft',
      }).select().single();
      if (error || !data) return { data: null, error: mutationError() };
      return { data: toCampaign(data, 0, 0), error: null };
    },
    async updateCampaign(id: string, input: UpdateCampaignInput): Promise<CampaignResultGeneric<CampaignResult>> {
      const patch: TablesUpdate<'campaigns'> = {};
      if (input.goalAmount !== undefined) patch.goal_amount = input.goalAmount;
      if (input.currency !== undefined) patch.currency = input.currency;
      if (input.startsAt !== undefined) patch.starts_at = input.startsAt;
      if (input.endsAt !== undefined) patch.ends_at = input.endsAt;
      if (input.status !== undefined) patch.status = input.status;
      const { data, error } = await client.from('campaigns').update(patch).eq('id', id).select().single();
      if (error || !data) return { data: null, error: mutationError() };
      const stats = await getContributionStats(client, data.id);
      return { data: toCampaign(data, stats.total, stats.count), error: null };
    },
    async createContribution(campaignId: string, contributorId: string, amount: number, currency: string): Promise<CampaignResultGeneric<CampaignContribution>> {
      // TODO: PAYMENT GATEWAY INTEGRATION REQUIRED HERE — records intent only, no money moves
      // until a provider (e.g. Razorpay) is wired in to confirm and flip status to 'settled'.
      // campaign_contributions RLS has `contributions_trusted with check(false)`, so this insert
      // is blocked from browser clients and must go through a trusted server role.
      const paymentReference = crypto.randomUUID();
      const { data, error } = await client.from('campaign_contributions').insert({
        campaign_id: campaignId, contributor_id: contributorId, amount, currency,
        payment_reference: paymentReference, status: 'pending',
      }).select().single();
      if (error || !data) {
        return { data: null, error: `Contribution blocked. (RLS forbids client inserts; a trusted server/payment provider is required.) ${error?.message ?? ''}` };
      }
      return { data: toContribution(data), error: null };
    },
    async listContributions(campaignId: string): Promise<CampaignResultGeneric<CampaignContribution[]>> {
      const { data, error } = await client.from('campaign_contributions').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false });
      if (error) return { data: null, error: campaignError() };
      return { data: (data ?? []).map(toContribution), error: null };
    },
    async postCampaignUpdate(campaignId: string, authorId: string, body: string): Promise<CampaignResultGeneric<CampaignUpdate>> {
      const cleaned = body.trim();
      if (!cleaned) return { data: null, error: 'An update cannot be empty.' };
      const { data: row, error } = await client.from('campaign_updates').insert({ campaign_id: campaignId, author_id: authorId, body: cleaned, published_at: new Date().toISOString() }).select().single();
      if (error || !row) return { data: null, error: mutationError() };
      const { data: profiles } = await client.from('profiles').select('id, display_name, handle').eq('id', authorId).limit(1);
      const author = profiles?.[0] ? { displayName: profiles[0].display_name, handle: profiles[0].handle } : { displayName: 'Campus member', handle: 'member' };
      return { data: { id: row.id, campaignId: row.campaign_id, authorId: row.author_id, author, body: row.body, publishedAt: row.published_at, createdAt: row.created_at }, error: null };
    },
    async getCampaignUpdates(campaignId: string): Promise<CampaignResultGeneric<CampaignUpdate[]>> {
      const { data: rows, error } = await client.from('campaign_updates').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false });
      if (error) return { data: null, error: campaignError() };
      const authorIds = [...new Set((rows ?? []).map((r) => r.author_id))];
      const { data: profiles } = await client.from('profiles').select('id, display_name, handle').in('id', authorIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      return { data: (rows ?? []).map((r) => { const p = profileMap.get(r.author_id); return { id: r.id, campaignId: r.campaign_id, authorId: r.author_id, author: p ? { displayName: p.display_name, handle: p.handle } : { displayName: 'Campus member', handle: 'member' }, body: r.body, publishedAt: r.published_at, createdAt: r.created_at }; }), error: null };
    },
  };
}

export type CampaignService = ReturnType<typeof createCampaignService>;