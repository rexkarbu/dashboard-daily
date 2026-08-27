import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuickNote as QuickNoteType } from '../../../shared/contracts';
import { Section } from '../../components/Section';

interface QuickNoteProps {
  note: QuickNoteType;
  onSaveNote: (text: string) => Promise<void>;
}

type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export const QuickNote: React.FC<QuickNoteProps> = ({ note, onSaveNote }) => {
  const [text, setText] = useState(note.text);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Sync from props only if user is not actively typing
  useEffect(() => {
    if (!isTypingRef.current) {
      setText(note.text);
    }
  }, [note.text]);

  const performSave = useCallback(
    async (textToSave: string) => {
      setStatus('saving');
      setErrorMessage(null);
      try {
        await onSaveNote(textToSave);
        setStatus('saved');
        setTimeout(() => {
          setStatus((prev) => (prev === 'saved' ? 'idle' : prev));
        }, 2000);
      } catch (err: unknown) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Gagal menyimpan catatan');
      } finally {
        isTypingRef.current = false;
      }
    },
    [onSaveNote]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setText(nextVal);
    isTypingRef.current = true;
    setStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSave(nextVal);
    }, 450);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (text !== note.text) {
      performSave(text);
    } else {
      isTypingRef.current = false;
    }
  };

  return (
    <Section title="Catatan Cepat">
      <div className="quick-note-wrap">
        <textarea
          className="quick-note-textarea"
          placeholder="Tulis catatan cepat, pengingat, atau memo di sini..."
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={10000}
          aria-label="Isi Catatan Cepat"
        />
        <div className="quick-note-footer">
          <div>
            {status === 'saving' && (
              <span className="note-status-saving">Menyimpan...</span>
            )}
            {status === 'saved' && (
              <span className="note-status-saved">✓ Tersimpan</span>
            )}
            {status === 'error' && (
              <span className="note-status-error">
                {errorMessage || 'Gagal menyimpan'}
              </span>
            )}
          </div>
          <span>{text.length} / 10.000</span>
        </div>
      </div>
    </Section>
  );
};
