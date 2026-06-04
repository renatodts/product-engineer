import { describe, it, expect } from 'vitest';
import { PACKAGE_NAME, makeId } from './index.js';

describe('shared-testing', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@product-engineer/shared-testing');
  });

  it('generates distinct ids', () => {
    expect(makeId()).not.toBe(makeId());
  });
});
