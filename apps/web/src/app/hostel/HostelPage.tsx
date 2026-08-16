import { Link, useSearchParams } from 'react-router-dom';
import { useAuthorization, useProfile } from '@supercampus/supabase';
import { ROUTES } from '@supercampus/core';
import { Button, EmptyState } from '@supercampus/shared';
import { HostelProvider } from './HostelProvider';
import { HostelReviewQueue } from './HostelReviewQueue';
import { OutpassRequestForm } from './OutpassRequestForm';
import { MyOutpassList } from './MyOutpassList';
import { ComplaintForm } from './ComplaintForm';
import { MyComplaintsList } from './MyComplaintsList';

const HOSTEL_TABS = [
  { id: 'outpass', label: 'Outpass', icon: '🚪' },
  { id: 'complaints', label: 'Complaints', icon: '📢' },
] as const;

const REVIEW_TAB = { id: 'review', label: 'Review Queue', icon: '🗂' } as const;

type HostelTab = (typeof HOSTEL_TABS)[number]['id'] | (typeof REVIEW_TAB)['id'];

function OutpassView(): React.ReactElement {
  return (
    <div className="sc-hostel-stack">
      <OutpassRequestForm />
      <MyOutpassList />
    </div>
  );
}

function ComplaintsView(): React.ReactElement {
  return (
    <div className="sc-hostel-stack">
      <ComplaintForm />
      <MyComplaintsList />
    </div>
  );
}

function HostelView(): React.ReactElement {
  const { hasPermission } = useAuthorization();
  const { profile } = useProfile();
  const isHosteller = profile?.residency_type === 'hosteller';
  const reviewEnabled =
    hasPermission('hostel.outpasses.manage') || hasPermission('hostel.complaints.manage');

  // Outpass + Complaints are residents-only (residency_type === 'hosteller').
  // Review Queue is purely permission-based and stays visible for staff
  // regardless of their own residency status.
  const residentTabs: readonly { id: HostelTab; label: string; icon: string }[] = isHosteller
    ? HOSTEL_TABS
    : [];
  const tabs = reviewEnabled ? [...residentTabs, REVIEW_TAB] : residentTabs;

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: HostelTab = tabs.some((t) => t.id === rawTab)
    ? (rawTab as HostelTab)
    : (tabs[0]?.id ?? REVIEW_TAB.id);

  function handleTabChange(tab: string): void {
    setSearchParams({ tab });
  }

  // No hosteller status AND no review permissions: explain instead of showing a blank page.
  if (tabs.length === 0) {
    return (
      <section className="sc-hostel" aria-labelledby="hostel-title">
        <header>
          <h1 id="hostel-title" className="sc-page-title">
            🏛 Hostel
          </h1>
          <p className="sc-page-desc">Outpass requests and hostel complaints.</p>
        </header>
        <EmptyState
          icon="🏛️"
          title="Hostel services are for hostel residents"
          description="This section is for hostel residents. If you live in a hostel, update your residency status in your Profile."
          action={
            <Link to={ROUTES.profile}>
              <Button variant="outline">Update my profile</Button>
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section className="sc-hostel" aria-labelledby="hostel-title">
      <header>
        <h1 id="hostel-title" className="sc-page-title">
          🏛 Hostel
        </h1>
        <p className="sc-page-desc">Outpass requests and hostel complaints.</p>
      </header>
      {!isHosteller ? (
        <p className="sc-hostel-residency-note" role="note">
          Outpass and complaints are for hostel residents. If you live in a hostel, update your
          residency status in your <Link to={ROUTES.profile}>Profile</Link>.
        </p>
      ) : null}
      <nav className="sc-market-tab-bar" role="tablist" aria-label="Hostel sub-tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`sc-market-tab${isActive ? ' active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <span aria-hidden="true">{tab.icon}</span> {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="sc-market-tabpanel">
        {activeTab === 'complaints' ? (
          <ComplaintsView />
        ) : activeTab === 'review' ? (
          <HostelReviewQueue />
        ) : (
          <OutpassView />
        )}
      </div>
    </section>
  );
}

export function HostelPage(): React.ReactElement {
  return (
    <HostelProvider>
      <HostelView />
    </HostelProvider>
  );
}