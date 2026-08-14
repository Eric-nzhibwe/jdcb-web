import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export function Badge({ label, color = '#2d9e5f', className }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', className)}
      style={{ backgroundColor: color + '22', color }}
    >
      {label}
    </span>
  );
}
