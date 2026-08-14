import { MapPin, Calendar, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { PROJECT_STATUSES } from '@/lib/constants';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onPress?: () => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const statusColor = getStatusColor(project.status, PROJECT_STATUSES);
  const statusLabel = getStatusLabel(project.status, PROJECT_STATUSES);

  return (
    <Card onClick={onPress} className="hover:translate-y-[-2px] transition-transform">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight flex-1">
          {project.name}
        </h3>
        <Badge label={statusLabel} color={statusColor} />
      </div>

      {project.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {project.location}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(project.startDate)}
        </span>
        {project.budget && (
          <span className="flex items-center gap-1 text-primary font-medium">
            {formatCurrency(project.budget)}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Progress
          </span>
          <span className="text-xs font-bold text-primary">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${project.progress}%`, backgroundColor: statusColor }}
          />
        </div>
      </div>
    </Card>
  );
}
