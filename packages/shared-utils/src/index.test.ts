import { describe, it, expect } from 'vitest';
import { PACKAGE_NAME, identity } from './index.js';

describe('shared-utils', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@product-engineer/shared-utils');
  });

  it('identity returns its input', () => {
    expect(identity(42)).toBe(42);
  });
});
