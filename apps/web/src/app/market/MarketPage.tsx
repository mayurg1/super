import { lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MarketplacePage } from '../marketplace/MarketplacePage';

const FoodPage = lazy(() => import('../food/FoodPage').then((m) => ({ default: m.FoodPage })));

const MARKET_TABS = [
  { id: 'food', label: 'Food Delivery', icon: '🍽' },
  { id: 'buysell', label: 'Buy & Sell', icon: '🛍' },
] as const;

type MarketTab = (typeof MARKET_TABS)[number]['id'];

function isValidTab(tab: string | null): tab is MarketTab {
  return tab !== null && MARKET_TABS.some((t) => t.id === tab);
}

export function MarketPage(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = isValidTab(rawTab) ? rawTab : 'food';

  const handleTabChange = (tab: MarketTab) => {
    setSearchParams({ tab });
  };

  return (
    <section className="sc-market" aria-label="Market">
      <nav className="sc-market-tab-bar" role="tablist" aria-label="Market sub-tabs">
        {MARKET_TABS.map((tab) => {
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
        {activeTab === 'buysell' ? (
          <MarketplacePage />
        ) : (
          <FoodPage />
        )}
      </div>
    </section>
  );
}

