import type { SupercampusSupabaseClient } from './client.js';
import type { Tables } from './database.types.js';

type JobRow = Tables<'jobs'>;

export interface JobResult {
  id: string;
  posterId: string;
  campusId: string;
  employer: string;
  title: string;
  description: string;
  location: string | null;
  employmentType: string;
  deadline: string | null;
  status: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobDetail extends JobResult {
  skills: { skillId: string; skillName: string; requirementLevel: number | null }[];
}

export interface JobQuery {
  campusId?: string | null;
  status?: string | null;
  cursor?: { createdAt: string };
  limit?: number;
}

export interface JobPage {
  jobs: JobResult[];
  nextCursor: { createdAt: string } | null;
}

export interface CreateJobInput {
  campusId: string;
  employer: string;
  title: string;
  description: string;
  location?: string | null;
  employmentType: string;
  deadline?: string | null;
}

export type JobResultGeneric<T> = { data: T; error: null } | { data: null; error: string };

const DEFAULT_PAGE_SIZE = 20;

function err(msg: string): string { return msg; }

function toJob(r: JobRow): JobResult {
  return { id: r.id, posterId: r.poster_id, campusId: r.campus_id, employer: r.employer, title: r.title, description: r.description, location: r.location, employmentType: r.employment_type, deadline: r.deadline, status: r.status, visibility: r.visibility, createdAt: r.created_at, updatedAt: r.updated_at };
}

export function createJobService(client: SupercampusSupabaseClient) {
  return {
    async getJobs(query: JobQuery = {}): Promise<JobResultGeneric<JobPage>> {
      const limit = Math.max(1, Math.min(query.limit ?? DEFAULT_PAGE_SIZE, 50));
      let b = client.from('jobs').select('*').not('status', 'eq', 'removed').order('created_at', { ascending: false }).limit(limit + 1);
      if (query.campusId) b = b.eq('campus_id', query.campusId);
      if (query.status) b = b.eq('status', query.status);
      if (query.cursor) b = b.lt('created_at', query.cursor.createdAt);
      const { data, error } = await b;
      if (error || !data) return { data: null, error: err('Unable to load jobs.') };
      const visible = data.slice(0, limit);
      if (!visible.length) return { data: { jobs: [], nextCursor: null }, error: null };
      const next = data.length > limit ? visible.at(-1) : undefined;
      return { data: { jobs: visible.map(toJob), nextCursor: next ? { createdAt: next.created_at } : null }, error: null };
    },
    async getJob(id: string): Promise<JobResultGeneric<JobDetail | null>> {
      const { data: job, error } = await client.from('jobs').select('*').eq('id', id).single();
      if (error || !job) return { data: null, error: err('Job not found.') };
      const { data: skills } = await client.from('job_skills').select('skill_id, requirement_level, skills(id, name)').eq('job_id', id);
      const parsed = (skills ?? []).map((s) => ({ skillId: s.skill_id, skillName: (s.skills as { name?: string } | null)?.name ?? '(unknown)', requirementLevel: s.requirement_level }));
      return { data: { ...toJob(job), skills: parsed }, error: null };
    },
    async createJob(input: CreateJobInput, posterId: string): Promise<JobResultGeneric<JobResult>> {
      const { data, error } = await client.from('jobs').insert({
        poster_id: posterId, campus_id: input.campusId, employer: input.employer.trim(), title: input.title.trim(),
        description: input.description.trim(), location: input.location ?? null, employment_type: input.employmentType,
        deadline: input.deadline ?? null, status: 'published',
      }).select().single();
      if (error || !data) return { data: null, error: err('Your job could not be posted.') };
      return { data: toJob(data), error: null };
    },
    async applyToJob(jobId: string, applicantId: string, opts: { resumeAssetId?: string | null; coverLetter?: string }): Promise<JobResultGeneric<void>> {
      const { error } = await client.from('job_applications').insert({
        job_id: jobId, applicant_id: applicantId, resume_asset_id: opts.resumeAssetId ?? null,
        cover_letter: opts.coverLetter ?? '', status: 'submitted',
      });
      if (error) return { data: null, error: error.code === '23505' ? 'You have already applied to this job.' : err('Your application could not be submitted.') };
      return { data: undefined, error: null };
    },
    async getMyApplications(userId: string): Promise<JobResultGeneric<{ jobId: string; status: string; job: JobResult }[]>> {
      const { data, error } = await client.from('job_applications').select('*, jobs(*)').eq('applicant_id', userId).order('created_at', { ascending: false });
      if (error || !data) return { data: null, error: err('Unable to load your applications.') };
      return { data: data.map((a) => ({ jobId: a.job_id, status: a.status, job: toJob(a.jobs as JobRow) })), error: null };
    },
    async getApplicantsForJob(jobId: string): Promise<JobResultGeneric<{ applicantId: string; status: string; coverLetter: string; createdAt: string }[]>> {
      const { data, error } = await client.from('job_applications').select('*').eq('job_id', jobId).order('created_at', { ascending: false });
      if (error) return { data: null, error: err('Unable to load applicants.') };
      return { data: (data ?? []).map((a) => ({ applicantId: a.applicant_id, status: a.status, coverLetter: a.cover_letter, createdAt: a.created_at })), error: null };
    },
  };
}

export type JobService = ReturnType<typeof createJobService>;