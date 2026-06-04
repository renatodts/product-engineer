import { describe, it, expect } from 'vitest';
import App from './App.js';

describe('App', () => {
  it('is a function component', () => {
    expect(typeof App).toBe('function');
  });
});
