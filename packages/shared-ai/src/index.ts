export const PACKAGE_NAME = '@product-engineer/shared-ai';

export interface PromptParts {
  system?: string;
  user: string;
}

export function buildPrompt(parts: PromptParts): string {
  return [parts.system, parts.user].filter(Boolean).join('\n\n');
}

/** A single AI-drafted flashcard candidate (not yet persisted). */
export interface CardSuggestion {
  front: string;
  back: string;
}

export interface GenerateOptions {
  /** Upper bound on how many suggestions to return. */
  maxCards?: number;
}

/**
 * Port for turning notes into flashcard suggestions. The api binds a real
 * Anthropic-backed adapter in production and a deterministic fake in tests/CI
 * (ADR-008 in the feature spec) so generation flows run offline.
 */
export interface AiCardGenerator {
  generateCards(notes: string, opts?: GenerateOptions): Promise<CardSuggestion[]>;
}

/** Splits notes into trimmed, non-empty segments on newlines or sentence breaks. */
function toSegments(notes: string): string[] {
  return notes
    .split(/\n+|(?<=[.!?])\s+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

/**
 * Deterministic, network-free generator: one suggestion per note segment, in
 * input order, optionally capped by `maxCards`. The same input always yields
 * the same output, which keeps generation flows testable offline.
 */
export class FakeAiCardGenerator implements AiCardGenerator {
  generateCards(notes: string, opts?: GenerateOptions): Promise<CardSuggestion[]> {
    const segments = toSegments(notes);
    const suggestions = segments.map((segment, index) => ({
      front: `Question ${index + 1}: ${segment}`,
      back: segment,
    }));
    const limit = opts?.maxCards;
    return Promise.resolve(limit == null ? suggestions : suggestions.slice(0, limit));
  }
}
