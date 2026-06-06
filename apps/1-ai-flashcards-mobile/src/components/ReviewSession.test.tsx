import { describe, it, expect, vi } from 'vitest';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable, Text } from 'react-native';
import type { Card } from '@product-engineer/shared-contracts';
import { ReviewSession } from './ReviewSession.js';

const card = (id: string, front: string): Card => ({
  id,
  deckId: 'd1',
  front,
  back: `${front}-answer`,
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  dueAt: '2026-06-04T10:00:00.000Z',
  createdAt: '2026-06-04T10:00:00.000Z',
});

const allText = (renderer: TestRenderer.ReactTestRenderer): string =>
  renderer.root
    .findAllByType(Text)
    .map((node) => [node.props.children].flat(Infinity).join(''))
    .join(' | ');

const press = async (renderer: TestRenderer.ReactTestRenderer, label: string) => {
  const target = renderer.root
    .findAllByType(Pressable)
    .find((node) => node.props.accessibilityLabel === label);
  if (!target) throw new Error(`No pressable labelled "${label}"`);
  await act(async () => {
    await target.props.onPress();
  });
};

describe('ReviewSession', () => {
  it('shows an empty state when nothing is due', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<ReviewSession cards={[]} onGrade={vi.fn()} />);
    });
    expect(allText(renderer)).toContain('No cards are due');
  });

  it('reveals the back only after requesting the answer', async () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <ReviewSession
          cards={[card('c1', 'hola')]}
          onGrade={vi.fn().mockResolvedValue(undefined)}
        />,
      );
    });

    expect(allText(renderer)).toContain('hola');
    expect(allText(renderer)).not.toContain('hola-answer');

    await press(renderer, 'Show answer');
    expect(allText(renderer)).toContain('hola-answer');
  });

  it('grades the current card, advances, then shows a summary', async () => {
    const onGrade = vi.fn().mockResolvedValue(undefined);
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <ReviewSession cards={[card('c1', 'one'), card('c2', 'two')]} onGrade={onGrade} />,
      );
    });

    await press(renderer, 'Show answer');
    await press(renderer, 'Grade 5');
    expect(onGrade).toHaveBeenCalledWith('c1', 5);
    expect(allText(renderer)).toContain('two');

    await press(renderer, 'Show answer');
    await press(renderer, 'Grade 2');
    expect(onGrade).toHaveBeenCalledWith('c2', 2);
    expect(allText(renderer)).toContain('Review complete');
  });
});
