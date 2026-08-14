'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Briefcase, CheckSquare, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToProjectsByContractor } from '@/services/projects';
import { subscribeToTasksByAssignee } from '@/services/tasks';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { TaskCard } from '@/components/cards/TaskCard';
import { Button } from '@/components/ui/Button';
import { formatCurrency, getInitials } from '@/lib/utils';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/lib/constants';
import type { Project, Task } from '@/types';

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-card flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '22' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function ContractorDashboard() {
  const { user } = useAuth();
  const router   = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [loading,  setLoading]  = useState(true);
  const ready = useRef(0);

  useEffect(() => {
    if (!user) return;
    ready.current = 0;
    const check = () => { ready.current++; if (ready.current >= 2) setLoading(false); };
    const u1 = subscribeToProjectsByContractor(user.id, (p) => { setProjects(p); check(); }, check);
    const u2 = subscribeToTasksByAssignee(user.id, (t) => { setTasks(t); check(); }, check);
    return () => { u1(); u2(); };
  }, [user?.id]);

  const active    = projects.filter((p) => p.status === 'active').length;
  const pending   = tasks.filter((t) => t.status === 'pending').length;
  const inProg    = tasks.filter((t) => t.status === 'in_progress').length;
  const done      = tasks.filter((t) => t.status === 'completed').length;
  const urgent    = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length;
  const firstName = user?.displayName?.split(' ')[0] ?? 'Contractor';
  const initials  = getInitials(user?.displayName ?? 'C');

  const sortedTasks = [...tasks].sort((a, b) => {
    const pO = { urgent: 0, high: 1, medium: 2, low: 3 };
    const sO = { in_progress: 0, pending: 1, blocked: 2, completed: 3 };
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    return (pO[a.priority] ?? 9) - (pO[b.priority] ?? 9);
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-secondary rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-hero">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_50%,#2d9e5f_0%,transparent_60%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Contractor Dashboard</p>
            <h1 className="text-2xl lg:text-3xl font-black text-white mb-2">Hey, {firstName} 🔧</h1>
            {urgent > 0 && (
              <span className="inline-flex items-center gap-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" /> {urgent} urgent task{urgent > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-secondary font-black text-sm">{initials}</span>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/10">
            <p className="text-white/50 text-xs font-medium mb-1">PROJECTS</p>
            <p className="text-white font-black text-xl">{active} <span className="text-white/40 text-sm font-normal">/ {projects.length} active</span></p>
          </div>
          <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/10">
            <p className="text-white/50 text-xs font-medium mb-1">TASKS</p>
            <p className="text-white font-black text-xl">{inProg} <span className="text-white/40 text-sm font-normal">in progress</span></p>
          </div>
          <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/10">
            <p className="text-white/50 text-xs font-medium mb-1">COMPLETION</p>
            <p className="text-accent font-black text-xl">{tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0}%</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}   label="Assigned"    value={projects.length} color="#2d9e5f" />
        <StatCard icon={TrendingUp}  label="Active Proj" value={active}          color="#27ae60" />
        <StatCard icon={CheckSquare} label="Tasks Done"  value={done}            color="#2980b9" />
        <StatCard icon={AlertCircle} label="Urgent"      value={urgent}          color="#e74c3c" />
      </div>

      {/* Projects */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Assigned Projects</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{active} active</p>
        </div>
        <div className="flex gap-2">
          {projects.length > 3 && (
            <Button variant="outline" size="sm" onClick={() => router.push('/contractor/projects')}>View all</Button>
          )}
          <Button size="sm" onClick={() => router.push('/contractor/projects/new')}>
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-12 text-center shadow-card">
          <Briefcase className="w-12 h-12 text-primary/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Your assigned projects will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.slice(0, 3).map((p) => (
            <ProjectCard key={p.id} project={p} onPress={() => router.push(`/contractor/projects/${p.id}`)} />
          ))}
        </div>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">What&apos;s Next</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{pending + inProg} tasks need attention</p>
            </div>
            {tasks.length > 5 && (
              <Button variant="outline" size="sm" onClick={() => router.push('/contractor/tasks')}>View all</Button>
            )}
          </div>
          <div className="space-y-3">
            {sortedTasks.slice(0, 5).map((t) => (
              <TaskCard key={t.id} task={t} onPress={() => router.push(`/contractor/tasks/${t.id}`)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
