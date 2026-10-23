import {
  Event,
  RecurrentWorshipEvent,
  MeetingEvent,
  isRecurrentWorshipEvent,
  isMeetingEvent,
} from '../types/event';
import { expandRecurrentEvent, formatDatePT, formatRecurrencePT } from './dateUtils';
import { getDate, getMonth } from 'date-fns';

export interface DraftConflict {
  id: string;
  summary: string;
  eventIds: string[];
  eventNames: string[];
}

function conflictLabel(parts: string[]): string {
  return parts.map((part) => part || '—').join(' · ');
}

/**
 * Conflicts follow the PDF rules:
 * cultos that share location, recurrence text, and time;
 * meetings that share calendar day, location, and time.
 * A missing place or time still matches another missing place or time.
 */
export function findDraftConflicts(events: Event[], year: number): DraftConflict[] {
  const conflicts: DraftConflict[] = [];

  const worshipGroups = new Map<string, RecurrentWorshipEvent[]>();
  events.filter(isRecurrentWorshipEvent).forEach((event) => {
    if (expandRecurrentEvent(event, year).length === 0) return;
    const key = [event.location, formatRecurrencePT(event), event.time ?? ''].join('\0');
    const group = worshipGroups.get(key) ?? [];
    group.push(event);
    worshipGroups.set(key, group);
  });

  worshipGroups.forEach((group, key) => {
    if (group.length < 2) return;
    const [location, pattern, time] = key.split('\0');
    conflicts.push({
      id: `worship:${key}`,
      summary: conflictLabel([
        location || 'sem local',
        pattern || 'sem recorrência',
        time || 'sem horário',
      ]),
      eventIds: group.map((event) => event.id),
      eventNames: group.map((event) => event.name),
    });
  });

  const meetingGroups = new Map<string, MeetingEvent[]>();
  events.filter(isMeetingEvent).forEach((event) => {
    const key = [
      formatDatePT(event.startDate),
      event.location ?? '',
      event.hour ?? '',
    ].join('\0');
    const group = meetingGroups.get(key) ?? [];
    group.push(event);
    meetingGroups.set(key, group);
  });

  meetingGroups.forEach((group, key) => {
    if (group.length < 2) return;
    const [date, location, hour] = key.split('\0');
    conflicts.push({
      id: `meeting:${key}`,
      summary: conflictLabel([
        date,
        location || 'sem local',
        hour || 'sem horário',
      ]),
      eventIds: group.map((event) => event.id),
      eventNames: group.map((event) => event.name),
    });
  });

  return conflicts;
}

export function conflictPartnerNames(conflicts: DraftConflict[], eventId: string): string {
  const names: string[] = [];
  conflicts.forEach((conflict) => {
    if (!conflict.eventIds.includes(eventId)) return;
    conflict.eventIds.forEach((id, index) => {
      if (id !== eventId && !names.includes(conflict.eventNames[index])) {
        names.push(conflict.eventNames[index]);
      }
    });
  });
  return names.join(', ');
}

export type RecurrentWorshipEntry = { name: string; time?: string };

/**
 * Organize recurrent worship services by location
 */
export function organizeRecurrentWorshipByLocation(
  events: RecurrentWorshipEvent[],
  year: number
): Map<string, Map<string, RecurrentWorshipEntry[]>> {
  const locationMap = new Map<string, Map<string, RecurrentWorshipEntry[]>>();

  events.forEach((event) => {
    const expanded = expandRecurrentEvent(event, year);
    const recurrencePattern = formatRecurrencePT(event);
    const time = event.time;

    expanded.forEach((exp) => {
      const location = exp.location;
      if (!locationMap.has(location)) {
        locationMap.set(location, new Map());
      }

      const patternMap = locationMap.get(location)!;
      if (!patternMap.has(recurrencePattern)) {
        patternMap.set(recurrencePattern, []);
      }

      const entries = patternMap.get(recurrencePattern)!;
      if (!entries.some((e) => e.name === event.name && (e.time ?? '') === (time ?? ''))) {
        entries.push({ name: event.name, time });
      }
    });
  });

  return locationMap;
}

/**
 * Organize meetings/events by month for the calendar table
 * Returns a map of month -> array of events for that month
 * Uses startDate for ordering and display
 */
export function organizeMeetingsByMonth(
  events: MeetingEvent[],
  year: number
): Map<number, Array<{ day: number; name: string; department?: string; endDay?: number; location?: string; hour?: string }>> {
  const monthlyMap = new Map<number, Array<{ day: number; name: string; department?: string; endDay?: number; location?: string; hour?: string }>>();

  events.forEach((event) => {
    const startMonth = getMonth(event.startDate);
    const startDay = getDate(event.startDate);
    const endDay = event.endDate ? getDate(event.endDate) : undefined;
    const endMonth = event.endDate ? getMonth(event.endDate) : undefined;

    if (event.startDate.getFullYear() !== year) {
      return;
    }

    if (!monthlyMap.has(startMonth)) {
      monthlyMap.set(startMonth, []);
    }

    monthlyMap.get(startMonth)!.push({
      day: startDay,
      name: event.name,
      department: event.department,
      endDay: endDay && endMonth === startMonth ? endDay : undefined,
      location: event.location,
      hour: event.hour,
    });
  });

  monthlyMap.forEach((events, month) => {
    events.sort((a, b) => a.day - b.day);
  });

  return monthlyMap;
}

/**
 * Get all unique locations from recurrent worship events
 */
export function getUniqueLocations(events: RecurrentWorshipEvent[]): string[] {
  const locations = new Set<string>();
  events.forEach((event) => {
    if (event.location) {
      locations.add(event.location);
    }
  });
  return Array.from(locations).sort();
}
