import type { Card } from '@product-engineer/shared-contracts';

export function CardList({
  cards,
  onEdit,
  onDelete,
}: {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}) {
  if (cards.length === 0) {
    return <p className="empty">No cards yet. Add one above or generate from notes.</p>;
  }

  return (
    <ul className="list">
      {cards.map((card) => (
        <li key={card.id} className="card">
          <div>
            <div className="card-title">{card.front}</div>
            <div className="meta">{card.back}</div>
          </div>
          <div className="toolbar">
            <button
              type="button"
              className="btn btn-ghost"
              aria-label={`Edit ${card.front}`}
              onClick={() => onEdit(card)}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-danger"
              aria-label={`Delete ${card.front}`}
              onClick={() => onDelete(card.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
