import type { AuthorizationFeature } from '@supercampus/supabase';
import type { NavigationItem } from '../navigation/navigationBuilder';
export interface DashboardSectionModel { id:string; title:string; items:readonly NavigationItem[] }
export function buildDashboard(features:readonly AuthorizationFeature[],actions:readonly NavigationItem[]):readonly DashboardSectionModel[]{const items=actions.filter(a=>features.some(f=>f.key===a.feature));return['Quick actions','Pinned features','Recommended modules'].map((title,index)=>({id:`section-${index}`,title,items}))}
