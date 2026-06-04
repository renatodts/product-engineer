import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button, PACKAGE_NAME } from './index.js';

describe('ui', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@product-engineer/ui');
  });

  it('renders a button', () => {
    const { getByRole } = render(<Button>Click</Button>);
    expect(getByRole('button').textContent).toBe('Click');
  });
});
