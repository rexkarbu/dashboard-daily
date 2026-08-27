import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoSection } from '../../src/renderer/features/todos/TodoSection';
import { TodoItem } from '../../src/shared/contracts';

describe('TodoSection Component', () => {
  const mockToday = '2026-08-25';

  const sampleTodos: TodoItem[] = [
    {
      id: 't-1',
      seriesId: 's-1',
      date: '2026-08-25',
      title: 'Kerjakan laporan',
      completed: false,
      carryOver: true,
      createdAt: '2026-08-25T08:00:00.000Z',
      updatedAt: '2026-08-25T08:00:00.000Z',
    },
    {
      id: 't-2',
      seriesId: 's-2',
      date: '2026-08-25',
      title: 'Beli kopi',
      completed: true,
      carryOver: false,
      createdAt: '2026-08-25T08:30:00.000Z',
      updatedAt: '2026-08-25T08:30:00.000Z',
    },
  ];

  it('renders today todos with progress badge', () => {
    render(
      <TodoSection
        todos={sampleTodos}
        today={mockToday}
        onCreateTodo={vi.fn()}
        onUpdateTodo={vi.fn()}
        onToggleTodo={vi.fn()}
        onDeleteTodo={vi.fn()}
      />
    );

    expect(screen.getByText('Kerjakan laporan')).toBeInTheDocument();
    expect(screen.getByText('Beli kopi')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('Carry-over')).toBeInTheDocument();
  });

  it('calls onToggleTodo when checkbox is clicked', async () => {
    const handleToggle = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <TodoSection
        todos={sampleTodos}
        today={mockToday}
        onCreateTodo={vi.fn()}
        onUpdateTodo={vi.fn()}
        onToggleTodo={handleToggle}
        onDeleteTodo={vi.fn()}
      />
    );

    const checkbox = screen.getByLabelText(/Tandai selesai Kerjakan laporan/i);
    await user.click(checkbox);

    expect(handleToggle).toHaveBeenCalledWith('t-1');
  });
});
