import Link from 'next/link';
import type { Deck } from '@product-engineer/shared-contracts';

export function DeckList({ decks, onDelete }: { decks: Deck[]; onDelete: (id: string) => void }) {
  if (decks.length === 0) {
    return <p className="empty">No decks yet. Create your first deck above.</p>;
  }

  return (
    <ul className="list">
      {decks.map((deck) => (
        <li key={deck.id} className="card">
          <div>
            <Link href={`/decks/${deck.id}`} className="card-title muted-link">
              {deck.name}
            </Link>
            <div className="meta">
              {deck.cardCount} cards · <span className="badge">{deck.dueCount} due</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            aria-label={`Delete ${deck.name}`}
            onClick={() => onDelete(deck.id)}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
