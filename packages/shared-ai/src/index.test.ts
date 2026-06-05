import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, vi } from 'vitest';

import {
  PACKAGE_NAME,
  buildPrompt,
  FakeAiCardGenerator,
  AnthropicAiCardGenerator,
} from './index.js';
import type { AiCardGenerator, CardSuggestion } from './index.js';

const textResponse = (text: string) => ({ content: [{ type: 'text', text }] });

describe('shared-ai', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@product-engineer/shared-ai');
  });

  it('builds a prompt from system and user parts', () => {
    expect(buildPrompt({ system: 'a', user: 'b' })).toBe('a\n\nb');
  });
});

describe('FakeAiCardGenerator', () => {
  const generator: AiCardGenerator = new FakeAiCardGenerator();

  it('derives a front/back suggestion per note segment', async () => {
    const cards = await generator.generateCards('The sky is blue.\nGrass is green.');
    expect(cards).toHaveLength(2);
    for (const card of cards) {
      expect(typeof card.front).toBe('string');
      expect(typeof card.back).toBe('string');
      expect(card.front.length).toBeGreaterThan(0);
      expect(card.back.length).toBeGreaterThan(0);
    }
  });

  it('is deterministic for the same input', async () => {
    const notes = 'Photosynthesis converts light to energy. Roots absorb water.';
    const first = await generator.generateCards(notes);
    const second = await generator.generateCards(notes);
    expect(second).toEqual(first);
  });

  it('respects the maxCards cap', async () => {
    const notes = 'One. Two. Three. Four. Five.';
    const cards = await generator.generateCards(notes, { maxCards: 2 });
    expect(cards).toHaveLength(2);
  });

  it('returns no suggestions for empty or whitespace notes', async () => {
    expect(await generator.generateCards('')).toEqual([]);
    expect(await generator.generateCards('   \n  ')).toEqual([]);
  });

  it('produces suggestions matching the CardSuggestion shape', async () => {
    const cards: CardSuggestion[] = await generator.generateCards('A fact.');
    expect(cards[0]).toEqual(
      expect.objectContaining({ front: expect.any(String), back: expect.any(String) }),
    );
  });
});

describe('AnthropicAiCardGenerator', () => {
  it('builds a prompt from the notes, calls the model, and parses JSON suggestions', async () => {
    const create = vi
      .fn()
      .mockResolvedValue(textResponse('[{"front":"Q1","back":"A1"},{"front":"Q2","back":"A2"}]'));
    const generator = new AnthropicAiCardGenerator({ apiKey: 'test' }, { messages: { create } });

    const cards = await generator.generateCards('photosynthesis notes', { maxCards: 5 });

    expect(cards).toEqual([
      { front: 'Q1', back: 'A1' },
      { front: 'Q2', back: 'A2' },
    ]);
    const params = create.mock.calls[0]?.[0];
    expect(params).toMatchObject({ model: 'claude-sonnet-4-6', max_tokens: 1024 });
    expect(JSON.stringify(params?.messages)).toContain('photosynthesis notes');
  });

  it('honors the model override (e.g. from ANTHROPIC_MODEL)', async () => {
    const create = vi.fn().mockResolvedValue(textResponse('[]'));
    const generator = new AnthropicAiCardGenerator(
      { apiKey: 'k', model: 'claude-custom' },
      { messages: { create } },
    );

    await generator.generateCards('notes');

    expect(create.mock.calls[0]?.[0]?.model).toBe('claude-custom');
  });

  it('truncates the model output to maxCards', async () => {
    const create = vi.fn().mockResolvedValue(
      textResponse(
        JSON.stringify([
          { front: '1', back: '1' },
          { front: '2', back: '2' },
          { front: '3', back: '3' },
        ]),
      ),
    );
    const generator = new AnthropicAiCardGenerator({ apiKey: 'k' }, { messages: { create } });

    const cards = await generator.generateCards('notes', { maxCards: 2 });

    expect(cards).toHaveLength(2);
  });

  it('tolerates prose/code fences around the JSON array', async () => {
    const create = vi
      .fn()
      .mockResolvedValue(
        textResponse('Here are your cards:\n```json\n[{"front":"Q","back":"A"}]\n```'),
      );
    const generator = new AnthropicAiCardGenerator({ apiKey: 'k' }, { messages: { create } });

    const cards = await generator.generateCards('notes');

    expect(cards).toEqual([{ front: 'Q', back: 'A' }]);
  });

  it('throws when the response is not parseable as suggestions', async () => {
    const create = vi.fn().mockResolvedValue(textResponse('the model refused'));
    const generator = new AnthropicAiCardGenerator({ apiKey: 'k' }, { messages: { create } });

    await expect(generator.generateCards('notes')).rejects.toThrow();
  });
});

describe('CommonJS importability (ADR-002)', () => {
  it('exports the generators from a CommonJS require() context (incl. the Anthropic SDK)', () => {
    const indexPath = fileURLToPath(new URL('./index.ts', import.meta.url));
    const script = `
      const m = require(${JSON.stringify(indexPath)});
      if (typeof m.FakeAiCardGenerator !== 'function') process.exit(2);
      if (typeof m.AnthropicAiCardGenerator !== 'function') process.exit(3);
      new m.AnthropicAiCardGenerator({ apiKey: 'k' });
      process.stdout.write('CJS_IMPORT_OK');
    `;
    const out = execFileSync(process.execPath, ['--experimental-strip-types', '-e', script], {
      encoding: 'utf8',
    });
    expect(out).toBe('CJS_IMPORT_OK');
  });
});
