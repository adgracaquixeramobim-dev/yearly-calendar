import React from 'react';
import { Event, isRecurrentWorshipEvent, isMeetingEvent } from '../../types/event';
import { formatRecurrencePT, formatDatePT } from '../../utils/dateUtils';

interface EventListProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEdit, onDelete }) => {
  const recurrentWorshipEvents = events.filter(isRecurrentWorshipEvent);
  const meetingEvents = [...events.filter(isMeetingEvent)].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="event-list">
      <h2>Eventos ({events.length})</h2>

      {recurrentWorshipEvents.length > 0 && (
        <div className="event-section">
          <h3>Cultos Recorrentes ({recurrentWorshipEvents.length})</h3>
          <div className="event-table-wrapper">
            <table className="event-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Localização</th>
                  <th>Recorrência</th>
                  <th>Horário</th>
                  <th>Departamento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {recurrentWorshipEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.name}</td>
                    <td>{event.location}</td>
                    <td>{formatRecurrencePT(event)}</td>
                    <td>{event.time ?? '—'}</td>
                    <td>{event.department ?? '—'}</td>
                    <td className="event-actions-cell">
                      <button
                        onClick={() => onEdit(event)}
                        className="btn btn-sm btn-secondary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(event.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {meetingEvents.length > 0 && (
        <div className="event-section">
          <h3>Reuniões/Eventos ({meetingEvents.length})</h3>
          <div className="event-table-wrapper">
            <table className="event-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Localização</th>
                  <th>Departamento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {meetingEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.name}</td>
                    <td>
                      {formatDatePT(event.startDate)}
                      {event.endDate && ` – ${formatDatePT(event.endDate)}`}
                    </td>
                    <td>{event.hour ?? '—'}</td>
                    <td>{event.location ?? '—'}</td>
                    <td>{event.department ?? '—'}</td>
                    <td className="event-actions-cell">
                      <button
                        onClick={() => onEdit(event)}
                        className="btn btn-sm btn-secondary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(event.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="empty">
          <p>Nenhum evento adicionado ainda.</p>
        </div>
      )}
    </div>
  );
};

export default EventList;
