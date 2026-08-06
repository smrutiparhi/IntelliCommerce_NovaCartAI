/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        success: { 500: '#10b981' },
        error: { 500: '#f43f5e' },
        warning: { 500: '#f59e0b' },
        info: { 500: '#0ea5e9' },
        dark: {
          bg: '#0a0a0f',
          surface: '#131320',
          border: '#1f1f2e',
        },
        cream: {
          DEFAULT: '#f3f1ec',
          surface: '#faf9f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(3rem, 8vw, 6.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        display: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h1: ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        h2: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        h3: ['1.5rem', { lineHeight: '1.3' }],
        h4: ['1.25rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        body: ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        md: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
        lg: '0 12px 24px -4px rgb(0 0 0 / 0.10)',
        xl: '0 24px 48px -8px rgb(0 0 0 / 0.14)',
      },
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '300ms',
        page: '500ms',
      },
      maxWidth: {
        measure: '65ch',
      },
    },
  },
  plugins: [],
}
