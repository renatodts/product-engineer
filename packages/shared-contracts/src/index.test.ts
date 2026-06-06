import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

import {
  DeckCreateSchema,
  DeckSchema,
  CardCreateSchema,
  CardSchema,
  GenerateRequestSchema,
  CardSuggestionSchema,
  AcceptSuggestionsSchema,
  ReviewSessionSchema,
  GradeRequestSchema,
  NOTES_MAX_LENGTH,
  MAX_CARDS_DEFAULT,
} from './index.js';

describe('DeckCreateSchema', () => {
  it('accepts a non-empty name', () => {
    expect(DeckCreateSchema.parse({ name: 'Spanish' })).toEqual({ name: 'Spanish' });
  });

  it('rejects an empty name', () => {
    expect(DeckCreateSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('rejects a whitespace-only name', () => {
    expect(DeckCreateSchema.safeParse({ name: '   ' }).success).toBe(false);
  });
});

describe('DeckSchema', () => {
  it('parses a full deck wire shape with derived counts', () => {
    const deck = {
      id: 'd1',
      name: 'Spanish',
      createdAt: '2026-06-04T10:00:00.000Z',
      cardCount: 3,
      dueCount: 1,
    };
    expect(DeckSchema.parse(deck)).toEqual(deck);
  });

  it('rejects a non-ISO createdAt', () => {
    expect(
      DeckSchema.safeParse({
        id: 'd1',
        name: 'Spanish',
        createdAt: 'not-a-date',
        cardCount: 0,
        dueCount: 0,
      }).success,
    ).toBe(false);
  });

  it('rejects negative counts', () => {
    expect(
      DeckSchema.safeParse({
        id: 'd1',
        name: 'Spanish',
        createdAt: '2026-06-04T10:00:00.000Z',
        cardCount: -1,
        dueCount: 0,
      }).success,
    ).toBe(false);
  });
});

describe('CardCreateSchema', () => {
  it('accepts non-empty front and back', () => {
    expect(CardCreateSchema.parse({ front: 'hola', back: 'hello' })).toEqual({
      front: 'hola',
      back: 'hello',
    });
  });

  it('rejects empty front or back', () => {
    expect(CardCreateSchema.safeParse({ front: '', back: 'hello' }).success).toBe(false);
    expect(CardCreateSchema.safeParse({ front: 'hola', back: '   ' }).success).toBe(false);
  });
});

describe('CardSchema', () => {
  it('parses a full card wire shape with SM-2 state', () => {
    const card = {
      id: 'c1',
      deckId: 'd1',
      front: 'hola',
      back: 'hello',
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      dueAt: '2026-06-04T10:00:00.000Z',
      createdAt: '2026-06-04T10:00:00.000Z',
    };
    expect(CardSchema.parse(card)).toEqual(card);
  });
});

describe('GenerateRequestSchema', () => {
  it('defaults maxCards when omitted', () => {
    expect(GenerateRequestSchema.parse({ notes: 'some notes' }).maxCards).toBe(MAX_CARDS_DEFAULT);
  });

  it('accepts an explicit maxCards within range', () => {
    expect(GenerateRequestSchema.parse({ notes: 'some notes', maxCards: 5 }).maxCards).toBe(5);
  });

  it('rejects empty notes', () => {
    expect(GenerateRequestSchema.safeParse({ notes: '   ' }).success).toBe(false);
  });

  it('rejects notes over the max length', () => {
    expect(
      GenerateRequestSchema.safeParse({ notes: 'a'.repeat(NOTES_MAX_LENGTH + 1) }).success,
    ).toBe(false);
  });

  it('rejects maxCards out of range', () => {
    expect(GenerateRequestSchema.safeParse({ notes: 'x', maxCards: 0 }).success).toBe(false);
    expect(GenerateRequestSchema.safeParse({ notes: 'x', maxCards: 21 }).success).toBe(false);
  });
});

describe('CardSuggestionSchema', () => {
  it('accepts a front/back suggestion', () => {
    expect(CardSuggestionSchema.parse({ front: 'q', back: 'a' })).toEqual({
      front: 'q',
      back: 'a',
    });
  });
});

describe('AcceptSuggestionsSchema', () => {
  it('accepts one or more suggestions', () => {
    const body = { suggestions: [{ front: 'q', back: 'a' }] };
    expect(AcceptSuggestionsSchema.parse(body)).toEqual(body);
  });

  it('rejects an empty selection', () => {
    expect(AcceptSuggestionsSchema.safeParse({ suggestions: [] }).success).toBe(false);
  });
});

describe('ReviewSessionSchema', () => {
  it('parses a session of due cards', () => {
    const session = {
      deckId: 'd1',
      cards: [
        {
          id: 'c1',
          deckId: 'd1',
          front: 'hola',
          back: 'hello',
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          dueAt: '2026-06-04T10:00:00.000Z',
          createdAt: '2026-06-04T10:00:00.000Z',
        },
      ],
    };
    expect(ReviewSessionSchema.parse(session)).toEqual(session);
  });

  it('accepts an empty due list', () => {
    expect(ReviewSessionSchema.parse({ deckId: 'd1', cards: [] }).cards).toEqual([]);
  });
});

describe('GradeRequestSchema', () => {
  it('accepts integer grades 0 through 5', () => {
    for (const grade of [0, 1, 2, 3, 4, 5]) {
      expect(GradeRequestSchema.parse({ grade }).grade).toBe(grade);
    }
  });

  it('rejects grades outside 0-5', () => {
    expect(GradeRequestSchema.safeParse({ grade: -1 }).success).toBe(false);
    expect(GradeRequestSchema.safeParse({ grade: 6 }).success).toBe(false);
  });

  it('rejects non-integer grades', () => {
    expect(GradeRequestSchema.safeParse({ grade: 2.5 }).success).toBe(false);
  });
});

describe('CommonJS importability (ADR-002 / ADR-020)', () => {
  it('schemas are importable and usable from a CommonJS require() context', () => {
    const indexPath = fileURLToPath(new URL('./index.ts', import.meta.url));
    const script = `
      const c = require(${JSON.stringify(indexPath)});
      if (typeof c.DeckCreateSchema?.parse !== 'function') { process.exit(2); }
      if (!c.DeckCreateSchema.safeParse({ name: 'ok' }).success) { process.exit(3); }
      if (!c.GradeRequestSchema.safeParse({ grade: 5 }).success) { process.exit(4); }
      process.stdout.write('CJS_IMPORT_OK');
    `;
    const out = execFileSync(process.execPath, ['--experimental-strip-types', '-e', script], {
      encoding: 'utf8',
    });
    expect(out).toBe('CJS_IMPORT_OK');
  });
});
