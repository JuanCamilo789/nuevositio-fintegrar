// ══════════════════════════════════════════════════
//  FINTEGRAR — Edge Function: ip-hash
//  Devuelve un hash SHA-256 de la IP real del cliente, para dejar rastro de
//  auditoría en solicitudes públicas (actualización de datos, etc.) sin
//  guardar la IP en claro. Se calcula server-side porque el navegador no
//  puede reportar su propia IP pública de forma confiable (un cliente
//  malicioso podría mentir si el hash se calculara en el front).
//
//  Despliegue:
//    supabase functions deploy ip-hash --no-verify-jwt
// ══════════════════════════════════════════════════

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const ip_hash = await sha256Hex(ip);

  return new Response(JSON.stringify({ ip_hash }), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
