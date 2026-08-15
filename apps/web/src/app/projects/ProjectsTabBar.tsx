import type { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

const PROJECT_TABS: { id: string; label: string; icon?: string }[] = [
  { id: 'projects', label: 'Projects' },
  { id: 'crowdfunding', label: 'Crowdfunding', icon: '\u{1F4B0}' },
];

type ProjectTab = string;

function isValidTab(tab: string | null): tab is ProjectTab {
  return tab !== null && PROJECT_TABS.some((t) => t.id === tab);
}

export function ProjectsTabBar(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('view');
  const activeTab = isValidTab(rawTab) ? rawTab : 'projects';

  const handleTabChange = (tab: ProjectTab) => {
    setSearchParams({ view: tab });
  };

  return (
    <nav className="sc-market-tab-bar" role="tablist" aria-label="Projects sub-tabs">
      {PROJECT_TABS.map((tab) => {
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
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>} {tab.label}
          </button>
        );
      })}
    </nav>
  );
}