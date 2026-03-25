import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-display tracking-wider uppercase rounded-sm border transition-all duration-300 ease-in-out outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-deep-space relative overflow-hidden group';
  
  const variantClasses = {
    primary: 'bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 shadow-[var(--shadow-neon-cyan)] hover:shadow-[0_0_30px_rgba(0,255,255,0.8)]',
    secondary: 'bg-transparent border-neon-pink text-neon-pink hover:bg-neon-pink/10 shadow-[var(--shadow-neon-pink)] hover:shadow-[0_0_30px_rgba(255,0,255,0.8)]',
    success: 'bg-transparent border-green-400 text-green-400 hover:bg-green-400/10 shadow-[0_0_10px_rgba(74,222,128,0.5)] hover:shadow-[0_0_30px_rgba(74,222,128,0.8)]',
    error: 'bg-transparent border-red-500 text-red-500 hover:bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]',
    ghost: 'border-transparent text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/50 hover:bg-neon-cyan/10',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm font-bold',
    lg: 'px-8 py-4 text-base font-bold',
  };

  return (
    <button
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        {
          'w-full': fullWidth,
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
