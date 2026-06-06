import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from './api.js';

const jsonResponse = (data: unknown, status = 200) => ({
  ok: status < 400,
  status,
  json: () => Promise.resolve(data),
});

afterEach(() => vi.restoreAllMocks());

describe('api client', () => {
  it('lists decks via GET /api/decks', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([{ id: 'd1' }]));
    vi.stubGlobal('fetch', fetchMock);

    const decks = await api.listDecks();

    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/decks');
    expect(decks).toEqual([{ id: 'd1' }]);
  });

  it('creates a deck via POST with a JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'd1', name: 'X' }, 201));
    vi.stubGlobal('fetch', fetchMock);

    await api.createDeck({ name: 'X' });

    const init = (fetchMock.mock.calls[0]?.[1] ?? {}) as RequestInit;
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/decks');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ name: 'X' });
  });

  it('returns undefined for 204 responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.deleteDeck('d1')).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/decks/d1');
  });

  it('throws ApiError on a non-ok response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 400));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.createDeck({ name: '' })).rejects.toBeInstanceOf(ApiError);
  });

  it('omits maxCards from the generate body when not provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    await api.generate('d1', 'some notes');

    const init = (fetchMock.mock.calls[0]?.[1] ?? {}) as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({ notes: 'some notes' });
  });

  it('grades a card via POST /api/cards/:id/review', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'c1' }));
    vi.stubGlobal('fetch', fetchMock);

    await api.gradeCard('c1', 5);

    const init = (fetchMock.mock.calls[0]?.[1] ?? {}) as RequestInit;
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/cards/c1/review');
    expect(JSON.parse(String(init.body))).toEqual({ grade: 5 });
  });
});
