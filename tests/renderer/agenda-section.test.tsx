import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgendaSection } from '../../src/renderer/features/agenda/AgendaSection';
import { AgendaItem } from '../../src/shared/contracts';

describe('AgendaSection Component', () => {
  const mockToday = '2026-08-25';

  const sampleAgenda: AgendaItem[] = [
    {
      id: 'a-1',
      date: '2026-08-25',
      title: 'Daily Standup',
      startTime: '09:00',
      endTime: '09:30',
      createdAt: '2026-08-25T08:00:00.000Z',
      updatedAt: '2026-08-25T08:00:00.000Z',
    },
    {
      id: 'a-2',
      date: '2026-08-26', // Tomorrow item, should be filtered out
      title: 'Future Meeting',
      startTime: '10:00',
      createdAt: '2026-08-25T08:00:00.000Z',
      updatedAt: '2026-08-25T08:00:00.000Z',
    },
  ];

  it('renders only today items and displays start/end times', () => {
    render(
      <AgendaSection
        agenda={sampleAgenda}
        today={mockToday}
        onCreateAgenda={vi.fn()}
        onUpdateAgenda={vi.fn()}
        onDeleteAgenda={vi.fn()}
      />
    );

    expect(screen.getByText('Daily Standup')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 09:30')).toBeInTheDocument();
    expect(screen.queryByText('Future Meeting')).not.toBeInTheDocument();
  });

  it('shows empty state when no agenda exists today', () => {
    render(
      <AgendaSection
        agenda={[]}
        today={mockToday}
        onCreateAgenda={vi.fn()}
        onUpdateAgenda={vi.fn()}
        onDeleteAgenda={vi.fn()}
      />
    );

    expect(screen.getByText('Belum ada agenda hari ini.')).toBeInTheDocument();
  });

  it('opens add modal and submits new agenda', async () => {
    const handleCreate = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <AgendaSection
        agenda={[]}
        today={mockToday}
        onCreateAgenda={handleCreate}
        onUpdateAgenda={vi.fn()}
        onDeleteAgenda={vi.fn()}
      />
    );

    const addButton = screen.getByTitle('Tambah Agenda Baru');
    await user.click(addButton);

    expect(screen.getByText('Tambah Agenda')).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Judul Agenda/i);
    await user.type(titleInput, 'Sprint Review');

    const saveButton = screen.getByRole('button', { name: /Simpan/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(handleCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sprint Review',
          date: mockToday,
        })
      );
    });
  });
});
