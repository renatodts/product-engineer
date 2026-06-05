import { describe, it, expect } from 'vitest';

import { PACKAGE_NAME, buildPrompt, FakeAiCardGenerator } from './index.js';
import type { AiCardGenerator, CardSuggestion } from './index.js';

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
