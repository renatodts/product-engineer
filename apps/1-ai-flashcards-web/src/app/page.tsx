'use client';

import { useEffect, useState } from 'react';
import type { Deck } from '@product-engineer/shared-contracts';
import { api } from '../lib/api';
import { DeckForm } from '../components/DeckForm';
import { DeckList } from '../components/DeckList';

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listDecks()
      .then(setDecks)
      .catch(() => setError('Could not load decks. Is the API running?'));
  }, []);

  const handleCreate = async (name: string) => {
    try {
      const deck = await api.createDeck({ name });
      setDecks((prev) => [...prev, deck]);
    } catch {
      setError('Could not create the deck.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDeck(id);
      setDecks((prev) => prev.filter((deck) => deck.id !== id));
    } catch {
      setError('Could not delete the deck.');
    }
  };

  return (
    <main>
      <h1>AI Flashcards</h1>
      <p className="subtitle">Create decks and study with spaced repetition.</p>
      <DeckForm onCreate={handleCreate} />
      {error ? <p className="error">{error}</p> : null}
      <DeckList decks={decks} onDelete={handleDelete} />
    </main>
  );
}
