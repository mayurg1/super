/** Renders a human-readable date range from HTML `date` input values (or null). */
export function formatDateRange(startedOn: string | null, endedOn: string | null, isCurrent = false): string {
  const start = startedOn ? new Date(`${startedOn}T00:00:00`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '—';
  if (isCurrent) return `${start} – Present`;
  const end = endedOn ? new Date(`${endedOn}T00:00:00`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '';
  return end ? `${start} – ${end}` : start;
}