'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, FolderOpen, TrendingUp, CheckCircle, Clock,
  Bell, CheckSquare, Briefcase, FileText, DollarSign, Package, Info,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToProjectsByClient } from '@/services/projects';
import { subscribeToTasksByProject } from '@/services/tasks';
import {
  subscribeToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/services/notifications';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Button } from '@/components/ui/Button';
import { formatCurrency, getInitials } from '@/lib/utils';
import type { Project, Task, Notification } from '@/types';

/* ─── helpers ─────────────────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_ICON: Record<Notification['type'], React.ElementType> = {
  task:     CheckSquare,
  project:  Briefcase,
  expense:  DollarSign,
  report:   FileText,
  material: Package,
  general:  Info,
};

const TYPE_COLOR: Record<Notification['type'], string> = {
  task:     '#2980b9',
  project:  '#27ae60',
  expense:  '#e74c3c',
  report:   '#2d9e5f',
  material: '#f39c12',
  general:  '#6c757d',
};

/* ─── stat card ───────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
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

/* ─── page ────────────────────────────────────────────────────── */

export default function ClientDashboard() {
  const { user }  = useAuth();
  const router    = useRouter();

  const [projects,       setProjects]       = useState<Project[]>([]);
  const [tasks,          setTasks]          = useState<Task[]>([]);
  const [notifications,  setNotifications]  = useState<Notification[]>([]);
  const [loadProjects,   setLoadProjects]   = useState(true);

  /* ── subscriptions ── */
  useEffect(() => {
    if (!user) return;

    // projects
    const u1 = subscribeToProjectsByClient(
      user.id,
      (p) => { setProjects(p); setLoadProjects(false); },
      ()  => setLoadProjects(false),
    );

    // notifications
    const u2 = subscribeToNotifications(user.id, setNotifications);

    return () => { u1(); u2(); };
  }, [user?.id]);

  // Subscribe to tasks for ALL client projects (aggregate)
  useEffect(() => {
    if (projects.length === 0) { setTasks([]); return; }

    const allTasks: Record<string, Task> = {};
    const unsubs = projects.map((p) =>
      subscribeToTasksByProject(p.id, (projectTasks) => {
        projectTasks.forEach((t) => { allTasks[t.id] = t; });
        setTasks(Object.values(allTasks));
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [projects.map((p) => p.id).join(',')]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── derived stats ── */
  const active    = projects.filter((p) => p.status === 'active').length;
  const planning  = projects.filter((p) => p.status === 'planning').length;
  const completed = projects.filter((p) => p.status === 'completed').length;
  const budget    = projects.reduce((s, p) => s + (p.budget ?? 0), 0);
  const avgProg   = projects.length > 0
    ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
    : 0;

  const tasksDone    = tasks.filter((t) => t.status === 'completed').length;
  const tasksActive  = tasks.filter((t) => t.status === 'in_progress').length;
  const tasksPending = tasks.filter((t) => t.status === 'pending').length;

  const unreadCount  = notifications.filter((n) => !n.read).length;
  const recentNotifs = notifications.slice(0, 5);

  const firstName = user?.displayName?.split(' ')[0] ?? 'Client';
  const initials  = getInitials(user?.displayName ?? 'C');

  const handleReadNotif = async (n: Notification) => {
    if (!n.read) await markNotificationRead(n.id);
    // If it's a project notification, navigate to that project
    if (n.referenceId && (n.type === 'project' || n.type === 'task' || n.type === 'report')) {
      router.push(`/client/projects/${n.referenceId}`);
    }
  };

  /* ── render ── */
  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="bg-secondary rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-hero">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_50%,#2d9e5f_0%,transparent_60%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Client Dashboard</p>
            <h1 className="text-2xl lg:text-3xl font-black text-white mb-2">Good day, {firstName} 👋</h1>
            <p className="text-white/50 text-sm">
              {projects.length} project{projects.length !== 1 ? 's' : ''} · Avg progress {avgProg}%
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  <Bell className="w-3 h-3" /> {unreadCount} new
                </span>
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-secondary font-black text-sm">{initials}</span>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/10">
            <p className="text-white/50 text-xs font-medium mb-1">TOTAL BUDGET</p>
            <p className="text-white font-black text-xl">{formatCurrency(budget)}</p>
          </div>
          <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/10">
            <p className="text-white/50 text-xs font-medium mb-1">AVG PROGRESS</p>
            <p className="text-accent font-black text-xl">{avgProg}%</p>
          </div>
          <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/10">
            <p className="text-white/50 text-xs font-medium mb-1">TASKS DONE</p>
            <p className="text-white font-black text-xl">
              {tasksDone}
              <span className="text-white/40 text-sm font-normal"> / {tasks.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp}  label="Active"    value={active}          color="#27ae60" />
        <StatCard icon={Clock}       label="Planning"  value={planning}        color="#f39c12" />
        <StatCard icon={CheckCircle} label="Completed" value={completed}       color="#2d9e5f" />
        <StatCard icon={FolderOpen}  label="Total"     value={projects.length} color="#2980b9" />
      </div>

      {/* Task summary row */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'In Progress', value: tasksActive,  color: '#2980b9' },
            { label: 'Pending',     value: tasksPending, color: '#f39c12' },
            { label: 'Completed',   value: tasksDone,    color: '#27ae60' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center shadow-card"
            >
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Live contractor updates (notifications feed) */}
      {notifications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                Contractor Updates
                {unreadCount > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Live updates from your contractors</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsRead(notifications)}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="space-y-2">
            {recentNotifs.map((n) => {
              const Icon  = TYPE_ICON[n.type] ?? Info;
              const color = TYPE_COLOR[n.type] ?? '#6c757d';
              return (
                <button
                  key={n.id}
                  onClick={() => handleReadNotif(n)}
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-all hover:shadow-md ${
                    !n.read
                      ? 'bg-primary/[0.04] dark:bg-primary/10 border-primary/20 dark:border-primary/30'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                  }`}
                >
                  {/* Icon bubble */}
                  <div
                    className="mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color + '22' }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Unread dot + tap hint */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                    {n.referenceId && (
                      <span className="text-[10px] text-primary font-semibold">View →</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">My Projects</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{active} active · {completed} completed</p>
        </div>
        <div className="flex gap-2">
          {projects.length > 3 && (
            <Button variant="outline" size="sm" onClick={() => router.push('/client/projects')}>
              View all
            </Button>
          )}
          <Button size="sm" onClick={() => router.push('/client/projects/new')}>
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>

      {loadProjects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-12 text-center shadow-card">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Create your first project and assign a contractor to get started.
          </p>
          <Button onClick={() => router.push('/client/projects/new')}>
            <Plus className="w-4 h-4" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.slice(0, 6).map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onPress={() => router.push(`/client/projects/${p.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
