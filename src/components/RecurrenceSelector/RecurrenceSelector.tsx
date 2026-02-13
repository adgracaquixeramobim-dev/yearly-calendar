import React, { useState, useEffect } from 'react';
import { RecurrencePattern } from '../../types/event';
import { parseCalendarDate, toCalendarDateString } from '../../utils/dateUtils';

interface RecurrenceSelectorProps {
  value?: RecurrencePattern;
  onChange: (pattern: RecurrencePattern | undefined) => void;
  enabled: boolean;
}

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  value,
  onChange,
  enabled,
}) => {
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>(
    value?.type || 'weekly'
  );
  const [interval, setInterval] = useState<number>(value?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(value?.daysOfWeek || []);
  const [weekOfMonth, setWeekOfMonth] = useState<number[]>(value?.weekOfMonth || []);
  const [endDate, setEndDate] = useState<string>(
    value?.endDate ? toCalendarDateString(value.endDate) : ''
  );

  useEffect(() => {
    if (!enabled) {
      onChange(undefined);
      return;
    }

    const pattern: RecurrencePattern = {
      type,
      interval: type === 'daily' || type === 'weekly' ? interval : undefined,
      daysOfWeek: type === 'weekly' || type === 'monthly' ? daysOfWeek : undefined,
      weekOfMonth: type === 'monthly' ? weekOfMonth : undefined,
      endDate: endDate ? parseCalendarDate(endDate) : undefined,
    };

    onChange(pattern);
  }, [enabled, type, interval, daysOfWeek, weekOfMonth, endDate, onChange]);

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const weekOrdinals = ['1º', '2º', '3º', '4º', 'Última'];

  const toggleDayOfWeek = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleWeekOfMonth = (week: number) => {
    setWeekOfMonth((prev) =>
      prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
    );
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className="recurrence-selector">
      <div className="form-group">
        <label>Frequência:</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="form-control"
        >
          <option value="daily">Diária</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
        </select>
      </div>

      {type === 'daily' && (
        <div className="form-group">
          <label>Intervalo (dias):</label>
          <input
            type="number"
            min="1"
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
            className="form-control"
          />
        </div>
      )}

      {(type === 'weekly' || type === 'monthly') && (
        <div className="form-group">
          <label>Dias da Semana:</label>
          <div className="day-selector">
            {dayNames.map((name, index) => (
              <label key={index} className="day-checkbox">
                <input
                  type="checkbox"
                  checked={daysOfWeek.includes(index)}
                  onChange={() => toggleDayOfWeek(index)}
                />
                {name}
              </label>
            ))}
          </div>
        </div>
      )}

      {type === 'monthly' && (
        <div className="form-group">
          <label>Semana do Mês:</label>
          <div className="week-selector">
            {weekOrdinals.map((ordinal, index) => (
              <label key={index} className="week-checkbox">
                <input
                  type="checkbox"
                  checked={weekOfMonth.includes(index + 1)}
                  onChange={() => toggleWeekOfMonth(index + 1)}
                />
                {ordinal}
              </label>
            ))}
          </div>
        </div>
      )}

      {type === 'weekly' && (
        <div className="form-group">
          <label>Intervalo (semanas):</label>
          <input
            type="number"
            min="1"
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
            className="form-control"
          />
        </div>
      )}

      <div className="form-group">
        <label>Data Final (opcional):</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="form-control"
        />
      </div>
    </div>
  );
};

export default RecurrenceSelector;
