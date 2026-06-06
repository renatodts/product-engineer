import type { Card as DbCard } from '@prisma/client';
import type { Card } from '@product-engineer/shared-contracts';

/** Maps a persisted card to its serializable wire shape (Dates -> ISO strings). */
export function toCard(card: DbCard): Card {
  return {
    id: card.id,
    deckId: card.deckId,
    front: card.front,
    back: card.back,
    easeFactor: card.easeFactor,
    interval: card.interval,
    repetitions: card.repetitions,
    dueAt: card.dueAt.toISOString(),
    createdAt: card.createdAt.toISOString(),
  };
}
