import React, { useState } from 'react';
import { TodoItem as TodoItemType, CreateTodoInput } from '../../../shared/contracts';
import { Section } from '../../components/Section';
import { TodoItem } from './TodoItem';
import { TodoForm } from './TodoForm';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';

interface TodoSectionProps {
  todos: TodoItemType[];
  today: string;
  onCreateTodo: (input: CreateTodoInput) => Promise<void>;
  onUpdateTodo: (id: string, input: { title: string; carryOver: boolean }) => Promise<void>;
  onToggleTodo: (id: string) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
}

export const TodoSection: React.FC<TodoSectionProps> = ({
  todos,
  today,
  onCreateTodo,
  onUpdateTodo,
  onToggleTodo,
  onDeleteTodo,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItemType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter today's todos and sort: incomplete first, then completed
  const todayTodos = todos
    .filter((item) => item.date === today)
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return a.createdAt.localeCompare(b.createdAt);
    });

  const completedCount = todayTodos.filter((t) => t.completed).length;
  const progressBadge =
    todayTodos.length > 0 ? `${completedCount}/${todayTodos.length}` : undefined;

  const handleSave = async (data: CreateTodoInput) => {
    if (editingItem) {
      await onUpdateTodo(editingItem.id, {
        title: data.title,
        carryOver: data.carryOver ?? true,
      });
      setEditingItem(null);
    } else {
      await onCreateTodo(data);
      setIsAddOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await onDeleteTodo(deletingId);
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Section
        title="To-Do Hari Ini"
        badge={progressBadge}
        onAdd={() => setIsAddOpen(true)}
        addTitle="Tambah To-Do Baru"
      >
        {todayTodos.length === 0 ? (
          <EmptyState message="Belum ada to-do untuk hari ini." />
        ) : (
          <div className="todo-list">
            {todayTodos.map((item) => (
              <TodoItem
                key={item.id}
                item={item}
                onToggle={onToggleTodo}
                onEdit={(selected) => setEditingItem(selected)}
                onDelete={(id) => setDeletingId(id)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddOpen || !!editingItem}
        onClose={() => {
          setIsAddOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit To-Do' : 'Tambah To-Do'}
      >
        <TodoForm
          initialData={editingItem}
          onSubmit={handleSave}
          onCancel={() => {
            setIsAddOpen(false);
            setEditingItem(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Konfirmasi Hapus To-Do"
      >
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Apakah Anda yakin ingin menghapus tugas ini?
          </p>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDeletingId(null)}
            disabled={isDeleting}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </Modal>
    </>
  );
};
