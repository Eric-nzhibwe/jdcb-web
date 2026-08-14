import { Tag, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Expense } from '@/types';

export function ExpenseCard({ expense }: { expense: Expense }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{expense.title}</h4>
          {expense.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{expense.description}</p>
          )}
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1 capitalize">
              <Tag className="w-3 h-3" />{expense.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />{formatDate(expense.date)}
            </span>
          </div>
        </div>
        <span className="font-bold text-primary text-base whitespace-nowrap">
          {formatCurrency(expense.amount)}
        </span>
      </div>
    </Card>
  );
}
