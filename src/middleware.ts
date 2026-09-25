import type { MiddlewareHandler } from 'astro';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

// ─── Headers de seguridad ────────────────────────────────────────────────────
//
// La CSP permite solo los orígenes externos que el sitio usa hoy
// (Cloudflare Insights). El botón de pagos (zonapagos.net) es un enlace normal
// y no requiere permiso aquí; si se agrega un formulario que envíe datos a un
// servicio externo, hay que permitir su origen en form-action.
//
// 'unsafe-inline' en script/style es necesario porque el sitio (y la
// hidratación de Astro) usan estilos y scripts en línea. Aun así, el resto de
// directivas (frame-ancestors, object-src, base-uri) y los demás headers
// (HSTS, nosniff, referrer, permissions) dan una capa sólida de protección.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  "font-src 'self' data:",
  `connect-src 'self' https://static.cloudflareinsights.com`,
  "form-action 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CSP,
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  // 2 años + preload; el sitio se sirve solo por HTTPS
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

// ─── Caché de páginas en memoria (protege al servidor bajo mucho tráfico) ────
//
// Las páginas del sitio son iguales para todos los visitantes, así que se
// renderizan una vez y se sirven desde memoria durante TTL_MS:
//   - Mil visitantes simultáneos a la misma página = 1 render, no 1.000.
//   - Las peticiones concurrentes a una página aún no cacheada comparten el mismo render.
//   - La respuesta se guarda ya comprimida (brotli/gzip) para ahorrar CPU y ancho de banda.
// Solo se cachean respuestas 200 de HTML por GET, y la clave es solo la ruta (sin
// query string), para que nadie pueda llenar la memoria inventando URLs.
// Si alguna página pasa a depender del usuario (sesión, cookies), hay que excluirla aquí.
const TTL_MS = 60_000;
const MAX_ENTRADAS = 200;
const MAX_BYTES_PAGINA = 2 * 1024 * 1024;

const CACHE_CONTROL = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

interface Entrada {
  expira: number;
  headers: [string, string][];
  raw: Buffer;
  br?: Buffer;
  gzip?: Buffer;
}

const cache = new Map<string, Entrada>();
const enCurso = new Map<string, Promise<Entrada | null>>();

function comprimir(e: Entrada, aceptado: string): { body: Buffer; encoding?: 'br' | 'gzip' } {
  if (aceptado.includes('br')) {
    e.br ??= brotliCompressSync(e.raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } });
    return { body: e.br, encoding: 'br' };
  }
  if (aceptado.includes('gzip')) {
    e.gzip ??= gzipSync(e.raw, { level: 6 });
    return { body: e.gzip, encoding: 'gzip' };
  }
  return { body: e.raw };
}

function responder(e: Entrada, aceptado: string): Response {
  const { body, encoding } = comprimir(e, aceptado);
  const headers = new Headers(e.headers);
  headers.set('Content-Length', String(body.length));
  if (encoding) headers.set('Content-Encoding', encoding);
  return new Response(new Uint8Array(body), { status: 200, headers });
}

function aplicarHeaders(headers: Headers) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  // El sitio no usa cookies ni sesiones, así que un header Cookie no debe saltarse la caché
  // (si no, cualquiera podría forzar un render por petición solo enviándolo).
  const cacheable = import.meta.env.PROD && context.request.method === 'GET';

  if (!cacheable) {
    const response = await next();
    aplicarHeaders(response.headers);
    return response;
  }

  const clave = context.url.pathname;
  const aceptado = context.request.headers.get('accept-encoding') ?? '';

  const guardada = cache.get(clave);
  if (guardada && guardada.expira > Date.now()) return responder(guardada, aceptado);

  // Otro visitante ya está generando esta página: esperar su resultado en lugar de renderizarla de nuevo.
  const pendiente = enCurso.get(clave);
  if (pendiente) {
    const entrada = await pendiente;
    if (entrada) return responder(entrada, aceptado);
    const response = await next(); // no era cacheable (redirección, 404...): cada quien obtiene la suya
    aplicarHeaders(response.headers);
    return response;
  }

  let noCacheable: Response | null = null;
  const render = (async (): Promise<Entrada | null> => {
    const response = await next();
    const esHtml = (response.headers.get('content-type') ?? '').includes('text/html');
    if (response.status !== 200 || !esHtml) {
      aplicarHeaders(response.headers);
      noCacheable = response;
      return null;
    }
    const raw = Buffer.from(await response.arrayBuffer());
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    headers.set('Cache-Control', CACHE_CONTROL);
    headers.set('Vary', 'Accept-Encoding');
    aplicarHeaders(headers);
    const entrada: Entrada = { expira: Date.now() + TTL_MS, headers: [...headers.entries()], raw };
    if (raw.length <= MAX_BYTES_PAGINA) {
      if (cache.size >= MAX_ENTRADAS) cache.delete(cache.keys().next().value!);
      cache.set(clave, entrada);
    }
    return entrada;
  })().finally(() => enCurso.delete(clave));
  enCurso.set(clave, render);

  const entrada = await render;
  return entrada ? responder(entrada, aceptado) : noCacheable!;
};
