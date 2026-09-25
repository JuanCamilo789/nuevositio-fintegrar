import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://fintegrar.com',
  output: 'server',
  server: {
    host: true,
  },
  // Solo se confía en el header X-Forwarded-Host de estos dominios (evita envenenar URLs con un Host falso).
  // Al desplegar en Railway, agregar aquí el dominio que asigne.
  security: {
    allowedDomains: [{ hostname: 'fintegrar.com' }, { hostname: 'www.fintegrar.com' }],
  },
  adapter: node({
    mode: 'standalone',
    host: true,
  }),
  integrations: [
    sitemap(),
    icon({
      include: {
        tabler: [
          'address-book', 'alert-circle', 'apps', 'arrow-left', 'arrow-right', 'arrow-up-right', 'award',
          'baby-carriage', 'brand-facebook', 'brand-instagram', 'brand-linkedin', 'brand-whatsapp',
          'briefcase', 'building-bank', 'building-store', 'bulb', 'calculator', 'calendar-check',
          'calendar-event', 'candle', 'check', 'chevron-down', 'chevron-left', 'chevron-right',
          'circle-check', 'clipboard-check', 'clock', 'clock-hour-4', 'cookie', 'credit-card', 'device-mobile-dollar', 'download',
          'equal', 'eye', 'file-check', 'file-text', 'file-type-pdf', 'file-upload', 'folder', 'headset',
          'heart', 'heart-handshake', 'help', 'help-hexagon', 'home', 'home-heart',
          'id-badge', 'info-circle', 'layout-dashboard', 'layout-grid', 'mail',
          'map-pin', 'menu-2', 'message-x', 'mood-empty', 'mood-happy', 'phone', 'photo-off',
          'plane', 'receipt', 'scale', 'search', 'sparkles', 'device-laptop',
          'school', 'send', 'share', 'shield-check', 'shield-lock', 'star-filled', 'stethoscope', 'target', 'trending-up',
          'upload', 'user', 'user-cog', 'user-plus', 'users', 'users-group', 'wallet', 'x', 'refresh'
        ],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: 'esbuild',
      target: ['safari14', 'chrome100', 'firefox100', 'edge100'],
    },
    preview: {
      allowedHosts: ['fintegrar.com', 'www.fintegrar.com'],
    },
    server: {
      allowedHosts: ['fintegrar.com', 'www.fintegrar.com'],
    },
  },
});
