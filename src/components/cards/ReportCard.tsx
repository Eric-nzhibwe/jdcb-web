import { User, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import type { ProgressReport } from '@/types';

export function ReportCard({ report }: { report: ProgressReport }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{report.title}</h4>
        <span className="text-lg font-black text-primary">{report.progressPercent}%</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{report.description}</p>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-3">
        <div
          className="h-1.5 rounded-full bg-primary transition-all"
          style={{ width: `${report.progressPercent}%` }}
        />
      </div>
      <div className="flex gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><User className="w-3 h-3" />{report.createdByName}</span>
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(report.createdAt)}</span>
      </div>
      {report.images.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {report.images.map((url, i) => (
            <img key={i} src={url} alt={`Report image ${i + 1}`} className="w-16 h-16 rounded-lg object-cover" />
          ))}
        </div>
      )}
    </Card>
  );
}
