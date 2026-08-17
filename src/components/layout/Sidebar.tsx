'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderOpen, CheckSquare, Settings,
  User, LogOut, Palette, Wrench,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const contractorNav: NavItem[] = [
  { label: 'Dashboard', href: '/contractor/dashboard', icon: LayoutDashboard },
  { label: 'Projects',  href: '/contractor/projects',  icon: FolderOpen },
  { label: 'Tasks',     href: '/contractor/tasks',     icon: CheckSquare },
  { label: 'Profile',   href: '/contractor/profile',   icon: User },
  { label: 'Settings',  href: '/contractor/settings',  icon: Settings },
];

const clientNav: NavItem[] = [
  { label: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
  { label: 'Projects',  href: '/client/projects',  icon: FolderOpen },
  { label: 'Profile',   href: '/client/profile',   icon: User },
  { label: 'Settings',  href: '/client/settings',  icon: Settings },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { themeMode } = useTheme();
  const pathname = usePathname();

  const nav = user?.role === 'client' ? clientNav : contractorNav;
  const initials = getInitials(user?.displayName ?? 'U');

  // Settings href for the quick-link
  const settingsHref = user?.role === 'client' ? '/client/settings' : '/contractor/settings';

  return (
    <aside
      className="flex flex-col w-64 min-h-screen text-white"
      style={{ backgroundColor: 'var(--secondary)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-black tracking-widest text-white">JDCB</p>
          <p className="text-xs text-white/50 leading-none">Weld &amp; Fab</p>
        </div>
      </div>

      {/* User pill */}
      <div className="mx-4 mt-4 flex items-center gap-3 bg-white/[0.08] rounded-2xl px-4 py-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <span className="text-sm font-black" style={{ color: 'var(--secondary)' }}>{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user?.displayName}</p>
          <p className="text-xs text-white/50 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-6 px-4 space-y-1">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'text-white shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
              style={active ? { backgroundColor: 'var(--primary)' } : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — theme hint + sign out */}
      <div className="px-4 pb-6 space-y-1">
        <Link
          href={settingsHref}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <Palette className="w-4 h-4" />
          Theme: {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
