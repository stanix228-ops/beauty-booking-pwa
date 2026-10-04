import React from 'react';
import { Spinner } from '@astryxdesign/core/Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, style, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer rounded-xl';

    const sizeStyles = {
      sm: 'h-9 px-3.5 text-xs',
      md: 'h-11 px-5 text-sm',
      lg: 'h-13 px-6 text-base font-semibold',
    };

    let variantClasses = '';
    let customStyle: React.CSSProperties = { ...style };

    if (variant === 'primary') {
      variantClasses = 'text-neutral-950 font-semibold shadow-lg hover:brightness-105';
      customStyle = {
        backgroundColor: 'var(--tenant-accent)',
        ...customStyle,
      };
    } else if (variant === 'secondary') {
      variantClasses = 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 border border-neutral-700/60';
    } else if (variant === 'outline') {
      variantClasses = 'border text-neutral-200 hover:bg-neutral-800/60';
      customStyle = {
        borderColor: 'rgba(255, 255, 255, 0.15)',
        ...customStyle,
      };
    } else if (variant === 'ghost') {
      variantClasses = 'text-neutral-300 hover:bg-neutral-800/40 hover:text-white';
    } else if (variant === 'destructive') {
      variantClasses = 'bg-red-600/90 text-white hover:bg-red-500 shadow-sm';
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={customStyle}
        className={`${baseStyles} ${sizeStyles[size]} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" shade="inherit" />
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
