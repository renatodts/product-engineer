import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Deck } from '@product-engineer/shared-contracts';
import { DeckList } from './DeckList.js';

const deck = (overrides: Partial<Deck> = {}): Deck => ({
  id: 'd1',
  name: 'Spanish',
  createdAt: '2026-06-04T10:00:00.000Z',
  cardCount: 3,
  dueCount: 1,
  ...overrides,
});

describe('DeckList', () => {
  it('renders each deck with its name and counts', () => {
    render(<DeckList decks={[deck()]} onDelete={vi.fn()} />);

    expect(screen.getByText('Spanish')).toBeTruthy();
    expect(screen.getByText(/3 cards/i)).toBeTruthy();
    expect(screen.getByText(/1 due/i)).toBeTruthy();
  });

  it('shows an empty state when there are no decks', () => {
    render(<DeckList decks={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/no decks yet/i)).toBeTruthy();
  });

  it('calls onDelete with the deck id', () => {
    const onDelete = vi.fn();
    render(<DeckList decks={[deck({ id: 'abc', name: 'Math' })]} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: /delete math/i }));

    expect(onDelete).toHaveBeenCalledWith('abc');
  });
});
