'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Current input value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Clear handler, called when X is clicked */
  onClear?: () => void;
  /** Show loading spinner */
  loading?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      loading = false,
      placeholder = 'Search LEGO sets...',
      className = '',
      ...props
    },
    ref
  ) => {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div
        className={[
          'relative flex items-center group',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Search icon */}
        <div className="absolute left-3.5 pointer-events-none text-[#555B6E] group-focus-within:text-[#C9A84C] transition-colors duration-150">
          <Search size={18} />
        </div>

        {/* Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={[
            'w-full pl-11 pr-11 py-3 text-sm',
            'bg-[#161A22] border border-[#2A2F3C] rounded-xl',
            'text-[#F0F2F5] placeholder:text-[#555B6E]',
            'font-inter',
            'focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50',
            'transition-all duration-150',
          ].join(' ')}
          {...props}
        />

        {/* Right side: loading spinner or clear button */}
        <div className="absolute right-3 flex items-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-[#8B92A5]"
              >
                <Loader2 size={16} className="animate-spin" />
              </motion.div>
            ) : value ? (
              <motion.button
                key="clear"
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="text-[#555B6E] hover:text-[#F0F2F5] transition-colors duration-150 cursor-pointer p-0.5 rounded-md hover:bg-[#1E2330]"
              >
                <X size={14} />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
export default SearchInput;
