export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
}: EmptyStateProps): React.ReactElement {
  return (
    <div className="sc-empty-state">
      <div className="sc-empty-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="sc-empty-title">{title}</h3>
      {description ? <p className="sc-empty-desc">{description}</p> : null}
      {action ? <div className="sc-empty-action">{action}</div> : null}
    </div>
  );
}
