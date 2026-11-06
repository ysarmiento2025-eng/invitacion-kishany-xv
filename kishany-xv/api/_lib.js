// Utilidades compartidas por las funciones de Vercel (los archivos que empiezan con "_" no son rutas).
import crypto from "node:crypto";

export const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const configured = () => Boolean(SUPABASE_URL && SUPABASE_KEY);

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

// Llamada a la API REST de Supabase con la clave de servicio (solo en el servidor).
export async function sb(path, { method = "GET", body, prefer } = {}) {
  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!r.ok) { const err = new Error(`Supabase ${r.status}: ${text.slice(0, 300)}`); err.status = r.status; throw err; }
  return data;
}

// Límite simple de peticiones por IP y por ruta (por instancia de la función).
const hits = new Map();
export function rateLimited(req, max = 8, windowMs = 60_000, bucket = "") {
  const key = clientIp(req) + "|" + (bucket || req.url || ""), now = Date.now();
  const list = (hits.get(key) || []).filter(t => now - t < windowMs);
  list.push(now); hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

export function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
}
export function ipHash(req) {
  return crypto.createHash("sha256").update(clientIp(req) + (process.env.ADMIN_PASSWORD || "kxv")).digest("hex").slice(0, 16);
}

export function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}

export const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
export const normalizeKey = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ ]/g, "").replace(/\s+/g, " ").trim();

// Señales de bot: campo trampa lleno o envío en menos de 1,5 s.
export const looksLikeBot = b => Boolean(b.website) || (typeof b.elapsedMs === "number" && b.elapsedMs < 1500);

export function checkAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD || "";
  const given = String(req.headers["x-admin-key"] || "");
  if (!expected || given.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}
