import { createContext, useContext } from 'react';
import type { CreateProjectInput, ProjectResult, UpdateProjectInput } from '@supercampus/supabase';

export interface ProjectContextValue {
  projects: readonly ProjectResult[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  statusFilter: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setStatusFilter: (status: string | null) => void;
  createProject: (input: CreateProjectInput) => Promise<ProjectResult | null>;
  updateProject: (id: string, input: UpdateProjectInput) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  requestToJoin: (projectId: string) => Promise<boolean>;
  respondToMember: (projectId: string, userId: string, status: string) => Promise<boolean>;
}

export const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProjects(): ProjectContextValue {
  const value = useContext(ProjectContext);
  if (!value) throw new Error('useProjects must be used inside ProjectsProvider');
  return value;
}