import { pdf } from '@react-pdf/renderer';
import { Event } from '../types/event';
import { CalendarPDFDocument } from './pdfGenerator';

interface DownloadCalendarPdfOptions {
  events: Event[];
  year: number;
  churchName?: string;
  ministryName?: string;
  detectConflicts: boolean;
}

export async function downloadCalendarPdf({
  events,
  year,
  churchName,
  ministryName,
  detectConflicts,
}: DownloadCalendarPdfOptions): Promise<void> {
  const blob = await pdf(
    <CalendarPDFDocument
      events={events}
      year={year}
      churchName={churchName}
      ministryName={ministryName}
      detectConflicts={detectConflicts}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `calendario-${year}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
