import type {
  Card,
  CardCreate,
  CardSuggestion,
  Deck,
  DeckCreate,
  ReviewSession,
} from '@product-engineer/shared-contracts';

// Same-origin base; Next rewrites /api/* to the NestJS api (see next.config.mjs).
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed (${response.status})`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

/** Typed client for the AI Flashcards api. Request/response types come from the shared Zod contracts. */
export const api = {
  listDecks: () => request<Deck[]>('/decks'),
  createDeck: (body: DeckCreate) =>
    request<Deck>('/decks', { method: 'POST', body: JSON.stringify(body) }),
  deleteDeck: (id: string) => request<void>(`/decks/${id}`, { method: 'DELETE' }),

  listCards: (deckId: string) => request<Card[]>(`/decks/${deckId}/cards`),
  createCard: (deckId: string, body: CardCreate) =>
    request<Card>(`/decks/${deckId}/cards`, { method: 'POST', body: JSON.stringify(body) }),
  updateCard: (id: string, body: CardCreate) =>
    request<Card>(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteCard: (id: string) => request<void>(`/cards/${id}`, { method: 'DELETE' }),

  generate: (deckId: string, notes: string, maxCards?: number) =>
    request<CardSuggestion[]>(`/decks/${deckId}/generate`, {
      method: 'POST',
      body: JSON.stringify(maxCards == null ? { notes } : { notes, maxCards }),
    }),
  acceptSuggestions: (deckId: string, suggestions: CardSuggestion[]) =>
    request<Card[]>(`/decks/${deckId}/cards/accept`, {
      method: 'POST',
      body: JSON.stringify({ suggestions }),
    }),

  reviewSession: (deckId: string) => request<ReviewSession>(`/decks/${deckId}/review`),
  gradeCard: (cardId: string, grade: number) =>
    request<Card>(`/cards/${cardId}/review`, { method: 'POST', body: JSON.stringify({ grade }) }),
};
