import React from 'react';
import { Pencil, Trash2, ArrowRightCircle } from 'lucide-react';
import { TodoItem as TodoItemType } from '../../../shared/contracts';
import { IconButton } from '../../components/IconButton';

interface TodoItemProps {
  item: TodoItemType;
  onToggle: (id: string) => void;
  onEdit: (item: TodoItemType) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ item, onToggle, onEdit, onDelete }) => {
  return (
    <div className="todo-item">
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={item.completed}
        onChange={() => onToggle(item.id)}
        aria-label={`Tandai selesai ${item.title}`}
      />
      <div className={`todo-title ${item.completed ? 'completed' : ''}`}>
        {item.title}
      </div>
      {item.carryOver && (
        <span
          className="carry-over-tag"
          title="Tugas ini akan otomatis dibawa ke hari berikutnya jika belum selesai"
          aria-label="Carry-over aktif"
        >
          <ArrowRightCircle size={10} />
          <span>Carry-over</span>
        </span>
      )}
      <div className="item-actions">
        <IconButton
          icon={<Pencil size={13} />}
          title="Edit to-do"
          ariaLabel={`Edit to-do ${item.title}`}
          onClick={() => onEdit(item)}
        />
        <IconButton
          icon={<Trash2 size={13} />}
          title="Hapus to-do"
          ariaLabel={`Hapus to-do ${item.title}`}
          variant="danger"
          onClick={() => onDelete(item.id)}
        />
      </div>
    </div>
  );
};
