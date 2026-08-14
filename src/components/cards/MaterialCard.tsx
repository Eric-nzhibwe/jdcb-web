import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { MATERIAL_STATUSES } from '@/lib/constants';
import type { Material } from '@/types';

export function MaterialCard({ material }: { material: Material }) {
  const statusColor = getStatusColor(material.status, MATERIAL_STATUSES);
  const totalCost   = material.quantity * material.costPerUnit;
  const usedPct     = material.quantity > 0 ? Math.round((material.usedQuantity / material.quantity) * 100) : 0;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{material.name}</h4>
          {material.supplier && (
            <p className="text-xs text-gray-400 mt-0.5">{material.supplier}</p>
          )}
        </div>
        <Badge label={getStatusLabel(material.status, MATERIAL_STATUSES)} color={statusColor} />
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
        <span>Qty: <strong className="text-gray-700 dark:text-gray-300">{material.quantity} {material.unit}</strong></span>
        <span>Used: <strong className="text-gray-700 dark:text-gray-300">{material.usedQuantity} {material.unit}</strong></span>
        <span>Cost: <strong className="text-primary">{formatCurrency(totalCost)}</strong></span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
        <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${usedPct}%` }} />
      </div>
    </Card>
  );
}
