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
  const meetingEvents = events.filter(isMeetingEvent);

  return (
    <div className="event-list">
      <h2>Eventos ({events.length})</h2>
      
      {recurrentWorshipEvents.length > 0 && (
        <div className="event-section">
          <h3>Cultos Recorrentes ({recurrentWorshipEvents.length})</h3>
          <div className="events-grid">
            {recurrentWorshipEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h4>{event.name}</h4>
                  <span className="event-type">Culto Recorrente</span>
                </div>
                <div className="event-details">
                  <p>
                    <strong>Localização:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Recorrência:</strong> {formatRecurrencePT(event)}
                  </p>
                  {event.time && (
                    <p>
                      <strong>Horário:</strong> {event.time}
                    </p>
                  )}
                  {event.department && (
                    <p>
                      <strong>Departamento:</strong> {event.department}
                    </p>
                  )}
                </div>
                <div className="event-actions">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {meetingEvents.length > 0 && (
        <div className="event-section">
          <h3>Reuniões/Eventos ({meetingEvents.length})</h3>
          <div className="events-grid">
            {meetingEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h4>{event.name}</h4>
                  <span className="event-type">Reunião/Evento</span>
                </div>
                <div className="event-details">
                  <p>
                    <strong>Data:</strong> {formatDatePT(event.startDate)}
                    {event.endDate && ` - ${formatDatePT(event.endDate)}`}
                  </p>
                  {event.hour && (
                    <p>
                      <strong>Horário:</strong> {event.hour}
                    </p>
                  )}
                  {event.location && (
                    <p>
                      <strong>Localização:</strong> {event.location}
                    </p>
                  )}
                  {event.department && (
                    <p>
                      <strong>Departamento:</strong> {event.department}
                    </p>
                  )}
                </div>
                <div className="event-actions">
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
                </div>
              </div>
            ))}
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
