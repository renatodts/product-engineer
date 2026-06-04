import { describe, it, expect } from 'vitest';
import { PACKAGE_NAME, Entity } from './index.js';

class Sample extends Entity<{ name: string }> {
  static create(id: string, name: string) {
    return new Sample(id, { name });
  }
}

describe('shared-domain', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@product-engineer/shared-domain');
  });

  it('entities are equal by id', () => {
    expect(Sample.create('1', 'a').equals(Sample.create('1', 'b'))).toBe(true);
  });
});
