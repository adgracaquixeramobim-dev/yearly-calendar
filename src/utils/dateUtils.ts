import { startOfYear, endOfYear, addDays, addWeeks, addMonths, getDay, getDate, isSameDay, format } from 'date-fns';
import { ExpandedEvent, RecurrentWorshipEvent } from '../types/event';

/**
 * Get all dates for a specific day of week in a month
 */
export function getDatesForDayOfWeekInMonth(
  year: number,
  month: number,
  dayOfWeek: number
): Date[] {
  const dates: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let currentDate = new Date(firstDay);
  while (getDay(currentDate) !== dayOfWeek) {
    currentDate = addDays(currentDate, 1);
  }
  
  while (currentDate <= lastDay) {
    dates.push(new Date(currentDate));
    currentDate = addWeeks(currentDate, 1);
  }
  
  return dates;
}

/**
 * Get the week number of month for a date (1st, 2nd, 3rd, 4th, or 5th)
 */
export function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = getDay(firstDay);
  const dayOfMonth = getDate(date);
  
  return Math.ceil((dayOfMonth + dayOfWeek) / 7);
}

/**
 * Expand a recurrent event into specific dates for a given year
 */
export function expandRecurrentEvent(event: RecurrentWorshipEvent, year: number): ExpandedEvent[] {
  const expanded: ExpandedEvent[] = [];
  const startDate = startOfYear(new Date(year, 0, 1));
  const endDate = endOfYear(new Date(year, 11, 31));
  
  if (!event.recurrence) {
    return expanded;
  }
  
  const recurrence = event.recurrence;
  let currentDate = new Date(startDate);
  
  if (recurrence.type === 'daily') {
    const interval = recurrence.interval || 1;
    while (currentDate <= endDate) {
      if (!recurrence.endDate || currentDate <= recurrence.endDate) {
        expanded.push({
          event,
          date: new Date(currentDate),
          location: event.location,
          time: event.time,
        });
      }
      currentDate = addDays(currentDate, interval);
    }
  } else if (recurrence.type === 'weekly') {
    const daysOfWeek = recurrence.daysOfWeek || [];
    if (daysOfWeek.length === 0) {
      return expanded; // No days specified
    }
    const interval = recurrence.interval || 1;
    
    while (currentDate <= endDate) {
      for (const dayOfWeek of daysOfWeek) {
        let targetDate = new Date(currentDate);
        const currentDay = getDay(targetDate);
        const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
        targetDate = addDays(targetDate, daysToAdd);
        
        while (targetDate <= endDate) {
          if (!recurrence.endDate || targetDate <= recurrence.endDate) {
            expanded.push({
              event,
              date: new Date(targetDate),
              location: event.location,
              time: event.time,
            });
          }
          targetDate = addWeeks(targetDate, interval);
        }
      }
      currentDate = addMonths(currentDate, 1); // Move to next month to avoid duplicates
    }
  } else if (recurrence.type === 'monthly') {
    const weeksOfMonth = recurrence.weekOfMonth || [];
    const daysOfWeek = recurrence.daysOfWeek || [];
    if (weeksOfMonth.length === 0 || daysOfWeek.length === 0) {
      return expanded; // Missing required fields
    }
    
    for (let month = 0; month < 12; month++) {
      for (const dayOfWeek of daysOfWeek) {
        const datesInMonth = getDatesForDayOfWeekInMonth(year, month, dayOfWeek);
        
        for (const date of datesInMonth) {
          const weekNum = getWeekOfMonth(date);
          
          if (weeksOfMonth.includes(weekNum)) {
            if (!recurrence.endDate || date <= recurrence.endDate) {
              expanded.push({
                event,
                date: new Date(date),
                location: event.location,
                time: event.time,
              });
            }
          }
        }
      }
    }
  }
  
  const unique = expanded.filter((item, index, self) =>
    index === self.findIndex((t) => isSameDay(t.date, item.date))
  );
  
  return unique.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Format date for display in Portuguese format
 */
export function formatDatePT(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}

/**
 * Get Portuguese day name abbreviation
 */
export function getDayNamePT(dayOfWeek: number): string {
  const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
  return days[dayOfWeek];
}

/**
 * Get Portuguese month name
 */
export function getMonthNamePT(month: number): string {
  const months = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];
  return months[month];
}

/**
 * Format recurrence pattern description in Portuguese
 */
export function formatRecurrencePT(event: RecurrentWorshipEvent): string {
  if (!event.recurrence) {
    return '';
  }
  
  const { recurrence } = event;
  
  if (recurrence.type === 'daily') {
    return 'TODO DIA';
  }
  
  if (recurrence.type === 'weekly') {
    const daysOfWeek = recurrence.daysOfWeek || [];
    if (daysOfWeek.length === 1) {
      return `TODA ${getDayNamePT(daysOfWeek[0])}`;
    }
    return daysOfWeek.map(d => getDayNamePT(d)).join(', ');
  }
  
  if (recurrence.type === 'monthly') {
    const weeksOfMonth = recurrence.weekOfMonth || [];
    const daysOfWeek = recurrence.daysOfWeek || [];
    
    if (weeksOfMonth.length === 1 && daysOfWeek.length === 1) {
      const weekOrdinals = ['', '1º', '2º', '3º', '4º', '5º'];
      return `${weekOrdinals[weeksOfMonth[0]]} ${getDayNamePT(daysOfWeek[0])}`;
    }
    
    const weekStr = weeksOfMonth.map(w => {
      const ordinals = ['', '1º', '2º', '3º', '4º', '5º'];
      return ordinals[w];
    }).join(', ');
    
    const dayStr = daysOfWeek.length === 1 
      ? getDayNamePT(daysOfWeek[0])
      : daysOfWeek.map(d => getDayNamePT(d)).join(', ');
    
    return `${weekStr} ${dayStr}`;
  }
  
  return '';
}
