import type { SupercampusSupabaseClient } from './client.js';
import type { Tables } from './database.types.js';

type EventRow = Tables<'events'>;

export interface EventResult {
  id: string; organizerId: string; campusId: string; title: string; description: string;
  venue: string; startsAt: string; endsAt: string; capacity: number | null;
  registrationDeadline: string | null; visibility: string; status: string; createdAt: string; updatedAt: string;
  registrationCount: number;
}

export interface EventQuery { campusId?: string | null; cursor?: { startsAt: string }; limit?: number }

export interface EventPage { events: EventResult[]; nextCursor: { startsAt: string } | null }

export interface CreateEventInput {
  campusId: string; title: string; description?: string; venue: string; startsAt: string; endsAt: string;
  capacity?: number | null; registrationDeadline?: string | null;
}

export type EventResultGeneric<T> = { data: T; error: null } | { data: null; error: string };

const DEFAULT_PAGE_SIZE = 20;
function e(msg: string): string { return msg; }
function toEvent(r: EventRow, count: number): EventResult {
  return { id: r.id, organizerId: r.organizer_id, campusId: r.campus_id, title: r.title, description: r.description, venue: r.venue, startsAt: r.starts_at, endsAt: r.ends_at, capacity: r.capacity, registrationDeadline: r.registration_deadline, visibility: r.visibility, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at, registrationCount: count };
}

export function createEventService(client: SupercampusSupabaseClient) {
  return {
    async getEvents(query: EventQuery = {}): Promise<EventResultGeneric<EventPage>> {
      const limit = Math.max(1, Math.min(query.limit ?? DEFAULT_PAGE_SIZE, 50));
      let b = client.from('events').select('*').eq('status', 'published').order('starts_at', { ascending: true }).limit(limit + 1);
      if (query.campusId) b = b.eq('campus_id', query.campusId);
      if (query.cursor) b = b.gt('starts_at', query.cursor.startsAt);
      const { data, error } = await b;
      if (error || !data) return { data: null, error: e('Unable to load events.') };
      const visible = data.slice(0, limit);
      if (!visible.length) return { data: { events: [], nextCursor: null }, error: null };
      const regCounts = await Promise.all(visible.map((ev) => client.from('event_registrations').select('*', { head: true, count: 'exact' }).eq('event_id', ev.id)));
      const mapped = visible.map((ev, i) => toEvent(ev, regCounts[i]?.count ?? 0));
      const next = data.length > limit ? visible.at(-1) : undefined;
      return { data: { events: mapped, nextCursor: next ? { startsAt: next.starts_at } : null }, error: null };
    },
    async getEvent(id: string): Promise<EventResultGeneric<EventResult | null>> {
      const { data: ev, error } = await client.from('events').select('*').eq('id', id).single();
      if (error || !ev) return { data: null, error: e('Event not found.') };
      const { count } = await client.from('event_registrations').select('*', { head: true, count: 'exact' }).eq('event_id', id);
      return { data: toEvent(ev, count ?? 0), error: null };
    },
    async createEvent(input: CreateEventInput, organizerId: string): Promise<EventResultGeneric<EventResult>> {
      const { data, error } = await client.from('events').insert({
        organizer_id: organizerId, campus_id: input.campusId, title: input.title.trim(), description: input.description ?? '',
        venue: input.venue.trim(), starts_at: input.startsAt, ends_at: input.endsAt, capacity: input.capacity ?? null,
        registration_deadline: input.registrationDeadline ?? null, status: 'published',
      }).select().single();
      if (error || !data) return { data: null, error: e('Your event could not be created.') };
      return { data: toEvent(data, 0), error: null };
    },
    async registerForEvent(eventId: string, userId: string): Promise<EventResultGeneric<void>> {
      const { error } = await client.from('event_registrations').insert({ event_id: eventId, user_id: userId, status: 'registered' });
      if (error) return { data: null, error: error.code === '23505' ? 'You are already registered for this event.' : e('Could not register.') };
      return { data: undefined, error: null };
    },
    async cancelRegistration(eventId: string, userId: string): Promise<EventResultGeneric<void>> {
      const { error } = await client.from('event_registrations').delete().eq('event_id', eventId).eq('user_id', userId);
      if (error) return { data: null, error: e('Could not cancel registration.') };
      return { data: undefined, error: null };
    },
    async getMyRegistrations(userId: string): Promise<EventResultGeneric<{ eventId: string; status: string; event: EventResult }[]>> {
      const { data, error } = await client.from('event_registrations').select('*, events(*)').eq('user_id', userId).order('created_at', { ascending: false });
      if (error || !data) return { data: null, error: e('Unable to load your registrations.') };
      const regCounts = await Promise.all(data.map((r) => client.from('event_registrations').select('*', { head: true, count: 'exact' }).eq('event_id', r.event_id)));
      return { data: data.map((r, i) => ({ eventId: r.event_id, status: r.status, event: toEvent(r.events as EventRow, regCounts[i]?.count ?? 0) })), error: null };
    },
  };
}

export type EventService = ReturnType<typeof createEventService>;