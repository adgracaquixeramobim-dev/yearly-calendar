# Calendar PDF Generator

A React application for creating and managing church event calendars with PDF export functionality.

## Features

- **Event Management**: Add, edit, and delete events (both unique and recurrent)
- **Flexible Recurrence Patterns**: Support for daily, weekly, and monthly recurring events
- **PDF Generation**: Generate formatted PDF calendars matching the original document structure
- **Backup & Restore**: Save and restore all event data as JSON files
- **Form Validation**: Comprehensive validation using Zod schemas

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Events

1. Fill out the event form with:
   - Event name
   - Event type (Worship, Holy Communion, Meeting, Other)
   - Location
   - Date (for unique events) or recurrence pattern (for recurring events)
   - Optional: Time and Department

2. For recurring events:
   - Check "Evento Recorrente"
   - Select frequency (Daily, Weekly, Monthly)
   - Choose days of week (for weekly/monthly)
   - Select weeks of month (for monthly)
   - Optionally set an end date

### Managing Events

- View all events in the event list
- Click "Editar" to modify an event
- Click "Excluir" to remove an event

### Generating PDF

1. Add events to your calendar
2. Click "Gerar PDF" button
3. Preview the generated PDF
4. Click "Baixar PDF" to download

### Backup & Restore

- **Backup**: Click "Fazer Backup" to download all events as a JSON file
- **Restore**: Click "Restaurar Backup" and select a previously saved JSON file

## Project Structure

```
src/
  components/
    EventForm/          # Event input form
    EventList/          # Event list display
    RecurrenceSelector/ # Recurrence pattern selector
    PDFPreview/         # PDF preview component
    BackupRestore/      # Backup/restore functionality
  utils/
    dateUtils.ts        # Date calculation utilities
    eventOrganizer.ts   # Event organization logic
    pdfGenerator.tsx    # PDF generation
    backupRestore.ts    # Backup/restore utilities
    validation.ts       # Form validation schemas
  types/
    event.ts            # TypeScript type definitions
```

## Technologies

- React 18
- TypeScript
- @react-pdf/renderer
- date-fns
- zod
- React Hook Form

## License

MIT
