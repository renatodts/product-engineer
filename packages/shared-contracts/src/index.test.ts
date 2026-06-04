import { describe, it, expect } from 'vitest';
import { PACKAGE_NAME } from './index.js';

describe('shared-contracts', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@product-engineer/shared-contracts');
  });
});
