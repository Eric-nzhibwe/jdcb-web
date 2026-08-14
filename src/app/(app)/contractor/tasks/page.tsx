'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToTasksByAssignee, updateTask } from '@/services/tasks';
import { TaskCard } from '@/components/cards/TaskCard';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/lib/constants';
import type { Task, TaskStatus, TaskPriority } from '@/types';

type StatusFilter   = 'all' | TaskStatus;
type PriorityFilter = 'all' | TaskPriority;

export default function ContractorTasksPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sFilter,  setSFilter]  = useState<StatusFilter>('all');
  const [pFilter,  setPFilter]  = useState<PriorityFilter>('all');
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTasksByAssignee(user.id, (t) => { setTasks(t); setLoading(false); });
    return unsub;
  }, [user?.id]);

  const filtered = useMemo(() => tasks.filter((t) => {
    const s = sFilter === 'all' || t.status === sFilter;
    const p = pFilter === 'all' || t.priority === pFilter;
    const q = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return s && p && q;
  }), [tasks, sFilter, pFilter, search]);

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    await updateTask(task.id, { status });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Tasks</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{tasks.length} total assigned</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks…"
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSFilter('all')} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${sFilter === 'all' ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>All</button>
        {TASK_STATUSES.map((s) => (
          <button key={s.value} onClick={() => setSFilter(s.value as StatusFilter)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5 ${sFilter === s.value ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
            style={sFilter === s.value ? { backgroundColor: s.color } : {}}>
            {s.label}
            <span className="opacity-70">({tasks.filter((t) => t.status === s.value).length})</span>
          </button>
        ))}
      </div>

      {/* Priority filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setPFilter('all')} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${pFilter === 'all' ? 'bg-secondary text-white border-secondary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>All Priority</button>
        {TASK_PRIORITIES.map((p) => (
          <button key={p.value} onClick={() => setPFilter(p.value as PriorityFilter)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${pFilter === p.value ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
            style={pFilter === p.value ? { backgroundColor: p.color } : {}}>
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-semibold">No tasks found</p>
          <p className="text-sm mt-1">Try adjusting filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="group">
              <TaskCard task={t} />
              {/* Quick status update */}
              <div className="mt-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {(['pending', 'in_progress', 'completed', 'blocked'] as TaskStatus[]).map((s) => (
                  <button key={s} onClick={() => handleStatusChange(t, s)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${t.status === s ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
