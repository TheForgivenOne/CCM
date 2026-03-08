'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-[#0EA5E9] text-white hover:bg-[#0284C7] focus:ring-[#0EA5E9] shadow-lg shadow-[#0EA5E9]/20 hover:shadow-[#0EA5E9]/30',
      secondary: 'border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:ring-zinc-400',
      danger: 'bg-[#F43F5E] text-white hover:bg-[#E11D48] focus:ring-[#F43F5E] shadow-lg shadow-[#F43F5E]/20 hover:shadow-[#F43F5E]/30',
      success: 'bg-[#10B981] text-white hover:bg-[#059669] focus:ring-[#10B981] shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/30',
      ghost: 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:ring-zinc-400',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
