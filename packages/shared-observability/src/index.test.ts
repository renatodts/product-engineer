import { describe, it, expect } from 'vitest';
import { PACKAGE_NAME, consoleLogger } from './index.js';

describe('shared-observability', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@product-engineer/shared-observability');
  });

  it('provides a console logger', () => {
    expect(typeof consoleLogger.info).toBe('function');
  });
});
