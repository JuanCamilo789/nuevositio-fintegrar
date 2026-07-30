import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import sanitizeHtml from 'sanitize-html';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '../../lib/adminSession';

export const prerender = false;

const ALLOWED_IDS = new Set([
  'politica-datos', 'privacidad', 'terminos', 'manual', 'sarlaft',
]);

// Allowlist calibrada al toolbar real del editor Quill (ver editar/[id].astro):
// encabezados h2/h3, negrita/itálica/subrayado/tachado, link, blockquote,
// bloque de código, listas ordenadas/con viñetas/alfabéticas.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h2', 'h3', 'p', 'br', 'strong', 'em', 'u', 's',
    'a', 'blockquote', 'pre', 'code', 'ol', 'ul', 'li', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    li: ['data-list'],
    span: ['class'],
    ol: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
};

const ALLOWED_DIR = path.resolve('./src/data/legales');

export const POST: APIRoute = async ({ request, cookies }) => {
  const sessionCookie = cookies.get(ADMIN_COOKIE_NAME)?.value;
  const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? '';

  if (!verifySessionToken(sessionCookie, ADMIN_SESSION_SECRET)) {
    return new Response(JSON.stringify({ message: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();
    const { id, content } = data;

    if (!id || content === undefined) {
      return new Response(JSON.stringify({ message: 'Faltan parámetros' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ALLOWED_IDS.has(id)) {
      return new Response(JSON.stringify({ message: 'ID no permitido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filePath = path.resolve(ALLOWED_DIR, `${id}.html`);
    if (!filePath.startsWith(ALLOWED_DIR + path.sep) && filePath !== ALLOWED_DIR) {
      return new Response(JSON.stringify({ message: 'Ruta no permitida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const clean = sanitizeHtml(String(content), SANITIZE_OPTIONS);
    fs.writeFileSync(filePath, clean, 'utf-8');

    return new Response(JSON.stringify({ message: 'Guardado correctamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error al guardar archivo legal');
    return new Response(JSON.stringify({ message: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
