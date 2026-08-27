import React from 'react';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon }) => {
  return (
    <div className="empty-state">
      {icon && <span>{icon}</span>}
      <p>{message}</p>
    </div>
  );
};
