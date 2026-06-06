import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Card } from '@product-engineer/shared-contracts';
import { ReviewSession } from './ReviewSession.js';

const card = (id: string, front: string): Card => ({
  id,
  deckId: 'd1',
  front,
  back: `${front}-answer`,
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  dueAt: '2026-06-04T10:00:00.000Z',
  createdAt: '2026-06-04T10:00:00.000Z',
});

describe('ReviewSession', () => {
  it('shows an empty state when nothing is due', () => {
    render(<ReviewSession cards={[]} onGrade={vi.fn()} />);
    expect(screen.getByText(/no cards are due/i)).toBeTruthy();
  });

  it('reveals the back only after requesting the answer', () => {
    render(
      <ReviewSession cards={[card('c1', 'hola')]} onGrade={vi.fn().mockResolvedValue(undefined)} />,
    );

    expect(screen.getByText('hola')).toBeTruthy();
    expect(screen.queryByText('hola-answer')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
    expect(screen.getByText('hola-answer')).toBeTruthy();
  });

  it('grades the current card and advances, then shows a summary', async () => {
    const onGrade = vi.fn().mockResolvedValue(undefined);
    render(<ReviewSession cards={[card('c1', 'one'), card('c2', 'two')]} onGrade={onGrade} />);

    fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /grade 5/i }));

    await waitFor(() => expect(onGrade).toHaveBeenCalledWith('c1', 5));
    await waitFor(() => expect(screen.getByText('two')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /grade 2/i }));

    await waitFor(() => expect(onGrade).toHaveBeenCalledWith('c2', 2));
    await waitFor(() => expect(screen.getByText(/review complete/i)).toBeTruthy());
  });
});
