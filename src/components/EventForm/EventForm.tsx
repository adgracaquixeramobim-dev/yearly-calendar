import React, { useState, useEffect } from 'react';
import { Event, RecurrentWorshipEvent, MeetingEvent, isRecurrentWorshipEvent, isMeetingEvent } from '../../types/event';
import RecurrenceSelector from '../RecurrenceSelector/RecurrenceSelector';
import { validateEvent } from '../../utils/validation';
import { parseCalendarDate, toCalendarDateString } from '../../utils/dateUtils';

interface EventFormProps {
  event?: Event;
  onSubmit: (event: Event) => void;
  onCancel?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, onCancel }) => {
  const [eventType, setEventType] = useState<'recurrent-worship' | 'meeting-event'>(
    event ? (isRecurrentWorshipEvent(event) ? 'recurrent-worship' : 'meeting-event') : 'recurrent-worship'
  );
  
  const [name, setName] = useState(event?.name || '');
  const [errors, setErrors] = useState<string[]>([]);

  const [location, setLocation] = useState(
    (event && isRecurrentWorshipEvent(event)) ? event.location : ''
  );
  const [recurrence, setRecurrence] = useState(
    (event && isRecurrentWorshipEvent(event)) ? event.recurrence : undefined
  );
  const [time, setTime] = useState(
    (event && isRecurrentWorshipEvent(event)) ? event.time : ''
  );
  const [department, setDepartment] = useState(
    (event && isRecurrentWorshipEvent(event)) ? event.department : ''
  );

  const [startDate, setStartDate] = useState<string>(
    (event && isMeetingEvent(event)) ? toCalendarDateString(event.startDate) : ''
  );
  const [endDate, setEndDate] = useState<string>(
    (event && isMeetingEvent(event) && event.endDate) ? toCalendarDateString(event.endDate) : ''
  );
  const [hour, setHour] = useState(
    (event && isMeetingEvent(event)) ? event.hour : ''
  );
  const [meetingLocation, setMeetingLocation] = useState(
    (event && isMeetingEvent(event)) ? event.location : ''
  );
  const [meetingDepartment, setMeetingDepartment] = useState(
    (event && isMeetingEvent(event)) ? event.department : ''
  );

  const departments = ['MIS', 'SEN', 'JOV', 'INF', 'FAM', 'EBD', ''];

  useEffect(() => {
    if (event) {
      setName(event.name || '');
      if (isRecurrentWorshipEvent(event)) {
        setEventType('recurrent-worship');
        setLocation(event.location || '');
        setRecurrence(event.recurrence);
        setTime(event.time || '');
        setDepartment(event.department || '');
      } else if (isMeetingEvent(event)) {
        setEventType('meeting-event');
        setStartDate(event.startDate ? toCalendarDateString(event.startDate) : '');
        setEndDate(event.endDate ? toCalendarDateString(event.endDate) : '');
        setHour(event.hour || '');
        setMeetingLocation(event.location || '');
        setMeetingDepartment(event.department || '');
      }
      setErrors([]);
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let eventData: Event;

    if (eventType === 'recurrent-worship') {
      if (!recurrence) {
        setErrors(['Recorrência é obrigatória para cultos recorrentes']);
        return;
      }
      eventData = {
        id: event?.id || Date.now().toString(),
        eventType: 'recurrent-worship',
        name,
        location,
        recurrence,
        time: time || undefined,
        department: department || undefined,
      } as RecurrentWorshipEvent;
    } else {
      if (!startDate) {
        setErrors(['Data de início é obrigatória para reuniões/eventos']);
        return;
      }
      const start = parseCalendarDate(startDate);
      const end = endDate ? parseCalendarDate(endDate) : undefined;
      
      if (end && end < start) {
        setErrors(['Data de fim deve ser posterior à data de início']);
        return;
      }
      
      eventData = {
        id: event?.id || Date.now().toString(),
        eventType: 'meeting-event',
        name,
        startDate: start,
        endDate: end,
        hour: hour || undefined,
        location: meetingLocation || undefined,
        department: meetingDepartment || undefined,
      } as MeetingEvent;
    }

    const validation = validateEvent(eventData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onSubmit(eventData);
    
    if (!event) {
      setName('');
      setLocation('');
      setStartDate('');
      setEndDate('');
      setTime('');
      setHour('');
      setDepartment('');
      setMeetingLocation('');
      setMeetingDepartment('');
      setRecurrence(undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <h2>{event ? 'Editar Evento' : 'Adicionar Evento'}</h2>

      {errors.length > 0 && (
        <div className="error-messages">
          <strong>Erros de validação:</strong>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="eventType">Tipo de Evento *</label>
        <select
          id="eventType"
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value as 'recurrent-worship' | 'meeting-event');
            setErrors([]);
          }}
          required
          className="form-control"
        >
          <option value="recurrent-worship">Culto Recorrente</option>
          <option value="meeting-event">Reunião/Evento</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="name">Nome do Evento *</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-control"
        />
      </div>

      {eventType === 'recurrent-worship' ? (
        <>
          <div className="form-group">
            <label htmlFor="location">Localização *</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Recorrência *</label>
            <RecurrenceSelector
              value={recurrence}
              onChange={setRecurrence}
              enabled={true}
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Horário (opcional)</label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Departamento (opcional)</label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="form-control"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept || 'Nenhum'}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="startDate">Data de Início *</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">Data de Fim (opcional)</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="form-control"
            />
            <small className="form-text text-muted">
              Deixe em branco para evento de um único dia
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="hour">Horário (opcional)</label>
            <input
              id="hour"
              type="time"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="meetingLocation">Localização (opcional)</label>
            <input
              id="meetingLocation"
              type="text"
              value={meetingLocation}
              onChange={(e) => setMeetingLocation(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="meetingDepartment">Departamento (opcional)</label>
            <select
              id="meetingDepartment"
              value={meetingDepartment}
              onChange={(e) => setMeetingDepartment(e.target.value)}
              className="form-control"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept || 'Nenhum'}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {event ? 'Salvar Alterações' : 'Adicionar Evento'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default EventForm;
