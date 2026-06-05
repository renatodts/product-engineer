import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeckForm } from './DeckForm.js';

describe('DeckForm', () => {
  it('calls onCreate with the entered name', () => {
    const onCreate = vi.fn();
    render(<DeckForm onCreate={onCreate} />);

    fireEvent.change(screen.getByLabelText(/deck name/i), { target: { value: 'Spanish' } });
    fireEvent.click(screen.getByRole('button', { name: /create deck/i }));

    expect(onCreate).toHaveBeenCalledWith('Spanish');
  });

  it('does not submit a blank name', () => {
    const onCreate = vi.fn();
    render(<DeckForm onCreate={onCreate} />);

    fireEvent.click(screen.getByRole('button', { name: /create deck/i }));

    expect(onCreate).not.toHaveBeenCalled();
  });

  it('clears the input after a successful create', () => {
    const onCreate = vi.fn();
    render(<DeckForm onCreate={onCreate} />);
    const input = screen.getByLabelText(/deck name/i) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'History' } });
    fireEvent.click(screen.getByRole('button', { name: /create deck/i }));

    expect(input.value).toBe('');
  });
});
