import { Event, isMeetingEvent, isRecurrentWorshipEvent } from '../types/event';
import { deserializeEvent, serializeEvent } from './backupRestore';

const STORAGE_KEY = 'yearly-calendar-draft-v1';

export interface StoredDraft {
  events: Event[];
  year: number;
  jsonSignature: string | null;
  savedAt: string | null;
}

export interface DraftSaveInput {
  events: Event[];
  year: number;
  jsonSignature: string | null;
}

function hashString(input: string): string {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

export function draftSignature(events: Event[], year: number): string {
  return hashString(
    JSON.stringify({
      year,
      events: events.map(serializeEvent),
    })
  );
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function eventsAreValid(events: Event[]): boolean {
  return events.every((event) => {
    if (!event || typeof event.id !== 'string' || typeof event.name !== 'string') {
      return false;
    }
    if (isMeetingEvent(event)) {
      if (!isValidDate(event.startDate)) return false;
      if (event.endDate && !isValidDate(event.endDate)) return false;
      return true;
    }
    if (isRecurrentWorshipEvent(event)) {
      if (!event.recurrence || typeof event.recurrence.type !== 'string') return false;
      if (event.recurrence.endDate && !isValidDate(event.recurrence.endDate)) return false;
      return true;
    }
    return false;
  });
}

export function loadDraft(): StoredDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.events)) return null;

    const events = data.events.map(deserializeEvent);
    if (!eventsAreValid(events)) return null;

    const year = Number(data.year);
    return {
      events,
      year: Number.isInteger(year) ? year : new Date().getFullYear(),
      jsonSignature: typeof data.jsonSignature === 'string' ? data.jsonSignature : null,
      savedAt: typeof data.savedAt === 'string' ? data.savedAt : null,
    };
  } catch {
    return null;
  }
}

export function saveDraft(draft: DraftSaveInput): boolean {
  try {
    const payload = {
      events: draft.events.map(serializeEvent),
      year: draft.year,
      jsonSignature: draft.jsonSignature,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}
