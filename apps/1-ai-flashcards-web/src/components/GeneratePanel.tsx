'use client';

import { useState } from 'react';
import type { CardSuggestion } from '@product-engineer/shared-contracts';

export function GeneratePanel({
  onGenerate,
  onAccept,
}: {
  onGenerate: (notes: string) => Promise<CardSuggestion[]>;
  onAccept: (suggestions: CardSuggestion[]) => Promise<void>;
}) {
  const [notes, setNotes] = useState('');
  const [suggestions, setSuggestions] = useState<CardSuggestion[] | null>(null);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCount = selected.filter(Boolean).length;

  const generate = async () => {
    if (!notes.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await onGenerate(notes.trim());
      setSuggestions(result);
      setSelected(result.map(() => true));
    } catch {
      setError('Generation failed. Your notes are kept — you can retry.');
    } finally {
      setBusy(false);
    }
  };

  const accept = async () => {
    if (!suggestions) return;
    const chosen = suggestions.filter((_, index) => selected[index]);
    if (chosen.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      await onAccept(chosen);
      setSuggestions(null);
      setSelected([]);
      setNotes('');
    } catch {
      setError('Could not save the selected cards — you can retry.');
    } finally {
      setBusy(false);
    }
  };

  const toggle = (index: number) => {
    setSelected((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <section className="stack">
      <label htmlFor="generate-notes" className="card-title">
        Generate cards from notes
      </label>
      <textarea
        id="generate-notes"
        className="field"
        aria-label="Notes"
        placeholder="Paste your study notes here…"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <div className="toolbar">
        <button type="button" className="btn" onClick={generate} disabled={!notes.trim() || busy}>
          {busy && !suggestions ? 'Generating…' : 'Generate'}
        </button>
        {error ? (
          <button type="button" className="btn btn-ghost" onClick={generate} disabled={busy}>
            Retry
          </button>
        ) : null}
      </div>

      {error ? <p className="error">{error}</p> : null}

      {suggestions ? (
        <div className="stack">
          <ul className="list">
            {suggestions.map((suggestion, index) => (
              <li key={`${suggestion.front}-${index}`} className="card">
                <label className="row" style={{ gap: '0.6rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    aria-label={suggestion.front}
                    checked={selected[index] ?? false}
                    onChange={() => toggle(index)}
                  />
                  <span>
                    <span className="card-title">{suggestion.front}</span>
                    <span className="meta"> — {suggestion.back}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="toolbar">
            <button
              type="button"
              className="btn"
              onClick={accept}
              disabled={selectedCount === 0 || busy}
            >
              Accept {selectedCount} selected
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSuggestions(null);
                setSelected([]);
              }}
              disabled={busy}
            >
              Discard
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
