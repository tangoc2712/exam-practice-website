import React from 'react';
import type { HTMLAttributes } from 'react';
import classNames from 'classnames';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  interactive = false,
  ...props 
}) => {
  return (
    <div 
      className={classNames(
        'bg-[#1A1A2E]/80 backdrop-blur-md border border-[#333344] rounded-lg p-4 sm:p-5 md:p-8 transition-all duration-300',
        interactive ? 'cursor-pointer hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] hover:-translate-y-1' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassPanel: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={classNames('bg-[#1A1A2E] border border-[#333344] rounded-lg shadow-2xl p-5 sm:p-6 md:p-10 relative overflow-hidden', className)} {...props}>
      {/* Decorative scanline accent on panels */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-50"></div>
      {children}
    </div>
  );
};
