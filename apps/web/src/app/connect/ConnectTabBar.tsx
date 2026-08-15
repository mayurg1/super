export function ConnectTabBar({ activeTab, onTabChange }: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}): React.ReactElement {
  const tabs = [
    { id: 'alumni', label: 'Alumni', icon: '🎓' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'faculty', label: 'Faculty', icon: '👨🏫' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'events', label: 'Events', icon: '🎉' },
  ];
  return (
    <div className="sc-connect-tab-bar" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={activeTab === t.id}
          className={'sc-connect-tab' + (activeTab === t.id ? ' active' : '')}
          onClick={() => onTabChange(t.id)}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}