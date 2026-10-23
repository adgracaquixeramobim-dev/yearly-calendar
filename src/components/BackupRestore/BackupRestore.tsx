import React, { useRef } from 'react';
import { Event } from '../../types/event';
import { exportBackup, importBackup } from '../../utils/backupRestore';

interface BackupRestoreProps {
  events: Event[];
  onRestore: (events: Event[], metadata?: { churchName?: string; ministryName?: string; year?: number }) => void;
  onExport?: () => void;
  exportDisabled?: boolean;
  exportClassName?: string;
  exportLabel?: string;
  metadata?: {
    churchName?: string;
    ministryName?: string;
    year?: number;
  };
}

const BackupRestore: React.FC<BackupRestoreProps> = ({
  events,
  onRestore,
  onExport,
  exportDisabled = false,
  exportClassName = 'btn btn-primary btn-large',
  exportLabel = 'Baixar JSON',
  metadata,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    if (exportDisabled) return;
    if (onExport) {
      onExport();
      return;
    }
    exportBackup(events, metadata);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importBackup(file);
    
    if (result.error) {
      alert(`Erro ao restaurar backup: ${result.error}`);
      return;
    }

    if (result.events.length === 0) {
      alert('Nenhum evento encontrado no arquivo de backup.');
      return;
    }

    const confirmed = window.confirm(
      `Deseja restaurar ${result.events.length} evento(s)? Isso substituirá todos os eventos atuais.`
    );

    if (confirmed) {
      onRestore(result.events, result.metadata);
      alert('Backup restaurado com sucesso!');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="backup-restore">
      <button
        type="button"
        onClick={handleBackup}
        className={exportClassName}
        disabled={exportDisabled}
      >
        {exportLabel}
      </button>
      <button type="button" onClick={handleRestoreClick} className="btn btn-secondary">
        Restaurar JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default BackupRestore;
