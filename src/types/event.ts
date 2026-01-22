export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  weekOfMonth?: number[]; // [1, 2, 3, 4] for "1st, 2nd, 3rd"
  endDate?: Date;
}

export interface RecurrentWorshipEvent {
  id: string;
  eventType: 'recurrent-worship';
  name: string;
  location: string;
  recurrence: RecurrencePattern; // Required for recurrent worship
  time?: string; // Optional
  department?: string; // Optional
}

export interface MeetingEvent {
  id: string;
  eventType: 'meeting-event';
  name: string;
  startDate: Date; // Required for meetings/events
  endDate?: Date; // Optional - if provided, event spans multiple days
  hour?: string; // Optional
  location?: string; // Optional
  department?: string; // Optional
}

export type Event = RecurrentWorshipEvent | MeetingEvent;

export interface BackupData {
  version: string;
  exportDate: string;
  events: Event[];
  metadata?: {
    churchName?: string;
    ministryName?: string;
    year?: number;
  };
}

export interface ExpandedEvent {
  event: Event;
  date: Date;
  location: string;
  time?: string;
}

export type EventGroup = {
  location: string;
  events: ExpandedEvent[];
};

export type HolyCommunionEvent = {
  week: number; // 1, 2, 3, 4
  day: 'tuesday' | 'wednesday' | 'thursday' | 'sunday';
  location: string;
  time: string;
};

export type MonthlyEvent = {
  month: number; // 0-11
  day: number; // 1-31
  event: MeetingEvent;
  department?: string;
};

export function isRecurrentWorshipEvent(event: Event): event is RecurrentWorshipEvent {
  return event.eventType === 'recurrent-worship';
}

export function isMeetingEvent(event: Event): event is MeetingEvent {
  return event.eventType === 'meeting-event';
}
