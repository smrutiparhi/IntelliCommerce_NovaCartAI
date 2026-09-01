/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#5457e5', 700: '#4547c8', 800: '#3739a3', 900: '#30327f' },
        ink: { 950: '#07080b', 900: '#0b0d12', 850: '#101218', 800: '#151821', 700: '#20242f' },
        accent: { 400: '#9da8ff', 500: '#7c87ff' },
        error: { 500: '#fb7185' },
        dark: { bg: '#07080b', surface: '#101218', border: '#252a36' },
      },
      fontFamily: { sans: ['Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      fontSize: {
        display: ['clamp(3.5rem, 9vw, 9.5rem)', { lineHeight: '.84', letterSpacing: '-.075em', fontWeight: '720' }],
        hero: ['clamp(3rem, 7vw, 7rem)', { lineHeight: '.88', letterSpacing: '-.065em', fontWeight: '720' }],
        h1: ['clamp(2.75rem, 5vw, 5.5rem)', { lineHeight: '.94', letterSpacing: '-.055em', fontWeight: '700' }],
        h2: ['clamp(2rem, 3.6vw, 4rem)', { lineHeight: '.98', letterSpacing: '-.045em', fontWeight: '700' }],
        h3: ['1.75rem', { lineHeight: '1.15', letterSpacing: '-.03em', fontWeight: '650' }],
        body: ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['.875rem', { lineHeight: '1.6' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        caption: ['.75rem', { lineHeight: '1.4' }],
      },
      spacing: { 13: '3.25rem', 18: '4.5rem', 22: '5.5rem', 30: '7.5rem' },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      boxShadow: {
        float: '0 24px 80px rgba(0,0,0,.34)',
        card: '0 18px 60px rgba(0,0,0,.22)',
        glow: '0 0 80px rgba(99,102,241,.16)',
      },
      maxWidth: { shell: '1440px', measure: '65ch' },
      transitionDuration: { 400: '400ms' },
      zIndex: { 60: '60', 70: '70', 80: '80' },
    },
  },
  plugins: [],
}
