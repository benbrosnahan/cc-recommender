'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SelectionCardProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function SelectionCard({
  label,
  description,
  icon,
  selected,
  onClick,
  disabled,
  className,
}: SelectionCardProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left rounded-xl border-2 p-4 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#275B2D]',
        selected
          ? 'border-[#275B2D] bg-[#EAF3E7] shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-400',
        disabled && !selected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span
            className={cn(
              'mt-0.5 flex-shrink-0 text-slate-500',
              selected && 'text-[#275B2D]'
            )}
          >
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'font-semibold text-sm leading-snug',
              selected ? 'text-[#275B2D]' : 'text-slate-800'
            )}
          >
            {label}
          </p>
          {description && (
            <p className="mt-0.5 text-xs text-slate-500 leading-snug">{description}</p>
          )}
        </div>
        {selected && (
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#275B2D] flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>
    </motion.button>
  );
}
