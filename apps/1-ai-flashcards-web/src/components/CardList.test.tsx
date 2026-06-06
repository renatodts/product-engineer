import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Card } from '@product-engineer/shared-contracts';
import { CardList } from './CardList.js';

const card = (overrides: Partial<Card> = {}): Card => ({
  id: 'c1',
  deckId: 'd1',
  front: 'hola',
  back: 'hello',
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  dueAt: '2026-06-04T10:00:00.000Z',
  createdAt: '2026-06-04T10:00:00.000Z',
  ...overrides,
});

describe('CardList', () => {
  it('renders each card front and back', () => {
    render(<CardList cards={[card()]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('hola')).toBeTruthy();
    expect(screen.getByText('hello')).toBeTruthy();
  });

  it('shows an empty state when there are no cards', () => {
    render(<CardList cards={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/no cards yet/i)).toBeTruthy();
  });

  it('invokes edit and delete callbacks', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const c = card({ id: 'abc', front: 'bonjour' });
    render(<CardList cards={[c]} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: /edit bonjour/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete bonjour/i }));

    expect(onEdit).toHaveBeenCalledWith(c);
    expect(onDelete).toHaveBeenCalledWith('abc');
  });
});
