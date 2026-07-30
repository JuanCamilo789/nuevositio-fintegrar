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
  adapter: node({
    mode: 'standalone',
    host: true,
  }),
  integrations: [
    sitemap({
      // Excluir rutas de administración y endpoints de API
      filter: (page) =>
        !page.includes('/admin/') &&
        !page.includes('/api/'),
    }),
    icon({
      include: {
        tabler: [
          'address-book', 'alert-circle', 'apps', 'arrow-left', 'arrow-right', 'arrow-up-right', 'award',
          'baby-carriage', 'brand-facebook', 'brand-instagram', 'brand-linkedin', 'brand-whatsapp',
          'briefcase', 'building-bank', 'building-store', 'bulb', 'calculator', 'calendar-check',
          'calendar-event', 'candle', 'check', 'chevron-down', 'chevron-left', 'chevron-right',
          'circle-check', 'clipboard-check', 'clock', 'clock-hour-4', 'credit-card', 'device-mobile-dollar',
          'equal', 'eye', 'file-text', 'file-type-pdf', 'file-upload', 'headset',
          'heart', 'heart-handshake', 'help', 'help-hexagon', 'home', 'home-heart',
          'id-badge', 'info-circle', 'layout-dashboard', 'layout-grid', 'mail',
          'map-pin', 'menu-2', 'message-x', 'mood-empty', 'mood-happy', 'phone',
          'plane', 'receipt', 'scale', 'search',
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
      allowedHosts: ['fintegrar.com', 'www.fintegrar.com', 'coop-landing-page-production.up.railway.app'],
    },
    server: {
      allowedHosts: ['fintegrar.com', 'www.fintegrar.com', 'coop-landing-page-production.up.railway.app'],
    },
  },
});
