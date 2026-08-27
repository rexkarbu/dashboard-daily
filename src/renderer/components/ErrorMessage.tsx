import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div
      style={{
        background: 'var(--danger-surface)',
        border: '1px solid var(--danger)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        fontSize: '12px',
        color: 'var(--danger)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <AlertCircle size={14} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            background: 'transparent',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px 8px',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Coba lagi
        </button>
      )}
    </div>
  );
};
