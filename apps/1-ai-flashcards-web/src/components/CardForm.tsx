'use client';

import { useState, type FormEvent } from 'react';

export function CardForm({
  onSubmit,
  initialFront = '',
  initialBack = '',
  submitLabel = 'Add card',
  onCancel,
}: {
  onSubmit: (front: string, back: string) => void;
  initialFront?: string;
  initialBack?: string;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const canSubmit = front.trim().length > 0 && back.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(front.trim(), back.trim());
    if (!onCancel) {
      setFront('');
      setBack('');
    }
  };

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="row">
        <label htmlFor="card-front" className="sr-only">
          Front
        </label>
        <input
          id="card-front"
          className="field"
          placeholder="Front (question)"
          value={front}
          onChange={(event) => setFront(event.target.value)}
        />
        <label htmlFor="card-back" className="sr-only">
          Back
        </label>
        <input
          id="card-back"
          className="field"
          placeholder="Back (answer)"
          value={back}
          onChange={(event) => setBack(event.target.value)}
        />
      </div>
      <div className="toolbar">
        <button type="submit" className="btn" disabled={!canSubmit}>
          {submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
