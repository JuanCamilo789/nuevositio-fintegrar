import type { MiddlewareHandler } from 'astro';

// Headers de seguridad aplicados a todas las respuestas del sitio (SSR/Node).
//
// La CSP está calibrada para permitir exactamente los orígenes externos que
// el sitio usa hoy, sin romper nada:
//   - Supabase (API, realtime wss y Storage de PDFs/adjuntos)
//   - cdn.jsdelivr.net → editor Quill y supabase-js (paneles de administración)
//   - placehold.co     → imágenes placeholder de Novedades
//   - www.zonapagos.net → formulario de pago (PSE) enlazado desde el sitio
//
// 'unsafe-inline' en script/style es necesario porque el sitio (y la
// hidratación de Astro) usan estilos y scripts en línea. Aun así, el resto de
// directivas (frame-ancestors, object-src, base-uri) y los demás headers
// (HSTS, nosniff, referrer, permissions) dan una capa sólida de protección.
const SUPABASE = 'https://*.supabase.co';
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://static.cloudflareinsights.com`,
  `style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net`,
  `img-src 'self' data: blob: https://placehold.co ${SUPABASE}`,
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE} wss://*.supabase.co https://cdn.jsdelivr.net https://static.cloudflareinsights.com`,
  `frame-src 'self' ${SUPABASE}`,
  "form-action 'self' https://www.zonapagos.net",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

export const onRequest: MiddlewareHandler = async (_context, next) => {
  const response = await next();

  // No sobreescribir respuestas de assets estáticos servidos sin cuerpo mutable
  const headers = response.headers;

  headers.set('Content-Security-Policy', CSP);
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  // 2 años + preload; el sitio se sirve solo por HTTPS en Railway
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  return response;
};
