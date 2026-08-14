'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Phone } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { TaskCard } from '@/components/cards/TaskCard';
import { MaterialCard } from '@/components/cards/MaterialCard';
import { ExpenseCard } from '@/components/cards/ExpenseCard';
import { ReportCard } from '@/components/cards/ReportCard';
import { subscribeToProject } from '@/services/projects';
import { subscribeToTasksByProject } from '@/services/tasks';
import { subscribeToMaterialsByProject } from '@/services/materials';
import { subscribeToExpensesByProject, calculateTotalExpenses } from '@/services/expenses';
import { subscribeToReportsByProject } from '@/services/reports';
import { getUserById } from '@/services/auth';
import { PROJECT_STATUSES } from '@/lib/constants';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Project, Task, Material, Expense, ProgressReport } from '@/types';

type Tab = 'overview' | 'tasks' | 'materials' | 'expenses' | 'reports';

export default function ClientProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [project,   setProject]   = useState<Project | null>(null);
  const [tasks,     setTasks]     = useState<Task[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [expenses,  setExpenses]  = useState<Expense[]>([]);
  const [reports,   setReports]   = useState<ProgressReport[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading,   setLoading]   = useState(true);
  const [contractorPhone, setContractorPhone] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const u1 = subscribeToProject(id, (p) => {
      setProject(p); setLoading(false);
      if (p?.contractorId) {
        getUserById(p.contractorId).then((u) => setContractorPhone(u?.phone ?? null)).catch(() => {});
      }
    });
    const u2 = subscribeToTasksByProject(id, setTasks);
    const u3 = subscribeToMaterialsByProject(id, setMaterials);
    const u4 = subscribeToExpensesByProject(id, setExpenses);
    const u5 = subscribeToReportsByProject(id, setReports);
    return () => { u1(); u2(); u3(); u4(); u5(); };
  }, [id]);

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-12 text-gray-500">Project not found</div>;

  const statusColor = getStatusColor(project.status, PROJECT_STATUSES);
  const totalExp    = calculateTotalExpenses(expenses);
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview',   label: 'Overview' },
    { key: 'tasks',      label: 'Tasks',     count: tasks.length },
    { key: 'materials',  label: 'Materials', count: materials.length },
    { key: 'expenses',   label: 'Expenses',  count: expenses.length },
    { key: 'reports',    label: 'Reports',   count: reports.length },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{project.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Contractor: {project.contractorName}</p>
        </div>
        <Badge label={getStatusLabel(project.status, PROJECT_STATUSES)} color={statusColor} className="text-sm px-3 py-1" />
      </div>

      {/* Call contractor */}
      {contractorPhone && (
        <a
          href={`tel:${contractorPhone}`}
          className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 hover:bg-green-100 transition-colors"
        >
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-700 dark:text-green-400 text-sm">Call {project.contractorName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{contractorPhone}</p>
          </div>
        </a>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === t.key
                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0.5 font-bold">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-card space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-gray-700 dark:text-gray-300">{project.description || 'No description'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Location</p>
              <p className="text-gray-700 dark:text-gray-300">{project.location}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Timeline</p>
              <p className="text-gray-700 dark:text-gray-300">
                {formatDate(project.startDate)}{project.endDate ? ` → ${formatDate(project.endDate)}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Budget</p>
              <p className="text-gray-700 dark:text-gray-300">{project.budget ? formatCurrency(project.budget) : 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Expenses</p>
              <p className="text-primary font-bold">{formatCurrency(totalExp)}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Progress</span>
              <span className="text-sm font-bold text-primary">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {tasks.length === 0 ? <p className="text-center text-gray-400 py-8">No tasks yet</p> : tasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      )}
      {activeTab === 'materials' && (
        <div className="space-y-3">
          {materials.length === 0 ? <p className="text-center text-gray-400 py-8">No materials tracked</p> : materials.map((m) => <MaterialCard key={m.id} material={m} />)}
        </div>
      )}
      {activeTab === 'expenses' && (
        <div className="space-y-3">
          {expenses.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-black text-primary">{formatCurrency(totalExp)}</p>
            </div>
          )}
          {expenses.length === 0 ? <p className="text-center text-gray-400 py-8">No expenses recorded</p> : expenses.map((e) => <ExpenseCard key={e.id} expense={e} />)}
        </div>
      )}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? <p className="text-center text-gray-400 py-8">No progress reports</p> : reports.map((r) => <ReportCard key={r.id} report={r} />)}
        </div>
      )}
    </div>
  );
}
