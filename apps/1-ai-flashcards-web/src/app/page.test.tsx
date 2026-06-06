import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const listDecks = vi.fn();
const createDeck = vi.fn();
const deleteDeck = vi.fn();

vi.mock('../lib/api', () => ({
  api: {
    listDecks: () => listDecks(),
    createDeck: (body: { name: string }) => createDeck(body),
    deleteDeck: (id: string) => deleteDeck(id),
  },
}));

import Home from './page.js';

describe('Home (deck list page)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listDecks.mockResolvedValue([]);
  });

  it('renders the heading and loads decks on mount', async () => {
    listDecks.mockResolvedValue([
      {
        id: 'd1',
        name: 'Spanish',
        createdAt: '2026-06-04T10:00:00.000Z',
        cardCount: 2,
        dueCount: 0,
      },
    ]);
    render(<Home />);

    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Spanish')).toBeTruthy());
  });

  it('adds a created deck to the list without a reload', async () => {
    createDeck.mockResolvedValue({
      id: 'd2',
      name: 'History',
      createdAt: '2026-06-04T10:00:00.000Z',
      cardCount: 0,
      dueCount: 0,
    });
    render(<Home />);
    await waitFor(() => expect(screen.getByText(/no decks yet/i)).toBeTruthy());

    fireEvent.change(screen.getByLabelText(/deck name/i), { target: { value: 'History' } });
    fireEvent.click(screen.getByRole('button', { name: /create deck/i }));

    await waitFor(() => expect(screen.getByText('History')).toBeTruthy());
    expect(createDeck).toHaveBeenCalledWith({ name: 'History' });
  });
});
