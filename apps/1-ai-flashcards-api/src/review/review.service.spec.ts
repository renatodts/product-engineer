import { NotFoundException } from '@nestjs/common';
import { ReviewService } from './review.service';
import { applySm2 } from '../domain/sm2';
import type { PrismaService } from '../prisma/prisma.service';

const NOW = new Date('2026-06-04T00:00:00.000Z');

const dbCard = (overrides: Record<string, unknown> = {}) => ({
  id: 'c1',
  deckId: 'd1',
  front: 'hola',
  back: 'hello',
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  dueAt: NOW,
  createdAt: NOW,
  ...overrides,
});

describe('ReviewService (unit)', () => {
  it('returns due cards for an existing deck mapped to the wire shape', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'd1' });
    const findMany = jest.fn().mockResolvedValue([dbCard()]);
    const prisma = {
      deck: { findUnique },
      card: { findMany },
    } as unknown as PrismaService;

    const session = await new ReviewService(prisma).getSession('d1', NOW);

    expect(findMany).toHaveBeenCalledWith({
      where: { deckId: 'd1', dueAt: { lte: NOW } },
      orderBy: { dueAt: 'asc' },
    });
    expect(session.deckId).toBe('d1');
    expect(session.cards).toHaveLength(1);
    expect(session.cards[0]?.dueAt).toBe(NOW.toISOString());
  });

  it('throws NotFound for a review session on a missing deck', async () => {
    const prisma = {
      deck: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;

    await expect(new ReviewService(prisma).getSession('missing', NOW)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('applies SM-2 and logs a review when grading a card', async () => {
    const card = dbCard();
    const expected = applySm2({ easeFactor: 2.5, interval: 0, repetitions: 0, dueAt: NOW }, 5, NOW);
    const update = jest.fn();
    const reviewCreate = jest.fn();
    const transaction = jest.fn().mockResolvedValue([
      dbCard({
        easeFactor: expected.easeFactor,
        interval: expected.interval,
        repetitions: expected.repetitions,
        dueAt: expected.dueAt,
      }),
    ]);
    const prisma = {
      card: { findUnique: jest.fn().mockResolvedValue(card), update },
      review: { create: reviewCreate },
      $transaction: transaction,
    } as unknown as PrismaService;

    const result = await new ReviewService(prisma).grade('c1', 5, NOW);

    expect(update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: {
        easeFactor: expected.easeFactor,
        interval: expected.interval,
        repetitions: expected.repetitions,
        dueAt: expected.dueAt,
      },
    });
    expect(reviewCreate).toHaveBeenCalledWith({
      data: {
        cardId: 'c1',
        grade: 5,
        interval: expected.interval,
        easeFactor: expected.easeFactor,
      },
    });
    expect(transaction).toHaveBeenCalled();
    expect(result.repetitions).toBe(expected.repetitions);
  });

  it('throws NotFound when grading a missing card', async () => {
    const prisma = {
      card: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;

    await expect(new ReviewService(prisma).grade('missing', 5, NOW)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
