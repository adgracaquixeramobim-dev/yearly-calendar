import React, { useEffect, useId, useRef, useState } from 'react';

interface ConfirmClearProps {
  open: boolean;
  eventCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

const CONFIRM_PHRASE = 'LIMPAR';

const ConfirmClear: React.FC<ConfirmClearProps> = ({
  open,
  eventCount,
  onCancel,
  onConfirm,
}) => {
  const [phrase, setPhrase] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const onCancelRef = useRef(onCancel);
  const titleId = useId();
  const descriptionId = useId();
  const canConfirm = phrase === CONFIRM_PHRASE;

  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) {
      setPhrase('');
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancelRef.current();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (phrase === CONFIRM_PHRASE) onConfirm();
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">Confirmação</p>
        <h2 id={titleId}>Limpar calendário</h2>
        <div id={descriptionId} className="modal-copy">
          <p>
            Isso apaga {eventCount} {eventCount === 1 ? 'evento' : 'eventos'} deste
            aparelho. O ano selecionado permanece.
          </p>
          <p>
            Se o JSON ainda não foi baixado, o calendário se perde neste aparelho.
            Baixe o JSON antes de continuar. Esse é o arquivo que deve ser enviado.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="clear-confirm">Digite LIMPAR para confirmar</label>
            <input
              id="clear-confirm"
              ref={inputRef}
              type="text"
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="form-control"
              placeholder="LIMPAR"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger" disabled={!canConfirm}>
              Limpar tudo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmClear;
