import React, { useCallback, useEffect, useState } from 'react';
import { Event } from './types/event';
import EventForm from './components/EventForm/EventForm';
import EventList from './components/EventList/EventList';
import PDFPreview from './components/PDFPreview/PDFPreview';
import BackupRestore from './components/BackupRestore/BackupRestore';
import ConfirmClear from './components/ConfirmClear/ConfirmClear';
import { exportBackup, shareBackup } from './utils/backupRestore';
import { downloadCalendarPdf } from './utils/downloadPdf';
import { draftSignature, loadDraft, saveDraft } from './utils/storage';
import './App.css';

function App() {
  const [initialDraft] = useState(() => loadDraft());
  const [events, setEvents] = useState<Event[]>(initialDraft?.events ?? []);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [year, setYear] = useState(initialDraft?.year ?? new Date().getFullYear());
  const [jsonSignature, setJsonSignature] = useState<string | null>(
    initialDraft?.jsonSignature ?? null
  );
  const [persisted, setPersisted] = useState(Boolean(initialDraft));
  const [storageWarning, setStorageWarning] = useState(false);
  const [detectConflicts, setDetectConflicts] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [shareHint, setShareHint] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [churchName] = useState('Igreja Evangélica Assembleia de Deus no Brasil');
  const [ministryName] = useState('Ministério da Graça');

  const currentSignature = draftSignature(events, year);
  const isJsonExported = jsonSignature !== null && jsonSignature === currentSignature;

  useEffect(() => {
    const saved = saveDraft({ events, year, jsonSignature });
    setPersisted(saved);
    setStorageWarning(!saved);
  }, [events, year, jsonSignature]);

  useEffect(() => {
    if (events.length === 0) setShowPDFPreview(false);
  }, [events.length]);

  const handleAddEvent = (event: Event) => {
    if (editingEvent) {
      setEvents(events.map((item) => (item.id === event.id ? event : item)));
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
      setEvents(events.filter((event) => event.id !== eventId));
      if (editingEvent?.id === eventId) setEditingEvent(undefined);
    }
  };

  const handleRestore = (
    restoredEvents: Event[],
    metadata?: { churchName?: string; ministryName?: string; year?: number }
  ) => {
    setEvents(restoredEvents);
    setJsonSignature(null);
    setEditingEvent(undefined);
    if (metadata?.year) setYear(metadata.year);
  };

  const handleCancelEdit = () => {
    setEditingEvent(undefined);
  };

  const handleClear = () => {
    setEvents([]);
    setJsonSignature(null);
    setEditingEvent(undefined);
    setPdfError('');
    setShowClearConfirm(false);
  };

  const handleCloseClear = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  const handleExportJson = () => {
    if (events.length === 0) return;
    const signatureAtExport = draftSignature(events, year);
    exportBackup(events, { churchName, ministryName, year });
    setJsonSignature(signatureAtExport);
  };

  const handleShareWhatsApp = async () => {
    if (events.length === 0) return;
    const signatureAtExport = draftSignature(events, year);
    setShareHint('');
    const result = await shareBackup(events, { churchName, ministryName, year });
    if (result === 'cancelled') return;
    setJsonSignature(signatureAtExport);
    if (result === 'downloaded') {
      setShareHint(
        'O JSON foi baixado e o WhatsApp foi aberto. Anexe esse arquivo na conversa. Não envie o PDF.'
      );
    }
  };

  const handleDownloadPdf = async () => {
    if (events.length === 0 || isGenerating) return;

    setPdfError('');
    setIsGenerating(true);
    try {
      await downloadCalendarPdf({
        events,
        year,
        churchName,
        ministryName,
        detectConflicts,
      });
    } catch {
      setPdfError('Não foi possível gerar o PDF. Tente de novo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportLabel = isJsonExported ? 'JSON exportado' : 'JSON ainda não exportado';

  return (
    <div className={`App${events.length > 0 ? ' has-export-bar' : ''}`}>
      <header className="app-header">
        <div className="brand">
          <p className="eyebrow">{ministryName}</p>
          <h1>Calendário anual</h1>
          <p className="church-name">{churchName}</p>
        </div>
        <div className="year-selector">
          <label htmlFor="calendar-year">Ano</label>
          <input
            id="calendar-year"
            type="number"
            value={year}
            onChange={(event) => setYear(parseInt(event.target.value, 10) || new Date().getFullYear())}
            min="2020"
            max="2100"
            inputMode="numeric"
            className="form-control-small"
          />
        </div>
      </header>

      <div className="status-strip" role="status">
        <ul className="status-facts">
          <li>
            <strong>{events.length}</strong> {events.length === 1 ? 'evento' : 'eventos'}
          </li>
          <li>Ano {year}</li>
          <li className={`export-badge${isJsonExported ? ' is-exported' : ' is-pending'}`}>
            {events.length === 0 ? 'Rascunho vazio' : exportLabel}
          </li>
        </ul>
        <p className="status-message">
          Envie o arquivo JSON pelo WhatsApp. Não envie o PDF.
        </p>
        {persisted && <p className="save-note">Salvo neste dispositivo</p>}
        {storageWarning && (
          <p className="save-note is-warning">
            Não foi possível salvar neste dispositivo. Baixe o JSON para não perder o calendário.
          </p>
        )}
      </div>

      <main className="app-main">
        <div className="form-section">
          <EventForm
            event={editingEvent}
            onSubmit={handleAddEvent}
            onCancel={editingEvent ? handleCancelEdit : undefined}
          />
        </div>

        <div className="workspace">
          <section className="export-panel">
            <div className="export-panel-copy">
              <p className="eyebrow">Arquivo para enviar</p>
              <h2>Envie o JSON pelo WhatsApp</h2>
              <p>
                Toque em Enviar pelo WhatsApp, escolha a conversa e mande o arquivo JSON.
                O PDF é só para impressão e não substitui o JSON.
              </p>
            </div>
            <div className="export-panel-actions">
              {events.length > 0 && (
                <p className={`export-badge${isJsonExported ? ' is-exported' : ' is-pending'}`}>
                  {exportLabel}
                </p>
              )}
              <button
                type="button"
                className="btn btn-whatsapp btn-large"
                onClick={handleShareWhatsApp}
                disabled={events.length === 0}
              >
                <WhatsAppIcon />
                Enviar pelo WhatsApp
              </button>
              <BackupRestore
                events={events}
                onRestore={handleRestore}
                onExport={handleExportJson}
                exportDisabled={events.length === 0}
                exportClassName="btn btn-secondary"
                exportLabel="Baixar JSON"
                metadata={{ churchName, ministryName, year }}
              />
              {shareHint && <p className="share-hint">{shareHint}</p>}
              {events.length === 0 && (
                <p className="export-waiting">
                  Adicione pelo menos um evento para enviar o JSON.
                </p>
              )}
            </div>
          </section>

          <EventList
            events={events}
            year={year}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />

          <section className="draft-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setShowClearConfirm(true)}
              disabled={events.length === 0}
            >
              Limpar calendário
            </button>
            <p className="draft-note">
              Limpar apaga os eventos salvos neste dispositivo. Baixe o JSON antes, se ainda
              for enviá-lo.
            </p>
          </section>

          <details className="pdf-tools">
            <summary>PDF para impressão (opcional)</summary>
            <div className="pdf-tools-body">
              <p>
                Não envie o PDF no lugar do JSON. Ele serve apenas para conferir ou imprimir
                o calendário.
              </p>
              {events.length > 0 ? (
                <>
                  <label className="conflict-toggle">
                    <input
                      type="checkbox"
                      checked={detectConflicts}
                      onChange={(event) => setDetectConflicts(event.target.checked)}
                    />
                    <span>Marcar conflitos quando houver 2 ou mais eventos no mesmo dia e local</span>
                  </label>
                  <div className="export-buttons">
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="btn btn-secondary"
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPDFPreview((open) => !open)}
                      className="btn btn-secondary"
                    >
                      {showPDFPreview ? 'Ocultar prévia' : 'Pré-visualizar'}
                    </button>
                  </div>
                  {pdfError && <p className="export-error">{pdfError}</p>}
                  {showPDFPreview && (
                    <PDFPreview
                      events={events}
                      year={year}
                      churchName={churchName}
                      ministryName={ministryName}
                      detectConflicts={detectConflicts}
                    />
                  )}
                </>
              ) : (
                <p className="export-waiting">O PDF fica disponível depois que houver eventos.</p>
              )}
            </div>
          </details>
        </div>
      </main>

      {events.length > 0 && (
        <div className="export-sticky">
          <div className="export-sticky-copy">
            <strong>{exportLabel}</strong>
            <span>Envie o JSON pelo WhatsApp, não o PDF</span>
          </div>
          <button type="button" className="btn btn-whatsapp" onClick={handleShareWhatsApp}>
            <WhatsAppIcon />
            WhatsApp
          </button>
        </div>
      )}

      <ConfirmClear
        open={showClearConfirm}
        eventCount={events.length}
        onCancel={handleCloseClear}
        onConfirm={handleClear}
      />
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.5 3.5A11 11 0 0 0 2.1 17.1L1 23l6-1.6A11 11 0 0 0 20.5 3.5zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.6.9.9-3.5-.2-.3A9.1 9.1 0 1 1 12 20.5zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a2 2 0 0 0 0-.6c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 12 12 0 0 0 4.5 4 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3z"
      />
    </svg>
  );
}

export default App;
