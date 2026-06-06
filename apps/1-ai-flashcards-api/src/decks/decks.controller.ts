import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { DeckCreateSchema } from '@product-engineer/shared-contracts';
import type { Deck, DeckCreate } from '@product-engineer/shared-contracts';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { DecksService } from './decks.service';

@Controller('decks')
export class DecksController {
  constructor(private readonly decks: DecksService) {}

  @Get()
  list(): Promise<Deck[]> {
    return this.decks.list();
  }

  @Post()
  create(@Body(new ZodValidationPipe(DeckCreateSchema)) body: DeckCreate): Promise<Deck> {
    return this.decks.create(body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.decks.remove(id);
  }
}
