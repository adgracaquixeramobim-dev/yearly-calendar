import React, { useState } from 'react';
import { Event } from './types/event';
import EventForm from './components/EventForm/EventForm';
import EventList from './components/EventList/EventList';
import PDFPreview from './components/PDFPreview/PDFPreview';
import BackupRestore from './components/BackupRestore/BackupRestore';
import './App.css';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [churchName] = useState('Igreja Evangélica Assembleia de Deus no Brasil');
  const [ministryName] = useState('Ministério da Graça');

  const handleAddEvent = (event: Event) => {
    if (editingEvent) {
      setEvents(events.map((e) => (e.id === event.id ? event : e)));
      setEditingEvent(undefined);
    } else {
      setEvents([...events, event]);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      setEvents(events.filter((e) => e.id !== eventId));
    }
  };

  const handleRestore = (restoredEvents: Event[], metadata?: { churchName?: string; ministryName?: string; year?: number }) => {
    setEvents(restoredEvents);
    if (metadata?.year) {
      setYear(metadata.year);
    }
  };

  const handleCancelEdit = () => {
    setEditingEvent(undefined);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Gerador de Calendário PDF</h1>
        <div className="header-controls">
          <div className="year-selector">
            <label>Ano:</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              min="2020"
              max="2100"
              className="form-control-small"
            />
          </div>
          <BackupRestore
            events={events}
            onRestore={handleRestore}
            metadata={{ churchName, ministryName, year }}
          />
        </div>
      </header>

      <main className="app-main">
        <div className="form-section">
          <EventForm
            event={editingEvent}
            onSubmit={handleAddEvent}
            onCancel={editingEvent ? handleCancelEdit : undefined}
          />
        </div>

        <div className="events-section">
          <EventList
            events={events}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </div>

        {events.length > 0 && (
          <div className="pdf-section">
            <button
              onClick={() => setShowPDFPreview(!showPDFPreview)}
              className="btn btn-primary btn-large"
            >
              {showPDFPreview ? 'Ocultar' : 'Gerar PDF'}
            </button>
            {showPDFPreview && (
              <PDFPreview
                events={events}
                year={year}
                churchName={churchName}
                ministryName={ministryName}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
