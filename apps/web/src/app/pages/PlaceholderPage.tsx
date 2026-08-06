import { Card, EmptyState } from '@supercampus/shared';

export interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: string;
}

export function PlaceholderPage({
  title,
  description,
  icon = '🚧',
}: PlaceholderPageProps): React.ReactElement {
  return (
    <Card>
      <EmptyState icon={icon} title={title} description={description} />
    </Card>
  );
}
