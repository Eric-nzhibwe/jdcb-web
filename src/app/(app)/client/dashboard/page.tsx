'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToProjectsByClient } from '@/services/projects';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Button } from '@/components/ui/Button';
import { formatCurrency, getInitials } from '@/lib/utils';
import type { Project } from '@/types';

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

export default function ClientDashboard() {
  const { user } = useAuth();
  const router   = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToProjectsByClient(user.id, (p) => { setProjects(p); setLoading(false); }, (e) => { console.error(e); setLoading(false); });
    return unsub;
  }, [user?.id]);

  const active    = projects.filter((p) => p.status === 'active').length;
  const planning  = projects.filter((p) => p.status === 'planning').length;
  const completed = projects.filter((p) => p.status === 'completed').length;
  const budget    = projects.reduce((s, p) => s + (p.budget ?? 0), 0);
  const avgProg   = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0;
  const firstName = user?.displayName?.split(' ')[0] ?? 'Client';
  const initials  = getInitials(user?.displayName ?? 'C');

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-secondary rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-hero">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_50%,#2d9e5f_0%,transparent_60%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Client Dashboard</p>
            <h1 className="text-2xl lg:text-3xl font-black text-white mb-2">Good day, {firstName} 👋</h1>
            <p className="text-white/50 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''} · Avg progress {avgProg}%</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-secondary font-black text-sm">{initials}</span>
            </div>
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp}   label="Active"    value={active}    color="#27ae60" />
        <StatCard icon={Clock}        label="Planning"  value={planning}  color="#f39c12" />
        <StatCard icon={CheckCircle}  label="Completed" value={completed} color="#2d9e5f" />
        <StatCard icon={FolderOpen}   label="Total"     value={projects.length} color="#2980b9" />
      </div>

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

      {loading ? (
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
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Create your first project and assign a contractor to get started.</p>
          <Button onClick={() => router.push('/client/projects/new')}>
            <Plus className="w-4 h-4" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.slice(0, 6).map((p) => (
            <ProjectCard key={p.id} project={p} onPress={() => router.push(`/client/projects/${p.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
