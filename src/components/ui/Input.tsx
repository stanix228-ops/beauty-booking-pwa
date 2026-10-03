import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium" style={{ color: 'var(--tenant-muted, #8E8E93)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{
            backgroundColor: 'var(--tenant-card, #16161C)',
            borderColor: 'var(--tenant-card-border, rgba(212, 175, 55, 0.15))',
            color: 'var(--tenant-text, #FAF8F5)',
          }}
          className={`w-full h-11 px-3.5 border rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-colors ${
            error ? '!border-red-500 !focus:border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
