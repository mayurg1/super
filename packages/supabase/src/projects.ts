import type { SupercampusSupabaseClient } from './client.js';
import type { Tables, TablesUpdate } from './database.types.js';

type ProjectRow = Tables<'projects'>;
type MemberRow = Tables<'project_members'>;
type ProfileRow = Tables<'profiles'>;

export interface ProjectMemberProfile {
  userId: string;
  displayName: string;
  handle: string;
  memberRole: string;
  memberStatus: string;
}

export interface ProjectSkill {
  skillId: string;
  skillName: string;
  requirementLevel: number | null;
}

export interface ProjectDetail {
  project: ProjectResult;
  members: ProjectMemberProfile[];
  skills: ProjectSkill[];
}

export interface ProjectResult {
  id: string;
  ownerId: string;
  campusId: string | null;
  title: string;
  summary: string;
  body: string;
  category: string;
  status: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCursor {
  createdAt: string;
}

export interface ProjectQuery {
  campusId?: string | null;
  cursor?: ProjectCursor | null;
  limit?: number;
  status?: string;
  viewerId?: string | null;
}

export interface ProjectPage {
  projects: ProjectResult[];
  nextCursor: ProjectCursor | null;
}

export interface CreateProjectInput {
  ownerId: string;
  campusId?: string | null;
  title: string;
  summary?: string;
  body?: string;
  category: string;
  status?: string;
  visibility?: string;
}

export interface UpdateProjectInput {
  title?: string;
  summary?: string;
  body?: string;
  category?: string;
  status?: string;
  visibility?: string;
}

export type ProjectResultGeneric<T> = { data: T; error: null } | { data: null; error: string };

const DEFAULT_PAGE_SIZE = 20;

function browseError(): string {
  return 'Unable to load projects. Please try again.';
}

function mutationError(): string {
  return 'Unable to save this project. Please try again.';
}

function toProject(row: ProjectRow): ProjectResult {
  return {
    id: row.id,
    ownerId: row.owner_id,
    campusId: row.campus_id,
    title: row.title,
    summary: row.summary,
    body: row.body,
    category: row.category,
    status: row.status,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toMemberProfile(profile: Pick<ProfileRow, 'id' | 'display_name' | 'handle'>, member: MemberRow): ProjectMemberProfile {
  return {
    userId: member.user_id,
    displayName: profile.display_name,
    handle: profile.handle,
    memberRole: member.member_role,
    memberStatus: member.status,
  };
}

export function createProjectService(client: SupercampusSupabaseClient) {
  async function loadProjects(query: ProjectQuery & { projectId?: string }): Promise<ProjectResultGeneric<ProjectPage>> {
    const limit = Math.max(1, Math.min(query.limit ?? DEFAULT_PAGE_SIZE, 50));
    let request = client
      .from('projects')
      .select('*')
      .not('status', 'eq', 'removed')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(query.projectId ? 1 : limit + 1);

    if (query.projectId) request = request.eq('id', query.projectId);
    if (query.campusId) request = request.eq('campus_id', query.campusId);
    if (query.status) request = request.eq('status', query.status);
    if (query.cursor) request = request.lt('created_at', query.cursor.createdAt);

    const { data: projectRows, error } = await request;
    if (error || !projectRows) return { data: null, error: browseError() };

    const visible = query.projectId ? projectRows : projectRows.slice(0, limit);
    if (visible.length === 0) return { data: { projects: [], nextCursor: null }, error: null };

    const next = !query.projectId && projectRows.length > limit ? visible.at(-1) : undefined;
    const cursor = next ? { createdAt: next.created_at } : null;

    return {
      data: { projects: visible.map(toProject), nextCursor: cursor },
      error: null,
    };
  }

  return {
    async getProjects(query: ProjectQuery = {}): Promise<ProjectResultGeneric<ProjectPage>> {
      return loadProjects(query);
    },
    async getProject(id: string): Promise<ProjectResultGeneric<ProjectDetail | null>> {
      const projectResult = await loadProjects({ projectId: id });
      if (!projectResult.data || projectResult.data.projects.length === 0) {
        return { data: null, error: projectResult.error ?? 'Project not found.' };
      }
      const project = projectResult.data.projects[0]!;
      const [membersResult, skillsResult] = await Promise.all([
        client.from('project_members').select('*').eq('project_id', id).order('created_at', { ascending: true }),
        client.from('project_skills').select('skill_id, requirement_level, skills(id, name)').eq('project_id', id),
      ]);

      const members: ProjectMemberProfile[] = [];
      if (membersResult.data) {
        const profileIds = [...new Set(membersResult.data.map((m) => m.user_id))];
        const { data: profiles } = await client.from('profiles').select('id, display_name, handle').in('id', profileIds);
        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
        for (const member of membersResult.data) {
          const prof = profileMap.get(member.user_id);
          if (prof) members.push(toMemberProfile(prof, member));
        }
      }

      const skills: ProjectSkill[] = [];
      if (skillsResult.data) {
        for (const row of skillsResult.data) {
          const skill = row.skills as { name: string } | null;
          skills.push({ skillId: row.skill_id, skillName: skill?.name ?? '(unknown)', requirementLevel: row.requirement_level });
        }
      }

      return { data: { project, members, skills }, error: null };
    },
    async getMyProjects(userId: string): Promise<ProjectResultGeneric<ProjectResult[]>> {
      const { data: memberships } = await client.from('project_members').select('project_id').eq('user_id', userId).eq('status', 'active');
      const memberIds = [...new Set((memberships ?? []).map((m) => m.project_id))];
      const { data: owned, error: oError } = await client.from('projects').select('*').eq('owner_id', userId).not('status', 'eq', 'removed').order('updated_at', { ascending: false });
      if (oError) return { data: null, error: browseError() };
      const { data: memberProjects, error: mError } = memberIds.length
        ? await client.from('projects').select('*').in('id', memberIds).not('status', 'eq', 'removed')
        : { data: [] as ProjectRow[], error: null };
      if (mError) return { data: null, error: browseError() };
      const byId = new Map<string, ProjectRow>();
      for (const row of [...(owned ?? []), ...(memberProjects ?? [])]) byId.set(row.id, row);
      return { data: [...byId.values()].map(toProject), error: null };
    },
    async createProject(input: CreateProjectInput): Promise<ProjectResultGeneric<ProjectResult>> {
      const { data, error } = await client.from('projects').insert({
        owner_id: input.ownerId,
        campus_id: input.campusId ?? null,
        title: input.title.trim(),
        summary: (input.summary ?? '').trim(),
        body: (input.body ?? '').trim(),
        category: input.category,
        status: input.status ?? 'open',
        visibility: input.visibility ?? 'campus',
      }).select().single();
      if (error || !data) return { data: null, error: mutationError() };
      return { data: toProject(data), error: null };
    },
    async updateProject(id: string, input: UpdateProjectInput): Promise<ProjectResultGeneric<ProjectResult>> {
      const patch: TablesUpdate<'projects'> = {};
      if (input.title !== undefined) patch.title = input.title.trim();
      if (input.summary !== undefined) patch.summary = input.summary.trim();
      if (input.body !== undefined) patch.body = input.body.trim();
      if (input.category !== undefined) patch.category = input.category;
      if (input.status !== undefined) patch.status = input.status;
      if (input.visibility !== undefined) patch.visibility = input.visibility;
      const { data, error } = await client.from('projects').update(patch).eq('id', id).select().single();
      if (error || !data) return { data: null, error: mutationError() };
      return { data: toProject(data), error: null };
    },
    async deleteProject(id: string): Promise<ProjectResultGeneric<void>> {
      const { error } = await client.from('projects').update({ status: 'removed', deleted_at: new Date().toISOString() }).eq('id', id);
      return error ? { data: null, error: mutationError() } : { data: undefined, error: null };
    },
    async requestToJoin(projectId: string, userId: string): Promise<ProjectResultGeneric<void>> {
      const { error } = await client.from('project_members').insert({ project_id: projectId, user_id: userId, member_role: 'member', status: 'requested' });
      return error ? { data: null, error: mutationError() } : { data: undefined, error: null };
    },
    async respondToMember(projectId: string, userId: string, status: string): Promise<ProjectResultGeneric<void>> {
      const { error } = await client.from('project_members').update({ status }).eq('project_id', projectId).eq('user_id', userId);
      return error ? { data: null, error: mutationError() } : { data: undefined, error: null };
    },
    async addProjectSkills(projectId: string, skillIds: readonly string[]): Promise<ProjectResultGeneric<void>> {
      const rows = skillIds.map((skillId) => ({ project_id: projectId, skill_id: skillId }));
      const { error } = await client.from('project_skills').insert(rows);
      return error ? { data: null, error: mutationError() } : { data: undefined, error: null };
    },
  };
}

export type ProjectService = ReturnType<typeof createProjectService>;