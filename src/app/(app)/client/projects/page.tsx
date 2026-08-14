'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToProjectsByClient } from '@/services/projects';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PROJECT_STATUSES } from '@/lib/constants';
import { getStatusColor } from '@/lib/utils';
import type { Project, ProjectStatus } from '@/types';

type Filter = 'all' | ProjectStatus;

export default function ClientProjectsPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<Filter>('all');
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToProjectsByClient(user.id, (p) => { setProjects(p); setLoading(false); });
    return unsub;
  }, [user?.id]);

  const filtered = projects.filter((p) => {
    const matchStatus = filter === 'all' || p.status === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.location.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{projects.length} total</p>
        </div>
        <Button onClick={() => router.push('/client/projects/new')}>
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter === 'all' ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          All ({projects.length})
        </button>
        {PROJECT_STATUSES.map((s) => {
          const count = projects.filter((p) => p.status === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() => setFilter(s.value as Filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5 ${filter === s.value ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              style={filter === s.value ? { backgroundColor: s.color } : {}}
            >
              {s.label} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-semibold">No projects found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onPress={() => router.push(`/client/projects/${p.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
