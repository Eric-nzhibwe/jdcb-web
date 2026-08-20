'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, ChevronDown, Phone } from 'lucide-react';
import { getUserById } from '@/services/auth';
import type { Project } from '@/types';

interface Contractor {
  id:          string;
  name:        string;
  phone:       string;
  projectName: string;
}

interface Props {
  projects: Project[];
}

/** Strip everything except digits for a clean wa.me link */
function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

function buildWaUrl(phone: string, contractorName: string): string {
  const msg = encodeURIComponent(
    `Hi ${contractorName}, I'd like to discuss my project with you.`,
  );
  return `https://wa.me/${digitsOnly(phone)}?text=${msg}`;
}

export function WhatsAppButton({ projects }: Props) {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [open,        setOpen]        = useState(false);
  const [loading,     setLoading]     = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  /* ── fetch contractor phones from projects ── */
  useEffect(() => {
    if (projects.length === 0) { setLoading(false); return; }

    // de-duplicate by contractorId, prefer active projects first
    const sorted  = [...projects].sort((a, b) => {
      const rank = (p: Project) => p.status === 'active' ? 0 : p.status === 'planning' ? 1 : 2;
      return rank(a) - rank(b);
    });

    const seen = new Set<string>();
    const unique = sorted.filter((p) => {
      if (!p.contractorId || seen.has(p.contractorId)) return false;
      seen.add(p.contractorId);
      return true;
    });

    Promise.all(
      unique.map(async (p) => {
        try {
          const u = await getUserById(p.contractorId);
          return u?.phone
            ? { id: p.contractorId, name: p.contractorName, phone: u.phone, projectName: p.name }
            : null;
        } catch {
          return null;
        }
      }),
    ).then((results) => {
      setContractors(results.filter(Boolean) as Contractor[]);
      setLoading(false);
    });
  }, [projects.map((p) => p.contractorId).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── close on outside click ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* ── nothing to show while loading or no projects ── */
  if (loading || projects.length === 0) return null;

  /* ── single contractor → direct link ── */
  if (contractors.length === 1) {
    const c = contractors[0];
    return (
      <a
        href={buildWaUrl(c.phone, c.name)}
        target="_blank"
        rel="noopener noreferrer"
        title={`Chat with ${c.name} on WhatsApp`}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-white/70 hover:bg-white/10 hover:text-white"
      >
        {/* WhatsApp SVG icon — official brand green */}
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 flex-shrink-0 fill-[#25D366]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Chat Contractor
      </a>
    );
  }

  /* ── multiple contractors → dropdown ── */
  if (contractors.length > 1) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-white/70 hover:bg-white/10 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 flex-shrink-0 fill-[#25D366]"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="flex-1 text-left">Chat Contractor</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute left-0 bottom-full mb-1 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
            <p className="px-4 pt-3 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Choose a contractor
            </p>
            {contractors.map((c) => (
              <a
                key={c.id}
                href={buildWaUrl(c.phone, c.name)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.projectName}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── contractors exist but none have a phone number ── */
  return (
    <div
      title="Your contractor hasn't added a phone number yet"
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/30 cursor-not-allowed select-none"
    >
      <MessageCircle className="w-4 h-4 flex-shrink-0" />
      Chat Contractor
    </div>
  );
}
