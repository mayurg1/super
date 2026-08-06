import { Button, EmptyState } from '@supercampus/shared';

export function ErrorState({ onRetry }: { onRetry: () => Promise<void> }): React.ReactElement { return <EmptyState icon="!" title="Unable to load the feed" description="Please check your connection and try again." action={<Button type="button" onClick={() => void onRetry()}>Try again</Button>} />; }
