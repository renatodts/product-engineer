import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Home from './page.js';

describe('Home', () => {
  it('renders the heading', () => {
    const { getByRole } = render(<Home />);
    expect(getByRole('heading', { level: 1 })).toBeTruthy();
  });
});
