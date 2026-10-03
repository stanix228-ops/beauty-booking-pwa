import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'destructive' | 'outline';
}

export function Badge({ className = '', variant = 'default', children, style, ...props }: BadgeProps) {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide';

  let variantClasses = 'bg-neutral-800 text-neutral-300';
  let customStyle: React.CSSProperties = { ...style };

  if (variant === 'accent') {
    variantClasses = 'text-neutral-950 font-semibold';
    customStyle = {
      backgroundColor: 'var(--tenant-accent)',
      ...customStyle,
    };
  } else if (variant === 'success') {
    variantClasses = 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40';
  } else if (variant === 'warning') {
    variantClasses = 'bg-amber-950/80 text-amber-300 border border-amber-800/40';
  } else if (variant === 'destructive') {
    variantClasses = 'bg-red-950/80 text-red-300 border border-red-800/40';
  } else if (variant === 'outline') {
    variantClasses = 'border border-neutral-700 text-neutral-300';
  }

  return (
    <span style={customStyle} className={`${base} ${variantClasses} ${className}`} {...props}>
      {children}
    </span>
  );
}
