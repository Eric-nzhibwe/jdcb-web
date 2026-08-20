'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { TaskCard } from '@/components/cards/TaskCard';
import { MaterialCard } from '@/components/cards/MaterialCard';
import { ExpenseCard } from '@/components/cards/ExpenseCard';
import { ReportCard } from '@/components/cards/ReportCard';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { subscribeToProject, updateProject } from '@/services/projects';
import { subscribeToTasksByProject, createTask } from '@/services/tasks';
import { subscribeToMaterialsByProject, createMaterial } from '@/services/materials';
import { subscribeToExpensesByProject, calculateTotalExpenses, createExpense } from '@/services/expenses';
import { subscribeToReportsByProject, createProgressReport } from '@/services/reports';
import { createNotification } from '@/services/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { PROJECT_STATUSES, TASK_PRIORITIES, EXPENSE_CATEGORIES, MATERIAL_UNITS } from '@/lib/constants';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, toDateInputValue } from '@/lib/utils';
import type { Project, Task, Material, Expense, ProgressReport, TaskPriority, ExpenseCategory } from '@/types';

type Tab = 'overview' | 'tasks' | 'materials' | 'expenses' | 'reports';

export default function ContractorProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [project,   setProject]   = useState<Project | null>(null);
  const [tasks,     setTasks]     = useState<Task[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [expenses,  setExpenses]  = useState<Expense[]>([]);
  const [reports,   setReports]   = useState<ProgressReport[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading,   setLoading]   = useState(true);

  // Modals
  const [taskModal,     setTaskModal]     = useState(false);
  const [materialModal, setMaterialModal] = useState(false);
  const [expenseModal,  setExpenseModal]  = useState(false);
  const [reportModal,   setReportModal]   = useState(false);

  // Task form
  const [tTitle,   setTTitle]   = useState('');
  const [tDesc,    setTDesc]    = useState('');
  const [tPri,     setTPri]     = useState<TaskPriority>('medium');
  const [tDue,     setTDue]     = useState('');
  const [tNotify,  setTNotify]  = useState(true);
  const [tSaving,  setTSaving]  = useState(false);

  // Material form
  const [mName,  setMName]  = useState('');
  const [mDesc,  setMDesc]  = useState('');
  const [mQty,   setMQty]   = useState('');
  const [mUnit,  setMUnit]  = useState('pcs');
  const [mCost,  setMCost]  = useState('');
  const [mSuppl, setMSuppl] = useState('');
  const [mSaving, setMSaving] = useState(false);

  // Expense form
  const [eTitle, setETitle] = useState('');
  const [eDesc,  setEDesc]  = useState('');
  const [eAmt,   setEAmt]   = useState('');
  const [eCat,   setECat]   = useState<ExpenseCategory>('materials');
  const [eDate,  setEDate]  = useState(toDateInputValue());
  const [eSaving, setESaving] = useState(false);

  // Report form
  const [rTitle,   setRTitle]   = useState('');
  const [rDesc,    setRDesc]    = useState('');
  const [rPct,     setRPct]     = useState('');
  const [rNotify,  setRNotify]  = useState(true);
  const [rSaving,  setRSaving]  = useState(false);

  useEffect(() => {
    if (!id) return;
    const u1 = subscribeToProject(id, (p) => { setProject(p); setLoading(false); });
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
    { key: 'overview',  label: 'Overview' },
    { key: 'tasks',     label: 'Tasks',     count: tasks.length },
    { key: 'materials', label: 'Materials', count: materials.length },
    { key: 'expenses',  label: 'Expenses',  count: expenses.length },
    { key: 'reports',   label: 'Reports',   count: reports.length },
  ];

  const saveTask = async () => {
    if (!id || !tTitle.trim() || !project) return;
    setTSaving(true);
    const task = await createTask({
      projectId:       id,
      title:           tTitle,
      description:     tDesc,
      priority:        tPri,
      dueDate:         tDue || undefined,
      assignedTo:      user?.id,
      assignedToName:  user?.displayName,
    });
    // Notify client if project is active, in_progress-equivalent (active), or completed
    if (tNotify && ['active', 'completed'].includes(project.status) && project.clientId) {
      await createNotification({
        userId:      project.clientId,
        title:       `New task added — ${project.name}`,
        body:        `"${task.title}" (${tPri} priority)${tDue ? ` · Due ${tDue}` : ''} was added by ${user?.displayName ?? 'your contractor'}.`,
        type:        'task',
        referenceId: id,
      });
    }
    setTaskModal(false);
    setTTitle(''); setTDesc(''); setTDue(''); setTNotify(true); setTSaving(false);
  };

  const saveMaterial = async () => {
    if (!id || !mName.trim() || !mQty || !mCost) return;
    setMSaving(true);
    await createMaterial({ projectId: id, name: mName, description: mDesc, quantity: parseFloat(mQty), unit: mUnit, costPerUnit: parseFloat(mCost), supplier: mSuppl });
    setMaterialModal(false); setMName(''); setMDesc(''); setMQty(''); setMCost(''); setMSuppl(''); setMSaving(false);
  };

  const saveExpense = async () => {
    if (!id || !eTitle.trim() || !eAmt) return;
    setESaving(true);
    await createExpense({ projectId: id, title: eTitle, description: eDesc, amount: parseFloat(eAmt), category: eCat, date: eDate, createdBy: user?.id ?? '', createdByName: user?.displayName ?? '' });
    setExpenseModal(false); setETitle(''); setEDesc(''); setEAmt(''); setESaving(false);
  };

  const saveReport = async () => {
    if (!id || !rTitle.trim() || !rDesc.trim() || !rPct || !project) return;
    setRSaving(true);
    const pct = parseInt(rPct);
    await createProgressReport({
      projectId:       id,
      title:           rTitle,
      description:     rDesc,
      progressPercent: pct,
      images:          [],
      createdBy:       user?.id ?? '',
      createdByName:   user?.displayName ?? '',
    });
    await updateProject(id, { progress: pct });
    if (rNotify && project.clientId) {
      await createNotification({
        userId:      project.clientId,
        title:       `Progress report — ${project.name}`,
        body:        `"${rTitle}": ${rDesc.slice(0, 80)}${rDesc.length > 80 ? '…' : ''} · Progress now at ${pct}%.`,
        type:        'report',
        referenceId: id,
      });
    }
    setReportModal(false);
    setRTitle(''); setRDesc(''); setRPct(''); setRNotify(true); setRSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{project.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">📍 {project.location} · Client: {project.clientName}</p>
        </div>
        <Badge label={getStatusLabel(project.status, PROJECT_STATUSES)} color={statusColor} className="text-sm px-3 py-1" />
      </div>

      {/* Status updater */}
      <Select
        label="Update Status"
        value={project.status}
        onChange={async (e) => {
          const newStatus = e.target.value as Project['status'];
          await updateProject(id!, { status: newStatus });
          // Always notify the client on meaningful status changes
          if (project.clientId && newStatus !== project.status) {
            const labelMap: Record<string, string> = {
              active:    'Your project is now Active 🚀',
              on_hold:   'Your project has been put On Hold ⏸',
              completed: 'Your project has been marked Completed 🎉',
              cancelled: 'Your project has been Cancelled',
              planning:  'Your project is back in Planning',
            };
            await createNotification({
              userId:      project.clientId,
              title:       labelMap[newStatus] ?? `Project status updated — ${project.name}`,
              body:        `"${project.name}" status was changed to ${newStatus.replace('_', ' ')} by ${user?.displayName ?? 'your contractor'}.`,
              type:        'project',
              referenceId: id!,
            });
          }
        }}
        options={PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        className="max-w-xs"
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t.key ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            {t.label}
            {t.count !== undefined && t.count > 0 && <span className="bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0.5 font-bold">{t.count}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-card space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-gray-700 dark:text-gray-300">{project.description || 'No description'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Client</p><p className="text-gray-700 dark:text-gray-300">{project.clientName}</p></div>
            <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Timeline</p><p className="text-gray-700 dark:text-gray-300">{formatDate(project.startDate)}{project.endDate ? ` → ${formatDate(project.endDate)}` : ''}</p></div>
            <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Budget</p><p className="text-gray-700 dark:text-gray-300">{project.budget ? formatCurrency(project.budget) : 'Not set'}</p></div>
            <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Expenses</p><p className="text-primary font-bold">{formatCurrency(totalExp)}</p></div>
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
          <Button size="sm" onClick={() => setTaskModal(true)}><Plus className="w-4 h-4" /> Add Task</Button>
          {tasks.length === 0 ? <p className="text-center text-gray-400 py-8">No tasks yet</p> : tasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="space-y-3">
          <Button size="sm" onClick={() => setMaterialModal(true)}><Plus className="w-4 h-4" /> Add Material</Button>
          {materials.length === 0 ? <p className="text-center text-gray-400 py-8">No materials tracked</p> : materials.map((m) => <MaterialCard key={m.id} material={m} />)}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-3">
          <Button size="sm" onClick={() => setExpenseModal(true)}><Plus className="w-4 h-4" /> Add Expense</Button>
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
          <Button size="sm" onClick={() => setReportModal(true)}><Plus className="w-4 h-4" /> New Progress Report</Button>
          {reports.length === 0 ? <p className="text-center text-gray-400 py-8">No progress reports</p> : reports.map((r) => <ReportCard key={r.id} report={r} />)}
        </div>
      )}

      {/* Task Modal */}
      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="Add Task">
        <div className="space-y-4">
          <Input label="Title *" value={tTitle} onChange={(e) => setTTitle(e.target.value)} placeholder="Task title" />
          <Textarea label="Description" value={tDesc} onChange={(e) => setTDesc(e.target.value)} placeholder="Task details..." />
          <Select label="Priority" value={tPri} onChange={(e) => setTPri(e.target.value as TaskPriority)} options={TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))} />
          <Input label="Due Date" type="date" value={tDue} onChange={(e) => setTDue(e.target.value)} />

          {/* Notify toggle — only shown for active / completed projects */}
          {['active', 'completed'].includes(project.status) && (
            <label className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer select-none">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={tNotify}
                  onChange={(e) => setTNotify(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 peer-checked:bg-primary rounded-full transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-500" /> Notify client
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Send an in-app notification to {project.clientName}</p>
              </div>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setTaskModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={tSaving} onClick={saveTask}>Save Task</Button>
          </div>
        </div>
      </Modal>

      {/* Material Modal */}
      <Modal open={materialModal} onClose={() => setMaterialModal(false)} title="Add Material">
        <div className="space-y-4">
          <Input label="Name *" value={mName} onChange={(e) => setMName(e.target.value)} placeholder="Steel pipe" />
          <Textarea label="Description" value={mDesc} onChange={(e) => setMDesc(e.target.value)} placeholder="Details..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity *" type="number" value={mQty} onChange={(e) => setMQty(e.target.value)} placeholder="10" />
            <Select label="Unit" value={mUnit} onChange={(e) => setMUnit(e.target.value)} options={MATERIAL_UNITS.map((u) => ({ value: u, label: u }))} />
          </div>
          <Input label="Cost per Unit (K) *" type="number" value={mCost} onChange={(e) => setMCost(e.target.value)} placeholder="500" />
          <Input label="Supplier" value={mSuppl} onChange={(e) => setMSuppl(e.target.value)} placeholder="ABC Supplies" />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setMaterialModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={mSaving} onClick={saveMaterial}>Save Material</Button>
          </div>
        </div>
      </Modal>

      {/* Expense Modal */}
      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title="Add Expense">
        <div className="space-y-4">
          <Input label="Title *" value={eTitle} onChange={(e) => setETitle(e.target.value)} placeholder="Expense title" />
          <Textarea label="Description" value={eDesc} onChange={(e) => setEDesc(e.target.value)} placeholder="Details..." />
          <Input label="Amount (K) *" type="number" value={eAmt} onChange={(e) => setEAmt(e.target.value)} placeholder="1500" />
          <Select label="Category" value={eCat} onChange={(e) => setECat(e.target.value as ExpenseCategory)} options={EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))} />
          <Input label="Date" type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setExpenseModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={eSaving} onClick={saveExpense}>Save Expense</Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal open={reportModal} onClose={() => setReportModal(false)} title="New Progress Report">
        <div className="space-y-4">
          <Input label="Title *" value={rTitle} onChange={(e) => setRTitle(e.target.value)} placeholder="Weekly Update" />
          <Textarea label="Description *" value={rDesc} onChange={(e) => setRDesc(e.target.value)} placeholder="What was completed..." />
          <Input label="Progress % *" type="number" min="0" max="100" value={rPct} onChange={(e) => setRPct(e.target.value)} placeholder="65" />

          {/* Notify toggle */}
          <label className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer select-none">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={rNotify}
                onChange={(e) => setRNotify(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 peer-checked:bg-primary rounded-full transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-500" /> Notify client
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Send progress report notification to {project.clientName}</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setReportModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={rSaving} onClick={saveReport}>Submit Report</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
