const SITE_URL = Deno.env.get("SITE_URL") ?? "https://cooperamigo.coop";

export interface BuildEmailOptions {
  label: string;
  bodyHtml: string;
}

export function buildEmail({ label, bodyHtml }: BuildEmailOptions): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Cooperamigó</title>
  <style type="text/css">
    body,table,td { margin:0; padding:0; }
    img { border:0; display:block; }
    @media only screen and (max-width:600px) {
      .wrap    { width:100% !important; }
      .pad     { padding-left:20px !important; padding-right:20px !important; }
      .em-big  { font-size:20px !important; }
      .ft-pad  { padding-right:16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#F0F2F5;-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0F2F5;padding:20px 0;">
<tr><td align="center" style="padding:0 12px;">
<table class="wrap" width="540" cellpadding="0" cellspacing="0" border="0" style="width:540px;max-width:100%;">

  <tr>
    <td class="pad" style="background:#ffffff;padding:20px 28px 0;border-radius:10px 10px 0 0;border:1px solid #E4E8ED;border-bottom:none;">
      <img
        src="${SITE_URL}/assets/img/logo-menu.svg"
        alt="Cooperamigó"
        height="26"
        style="height:26px;width:auto;"
      />
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
        <tr><td style="height:1px;background:#E4E8ED;font-size:1px;line-height:1px;">&nbsp;</td></tr>
      </table>
      <p style="text-align:right;margin:7px 0 0;font-size:10px;font-weight:600;letter-spacing:0.05em;color:#9CA3AF;font-family:Arial,Helvetica,sans-serif;">${label}</p>
    </td>
  </tr>

  <tr>
    <td class="pad" style="background:#ffffff;padding:22px 28px 28px;border-left:1px solid #E4E8ED;border-right:1px solid #E4E8ED;">
      ${bodyHtml}
    </td>
  </tr>

  <tr>
    <td style="background:#172B36;border-radius:0 0 10px 10px;padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>

          <td width="40" style="padding:0;vertical-align:middle;border-right:1px solid rgba(255,255,255,0.08);">
            <table cellpadding="0" cellspacing="0" border="0" width="40">
              <tr><td style="height:22px;"></td></tr>
              <tr>
                <td style="text-align:center;padding:5px 0;">
                  <div style="writing-mode:sideways-lr;display:inline-block;border-left:1.5px solid rgba(255,255,255,0.45);border-right:1.5px solid rgba(255,255,255,0.45);padding:0 1px;">
                    <span style="font-size:8px;font-weight:800;letter-spacing:0.18em;color:rgba(255,255,255,0.5);font-family:Arial,Helvetica,sans-serif;">VIGILADA</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="text-align:center;padding:4px 0 0;">
                  <div style="writing-mode:sideways-lr;display:inline-block;">
                    <span style="font-size:8px;font-weight:400;letter-spacing:0.06em;color:rgba(255,255,255,0.4);font-family:Arial,Helvetica,sans-serif;">SUPERSOLIDARIA</span>
                  </div>
                </td>
              </tr>
              <tr><td style="height:22px;"></td></tr>
            </table>
          </td>

          <td class="ft-pad" style="padding:20px 24px 20px 16px;vertical-align:middle;">
            <p style="color:rgba(255,255,255,0.8);font-size:11px;font-weight:700;margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;">Cooperamigó</p>
            <p style="color:rgba(255,255,255,0.35);font-size:10px;margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;">Cooperativa Multiactiva Luis Amigó</p>
            <p style="color:rgba(255,255,255,0.4);font-size:10px;line-height:1.6;margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;">Este mensaje ha sido generado automáticamente. Por favor, no responda a este correo. Si requiere asistencia, puede contactarnos a través de nuestros canales oficiales de atención.</p>
            <p style="color:rgba(255,255,255,0.25);font-size:9px;margin:0;font-family:Arial,Helvetica,sans-serif;">© 2026 Cooperamigó. Todos los derechos reservados.</p>
          </td>

        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}
