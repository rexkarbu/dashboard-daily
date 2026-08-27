import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  title: string;
  ariaLabel: string;
  variant?: 'default' | 'accent' | 'danger';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  title,
  ariaLabel,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`icon-btn ${variant !== 'default' ? variant : ''} ${className}`}
      title={title}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  );
};
