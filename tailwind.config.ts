import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2d9e5f',
          dark: '#1e7a47',
          light: '#e8f7ee',
        },
        secondary: '#1b3a2d',
        accent: '#f0a500',
        forest: {
          50:  '#f2faf5',
          100: '#e8f7ee',
          200: '#c8e6d0',
          300: '#8fb89a',
          400: '#5a7a66',
          500: '#2d9e5f',
          600: '#1e7a47',
          700: '#1b3a2d',
          800: '#122b1c',
          900: '#0d1f14',
        },
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
        card: '0 2px 12px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px 0 rgba(0,0,0,0.14)',
        hero: '0 12px 48px 0 rgba(0,0,0,0.22)',
      },
    },
  },
  plugins: [],
};

export default config;
