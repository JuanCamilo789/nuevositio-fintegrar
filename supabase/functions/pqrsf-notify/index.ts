// ══════════════════════════════════════════════════
//  FINTEGRAR — Edge Function: pqrsf-notify
//  Envía correos de confirmación cuando llega una PQRSF
//
//  Despliegue:
//    supabase functions deploy pqrsf-notify
//
//  Secretos necesarios (supabase secrets set):
//    RESEND_API_KEY   → tu API key de https://resend.com
//    SITE_URL         → URL base (default: https://fintegrar.com)
//
//  Webhook en Supabase:
//    Database → Webhooks → New webhook
//    Table: pqrsf | Event: INSERT
//    URL: https://<proyecto>.supabase.co/functions/v1/pqrsf-notify
// ══════════════════════════════════════════════════

import { buildEmail } from "../_shared/email-template.ts";

// ── Escapar caracteres HTML para prevenir XSS en los correos ────────────
function esc(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Validar que una URL sea HTTPS (para archivo adjunto) ─────────────────
function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
// NOTA: no-reply@fintegrar.com debe estar verificado como dominio en Resend antes de desplegar.
const FROM_EMAIL     = "Fondo de Empleados Fintegrar <no-reply@fintegrar.com>";
const ADMIN_EMAIL    = "gerencia@fintegrar.com";

const TIPO_LABEL: Record<string, string> = {
  peticion:     "Petición",
  queja:        "Queja",
  reclamo:      "Reclamo",
  sugerencia:   "Sugerencia",
  felicitacion: "Felicitación",
};

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    console.error("Resend error:", await res.text());
  }
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const r = payload.record; // fila insertada

    const tipoLabel = esc(TIPO_LABEL[r.tipo] ?? r.tipo);
    const fecha = new Date(r.created_at).toLocaleString("es-CO", {
      timeZone: "America/Bogota",
      dateStyle: "long",
      timeStyle: "short",
    });

    // Campos de usuario escapados
    const nombre    = esc(r.nombre);
    const radicado  = esc(r.radicado);
    const asunto    = esc(r.asunto);
    const tipoDocumento = esc(r.tipo_documento);
    const documento = esc(r.documento);
    const emailEsc  = esc(r.email);
    const telefono  = r.telefono ? esc(r.telefono) : "—";
    const mensaje   = esc(r.mensaje);
    const archivoUrl = safeUrl(r.archivo_url);

    // ── Cuerpo: correo al ciudadano ─────────────────
    const ciudadanoBody = `
      <p style="font-size:13px;color:#172B36;margin:0 0 5px;font-family:Arial,Helvetica,sans-serif;">
        Estimado(a) <strong>${nombre}</strong>,
      </p>
      <p style="font-size:13px;color:#4B5563;line-height:1.6;margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;">
        Hemos recibido su <strong style="color:#172B36;">${tipoLabel}</strong> de manera exitosa.
        Le responderemos al correo registrado en los tiempos estipulados.
      </p>

      <!-- Radicado -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
          <td style="background:#172B36;border-radius:8px;padding:16px 20px;text-align:center;">
            <p style="color:rgba(255,255,255,0.5);font-size:9px;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 5px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">
              Número de radicado
            </p>
            <p class="em-big" style="color:#FFC801;font-size:22px;font-weight:800;letter-spacing:0.05em;margin:0;font-family:Arial,Helvetica,sans-serif;">
              ${radicado}
            </p>
          </td>
        </tr>
      </table>

      <!-- Detalle -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td width="38%" style="padding:9px 0;font-size:11px;color:#6B7280;border-bottom:1px solid #F1F5F9;font-family:Arial,Helvetica,sans-serif;">Tipo de solicitud</td>
          <td style="padding:9px 0;font-size:11px;color:#172B36;font-weight:700;border-bottom:1px solid #F1F5F9;font-family:Arial,Helvetica,sans-serif;">${tipoLabel}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;font-size:11px;color:#6B7280;border-bottom:1px solid #F1F5F9;font-family:Arial,Helvetica,sans-serif;">Asunto</td>
          <td style="padding:9px 0;font-size:11px;color:#172B36;font-weight:600;border-bottom:1px solid #F1F5F9;font-family:Arial,Helvetica,sans-serif;">${asunto}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;font-size:11px;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">Fecha</td>
          <td style="padding:9px 0;font-size:11px;color:#172B36;font-weight:600;font-family:Arial,Helvetica,sans-serif;">${fecha}</td>
        </tr>
      </table>

      <p style="font-size:11px;color:#9CA3AF;line-height:1.6;margin:0;font-family:Arial,Helvetica,sans-serif;">
        Dudas: <a href="mailto:gerencia@fintegrar.com" style="color:#172B36;font-weight:600;text-decoration:none;">gerencia@fintegrar.com</a>
        — cite su número de radicado.
      </p>
    `;

    // ── Cuerpo: notificación interna ────────────────
    const adminBody = `
      <p style="font-size:11px;color:#9CA3AF;letter-spacing:0.05em;text-transform:uppercase;font-weight:600;margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;">
        Nuevo radicado
      </p>
      <p class="em-big" style="font-size:22px;font-weight:800;color:#172B36;letter-spacing:0.03em;margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;">
        ${radicado}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
        <tr><td style="height:1px;background:#F1F5F9;font-size:1px;line-height:1px;">&nbsp;</td></tr>
      </table>

      <!-- Campos -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:12px;">
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:9px 0;color:#6B7280;width:38%;font-family:Arial,Helvetica,sans-serif;">Tipo</td>
          <td style="padding:9px 0;color:#172B36;font-weight:700;font-family:Arial,Helvetica,sans-serif;">${tipoLabel}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:9px 0;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">Nombre</td>
          <td style="padding:9px 0;color:#172B36;font-weight:600;font-family:Arial,Helvetica,sans-serif;">${nombre}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:9px 0;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">Documento</td>
          <td style="padding:9px 0;color:#172B36;font-family:Arial,Helvetica,sans-serif;">${tipoDocumento} ${documento}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:9px 0;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">Correo</td>
          <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;">
            <a href="mailto:${emailEsc}" style="color:#172B36;text-decoration:none;">${emailEsc}</a>
          </td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:9px 0;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">Teléfono</td>
          <td style="padding:9px 0;color:#172B36;font-family:Arial,Helvetica,sans-serif;">${telefono}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:9px 0;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">Asunto</td>
          <td style="padding:9px 0;color:#172B36;font-weight:600;font-family:Arial,Helvetica,sans-serif;">${asunto}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:9px 0;color:#6B7280;vertical-align:top;font-family:Arial,Helvetica,sans-serif;">Mensaje</td>
          <td style="padding:9px 0;color:#172B36;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${mensaje}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">Fecha</td>
          <td style="padding:9px 0;color:#172B36;font-family:Arial,Helvetica,sans-serif;">${fecha}</td>
        </tr>
      </table>

      ${archivoUrl
        ? `<p style="margin-top:16px;font-size:12px;font-family:Arial,Helvetica,sans-serif;">
             <a href="${archivoUrl}" style="color:#172B36;font-weight:600;text-decoration:none;">Ver archivo adjunto →</a>
           </p>`
        : ""}
    `;

    // ── Enviar correos ──────────────────────────────
    await sendEmail(
      r.email,
      `FINTEGRAR — Radicado ${r.radicado} recibido`,
      buildEmail({ label: "Radicación Pqrsf", bodyHtml: ciudadanoBody }),
    );

    await sendEmail(
      ADMIN_EMAIL,
      `Nueva PQRSF — ${tipoLabel} | Radicado ${r.radicado}`,
      buildEmail({ label: "notificación interna", bodyHtml: adminBody }),
    );

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("pqrsf-notify error:", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
