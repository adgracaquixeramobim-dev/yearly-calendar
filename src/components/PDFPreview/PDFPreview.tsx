import React, { useState } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { Event } from '../../types/event';
import { CalendarPDFDocument } from '../../utils/pdfGenerator';

interface PDFPreviewProps {
  events: Event[];
  year: number;
  churchName?: string;
  ministryName?: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  events,
  year,
  churchName,
  ministryName,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    const doc = (
      <CalendarPDFDocument
        events={events}
        year={year}
        churchName={churchName}
        ministryName={ministryName}
      />
    );
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendario-${year}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    setIsGenerating(false);
  };

  return (
    <div className="pdf-preview">
      <h2>Pré-visualização do PDF</h2>
      <div className="pdf-viewer-container">
        <PDFViewer width="100%" height="600px">
          <CalendarPDFDocument
            events={events}
            year={year}
            churchName={churchName}
            ministryName={ministryName}
          />
        </PDFViewer>
      </div>
      <div className="pdf-actions">
        <button
          onClick={handleDownload}
          className="btn btn-primary"
          disabled={isGenerating}
        >
          {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
        </button>
      </div>
    </div>
  );
};

export default PDFPreview;
