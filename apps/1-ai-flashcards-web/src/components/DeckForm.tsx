'use client';

import { useState, type FormEvent } from 'react';

export function DeckForm({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  const trimmed = name.trim();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!trimmed) return;
    onCreate(trimmed);
    setName('');
  };

  return (
    <form className="row" onSubmit={handleSubmit}>
      <label htmlFor="deck-name" className="sr-only">
        Deck name
      </label>
      <input
        id="deck-name"
        className="field"
        placeholder="New deck name…"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <button type="submit" className="btn" disabled={!trimmed}>
        Create deck
      </button>
    </form>
  );
}
