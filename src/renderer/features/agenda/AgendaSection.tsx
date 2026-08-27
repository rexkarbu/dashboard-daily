import React, { useState } from 'react';
import { AgendaItem as AgendaItemType, CreateAgendaInput } from '../../../shared/contracts';
import { Section } from '../../components/Section';
import { AgendaItem } from './AgendaItem';
import { AgendaForm } from './AgendaForm';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';

interface AgendaSectionProps {
  agenda: AgendaItemType[];
  today: string;
  onCreateAgenda: (input: CreateAgendaInput) => Promise<void>;
  onUpdateAgenda: (id: string, input: CreateAgendaInput) => Promise<void>;
  onDeleteAgenda: (id: string) => Promise<void>;
}

export const AgendaSection: React.FC<AgendaSectionProps> = ({
  agenda,
  today,
  onCreateAgenda,
  onUpdateAgenda,
  onDeleteAgenda,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItemType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter only today's agenda items and sort by startTime
  const todayAgenda = agenda
    .filter((item) => item.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleSave = async (data: CreateAgendaInput) => {
    if (editingItem) {
      await onUpdateAgenda(editingItem.id, data);
      setEditingItem(null);
    } else {
      await onCreateAgenda(data);
      setIsAddOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await onDeleteAgenda(deletingId);
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Section
        title="Agenda Hari Ini"
        badge={todayAgenda.length > 0 ? todayAgenda.length : undefined}
        onAdd={() => setIsAddOpen(true)}
        addTitle="Tambah Agenda Baru"
      >
        {todayAgenda.length === 0 ? (
          <EmptyState message="Belum ada agenda hari ini." />
        ) : (
          <div className="agenda-list">
            {todayAgenda.map((item) => (
              <AgendaItem
                key={item.id}
                item={item}
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
        title={editingItem ? 'Edit Agenda' : 'Tambah Agenda'}
      >
        <AgendaForm
          initialData={editingItem}
          defaultDate={today}
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
        title="Konfirmasi Hapus Agenda"
      >
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Apakah Anda yakin ingin menghapus agenda ini? Tindakan ini tidak dapat dibatalkan.
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
