import React from 'react';
import { Plus } from 'lucide-react';
import { IconButton } from './IconButton';

interface SectionProps {
  title: string;
  badge?: string | number;
  onAdd?: () => void;
  addTitle?: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  title,
  badge,
  onAdd,
  addTitle = 'Tambah item',
  children,
}) => {
  return (
    <section className="section-card" aria-label={title}>
      <div className="section-header">
        <div className="section-title-wrap">
          <h2 className="section-title">{title}</h2>
          {badge !== undefined && <span className="section-badge">{badge}</span>}
        </div>
        {onAdd && (
          <IconButton
            icon={<Plus size={16} />}
            title={addTitle}
            ariaLabel={addTitle}
            variant="accent"
            onClick={onAdd}
          />
        )}
      </div>
      {children}
    </section>
  );
};
