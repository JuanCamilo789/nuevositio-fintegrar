/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--ff-sans)',    'system-ui', 'sans-serif'],
        display: ['var(--ff-heading)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1.4' }],
        'sm':   ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem',     { lineHeight: '1.65' }],
        'md':   ['1.125rem', { lineHeight: '1.55' }],
        'lg':   ['1.25rem',  { lineHeight: '1.4' }],
        'xl':   ['1.5rem',   { lineHeight: '1.3' }],
        '2xl':  ['1.875rem', { lineHeight: '1.25' }],
        '3xl':  ['2.25rem',  { lineHeight: '1.2' }],
        '4xl':  ['3rem',     { lineHeight: '1.1' }],
        '5xl':  ['3.75rem',  { lineHeight: '1.05' }],
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',   // 8px — íconos contenedores, inputs, badges
        'md': 'var(--radius-md)',   // 14px — tarjetas, botones
        'lg': 'var(--radius-lg)',   // 20px — paneles/modales, imágenes destacadas
        'xl': 'var(--radius-xl)',   // 32px
        'full': 'var(--radius-full)',
      },
    },
  },
  plugins: [],
};
