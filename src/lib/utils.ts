import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return `K ${new Intl.NumberFormat('en-ZM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getStatusColor(
  status: string,
  statuses: readonly { value: string; label: string; color: string }[]
): string {
  return statuses.find((s) => s.value === status)?.color ?? '#6c757d';
}

export function getStatusLabel(
  status: string,
  statuses: readonly { value: string; label: string; color: string }[]
): string {
  return statuses.find((s) => s.value === status)?.label ?? status;
}

export function toDateInputValue(dateString?: string): string {
  if (!dateString) return new Date().toISOString().split('T')[0];
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}
