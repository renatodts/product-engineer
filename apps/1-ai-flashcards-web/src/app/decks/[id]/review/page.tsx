'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Card } from '@product-engineer/shared-contracts';
import { api } from '../../../../lib/api';
import { ReviewSession } from '../../../../components/ReviewSession';

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const deckId = params.id;

  const [cards, setCards] = useState<Card[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .reviewSession(deckId)
      .then((session) => setCards(session.cards))
      .catch(() => setError('Could not load the review session.'));
  }, [deckId]);

  return (
    <main>
      <p>
        <Link href={`/decks/${deckId}`} className="muted-link">
          ← Back to deck
        </Link>
      </p>
      <h1>Review</h1>
      {error ? <p className="error">{error}</p> : null}
      {cards === null && !error ? (
        <p className="meta">Loading…</p>
      ) : (
        <ReviewSession
          cards={cards ?? []}
          onGrade={async (cardId, grade) => {
            await api.gradeCard(cardId, grade);
          }}
        />
      )}
    </main>
  );
}
