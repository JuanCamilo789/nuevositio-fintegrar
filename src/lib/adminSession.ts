import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE_NAME = 'admin_lp';
export const ADMIN_COOKIE_PATH = '/admin/landing-page';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function base64UrlEncode(text: string): string {
  return Buffer.from(text, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecodeToString(text: string): string {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function sign(payload: string, secret: string): string {
  const digest = createHmac('sha256', secret).update(payload).digest('base64');
  return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

// Comparación en tiempo constante. Se hashea cada lado a un digest de longitud
// fija (SHA-256) antes de comparar, para que ni la longitud del valor filtre
// información por diferencias de tiempo (timing attack).
export function safeEqual(a: string, b: string, secret: string): boolean {
  const ha = createHmac('sha256', secret).update(a).digest();
  const hb = createHmac('sha256', secret).update(b).digest();
  return ha.length === hb.length && timingSafeEqual(ha, hb);
}

export function createSessionToken(username: string, secret: string): string {
  const exp = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${username}:${exp}`;
  return `${base64UrlEncode(payload)}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  let payload: string;
  try {
    payload = base64UrlDecodeToString(payloadB64);
  } catch {
    return false;
  }
  const expected = sign(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;
  const idx = payload.lastIndexOf(':');
  if (idx === -1) return false;
  const exp = Number(payload.slice(idx + 1));
  return Number.isFinite(exp) && exp > Date.now();
}
