import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from './api.js';

const jsonResponse = (data: unknown, status = 200) => ({
  ok: status < 400,
  status,
  json: () => Promise.resolve(data),
});

afterEach(() => vi.restoreAllMocks());

describe('mobile api client', () => {
  it('lists decks via GET {base}/decks', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([{ id: 'd1' }]));
    vi.stubGlobal('fetch', fetchMock);

    const decks = await api.listDecks();

    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:4001/decks');
    expect(decks).toEqual([{ id: 'd1' }]);
  });

  it('fetches a review session for a deck', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ deckId: 'd1', cards: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const session = await api.reviewSession('d1');

    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:4001/decks/d1/review');
    expect(session).toEqual({ deckId: 'd1', cards: [] });
  });

  it('grades a card via POST {base}/cards/:id/review', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'c1' }));
    vi.stubGlobal('fetch', fetchMock);

    await api.gradeCard('c1', 5);

    const init = (fetchMock.mock.calls[0]?.[1] ?? {}) as RequestInit;
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:4001/cards/c1/review');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ grade: 5 });
  });

  it('throws ApiError on a non-ok response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 500));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.listDecks()).rejects.toBeInstanceOf(ApiError);
  });
});
