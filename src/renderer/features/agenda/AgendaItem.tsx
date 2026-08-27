import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { AgendaItem as AgendaItemType } from '../../../shared/contracts';
import { IconButton } from '../../components/IconButton';

interface AgendaItemProps {
  item: AgendaItemType;
  onEdit: (item: AgendaItemType) => void;
  onDelete: (id: string) => void;
}

export const AgendaItem: React.FC<AgendaItemProps> = ({ item, onEdit, onDelete }) => {
  const timeDisplay = item.endTime
    ? `${item.startTime} - ${item.endTime}`
    : item.startTime;

  return (
    <div className="agenda-item">
      <span className="agenda-time-pill">{timeDisplay}</span>
      <div className="agenda-content">
        <div className="agenda-title">{item.title}</div>
        {item.notes && <div className="agenda-notes">{item.notes}</div>}
      </div>
      <div className="item-actions">
        <IconButton
          icon={<Pencil size={13} />}
          title="Edit agenda"
          ariaLabel={`Edit agenda ${item.title}`}
          onClick={() => onEdit(item)}
        />
        <IconButton
          icon={<Trash2 size={13} />}
          title="Hapus agenda"
          ariaLabel={`Hapus agenda ${item.title}`}
          variant="danger"
          onClick={() => onDelete(item.id)}
        />
      </div>
    </div>
  );
};
