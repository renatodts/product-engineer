import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GradeRequestSchema } from '@product-engineer/shared-contracts';
import type { Card, GradeRequest, ReviewSession } from '@product-engineer/shared-contracts';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ReviewService } from './review.service';

@Controller()
export class ReviewController {
  constructor(private readonly review: ReviewService) {}

  @Get('decks/:deckId/review')
  getSession(@Param('deckId') deckId: string): Promise<ReviewSession> {
    return this.review.getSession(deckId);
  }

  @Post('cards/:id/review')
  grade(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(GradeRequestSchema)) body: GradeRequest,
  ): Promise<Card> {
    return this.review.grade(id, body.grade);
  }
}
