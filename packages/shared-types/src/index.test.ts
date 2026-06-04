import { describe, it, expect } from 'vitest';
import { PACKAGE_NAME, type Timestamped } from './index.js';

describe('shared-types', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@product-engineer/shared-types');
  });

  it('Timestamped shape is usable', () => {
    const record: Timestamped = { createdAt: new Date(), updatedAt: new Date() };
    expect(record.createdAt).toBeInstanceOf(Date);
  });
});
