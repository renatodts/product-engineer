import { describe, it, expect } from 'vitest';
import { PACKAGE_NAME, hasRole } from './index.js';

describe('shared-auth', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@product-engineer/shared-auth');
  });

  it('detects roles', () => {
    expect(hasRole({ id: '1', email: 'a@b.c', roles: ['admin'] }, 'admin')).toBe(true);
  });
});
