import { BadGatewayException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AiCardGenerator } from '@product-engineer/shared-ai';
import type { Card, CardSuggestion, GenerateRequest } from '@product-engineer/shared-contracts';
import { toCard } from '../common/card.serializer';
import { PrismaService } from '../prisma/prisma.service';
import { AI_CARD_GENERATOR } from './generation.tokens';

@Injectable()
export class GenerationService {
  constructor(
    @Inject(AI_CARD_GENERATOR) private readonly generator: AiCardGenerator,
    private readonly prisma: PrismaService,
  ) {}

  async generate(deckId: string, request: GenerateRequest): Promise<CardSuggestion[]> {
    await this.ensureDeck(deckId);
    try {
      return await this.generator.generateCards(request.notes, { maxCards: request.maxCards });
    } catch {
      throw new BadGatewayException({
        message: 'AI generation failed',
        code: 'AI_GENERATION_FAILED',
      });
    }
  }

  async accept(deckId: string, suggestions: CardSuggestion[]): Promise<Card[]> {
    await this.ensureDeck(deckId);
    const created = await this.prisma.$transaction(
      suggestions.map((suggestion) =>
        this.prisma.card.create({
          data: { deckId, front: suggestion.front, back: suggestion.back },
        }),
      ),
    );
    return created.map(toCard);
  }

  private async ensureDeck(deckId: string): Promise<void> {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) {
      throw new NotFoundException(`Deck ${deckId} not found`);
    }
  }
}
