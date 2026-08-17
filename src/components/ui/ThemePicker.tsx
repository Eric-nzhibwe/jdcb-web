'use client';

import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';
import { Check } from 'lucide-react';

const THEME_OPTIONS: {
  mode: ThemeMode;
  label: string;
  emoji: string;
  preview: { bg: string; primary: string; card: string };
}[] = [
  { mode: 'light',    label: 'Light',     emoji: '☀️',  preview: { bg: '#f2faf5', primary: '#2d9e5f', card: '#ffffff' } },
  { mode: 'dark',     label: 'Dark',      emoji: '🌙',  preview: { bg: '#0d1f14', primary: '#3dbf72', card: '#1a3324' } },
  { mode: 'darkBlue', label: 'Dark Blue', emoji: '🌊',  preview: { bg: '#0a0f1e', primary: '#4d8ef0', card: '#111d3e' } },
  { mode: 'orange',   label: 'Orange',    emoji: '🔥',  preview: { bg: '#fff8f0', primary: '#e86f00', card: '#ffffff' } },
  { mode: 'beige',    label: 'Beige',     emoji: '🪵',  preview: { bg: '#f5f0e8', primary: '#9b7e52', card: '#fffdf7' } },
  { mode: 'brown',    label: 'Brown',     emoji: '☕',  preview: { bg: '#1a0f08', primary: '#c8803a', card: '#3a2210' } },
];

export function ThemePicker() {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <div className="flex gap-3 flex-wrap">
      {THEME_OPTIONS.map((opt) => {
        const isActive = themeMode === opt.mode;
        return (
          <button
            key={opt.mode}
            onClick={() => setThemeMode(opt.mode)}
            aria-label={`${opt.label} theme`}
            aria-pressed={isActive}
            className="flex flex-col items-center gap-1.5 group"
          >
            {/* Swatch — mirrors mobile exactly */}
            <div
              className="relative w-16 h-[52px] rounded-xl overflow-hidden"
              style={{
                backgroundColor: opt.preview.bg,
                border: `${isActive ? '2.5px' : '2px'} solid ${isActive ? opt.preview.primary : '#d1d5db'}`,
              }}
            >
              {/* Mini card */}
              <div
                className="absolute rounded-md opacity-90"
                style={{
                  backgroundColor: opt.preview.card,
                  width: 38, height: 26,
                  top: 6, left: 8,
                }}
              />
              {/* Primary accent strip at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-2"
                style={{ backgroundColor: opt.preview.primary }}
              />
              {/* Checkmark on active */}
              {isActive && (
                <div
                  className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center"
                  style={{ backgroundColor: opt.preview.primary }}
                >
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Label */}
            <span
              className="text-[11px] text-center leading-tight"
              style={{
                color: isActive ? 'var(--color-primary, #2d9e5f)' : '#9ca3af',
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {opt.emoji} {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
