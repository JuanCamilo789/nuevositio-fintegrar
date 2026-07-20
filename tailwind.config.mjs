/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        confianza:     '#114C5A',
        compromiso:    '#172B36',
        avance:        '#FFC801',
        impulso:       '#FE9932',
        transparencia: '#F1F6F4',
        neutral: {
          100: '#F1F6F4',
          200: '#E4EDE9',
          300: '#B0C8C0',
          500: '#6B8F87',
          700: '#2E4A52',
          900: '#172B36',
        },
      },
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
        'sm':  '0 1px 3px rgba(23,43,54,0.08), 0 1px 2px rgba(23,43,54,0.04)',
        'md':  '0 4px 12px rgba(23,43,54,0.10), 0 2px 4px rgba(23,43,54,0.06)',
        'lg':  '0 10px 32px rgba(23,43,54,0.12), 0 4px 8px rgba(23,43,54,0.06)',
        'xl':  '0 20px 48px rgba(23,43,54,0.14), 0 8px 16px rgba(23,43,54,0.08)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)', // 8px — íconos contenedores, inputs, badges
        'md': 'var(--radius-md)', // 14px — tarjetas, botones
        'lg': 'var(--radius-lg)', // 20px — paneles/modales, imágenes destacadas
      },
    },
  },
  plugins: [],
};
