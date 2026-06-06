import { Module } from '@nestjs/common';
import { AnthropicAiCardGenerator, FakeAiCardGenerator } from '@product-engineer/shared-ai';
import type { AiCardGenerator } from '@product-engineer/shared-ai';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';
import { AI_CARD_GENERATOR } from './generation.tokens';

/**
 * The deterministic offline fake is intended ONLY for automated tests and CI
 * (ADR-008), where no API key is present and generation must run offline.
 */
function offlineFakeAllowed(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.CI === 'true';
}

/**
 * Binds the AiCardGenerator port to the real Anthropic adapter when
 * ANTHROPIC_API_KEY is present. Without a key it falls back to the offline fake
 * only in tests/CI; on a real run it fails loud rather than silently emitting
 * non-AI cards. Exported for unit testing.
 */
export function createAiCardGenerator(): AiCardGenerator {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    return new AnthropicAiCardGenerator({ apiKey, model: process.env.ANTHROPIC_MODEL });
  }
  if (offlineFakeAllowed()) {
    return new FakeAiCardGenerator();
  }
  throw new Error(
    'ANTHROPIC_API_KEY is not set. AI card generation requires an Anthropic API key. ' +
      'Add it to apps/1-ai-flashcards-api/.env (see .env.example). ' +
      'The offline FakeAiCardGenerator is only used when NODE_ENV=test or CI=true.',
  );
}

@Module({
  controllers: [GenerationController],
  providers: [GenerationService, { provide: AI_CARD_GENERATOR, useFactory: createAiCardGenerator }],
})
export class GenerationModule {}
