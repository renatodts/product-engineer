import Anthropic from '@anthropic-ai/sdk';

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

export interface AnthropicAiCardGeneratorOptions {
  apiKey: string;
  /** Defaults to `claude-sonnet-4-6` (override via ANTHROPIC_MODEL upstream). */
  model?: string;
  /** Defaults to 1024. */
  maxTokens?: number;
}

/** The slice of the Anthropic SDK this adapter depends on (injectable for tests). */
export interface AnthropicMessagesClient {
  messages: {
    create(params: {
      model: string;
      max_tokens: number;
      system?: string;
      temperature?: number;
      messages: Array<{ role: 'user'; content: string }>;
    }): Promise<{ content: Array<{ type: string; text?: string }> }>;
  };
}

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_CARD_HINT = 10;

function isSuggestion(value: unknown): value is CardSuggestion {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).front === 'string' &&
    typeof (value as Record<string, unknown>).back === 'string'
  );
}

/** Parses a JSON array of {front, back} out of a model response, tolerating prose/fences. */
function parseSuggestions(text: string): CardSuggestion[] {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  const json = start >= 0 && end > start ? text.slice(start, end + 1) : text;
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('AnthropicAiCardGenerator: model response was not valid JSON');
  }
  if (!Array.isArray(parsed)) {
    throw new Error('AnthropicAiCardGenerator: model response was not a JSON array');
  }
  return parsed.filter(isSuggestion).map((s) => ({ front: s.front, back: s.back }));
}

/**
 * Real generator backed by Claude. Asks the model for a JSON array of flashcards
 * and parses the response into CardSuggestions. The Anthropic client is injectable
 * so tests run without a network or API key.
 */
export class AnthropicAiCardGenerator implements AiCardGenerator {
  private readonly client: AnthropicMessagesClient;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(options: AnthropicAiCardGeneratorOptions, client?: AnthropicMessagesClient) {
    this.client = client ?? new Anthropic({ apiKey: options.apiKey });
    this.model = options.model ?? DEFAULT_MODEL;
    this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  }

  async generateCards(notes: string, opts?: GenerateOptions): Promise<CardSuggestion[]> {
    const limit = opts?.maxCards;
    const system = buildPrompt({
      user: [
        "You generate study flashcards from a user's notes.",
        `Return ONLY a JSON array of objects, each with a "front" (question/prompt) and a "back" (answer).`,
        `Generate at most ${limit ?? DEFAULT_CARD_HINT} cards. Output nothing except the JSON array.`,
      ].join(' '),
    });

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: 0.2,
      system,
      messages: [{ role: 'user', content: notes }],
    });

    const text = response.content
      .map((block) => block.text ?? '')
      .join('')
      .trim();
    const suggestions = parseSuggestions(text);
    return limit == null ? suggestions : suggestions.slice(0, limit);
  }
}
