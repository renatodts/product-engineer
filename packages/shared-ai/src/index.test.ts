import { describe, it, expect } from 'vitest';
import { PACKAGE_NAME, buildPrompt } from './index.js';

describe('shared-ai', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@product-engineer/shared-ai');
  });

  it('builds a prompt from system and user parts', () => {
    expect(buildPrompt({ system: 'a', user: 'b' })).toBe('a\n\nb');
  });
});
