'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-2.5 bg-white dark:bg-zinc-900 
            border border-zinc-200 dark:border-zinc-800 
            rounded-lg text-zinc-900 dark:text-zinc-100
            focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent
            transition-all duration-200
            ${error ? 'border-[#F43F5E] focus:ring-[#F43F5E]' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-[#F43F5E]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
