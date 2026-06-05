import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { FakeAiCardGenerator } from '@product-engineer/shared-ai';
import type { AiCardGenerator } from '@product-engineer/shared-ai';
import { GenerationService } from './generation.service';
import type { PrismaService } from '../prisma/prisma.service';

const NOW = new Date('2026-06-04T00:00:00.000Z');

describe('GenerationService (unit)', () => {
  it('returns suggestions for an existing deck without persisting them', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'd1' });
    const create = jest.fn();
    const prisma = { deck: { findUnique }, card: { create } } as unknown as PrismaService;

    const result = await new GenerationService(new FakeAiCardGenerator(), prisma).generate('d1', {
      notes: 'A fact. Another fact.',
      maxCards: 10,
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toEqual(
      expect.objectContaining({ front: expect.any(String), back: expect.any(String) }),
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('maps a generator failure to 502 (BadGateway)', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'd1' });
    const prisma = { deck: { findUnique } } as unknown as PrismaService;
    const failing: AiCardGenerator = { generateCards: () => Promise.reject(new Error('boom')) };

    await expect(
      new GenerationService(failing, prisma).generate('d1', { notes: 'x', maxCards: 10 }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('rejects generation for a missing deck and never calls the generator', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const prisma = { deck: { findUnique } } as unknown as PrismaService;
    const generateCards = jest.fn();
    const generator: AiCardGenerator = { generateCards };

    await expect(
      new GenerationService(generator, prisma).generate('missing', { notes: 'x', maxCards: 10 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(generateCards).not.toHaveBeenCalled();
  });

  it('persists accepted suggestions as cards', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'd1' });
    const transaction = jest.fn().mockResolvedValue([
      {
        id: 'c1',
        deckId: 'd1',
        front: 'Q',
        back: 'A',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        dueAt: NOW,
        createdAt: NOW,
      },
    ]);
    const cardCreate = jest.fn();
    const prisma = {
      deck: { findUnique },
      card: { create: cardCreate },
      $transaction: transaction,
    } as unknown as PrismaService;

    const result = await new GenerationService(new FakeAiCardGenerator(), prisma).accept('d1', [
      { front: 'Q', back: 'A' },
    ]);

    expect(cardCreate).toHaveBeenCalledWith({ data: { deckId: 'd1', front: 'Q', back: 'A' } });
    expect(transaction).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]?.front).toBe('Q');
  });
});
