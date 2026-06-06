import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CardsService } from './cards.service';
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

describe('CardsService (unit)', () => {
  it('creates a card in an existing deck and maps it to the wire shape', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'd1' });
    const create = jest.fn().mockResolvedValue(dbCard());
    const prisma = { deck: { findUnique }, card: { create } } as unknown as PrismaService;

    const result = await new CardsService(prisma).create('d1', { front: 'hola', back: 'hello' });

    expect(create).toHaveBeenCalledWith({ data: { deckId: 'd1', front: 'hola', back: 'hello' } });
    expect(result).toEqual({
      id: 'c1',
      deckId: 'd1',
      front: 'hola',
      back: 'hello',
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      dueAt: NOW.toISOString(),
      createdAt: NOW.toISOString(),
    });
  });

  it('rejects creating a card in a missing deck with 404 and never inserts', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const create = jest.fn();
    const prisma = { deck: { findUnique }, card: { create } } as unknown as PrismaService;

    await expect(
      new CardsService(prisma).create('missing', { front: 'a', back: 'b' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(create).not.toHaveBeenCalled();
  });

  it('updates only front/back and leaves SM-2 fields untouched', async () => {
    const update = jest.fn().mockResolvedValue(dbCard({ front: 'new', back: 'changed' }));
    const prisma = { card: { update } } as unknown as PrismaService;

    await new CardsService(prisma).update('c1', { front: 'new', back: 'changed' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { front: 'new', back: 'changed' },
    });
  });

  it('throws NotFound when updating a missing card', async () => {
    const update = jest.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('missing', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );
    const prisma = { card: { update } } as unknown as PrismaService;

    await expect(
      new CardsService(prisma).update('c1', { front: 'a', back: 'b' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
