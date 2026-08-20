'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToProjectsByClient } from '@/services/projects';
import type { Project } from '@/types';

/** Compact WhatsApp icon for the mobile header — opens the first available contractor */
function MobileWhatsAppIcon({ projects }: { projects: Project[] }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length === 0) return;
    // Use dynamic import to avoid server-side import issues
    import('@/services/auth').then(({ getUserById }) => {
      const sorted = [...projects].sort((a, b) =>
        (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1)
      );
      const first = sorted.find((p) => p.contractorId);
      if (!first) return;
      getUserById(first.contractorId).then((u) => {
        if (!u?.phone) return;
        const digits = u.phone.replace(/\D/g, '');
        const msg = encodeURIComponent(
          `Hi ${first.contractorName}, I'd like to discuss my project with you.`
        );
        setUrl(`https://wa.me/${digits}?text=${msg}`);
      }).catch(() => {});
    });
  }, [projects.map((p) => p.contractorId).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat contractor on WhatsApp"
      className="p-2 rounded-xl hover:bg-white/10 transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 fill-[#25D366]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (user?.role !== 'client') return;
    const unsub = subscribeToProjectsByClient(user.id, setClientProjects);
    return unsub;
  }, [user?.id, user?.role]);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header
          className="lg:hidden flex items-center gap-2 px-4 py-3 text-white"
          style={{ backgroundColor: 'var(--secondary)' }}
        >
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="flex-1 text-sm font-black tracking-widest">JDCB</span>
          {/* WhatsApp icon — only for clients */}
          {user?.role === 'client' && <MobileWhatsAppIcon projects={clientProjects} />}
          <NotificationBell />
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto" style={{ color: 'var(--text)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
