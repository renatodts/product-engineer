import { AnthropicAiCardGenerator, FakeAiCardGenerator } from '@product-engineer/shared-ai';
import { createAiCardGenerator } from './generation.module';

/**
 * The factory must pick the real Anthropic adapter whenever a key is present,
 * fall back to the offline fake ONLY in automated tests/CI, and otherwise fail
 * loud so a real run can never silently generate non-AI cards.
 */
describe('createAiCardGenerator', () => {
  const original = {
    apiKey: process.env.ANTHROPIC_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    ci: process.env.CI,
  };

  function set(name: string, value: string | undefined): void {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }

  afterEach(() => {
    set('ANTHROPIC_API_KEY', original.apiKey);
    set('NODE_ENV', original.nodeEnv);
    set('CI', original.ci);
  });

  it('uses the real Anthropic adapter when ANTHROPIC_API_KEY is set', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
    expect(createAiCardGenerator()).toBeInstanceOf(AnthropicAiCardGenerator);
  });

  it('falls back to the offline fake in automated tests (NODE_ENV=test)', () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.NODE_ENV = 'test';
    delete process.env.CI;
    expect(createAiCardGenerator()).toBeInstanceOf(FakeAiCardGenerator);
  });

  it('falls back to the offline fake in CI (CI=true)', () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.NODE_ENV = 'production';
    process.env.CI = 'true';
    expect(createAiCardGenerator()).toBeInstanceOf(FakeAiCardGenerator);
  });

  it('fails loud on a real run when the key is missing', () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.NODE_ENV = 'production';
    delete process.env.CI;
    expect(() => createAiCardGenerator()).toThrow(/ANTHROPIC_API_KEY/);
  });
});
