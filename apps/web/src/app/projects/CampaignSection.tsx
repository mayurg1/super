import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input } from '@supercampus/shared';
import { createCampaignService, useSupabase, useAuth, type CampaignResult, type CampaignUpdate } from '@supercampus/supabase';

export function CampaignSection({ projectId, isCreator }: { projectId: string; isCreator: boolean }): React.ReactElement | null {
  const client = useSupabase();
  const { user } = useAuth();
  const svc = useCallback(() => createCampaignService(client), [client]);
  const [campaign, setCampaign] = useState<CampaignResult | null>(null);
  const [amount, setAmount] = useState('');
  const [contribMsg, setContribMsg] = useState<string | null>(null);
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [updateBody, setUpdateBody] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void svc().getCampaign(projectId).then((r) => { if (active) { setCampaign(r.data ?? null); setLoading(false); } });
    void svc().getCampaignUpdates(projectId).then((r) => { if (active) setUpdates(r.data ?? []); });
    return () => { active = false; };
  }, [projectId, svc]);

  async function contribute(): Promise<void> {
    if (!user || !campaign) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) { setContribMsg('Enter a valid amount.'); return; }
    setContribMsg(null);
    const r = await svc().createContribution(campaign.id, user.id, amt, campaign.currency);
    setContribMsg(r.data ? `✓ Contribution recorded (${amt} ${campaign.currency}). Payment provider integration pending.` : r.error ?? 'Failed.');
  }

  if (loading) return null;
  if (campaign === null) return null;
  const c = campaign; // narrowed for closure safety

  const pct = c.goalAmount > 0 ? Math.round((c.raisedTotal / c.goalAmount) * 100) : 0;

  return (
    <Card padding="md" className="sc-campaign">
      <h3>Campaign — {c.status}</h3>
      <div className="sc-campaign-progress"><div className="sc-campaign-bar" style={{ width: `${Math.min(pct, 100)}%` }}></div></div>
      <p>Raised {c.raisedTotal} {c.currency} of {c.goalAmount} {c.currency} ({pct}%) · {c.contributorCount} contributor(s)</p>
      <Input label="Contribute (amount)" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <Button variant="primary" size="sm" disabled={!amount} onClick={() => void contribute()}>Contribute</Button>
      {contribMsg && <p className="sc-project-meta" role="alert">{contribMsg}</p>}
      {updates.length > 0 && <section><h4>Updates</h4>{updates.map((u) => <p key={u.id}><strong>{u.author.displayName}:</strong> {u.body}</p>)}</section>}
      {isCreator && (
        <div><textarea value={updateBody} onChange={(e) => setUpdateBody(e.target.value)} rows={2} placeholder="Post an update…" />
        <Button size="sm" disabled={!updateBody.trim()} onClick={async () => { if (user) { await svc().postCampaignUpdate(c.id, user.id, updateBody); setUpdateBody(''); } }}>Post</Button></div>
      )}
    </Card>
  );
}