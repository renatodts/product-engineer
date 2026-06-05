import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardForm } from './CardForm.js';

describe('CardForm', () => {
  it('submits trimmed front and back, then clears in add mode', () => {
    const onSubmit = vi.fn();
    render(<CardForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/front/i), { target: { value: ' hola ' } });
    fireEvent.change(screen.getByLabelText(/back/i), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: /add card/i }));

    expect(onSubmit).toHaveBeenCalledWith('hola', 'hello');
    expect((screen.getByLabelText(/front/i) as HTMLInputElement).value).toBe('');
  });

  it('does not submit when front or back is blank', () => {
    const onSubmit = vi.fn();
    render(<CardForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/front/i), { target: { value: 'only front' } });
    fireEvent.click(screen.getByRole('button', { name: /add card/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('prefills initial values and uses a custom submit label in edit mode', () => {
    const onSubmit = vi.fn();
    render(
      <CardForm
        onSubmit={onSubmit}
        initialFront="q"
        initialBack="a"
        submitLabel="Save"
        onCancel={vi.fn()}
      />,
    );

    expect((screen.getByLabelText(/front/i) as HTMLInputElement).value).toBe('q');
    expect(screen.getByRole('button', { name: /save/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeTruthy();
  });
});
