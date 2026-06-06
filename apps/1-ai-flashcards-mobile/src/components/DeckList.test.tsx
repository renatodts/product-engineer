import { describe, it, expect, vi } from 'vitest';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable, Text } from 'react-native';
import type { Deck } from '@product-engineer/shared-contracts';
import { DeckList } from './DeckList.js';

const deck = (overrides: Partial<Deck> = {}): Deck => ({
  id: 'd1',
  name: 'Spanish',
  createdAt: '2026-06-04T10:00:00.000Z',
  cardCount: 3,
  dueCount: 1,
  ...overrides,
});

/** Flatten every <Text> node into a single searchable string. */
const allText = (renderer: TestRenderer.ReactTestRenderer): string =>
  renderer.root
    .findAllByType(Text)
    .map((node) => [node.props.children].flat(Infinity).join(''))
    .join(' | ');

describe('DeckList', () => {
  it('renders each deck with its name and counts', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<DeckList decks={[deck()]} onSelect={vi.fn()} />);
    });

    const text = allText(renderer);
    expect(text).toContain('Spanish');
    expect(text).toContain('3 cards');
    expect(text).toContain('1 due');
  });

  it('shows an empty state when there are no decks', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<DeckList decks={[]} onSelect={vi.fn()} />);
    });

    expect(allText(renderer)).toContain('No decks yet.');
  });

  it('calls onSelect with the deck when pressed', () => {
    const onSelect = vi.fn();
    const target = deck({ id: 'abc', name: 'Math' });
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<DeckList decks={[target]} onSelect={onSelect} />);
    });

    act(() => {
      renderer.root.findByType(Pressable).props.onPress();
    });

    expect(onSelect).toHaveBeenCalledWith(target);
  });
});
