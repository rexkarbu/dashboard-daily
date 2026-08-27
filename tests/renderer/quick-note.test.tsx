import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickNote } from '../../src/renderer/features/notes/QuickNote';

describe('QuickNote Component', () => {
  it('renders existing note text and character counter', () => {
    render(
      <QuickNote
        note={{ text: 'Halo dunia', updatedAt: '2026-08-25T10:00:00.000Z' }}
        onSaveNote={vi.fn()}
      />
    );

    const textarea = screen.getByLabelText(/Isi Catatan Cepat/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Halo dunia');
    expect(screen.getByText('10 / 10.000')).toBeInTheDocument();
  });

  it('triggers debounced onSaveNote when text changes', async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined);

    render(
      <QuickNote
        note={{ text: '', updatedAt: '' }}
        onSaveNote={handleSave}
      />
    );

    const textarea = screen.getByLabelText(/Isi Catatan Cepat/i);
    fireEvent.change(textarea, { target: { value: 'Catatan baru' } });

    expect(screen.getByText(/Menyimpan/i)).toBeInTheDocument();

    await waitFor(
      () => {
        expect(handleSave).toHaveBeenCalledWith('Catatan baru');
      },
      { timeout: 1500 }
    );
  });
});
