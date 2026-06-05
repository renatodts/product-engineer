// API contracts (Zod schemas) shared across a project's web / mobile / api apps.
// Single source of truth for wire shapes (ADR-020): the api validates request bodies
// against these schemas and clients infer their TypeScript types via `z.infer`.
// Keep this package framework-neutral (no UI, no server-framework imports) so it stays
// CommonJS-importable by NestJS apps (ADR-002).
import { z } from 'zod';

// ── Shared bounds ────────────────────────────────────────────────────────────

/** Maximum length of pasted notes accepted by the AI generation endpoint. */
export const NOTES_MAX_LENGTH = 10_000;
/** Inclusive bounds for how many cards AI generation may draft in one request. */
export const MAX_CARDS_MIN = 1;
export const MAX_CARDS_MAX = 20;
export const MAX_CARDS_DEFAULT = 10;
/** Inclusive bounds for an SM-2 review grade. */
export const GRADE_MIN = 0;
export const GRADE_MAX = 5;

/** A trimmed, non-empty string (rejects whitespace-only input). */
const nonEmptyText = (field: string) => z.string().trim().min(1, `${field} must not be empty`);

// ── Decks ────────────────────────────────────────────────────────────────────

export const DeckCreateSchema = z.object({
  name: nonEmptyText('name'),
});
export type DeckCreate = z.infer<typeof DeckCreateSchema>;

export const DeckSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.iso.datetime(),
  cardCount: z.number().int().nonnegative(),
  dueCount: z.number().int().nonnegative(),
});
export type Deck = z.infer<typeof DeckSchema>;

// ── Cards ────────────────────────────────────────────────────────────────────

export const CardCreateSchema = z.object({
  front: nonEmptyText('front'),
  back: nonEmptyText('back'),
});
export type CardCreate = z.infer<typeof CardCreateSchema>;

export const CardSchema = z.object({
  id: z.string(),
  deckId: z.string(),
  front: z.string(),
  back: z.string(),
  easeFactor: z.number(),
  interval: z.number().int().nonnegative(),
  repetitions: z.number().int().nonnegative(),
  dueAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});
export type Card = z.infer<typeof CardSchema>;

// ── AI generation ──────────────────────────────────────────────────────────────

export const GenerateRequestSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(1, 'notes must not be empty')
    .max(NOTES_MAX_LENGTH, `notes must be at most ${NOTES_MAX_LENGTH} characters`),
  maxCards: z.number().int().min(MAX_CARDS_MIN).max(MAX_CARDS_MAX).default(MAX_CARDS_DEFAULT),
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export const CardSuggestionSchema = z.object({
  front: nonEmptyText('front'),
  back: nonEmptyText('back'),
});
export type CardSuggestion = z.infer<typeof CardSuggestionSchema>;

export const AcceptSuggestionsSchema = z.object({
  suggestions: z.array(CardSuggestionSchema).min(1, 'select at least one suggestion'),
});
export type AcceptSuggestions = z.infer<typeof AcceptSuggestionsSchema>;

// ── Review ─────────────────────────────────────────────────────────────────────

export const ReviewSessionSchema = z.object({
  deckId: z.string(),
  cards: z.array(CardSchema),
});
export type ReviewSession = z.infer<typeof ReviewSessionSchema>;

export const GradeRequestSchema = z.object({
  grade: z.number().int().min(GRADE_MIN).max(GRADE_MAX),
});
export type GradeRequest = z.infer<typeof GradeRequestSchema>;
