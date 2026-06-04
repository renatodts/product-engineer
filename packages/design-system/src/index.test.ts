import { describe, it, expect } from 'vitest';
import { PACKAGE_NAME, colors } from './index.js';

describe('design-system', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@product-engineer/design-system');
  });

  it('exposes the primary color', () => {
    expect(colors.primary).toBe('#4f46e5');
  });
});
