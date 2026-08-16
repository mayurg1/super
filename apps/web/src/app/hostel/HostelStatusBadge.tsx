const BADGE_CLASS: Record<string, string> = {
  pending: 'sc-badge-pending',
  approved: 'sc-badge-approved',
  rejected: 'sc-badge-rejected',
  open: 'sc-badge-open',
  assigned: 'sc-badge-assigned',
  resolved: 'sc-badge-resolved',
};

export function HostelStatusBadge({ status }: { status: string }): React.ReactElement {
  return <span className={`sc-badge ${BADGE_CLASS[status] ?? 'sc-badge-pending'}`}>{status}</span>;
}