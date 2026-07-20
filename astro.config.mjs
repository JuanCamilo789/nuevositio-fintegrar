import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cooperamigo.coop',
  output: 'server',
  security: {
    checkOrigin: false,
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
        !page.includes('/legales/admin/') &&
        !page.includes('/api/'),
    }),
    icon({
      include: {
        tabler: [
          'address-book', 'alert-circle', 'arrow-left', 'arrow-right', 'award',
          'baby-carriage', 'brand-facebook', 'brand-instagram', 'brand-linkedin', 'brand-whatsapp',
          'building-bank', 'building-store', 'bulb', 'calculator', 'calendar-check',
          'calendar-event', 'candle', 'check', 'chevron-down', 'chevron-left', 'chevron-right',
          'circle-check', 'clock', 'clock-hour-4', 'credit-card', 'device-mobile-dollar',
          'equal', 'eye', 'file-text', 'file-type-pdf', 'file-upload', 'headset',
          'heart', 'heart-handshake', 'help', 'help-hexagon', 'home', 'home-heart',
          'id-badge', 'layout-dashboard', 'mail',
          'map-pin', 'menu-2', 'message-x', 'mood-happy', 'phone',
          'plane', 'receipt', 'scale',
          'school', 'send', 'shield-check', 'stethoscope', 'target', 'trending-up',
          'upload', 'user', 'user-plus', 'users', 'users-group', 'wallet', 'x', 'refresh'
        ],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    preview: {
      allowedHosts: ['cooperamigo.coop', 'www.cooperamigo.coop', 'coop-landing-page-production.up.railway.app'],
    },
    server: {
      allowedHosts: ['cooperamigo.coop', 'www.cooperamigo.coop', 'coop-landing-page-production.up.railway.app'],
    },
  },
});
