'use client';

import { useState } from 'react';
import type { Card } from '@product-engineer/shared-contracts';

const GRADES = [0, 1, 2, 3, 4, 5];

export function ReviewSession({
  cards,
  onGrade,
}: {
  cards: Card[];
  onGrade: (cardId: string, grade: number) => Promise<void>;
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (cards.length === 0) {
    return <p className="empty">No cards are due right now. 🎉</p>;
  }
  if (index >= cards.length) {
    return <p className="empty">Review complete — {cards.length} card(s) reviewed.</p>;
  }

  const card = cards[index];
  if (!card) return null;

  const grade = async (value: number) => {
    setBusy(true);
    try {
      await onGrade(card.id, value);
      setIndex((prev) => prev + 1);
      setRevealed(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack">
      <p className="meta">
        Card {index + 1} of {cards.length}
      </p>
      <div className="card">
        <div className="card-title">{card.front}</div>
      </div>

      {revealed ? (
        <>
          <div className="card">
            <div className="meta">{card.back}</div>
          </div>
          <div className="toolbar" aria-label="Grade your recall from 0 to 5">
            {GRADES.map((value) => (
              <button
                key={value}
                type="button"
                className="btn"
                aria-label={`Grade ${value}`}
                onClick={() => grade(value)}
                disabled={busy}
              >
                {value}
              </button>
            ))}
          </div>
        </>
      ) : (
        <button type="button" className="btn" onClick={() => setRevealed(true)}>
          Show answer
        </button>
      )}
    </div>
  );
}
