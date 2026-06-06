import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DecksService } from './decks.service';
import type { PrismaService } from '../prisma/prisma.service';

const NOW = new Date('2026-06-04T00:00:00.000Z');

describe('DecksService (unit)', () => {
  it('creates a deck and returns it with zero counts', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'd1', name: 'Spanish', createdAt: NOW });
    const prisma = { deck: { create } } as unknown as PrismaService;

    const result = await new DecksService(prisma).create({ name: 'Spanish' });

    expect(create).toHaveBeenCalledWith({ data: { name: 'Spanish' } });
    expect(result).toEqual({
      id: 'd1',
      name: 'Spanish',
      createdAt: NOW.toISOString(),
      cardCount: 0,
      dueCount: 0,
    });
  });

  it('merges card counts and due counts when listing', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: 'd1', name: 'A', createdAt: NOW, _count: { cards: 3 } },
      { id: 'd2', name: 'B', createdAt: NOW, _count: { cards: 0 } },
    ]);
    const groupBy = jest.fn().mockResolvedValue([{ deckId: 'd1', _count: { _all: 2 } }]);
    const prisma = { deck: { findMany }, card: { groupBy } } as unknown as PrismaService;

    const result = await new DecksService(prisma).list(NOW);

    expect(groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ by: ['deckId'], where: { dueAt: { lte: NOW } } }),
    );
    expect(result).toEqual([
      { id: 'd1', name: 'A', createdAt: NOW.toISOString(), cardCount: 3, dueCount: 2 },
      { id: 'd2', name: 'B', createdAt: NOW.toISOString(), cardCount: 0, dueCount: 0 },
    ]);
  });

  it('throws NotFound when deleting a missing deck', async () => {
    const del = jest.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );
    const prisma = { deck: { delete: del } } as unknown as PrismaService;

    await expect(new DecksService(prisma).remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
