import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'outline';
}

export function Card({ className = '', variant = 'default', children, style, ...props }: CardProps) {
  let variantClasses = 'bg-neutral-900/80 border border-neutral-800/80 shadow-sm rounded-2xl p-4';

  if (variant === 'interactive') {
    variantClasses += ' hover:border-neutral-700 transition-all duration-200 cursor-pointer active:scale-[0.99]';
  } else if (variant === 'outline') {
    variantClasses = 'border border-neutral-800 rounded-2xl p-4';
  }

  const customStyle: React.CSSProperties = {
    backgroundColor: 'var(--tenant-card)',
    ...style,
  };

  return (
    <div style={customStyle} className={`${variantClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}
