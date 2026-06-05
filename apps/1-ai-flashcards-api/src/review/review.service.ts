import { Injectable, NotFoundException } from '@nestjs/common';
import type { Card, ReviewSession } from '@product-engineer/shared-contracts';
import { toCard } from '../common/card.serializer';
import { applySm2 } from '../domain/sm2';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getSession(deckId: string, now: Date = new Date()): Promise<ReviewSession> {
    await this.ensureDeck(deckId);
    const cards = await this.prisma.card.findMany({
      where: { deckId, dueAt: { lte: now } },
      orderBy: { dueAt: 'asc' },
    });
    return { deckId, cards: cards.map(toCard) };
  }

  async grade(cardId: string, grade: number, now: Date = new Date()): Promise<Card> {
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException(`Card ${cardId} not found`);
    }

    const next = applySm2(
      {
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        dueAt: card.dueAt,
      },
      grade,
      now,
    );

    const [updated] = await this.prisma.$transaction([
      this.prisma.card.update({
        where: { id: cardId },
        data: {
          easeFactor: next.easeFactor,
          interval: next.interval,
          repetitions: next.repetitions,
          dueAt: next.dueAt,
        },
      }),
      this.prisma.review.create({
        data: { cardId, grade, interval: next.interval, easeFactor: next.easeFactor },
      }),
    ]);

    return toCard(updated);
  }

  private async ensureDeck(deckId: string): Promise<void> {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) {
      throw new NotFoundException(`Deck ${deckId} not found`);
    }
  }
}
