import React, { useState } from 'react';
import { AgendaItem, CreateAgendaInput } from '../../../shared/contracts';
import { createAgendaInputSchema } from '../../../shared/schemas';

interface AgendaFormProps {
  initialData?: AgendaItem | null;
  defaultDate: string;
  onSubmit: (data: CreateAgendaInput) => Promise<void>;
  onCancel: () => void;
}

export const AgendaForm: React.FC<AgendaFormProps> = ({
  initialData,
  defaultDate,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || defaultDate);
  const [startTime, setStartTime] = useState(initialData?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initialData?.endTime || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: CreateAgendaInput = {
      title: title.trim(),
      date,
      startTime,
      endTime: endTime.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const validation = createAgendaInputSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan agenda');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {error && <div className="form-error-msg">{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="agenda-title">
            Judul Agenda *
          </label>
          <input
            id="agenda-title"
            type="text"
            className="form-input"
            placeholder="Misal: Rapat Tim Produk"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="agenda-date">
            Tanggal
          </label>
          <input
            id="agenda-date"
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="agenda-start-time">
              Mulai *
            </label>
            <input
              id="agenda-start-time"
              type="time"
              className="form-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="agenda-end-time">
              Selesai (opsional)
            </label>
            <input
              id="agenda-end-time"
              type="time"
              className="form-input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="agenda-notes">
            Catatan Tambahan (opsional)
          </label>
          <textarea
            id="agenda-notes"
            className="form-textarea"
            placeholder="Detail link, ruangan, agenda rapat..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
          />
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
