import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { AcceptSuggestionsSchema, GenerateRequestSchema } from '@product-engineer/shared-contracts';
import type {
  AcceptSuggestions,
  Card,
  CardSuggestion,
  GenerateRequest,
} from '@product-engineer/shared-contracts';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { GenerationService } from './generation.service';

// SPEC_DEVIATION: tasks.md specifies `POST /decks/:id/cards:accept`. Express/path-to-regexp
// treats `:accept` as a route param, so the accept endpoint uses `/cards/accept` instead.
// Reason: keep a literal, unambiguous path under Nest's default Express adapter.

@Controller('decks/:deckId')
export class GenerationController {
  constructor(private readonly generation: GenerationService) {}

  @Post('generate')
  @HttpCode(200)
  generate(
    @Param('deckId') deckId: string,
    @Body(new ZodValidationPipe(GenerateRequestSchema)) body: GenerateRequest,
  ): Promise<CardSuggestion[]> {
    return this.generation.generate(deckId, body);
  }

  @Post('cards/accept')
  accept(
    @Param('deckId') deckId: string,
    @Body(new ZodValidationPipe(AcceptSuggestionsSchema)) body: AcceptSuggestions,
  ): Promise<Card[]> {
    return this.generation.accept(deckId, body.suggestions);
  }
}
