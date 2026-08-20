'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Phone, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import type { Project } from '@/types';

/* ─── types ───────────────────────────────────────────────────── */

interface Contractor {
  id:          string;
  name:        string;
  phone:       string;   // empty string = not found
  projectName: string;
}

interface Props {
  projects: Project[];
}

/* ─── helpers ─────────────────────────────────────────────────── */

/** Pull a phone number from a raw Firestore user document.
 *  Tries every field name the mobile app or web registration might use. */
function extractPhone(d: Record<string, unknown>): string {
  const candidates = [
    d.phone,
    d.phoneNumber,
    d.mobile,
    d.mobileNumber,
    d.contactPhone,
    d.tel,
    d.telephone,
  ];
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim().length > 3) {
      return c.trim();
    }
  }
  return '';
}

/** Strip everything except digits and leading + for wa.me */
function toWaDigits(phone: string): string {
  // Keep a leading + if present
  const stripped = phone.replace(/[^\d+]/g, '');
  return stripped.startsWith('+') ? stripped.slice(1) : stripped;
}

function buildWaUrl(phone: string, name: string): string {
  const msg = encodeURIComponent(
    `Hi ${name}, I'd like to discuss my project with you.`,
  );
  return `https://wa.me/${toWaDigits(phone)}?text=${msg}`;
}

/* ─── WhatsApp SVG (official green) ──────────────────────────── */

function WaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'w-4 h-4 fill-[#25D366]'}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─── component ───────────────────────────────────────────────── */

export function WhatsAppButton({ projects }: Props) {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [open,        setOpen]        = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* ── resolve contractor phones directly from Firestore ── */
  useEffect(() => {
    if (projects.length === 0) { setLoading(false); return; }

    // Sort: active first, then planning, then rest
    const priority = (p: Project) =>
      p.status === 'active' ? 0 : p.status === 'planning' ? 1 : 2;
    const sorted = [...projects].sort((a, b) => priority(a) - priority(b));

    // De-duplicate by contractorId
    const seen = new Set<string>();
    const unique = sorted.filter((p) => {
      if (!p.contractorId || seen.has(p.contractorId)) return false;
      seen.add(p.contractorId);
      return true;
    });

    setLoading(true);

    Promise.all(
      unique.map(async (p): Promise<Contractor> => {
        try {
          // Read the raw Firestore doc — catches any field name variation
          const snap = await getDoc(
            doc(db, FIRESTORE_COLLECTIONS.users, p.contractorId),
          );
          const raw   = snap.exists() ? (snap.data() as Record<string, unknown>) : {};
          const phone = extractPhone(raw);

          if (process.env.NODE_ENV === 'development') {
            console.log('[WhatsApp] contractor', p.contractorName, '→ fields:', Object.keys(raw), '→ phone:', phone || '(none)');
          }

          return {
            id:          p.contractorId,
            name:        p.contractorName,
            phone,
            projectName: p.name,
          };
        } catch (err) {
          console.warn('[WhatsApp] failed to fetch contractor', p.contractorId, err);
          return { id: p.contractorId, name: p.contractorName, phone: '', projectName: p.name };
        }
      }),
    ).then((results) => {
      setContractors(results);
      setLoading(false);
    });
  }, [projects.map((p) => p.contractorId).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── close dropdown on outside click ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* ── still loading or no projects ── */
  if (loading)          return null;
  if (projects.length === 0) return null;

  const withPhone    = contractors.filter((c) => c.phone);
  const withoutPhone = contractors.filter((c) => !c.phone);

  /* ── all contractors have no phone ── */
  if (withPhone.length === 0) {
    return (
      <div className="relative group">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/30 cursor-not-allowed select-none">
          <WaIcon />
          Chat Contractor
        </div>
        {/* Tooltip */}
        <div className="absolute left-0 bottom-full mb-2 w-56 hidden group-hover:block bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-lg z-50 pointer-events-none">
          <AlertCircle className="inline w-3 h-3 mr-1 text-yellow-400" />
          Contractor hasn&apos;t added a phone number yet. Ask them to update their profile.
        </div>
      </div>
    );
  }

  /* ── single contractor with phone → direct link ── */
  if (withPhone.length === 1 && withoutPhone.length === 0) {
    const c = withPhone[0];
    return (
      <a
        href={buildWaUrl(c.phone, c.name)}
        target="_blank"
        rel="noopener noreferrer"
        title={`Chat ${c.name} on WhatsApp · ${c.phone}`}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-white/70 hover:bg-white/10 hover:text-white"
      >
        <WaIcon />
        Chat Contractor
      </a>
    );
  }

  /* ── multiple contractors (mix of with/without phone) → dropdown ── */
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-white/70 hover:bg-white/10 hover:text-white"
      >
        <WaIcon />
        <span className="flex-1 text-left">Chat Contractor</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-1 w-68 min-w-[260px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
          <p className="px-4 pt-3 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
            Choose a contractor
          </p>

          {/* Contractors with phone first */}
          {withPhone.map((c) => (
            <a
              key={c.id}
              href={buildWaUrl(c.phone, c.name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                <WaIcon className="w-4 h-4 fill-[#25D366]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                <p className="text-xs text-gray-400 truncate">{c.projectName}</p>
              </div>
              <span className="text-[10px] text-[#25D366] font-bold">Chat</span>
            </a>
          ))}

          {/* Contractors without phone — shown as disabled rows */}
          {withoutPhone.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-4 py-3 opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{c.name}</p>
                <p className="text-xs text-gray-400 truncate">No phone on file · {c.projectName}</p>
              </div>
            </div>
          ))}

          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-[10px] text-gray-400">
              Missing a number? Ask your contractor to add it in their Profile settings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
