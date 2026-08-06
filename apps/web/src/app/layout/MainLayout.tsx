import { Link, useLocation } from 'react-router-dom';
import { BOTTOM_NAV_ITEMS, ROUTES } from '@supercampus/core';
import { useTheme } from '@supercampus/shared';

export function TopBar(): React.ReactElement {
  return (
    <header className="sc-topbar">
      <div className="sc-topbar-logo">🏛️ SUPERCAMPUS</div>
      <div className="sc-topbar-actions">
        <button type="button" className="sc-icon-btn" title="Notifications" aria-label="Notifications">
          🔔
        </button>
        <ThemeToggleButton />
      </div>
    </header>
  );
}

function ThemeToggleButton(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className="sc-icon-btn"
      title="Toggle theme"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

export function BottomNav(): React.ReactElement {
  const location = useLocation();

  return (
    <nav className="sc-bottom-nav" aria-label="Main navigation">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path !== ROUTES.home && location.pathname.startsWith(`/${item.path.split('/')[1]}`));

        return (
          <Link
            key={item.id}
            to={item.path}
            className={`sc-nav-item${isActive ? ' active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="sc-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="sc-app-shell">
      <TopBar />
      <main className="sc-app-main">{children}</main>
      <BottomNav />
    </div>
  );
}
