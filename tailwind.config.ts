import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['selector', '[data-theme="dark"],[data-theme="darkBlue"],[data-theme="brown"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark:    'var(--primary-dark)',
          light:   'var(--primary-light)',
        },
        secondary:  'var(--secondary)',
        accent:     'var(--accent)',
        // Theme-aware surface colors
        'theme-bg':      'var(--bg)',
        'theme-card':    'var(--card)',
        'theme-surface': 'var(--surface)',
        'theme-border':  'var(--border)',
        'theme-text':    'var(--text)',
        'theme-text-secondary': 'var(--text-secondary)',
        'theme-input':   'var(--input-bg)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card:       '0 2px 12px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px 0 rgba(0,0,0,0.14)',
        hero:       '0 12px 48px 0 rgba(0,0,0,0.22)',
      },
    },
  },
  plugins: [],
};

export default config;
