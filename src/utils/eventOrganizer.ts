import { RecurrentWorshipEvent, MeetingEvent } from '../types/event';
import { expandRecurrentEvent, formatRecurrencePT } from './dateUtils';
import { getDate, getMonth } from 'date-fns';

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
