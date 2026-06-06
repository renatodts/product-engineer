import { Module } from '@nestjs/common';
import { AnthropicAiCardGenerator, FakeAiCardGenerator } from '@product-engineer/shared-ai';
import type { AiCardGenerator } from '@product-engineer/shared-ai';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';
import { AI_CARD_GENERATOR } from './generation.tokens';

/**
 * Binds the AiCardGenerator port to the real Anthropic adapter when
 * ANTHROPIC_API_KEY is present, otherwise to the deterministic offline fake
 * (used by tests/CI and local runs without a key).
 */
function createAiCardGenerator(): AiCardGenerator {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    return new AnthropicAiCardGenerator({ apiKey, model: process.env.ANTHROPIC_MODEL });
  }
  return new FakeAiCardGenerator();
}

@Module({
  controllers: [GenerationController],
  providers: [GenerationService, { provide: AI_CARD_GENERATOR, useFactory: createAiCardGenerator }],
})
export class GenerationModule {}
