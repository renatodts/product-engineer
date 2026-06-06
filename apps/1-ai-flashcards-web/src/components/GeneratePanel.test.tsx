import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GeneratePanel } from './GeneratePanel.js';

const suggestions = [
  { front: 'Q1', back: 'A1' },
  { front: 'Q2', back: 'A2' },
];

describe('GeneratePanel', () => {
  it('generates and previews suggestions before saving', async () => {
    const onGenerate = vi.fn().mockResolvedValue(suggestions);
    render(<GeneratePanel onGenerate={onGenerate} onAccept={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'my notes' } });
    fireEvent.click(screen.getByRole('button', { name: /^generate/i }));

    expect(onGenerate).toHaveBeenCalledWith('my notes');
    await waitFor(() => expect(screen.getByText('Q1')).toBeTruthy());
    expect(screen.getByText('Q2')).toBeTruthy();
  });

  it('accepts only the selected suggestions', async () => {
    const onAccept = vi.fn().mockResolvedValue(undefined);
    render(
      <GeneratePanel onGenerate={vi.fn().mockResolvedValue(suggestions)} onAccept={onAccept} />,
    );

    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'notes' } });
    fireEvent.click(screen.getByRole('button', { name: /^generate/i }));
    await waitFor(() => expect(screen.getByText('Q1')).toBeTruthy());

    // deselect the first suggestion
    fireEvent.click(screen.getByRole('checkbox', { name: /Q1/ }));
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));

    await waitFor(() => expect(onAccept).toHaveBeenCalledWith([{ front: 'Q2', back: 'A2' }]));
  });

  it('shows a non-blocking error with retry when generation fails, keeping notes', async () => {
    const onGenerate = vi.fn().mockRejectedValue(new Error('boom'));
    render(<GeneratePanel onGenerate={onGenerate} onAccept={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'keep me' } });
    fireEvent.click(screen.getByRole('button', { name: /^generate/i }));

    await waitFor(() => expect(screen.getByText(/generation failed/i)).toBeTruthy());
    expect(screen.getByRole('button', { name: /retry/i })).toBeTruthy();
    expect((screen.getByLabelText(/notes/i) as HTMLTextAreaElement).value).toBe('keep me');
  });
});
