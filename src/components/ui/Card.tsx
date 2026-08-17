import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick, ...rest }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-card p-5',
        onClick && 'cursor-pointer hover:shadow-card-hover transition-shadow',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
