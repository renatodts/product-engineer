import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CardCreateSchema } from '@product-engineer/shared-contracts';
import type { Card, CardCreate } from '@product-engineer/shared-contracts';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CardsService } from './cards.service';

@Controller()
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Get('decks/:deckId/cards')
  list(@Param('deckId') deckId: string): Promise<Card[]> {
    return this.cards.list(deckId);
  }

  @Post('decks/:deckId/cards')
  create(
    @Param('deckId') deckId: string,
    @Body(new ZodValidationPipe(CardCreateSchema)) body: CardCreate,
  ): Promise<Card> {
    return this.cards.create(deckId, body);
  }

  @Patch('cards/:id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CardCreateSchema)) body: CardCreate,
  ): Promise<Card> {
    return this.cards.update(id, body);
  }

  @Delete('cards/:id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.cards.remove(id);
  }
}
