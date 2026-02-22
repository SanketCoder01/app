/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#030712',
        foreground: '#f8fafc',
        card: {
          DEFAULT: 'rgba(17, 24, 39, 0.7)',
          foreground: '#f8fafc',
        },
        popover: {
          DEFAULT: '#0b0f19',
          foreground: '#f8fafc',
        },
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#1e293b',
          foreground: '#f8fafc',
        },
        muted: {
          DEFAULT: '#1f2937',
          foreground: '#94a3b8',
        },
        accent: {
          DEFAULT: '#ec4899',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        border: 'rgba(255,255,255,0.1)',
        input: 'rgba(255,255,255,0.1)',
        ring: '#6366f1',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};