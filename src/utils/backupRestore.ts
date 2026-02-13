import { Event, BackupData, isRecurrentWorshipEvent, isMeetingEvent } from '../types/event';
import { toCalendarDateString } from './dateUtils';

const BACKUP_VERSION = '1.0.0';

/**
 * Convert Date objects to calendar date strings (YYYY-MM-DD) for JSON serialization.
 * No timezone conversion — dates are stored statically.
 */
function serializeEvent(event: Event): any {
  const serialized: any = { ...event };
  
  if (isMeetingEvent(event)) {
    if (event.startDate) {
      serialized.startDate = toCalendarDateString(event.startDate);
    }
    if (event.endDate) {
      serialized.endDate = toCalendarDateString(event.endDate);
    }
  }
  
  if (isRecurrentWorshipEvent(event)) {
    if (event.recurrence?.endDate) {
      serialized.recurrence = {
        ...event.recurrence,
        endDate: toCalendarDateString(event.recurrence.endDate),
      };
    }
  }
  
  return serialized;
}

/**
 * Parse a date string as a static calendar date (YYYY-MM-DD or ISO with T).
 * Ignores timezone so dates are always the literal day/month/year.
 */
function parseLocalDate(dateString: string): Date {
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Convert ISO strings back to Date objects
 */
function deserializeEvent(data: any): Event {
  const event: any = { ...data };
  
  if (data.eventType === 'meeting-event') {
    if (data.startDate) {
      event.startDate = parseLocalDate(data.startDate);
    }
    if (data.endDate) {
      event.endDate = parseLocalDate(data.endDate);
    }
    if (data.date && !data.startDate) {
      event.startDate = parseLocalDate(data.date);
    }
  }
  
  if (data.eventType === 'recurrent-worship') {
    if (data.recurrence?.endDate) {
      event.recurrence = {
        ...data.recurrence,
        endDate: parseLocalDate(data.recurrence.endDate),
      };
    }
  }
  
  return event as Event;
}

/**
 * Export all events to a JSON file
 */
export function exportBackup(
  events: Event[],
  metadata?: { churchName?: string; ministryName?: string; year?: number }
): void {
  const backupData: BackupData = {
    version: BACKUP_VERSION,
    exportDate: new Date().toISOString(),
    events: events.map(serializeEvent),
    metadata,
  };
  
  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `calendar-backup-${dateStr}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import events from a JSON file
 */
export async function importBackup(file: File): Promise<{
  events: Event[];
  metadata?: { churchName?: string; ministryName?: string; year?: number };
  error?: string;
}> {
  try {
    const text = await file.text();
    const data: BackupData = JSON.parse(text);
    
    if (!data.version || !data.events || !Array.isArray(data.events)) {
      return {
        events: [],
        error: 'Invalid backup file format. Missing required fields.',
      };
    }
    
    const events = data.events.map(deserializeEvent);
    
    for (const event of events) {
      if (isMeetingEvent(event)) {
        if (event.startDate && isNaN(event.startDate.getTime())) {
          return {
            events: [],
            error: 'Invalid start date found in backup file.',
          };
        }
        if (event.endDate && isNaN(event.endDate.getTime())) {
          return {
            events: [],
            error: 'Invalid end date found in backup file.',
          };
        }
      }
      if (isRecurrentWorshipEvent(event)) {
        if (event.recurrence?.endDate && isNaN(event.recurrence.endDate.getTime())) {
          return {
            events: [],
            error: 'Invalid recurrence end date found in backup file.',
          };
        }
      }
    }
    
    return {
      events,
      metadata: data.metadata,
    };
  } catch (error) {
    return {
      events: [],
      error: error instanceof Error ? error.message : 'Failed to parse backup file.',
    };
  }
}
