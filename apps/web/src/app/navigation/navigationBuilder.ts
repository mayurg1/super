import type { AuthorizationFeature } from '@supercampus/supabase';
export interface NavigationItem { id:string; title:string; icon:string; route:string; sortOrder:number; feature:string; badge?:string; children?:NavigationItem[] }
export function buildNavigation(features:readonly AuthorizationFeature[]):NavigationItem[]{return features.filter(f=>f.route).map(f=>({id:f.key,title:f.name,icon:f.icon??'•',route:f.route!,sortOrder:f.sortOrder,feature:f.key})).sort((a,b)=>a.sortOrder-b.sortOrder)}
