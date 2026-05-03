import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

const ALLOWED_IDS = new Set([
  'politica-datos', 'privacidad', 'terminos', 'manual', 'sarlaft',
]);

const ALLOWED_DIR = path.resolve('./src/data/legales');

export const POST: APIRoute = async ({ request, cookies }) => {
  const sessionCookie = cookies.get('admin_lp')?.value;
  const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? '';

  function base64UrlDecodeToString(text: string): string {
    const padded = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=');
    return Buffer.from(padded, 'base64').toString('utf8');
  }

  async function sign(payload: string): Promise<string> {
    const { createHmac } = await import('node:crypto');
    const digest = createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest('base64');
    return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  async function verifySessionToken(token: string | undefined): Promise<boolean> {
    if (!token || !ADMIN_SESSION_SECRET) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, sig] = parts;
    try {
      const payload = base64UrlDecodeToString(payloadB64);
      const expected = await sign(payload);
      return sig === expected;
    } catch { return false; }
  }

  if (!(await verifySessionToken(sessionCookie))) {
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

    fs.writeFileSync(filePath, content, 'utf-8');

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
