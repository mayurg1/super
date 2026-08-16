import type { AuthorizationFeature } from '@supercampus/supabase';
export interface NavigationItem { id:string; title:string; icon:string; route:string; sortOrder:number; feature:string; badge?:string; children?:NavigationItem[] }
export function buildNavigation(features:readonly AuthorizationFeature[]):NavigationItem[]{
  // Collapse features whose route starts with "/connect" into a single "Connect" nav item
  const connectItems = features.filter(f => f.route?.startsWith('/connect'));
  const collapsedConnect: NavigationItem | null = connectItems.length > 0 ? {
    id: 'connect',
    title: 'Connect',
    icon: connectItems.find(f => f.route === '/connect/alumni')?.icon ?? connectItems[0].icon ?? '👥',
    route: '/connect',
    sortOrder: Math.min(...connectItems.map(f => f.sortOrder)),
    feature: 'directory',
  } : null;

  // Collapse features whose route starts with "/market" into a single "Market" nav item
  const marketItems = features.filter(f => f.route?.startsWith('/market'));
  const collapsedMarket: NavigationItem | null = marketItems.length > 0 ? {
    id: 'market',
    title: 'Market',
    icon: marketItems.find(f => f.key === 'marketplace')?.icon ?? marketItems[0].icon ?? '🛒',
    route: '/market',
    sortOrder: Math.min(...marketItems.map(f => f.sortOrder)),
    feature: 'market',
  } : null;

  const navItems = features
    .filter(f => f.route && !f.route.startsWith('/connect') && !f.route.startsWith('/market') && !f.route.startsWith('/projects/crowdfund') && f.key !== 'dashboard')
    .map(f => ({id:f.key,title:f.name,icon:f.icon??'•',route:f.route!,sortOrder:f.sortOrder,feature:f.key}));

  if (collapsedConnect) navItems.push(collapsedConnect);
  if (collapsedMarket) navItems.push(collapsedMarket);
  return navItems.sort((a,b)=>a.sortOrder-b.sortOrder);
}
