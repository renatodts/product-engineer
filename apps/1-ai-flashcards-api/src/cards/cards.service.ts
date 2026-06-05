import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Card as DbCard } from '@prisma/client';
import type { Card, CardCreate } from '@product-engineer/shared-contracts';
import { PrismaService } from '../prisma/prisma.service';

function toCard(card: DbCard): Card {
  return {
    id: card.id,
    deckId: card.deckId,
    front: card.front,
    back: card.back,
    easeFactor: card.easeFactor,
    interval: card.interval,
    repetitions: card.repetitions,
    dueAt: card.dueAt.toISOString(),
    createdAt: card.createdAt.toISOString(),
  };
}

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(deckId: string): Promise<Card[]> {
    await this.ensureDeck(deckId);
    const cards = await this.prisma.card.findMany({
      where: { deckId },
      orderBy: { createdAt: 'asc' },
    });
    return cards.map(toCard);
  }

  async create(deckId: string, input: CardCreate): Promise<Card> {
    await this.ensureDeck(deckId);
    const card = await this.prisma.card.create({
      data: { deckId, front: input.front, back: input.back },
    });
    return toCard(card);
  }

  async update(id: string, input: CardCreate): Promise<Card> {
    try {
      const card = await this.prisma.card.update({
        where: { id },
        data: { front: input.front, back: input.back },
      });
      return toCard(card);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Card ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.card.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Card ${id} not found`);
      }
      throw error;
    }
  }

  private async ensureDeck(deckId: string): Promise<void> {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) {
      throw new NotFoundException(`Deck ${deckId} not found`);
    }
  }
}
