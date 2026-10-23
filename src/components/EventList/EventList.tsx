import React from 'react';
import { Event, isRecurrentWorshipEvent, isMeetingEvent } from '../../types/event';
import { formatRecurrencePT, formatDatePT, getMonthNamePT, expandRecurrentEvent } from '../../utils/dateUtils';
import { conflictPartnerNames, findDraftConflicts } from '../../utils/eventOrganizer';

interface EventListProps {
  events: Event[];
  year: number;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

interface EventCardProps {
  title: string;
  typeLabel: string;
  rows: { label: string; value: string }[];
  conflictWith?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  typeLabel,
  rows,
  conflictWith,
  onEdit,
  onDelete,
}) => (
  <article className={`event-card${conflictWith ? ' is-conflict' : ''}`}>
    <header className="event-header">
      <h3>{title}</h3>
      <span className="event-type">{typeLabel}</span>
    </header>
    {conflictWith && (
      <p className="event-conflict">Conflito com {conflictWith}</p>
    )}
    <dl className="event-details">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
    <div className="event-actions">
      <button type="button" onClick={onEdit} className="btn btn-sm btn-secondary">
        Editar
      </button>
      <button type="button" onClick={onDelete} className="btn btn-sm btn-danger">
        Excluir
      </button>
    </div>
  </article>
);

function monthTitle(month: number): string {
  const name = getMonthNamePT(month);
  return name.charAt(0) + name.slice(1).toLowerCase();
}

function monthsInYear(event: Event, year: number): number[] {
  if (isRecurrentWorshipEvent(event)) {
    const months = new Set<number>();
    expandRecurrentEvent(event, year).forEach((item) => {
      if (item.date.getFullYear() === year) months.add(item.date.getMonth());
    });
    return Array.from(months).sort((a, b) => a - b);
  }

  const end = event.endDate ?? event.startDate;
  if (end.getFullYear() < year || event.startDate.getFullYear() > year) return [];

  const startMonth = event.startDate.getFullYear() < year ? 0 : event.startDate.getMonth();
  const endMonth = end.getFullYear() > year ? 11 : end.getMonth();
  const months: number[] = [];
  for (let month = startMonth; month <= endMonth; month += 1) months.push(month);
  return months;
}

function compareInMonth(a: Event, b: Event): number {
  const aWorship = isRecurrentWorshipEvent(a);
  const bWorship = isRecurrentWorshipEvent(b);
  if (aWorship !== bWorship) return aWorship ? -1 : 1;
  if (isMeetingEvent(a) && isMeetingEvent(b)) {
    return a.startDate.getTime() - b.startDate.getTime();
  }
  return a.name.localeCompare(b.name, 'pt');
}

function groupByMonth(events: Event[], year: number) {
  const byMonth = new Map<number, Event[]>();
  const outsideYear: Event[] = [];

  events.forEach((event) => {
    const months = monthsInYear(event, year);
    if (months.length === 0) {
      outsideYear.push(event);
      return;
    }
    months.forEach((month) => {
      const group = byMonth.get(month) ?? [];
      group.push(event);
      byMonth.set(month, group);
    });
  });

  const groups = Array.from(byMonth.keys()).sort((a, b) => a - b).map((month) => ({
    key: String(month),
    title: monthTitle(month),
    events: byMonth.get(month)!.sort(compareInMonth),
  }));

  outsideYear.sort(compareInMonth);
  return { groups, outsideYear };
}

function eventCardProps(event: Event) {
  if (isRecurrentWorshipEvent(event)) {
    return {
      title: event.name,
      typeLabel: 'Culto',
      rows: [
        { label: 'Local', value: event.location },
        { label: 'Recorrência', value: formatRecurrencePT(event) },
        { label: 'Horário', value: event.time || '—' },
        { label: 'Departamento', value: event.department || '—' },
      ],
    };
  }

  return {
    title: event.name,
    typeLabel: 'Evento',
    rows: [
      {
        label: 'Data',
        value: event.endDate
          ? `${formatDatePT(event.startDate)} – ${formatDatePT(event.endDate)}`
          : formatDatePT(event.startDate),
      },
      { label: 'Horário', value: event.hour || '—' },
      { label: 'Local', value: event.location || '—' },
      { label: 'Departamento', value: event.department || '—' },
    ],
  };
}

const EventList: React.FC<EventListProps> = ({ events, year, onEdit, onDelete }) => {
  const conflicts = findDraftConflicts(events, year);
  const { groups, outsideYear } = groupByMonth(events, year);

  return (
    <div className="event-list">
      <h2>Rascunho ({events.length})</h2>

      {events.length > 0 && (
        <section className={`conflict-summary${conflicts.length > 0 ? ' has-conflicts' : ' is-clear'}`}>
          <h3>Conflitos ({conflicts.length})</h3>
          {conflicts.length === 0 ? (
            <p>Nenhum conflito de dia, local e horário.</p>
          ) : (
            <ul>
              {conflicts.map((conflict) => (
                <li key={conflict.id}>
                  <strong>{conflict.summary}</strong>
                  <span>{conflict.eventNames.join(', ')}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {groups.map((group) => (
        <section className="event-section" key={group.key}>
          <h3>
            {group.title} ({group.events.length})
          </h3>
          <div className="events-grid">
            {group.events.map((event) => (
              <EventCard
                key={event.id}
                {...eventCardProps(event)}
                conflictWith={conflictPartnerNames(conflicts, event.id)}
                onEdit={() => onEdit(event)}
                onDelete={() => onDelete(event.id)}
              />
            ))}
          </div>
        </section>
      ))}

      {outsideYear.length > 0 && (
        <section className="event-section">
          <h3>
            Fora de {year} ({outsideYear.length})
          </h3>
          <div className="events-grid">
            {outsideYear.map((event) => (
              <EventCard
                key={event.id}
                {...eventCardProps(event)}
                conflictWith={conflictPartnerNames(conflicts, event.id)}
                onEdit={() => onEdit(event)}
                onDelete={() => onDelete(event.id)}
              />
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <div className="event-empty">
          <p>Nenhum evento no rascunho.</p>
          <p>Use o formulário para montar o calendário. Quando terminar, envie o JSON pelo WhatsApp.</p>
        </div>
      )}
    </div>
  );
};

export default EventList;
