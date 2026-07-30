import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '../../lib/adminSession';

export const prerender = false;

const BUCKET = 'normatividad';
const CATEGORIAS_PERMITIDAS = new Set([
  'Estatutos', 'Reglamentos', 'Políticas', 'Cumplimiento', 'Informes', 'Documentos Legales',
]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SUPABASE_URL =
  (import.meta.env.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '').trim().replace(/\/$/, '');
const SERVICE_ROLE_KEY =
  (import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
const ADMIN_SESSION_SECRET = import.meta.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? '';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!verifySessionToken(cookies.get(ADMIN_COOKIE_NAME)?.value, ADMIN_SESSION_SECRET)) {
    return jsonResponse({ error: 'No autorizado' }, 401);
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Configuración incompleta: falta SUPABASE_SERVICE_ROLE_KEY en el servidor.' }, 500);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const form = await request.formData();
    const action = String(form.get('action') || '');

    if (action === 'delete') {
      const id = String(form.get('id') || '');
      if (!UUID_RE.test(id)) return jsonResponse({ error: 'ID inválido' }, 400);

      const { error: delErr } = await admin.from('normatividad_docs').delete().eq('id', id);
      if (delErr) throw delErr;
      await admin.storage.from(BUCKET).remove([`${id}.pdf`]);
      return jsonResponse({ message: 'Documento eliminado' });
    }

    if (action === 'save') {
      const isEdit = String(form.get('isEdit') || '') === 'true';
      const idRaw = String(form.get('id') || '');
      const id = isEdit ? idRaw : crypto.randomUUID();
      if (isEdit && !UUID_RE.test(id)) return jsonResponse({ error: 'ID inválido' }, 400);

      const titulo = String(form.get('titulo') || '').trim();
      const categoria = String(form.get('categoria') || '');
      const fecha = String(form.get('fecha') || '');
      const descripcion = String(form.get('descripcion') || '').trim();

      if (!titulo) return jsonResponse({ error: 'El título es obligatorio' }, 400);
      if (!CATEGORIAS_PERMITIDAS.has(categoria)) return jsonResponse({ error: 'Categoría inválida' }, 400);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return jsonResponse({ error: 'Fecha inválida' }, 400);

      let url: string | undefined;
      const file = form.get('file');
      if (file instanceof File && file.size > 0) {
        if (file.type !== 'application/pdf') return jsonResponse({ error: 'Solo se permiten archivos PDF' }, 400);
        if (file.size > 10 * 1024 * 1024) return jsonResponse({ error: 'El archivo supera 10 MB' }, 400);

        const buffer = new Uint8Array(await file.arrayBuffer());
        const { error: upErr } = await admin.storage
          .from(BUCKET)
          .upload(`${id}.pdf`, buffer, { upsert: true, contentType: 'application/pdf' });
        if (upErr) throw upErr;

        const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(`${id}.pdf`);
        url = urlData.publicUrl;
      }

      const payload: Record<string, unknown> = {
        titulo, categoria, fecha, descripcion, activo: true,
        ...(url ? { url } : {}),
      };

      if (isEdit) {
        const { error: dbErr } = await admin.from('normatividad_docs').update(payload).eq('id', id);
        if (dbErr) throw dbErr;
      } else {
        const { error: dbErr } = await admin.from('normatividad_docs').insert({ id, ...payload, orden: 99 });
        if (dbErr) throw dbErr;
      }

      return jsonResponse({ message: isEdit ? 'Documento actualizado' : 'Documento creado', id });
    }

    return jsonResponse({ error: 'Acción no reconocida' }, 400);
  } catch (err) {
    console.error('Error en admin-normatividad');
    return jsonResponse({ error: err instanceof Error ? err.message : 'Error interno del servidor' }, 500);
  }
};
