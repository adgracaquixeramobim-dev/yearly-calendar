import { z } from 'zod';
import { Event, isRecurrentWorshipEvent, isMeetingEvent } from '../types/event';

export const recurrencePatternSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  interval: z.number().positive().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  weekOfMonth: z.array(z.number().min(1).max(5)).optional(),
  endDate: z.date().optional(),
});

export const recurrentWorshipEventSchema = z.object({
  id: z.string(),
  eventType: z.literal('recurrent-worship'),
  name: z.string().min(1, 'Nome do evento é obrigatório'),
  location: z.string().min(1, 'Localização é obrigatória'),
  recurrence: recurrencePatternSchema,
  time: z.string().optional(),
  department: z.string().optional(),
}).refine(
  (data) => {
    if (data.recurrence.type === 'weekly' || data.recurrence.type === 'monthly') {
      return !!(data.recurrence.daysOfWeek && data.recurrence.daysOfWeek.length > 0);
    }
    return true;
  },
  {
    message: 'Dias da semana devem ser especificados para eventos semanais ou mensais',
    path: ['recurrence'],
  }
).refine(
  (data) => {
    if (data.recurrence.type === 'monthly') {
      return !!(data.recurrence.weekOfMonth && data.recurrence.weekOfMonth.length > 0);
    }
    return true;
  },
  {
    message: 'Semanas do mês devem ser especificadas para eventos mensais',
    path: ['recurrence'],
  }
);

export const meetingEventSchema = z.object({
  id: z.string(),
  eventType: z.literal('meeting-event'),
  name: z.string().min(1, 'Nome do evento é obrigatório'),
  startDate: z.date({ required_error: 'Data de início é obrigatória' }),
  endDate: z.date().optional(),
  hour: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
}).refine(
  (data) => {
    if (data.endDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  {
    message: 'Data de fim deve ser posterior ou igual à data de início',
    path: ['endDate'],
  }
);

export function validateEvent(event: Event): { valid: boolean; errors: string[] } {
  try {
    if (isRecurrentWorshipEvent(event)) {
      recurrentWorshipEventSchema.parse(event);
    } else if (isMeetingEvent(event)) {
      meetingEventSchema.parse(event);
    } else {
      return { valid: false, errors: ['Tipo de evento inválido'] };
    }
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Erro de validação desconhecido'] };
  }
}
