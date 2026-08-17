import { Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/lib/constants';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const statusColor   = getStatusColor(task.status, TASK_STATUSES);
  const priorityColor = getStatusColor(task.priority, TASK_PRIORITIES);

  return (
    <Card
      onClick={onPress}
      className="border-l-4 hover:translate-y-[-2px] transition-transform"
      style={{ borderLeftColor: statusColor }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex-1">{task.title}</h4>
        <div className="flex gap-1.5">
          <Badge label={getStatusLabel(task.status, TASK_STATUSES)} color={statusColor} />
          <Badge label={task.priority.toUpperCase()} color={priorityColor} />
        </div>
      </div>
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex gap-3 text-xs text-gray-400">
        {task.assignedToName && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />{task.assignedToName}
          </span>
        )}
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />{formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </Card>
  );
}
