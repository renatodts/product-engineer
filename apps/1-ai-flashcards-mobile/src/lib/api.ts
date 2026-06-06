import type { Card, Deck, ReviewSession } from '@product-engineer/shared-contracts';

// Mobile has no same-origin proxy (it is not a web server), so it calls the NestJS
// api host directly. Point EXPO_PUBLIC_API_URL at a host reachable from the device
// or emulator; the localhost default suits the iOS simulator / web preview.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4001';

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

/** Typed client for the AI Flashcards api. Types come from the shared Zod contracts. */
export const api = {
  listDecks: () => request<Deck[]>('/decks'),
  reviewSession: (deckId: string) => request<ReviewSession>(`/decks/${deckId}/review`),
  gradeCard: (cardId: string, grade: number) =>
    request<Card>(`/cards/${cardId}/review`, { method: 'POST', body: JSON.stringify({ grade }) }),
};
