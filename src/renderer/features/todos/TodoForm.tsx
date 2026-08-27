import React, { useState } from 'react';
import { TodoItem, CreateTodoInput } from '../../../shared/contracts';
import { createTodoInputSchema } from '../../../shared/schemas';

interface TodoFormProps {
  initialData?: TodoItem | null;
  onSubmit: (data: CreateTodoInput) => Promise<void>;
  onCancel: () => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [carryOver, setCarryOver] = useState(initialData ? initialData.carryOver : true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: CreateTodoInput = {
      title: title.trim(),
      carryOver,
    };

    const validation = createTodoInputSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan to-do');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {error && <div className="form-error-msg">{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="todo-title">
            Judul Tugas *
          </label>
          <input
            id="todo-title"
            type="text"
            className="form-input"
            placeholder="Misal: Review PR release v0.1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={160}
            required
            autoFocus
          />
        </div>

        <div className="form-group" style={{ marginTop: '4px' }}>
          <label className="form-checkbox-label" htmlFor="todo-carry-over">
            <input
              id="todo-carry-over"
              type="checkbox"
              className="todo-checkbox"
              checked={carryOver}
              onChange={(e) => setCarryOver(e.target.checked)}
            />
            <span>Bawa ke hari berikutnya jika belum selesai</span>
          </label>
        </div>
      </div>

      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
};
