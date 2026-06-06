import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Deck, DeckCreate } from '@product-engineer/shared-contracts';
import { PrismaService } from '../prisma/prisma.service';

function toDeck(
  deck: { id: string; name: string; createdAt: Date },
  cardCount: number,
  dueCount: number,
): Deck {
  return {
    id: deck.id,
    name: deck.name,
    createdAt: deck.createdAt.toISOString(),
    cardCount,
    dueCount,
  };
}

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: DeckCreate): Promise<Deck> {
    const deck = await this.prisma.deck.create({ data: { name: input.name } });
    return toDeck(deck, 0, 0);
  }

  async list(now: Date = new Date()): Promise<Deck[]> {
    const decks = await this.prisma.deck.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { cards: true } } },
    });
    const dueCounts = await this.prisma.card.groupBy({
      by: ['deckId'],
      where: { dueAt: { lte: now } },
      _count: { _all: true },
    });
    const dueByDeck = new Map(dueCounts.map((row) => [row.deckId, row._count._all]));
    return decks.map((deck) => toDeck(deck, deck._count.cards, dueByDeck.get(deck.id) ?? 0));
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.deck.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Deck ${id} not found`);
      }
      throw error;
    }
  }
}
