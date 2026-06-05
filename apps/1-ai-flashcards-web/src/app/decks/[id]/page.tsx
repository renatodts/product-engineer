'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Card } from '@product-engineer/shared-contracts';
import { api } from '../../../lib/api';
import { CardForm } from '../../../components/CardForm';
import { CardList } from '../../../components/CardList';

export default function DeckDetailPage() {
  const params = useParams<{ id: string }>();
  const deckId = params.id;

  const [cards, setCards] = useState<Card[]>([]);
  const [editing, setEditing] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listCards(deckId)
      .then(setCards)
      .catch(() => setError('Could not load cards.'));
  }, [deckId]);

  const handleSubmit = async (front: string, back: string) => {
    try {
      if (editing) {
        const updated = await api.updateCard(editing.id, { front, back });
        setCards((prev) => prev.map((card) => (card.id === updated.id ? updated : card)));
        setEditing(null);
      } else {
        const created = await api.createCard(deckId, { front, back });
        setCards((prev) => [...prev, created]);
      }
    } catch {
      setError('Could not save the card.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCard(id);
      setCards((prev) => prev.filter((card) => card.id !== id));
      if (editing?.id === id) setEditing(null);
    } catch {
      setError('Could not delete the card.');
    }
  };

  return (
    <main>
      <p>
        <Link href="/" className="muted-link">
          ← All decks
        </Link>
      </p>
      <h1>Cards</h1>
      <p className="subtitle">
        Manage this deck&apos;s cards, or{' '}
        <Link href={`/decks/${deckId}/review`} className="muted-link">
          start a review
        </Link>
        .
      </p>

      <CardForm
        key={editing?.id ?? 'new'}
        onSubmit={handleSubmit}
        initialFront={editing?.front ?? ''}
        initialBack={editing?.back ?? ''}
        submitLabel={editing ? 'Save card' : 'Add card'}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      {error ? <p className="error">{error}</p> : null}

      <CardList cards={cards} onEdit={setEditing} onDelete={handleDelete} />
    </main>
  );
}
