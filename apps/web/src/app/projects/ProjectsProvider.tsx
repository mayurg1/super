import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createProjectService,
  useAuth,
  useProfile,
  useSupabase,
  type CreateProjectInput,
  type ProjectResult,
  type UpdateProjectInput,
} from '@supercampus/supabase';
import { ProjectContext, type ProjectContextValue } from './ProjectsContext';

export function ProjectsProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const client = useSupabase();
  const { user } = useAuth();
  const { profile } = useProfile();
  const service = useMemo(() => createProjectService(client), [client]);

  const [projects, setProjects] = useState<ProjectResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ createdAt: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const initializedForUser = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setCursor(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await service.getProjects({ campusId: profile?.campus_id, status: statusFilter ?? undefined, viewerId: user.id });
    if (!result.data) {
      setError(result.error ?? 'Unable to load projects.');
      setProjects([]);
      setCursor(null);
    } else {
      setProjects(result.data.projects);
      setCursor(result.data.nextCursor);
    }
    setLoading(false);
  }, [profile?.campus_id, service, statusFilter, user]);

  useEffect(() => {
    if (!user) {
      initializedForUser.current = null;
      setProjects([]);
      setCursor(null);
      setLoading(false);
      return;
    }
    const key = `${user.id}:${statusFilter ?? ''}`;
    if (initializedForUser.current !== key) {
      initializedForUser.current = key;
      void refresh();
    }
  }, [refresh, statusFilter, user]);

  const loadMore = useCallback(async () => {
    if (!user || !cursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    const result = await service.getProjects({ campusId: profile?.campus_id, cursor, status: statusFilter ?? undefined, viewerId: user.id });
    if (!result.data) {
      setError(result.error ?? 'Unable to load more projects.');
    } else {
      setProjects((current) => [...current, ...result.data.projects.filter((item) => !current.some((existing) => existing.id === item.id))]);
      setCursor(result.data.nextCursor);
    }
    setLoadingMore(false);
  }, [cursor, loadingMore, profile?.campus_id, service, statusFilter, user]);

  const createProject = useCallback(
    async (input: CreateProjectInput): Promise<ProjectResult | null> => {
      if (!user) return null;
      setError(null);
      const result = await service.createProject({ ...input, ownerId: user.id, campusId: input.campusId ?? profile?.campus_id ?? null });
      if (!result.data) {
        setError(result.error ?? 'Your project could not be created.');
        return null;
      }
      setProjects((current) => [result.data, ...current]);
      return result.data;
    },
    [profile?.campus_id, service, user],
  );

  const updateProject = useCallback(
    async (id: string, input: UpdateProjectInput): Promise<boolean> => {
      if (!user) return false;
      setError(null);
      const result = await service.updateProject(id, input);
      if (!result.data) {
        setError(result.error ?? 'The project could not be saved.');
        return false;
      }
      setProjects((current) => current.map((item) => (item.id === id ? result.data : item)));
      return true;
    },
    [service, user],
  );

  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;
      setError(null);
      const result = await service.deleteProject(id);
      if (result.error) {
        setError(result.error);
        return false;
      }
      setProjects((current) => current.filter((item) => item.id !== id));
      return true;
    },
    [service, user],
  );

  const requestToJoin = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!user) return false;
      setError(null);
      const result = await service.requestToJoin(projectId, user.id);
      if (result.error) {
        setError(result.error);
        return false;
      }
      return true;
    },
    [service, user],
  );

  const respondToMember = useCallback(
    async (projectId: string, memberUserId: string, status: string): Promise<boolean> => {
      if (!user) return false;
      setError(null);
      const result = await service.respondToMember(projectId, memberUserId, status);
      if (result.error) {
        setError(result.error);
        return false;
      }
      return true;
    },
    [service, user],
  );

  const value = useMemo<ProjectContextValue>(
    () => ({
      projects,
      loading,
      loadingMore,
      error,
      hasMore: cursor !== null,
      statusFilter,
      refresh,
      loadMore,
      setStatusFilter,
      createProject,
      updateProject,
      deleteProject,
      requestToJoin,
      respondToMember,
    }),
    [
      createProject, cursor, deleteProject, error, loadMore, loading, loadingMore,
      projects, refresh, requestToJoin, respondToMember, statusFilter, updateProject,
    ],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}