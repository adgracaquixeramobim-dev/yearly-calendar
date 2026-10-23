import React, { useEffect, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { Event } from '../../types/event';
import { CalendarPDFDocument } from '../../utils/pdfGenerator';

interface PDFPreviewProps {
  events: Event[];
  year: number;
  churchName?: string;
  ministryName?: string;
  detectConflicts: boolean;
}

function useWideScreen() {
  const query = '(min-width: 769px)';
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return matches;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  events,
  year,
  churchName,
  ministryName,
  detectConflicts,
}) => {
  const isWide = useWideScreen();

  return (
    <div className="pdf-preview">
      <h3>Pré-visualização</h3>
      {isWide ? (
        <div className="pdf-viewer-container">
          <PDFViewer width="100%" height="640px">
            <CalendarPDFDocument
              events={events}
              year={year}
              churchName={churchName}
              ministryName={ministryName}
              detectConflicts={detectConflicts}
            />
          </PDFViewer>
        </div>
      ) : (
        <p className="pdf-mobile-note">
          No celular, a pré-visualização não abre. Se quiser só conferir o calendário,
          use o PDF em uma tela maior. O arquivo para enviar continua sendo o JSON.
        </p>
      )}
    </div>
  );
};

export default PDFPreview;
