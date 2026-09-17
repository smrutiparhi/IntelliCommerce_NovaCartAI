/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f7f9ed', 100: '#edf2d9', 200: '#dbe6b4', 300: '#bed180', 400: '#9db655', 500: '#7b922f', 600: '#596d24', 700: '#465522', 800: '#39441f', 900: '#2e371c' },
        violet: { 50: '#f7f9ed', 100: '#edf2d9', 200: '#dbe6b4', 300: '#bed180', 400: '#9db655', 500: '#7b922f', 600: '#596d24', 700: '#465522', 800: '#39441f', 900: '#2e371c' },
        slate: { 50: '#f8f9f5', 100: '#eff1e9', 200: '#dfe3d7', 300: '#c5cbbc', 400: '#a2ab94', 500: '#78816d', 600: '#5e6854', 700: '#464f3e', 800: '#333b2e', 900: '#242c20', 950: '#181f15' },
        ink: { 950: '#10120f', 900: '#141710', 850: '#191c17', 800: '#242820', 700: '#32392d' },
        accent: { 400: '#9da8ff', 500: '#7c87ff' },
        error: { 500: '#fb7185' },
        dark: { bg: '#10120f', surface: '#191c17', border: '#32392d' },
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
        card: 'var(--nc-shadow)',
        glow: '0 0 80px rgba(99,102,241,.16)',
      },
      maxWidth: { shell: '1440px', measure: '65ch' },
      transitionDuration: { 400: '400ms' },
      zIndex: { 60: '60', 70: '70', 80: '80' },
    },
  },
  plugins: [],
}
