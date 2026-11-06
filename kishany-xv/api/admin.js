// GET /api/admin — datos completos para el panel de organizadores.
// Requiere el encabezado x-admin-key con el valor de ADMIN_PASSWORD.
import { send, sb, configured, checkAdmin, rateLimited } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return send(res, 405, { error: "Método no permitido" }); }
  if (rateLimited(req, 20, 60000, "admin")) return send(res, 429, { error: "Demasiados intentos." });
  if (!process.env.ADMIN_PASSWORD) return send(res, 503, { error: "Falta configurar ADMIN_PASSWORD en Vercel." });
  if (!checkAdmin(req)) return send(res, 401, { error: "Contraseña incorrecta." });
  if (!configured()) return send(res, 503, { error: "Falta configurar Supabase en Vercel." });
  try {
    const [rsvps, songs] = await Promise.all([
      sb("rsvps?select=name,attending,companions,companion_names,phone,diet,message,created_at,updated_at&order=updated_at.desc"),
      sb("songs?select=song,link,guest_name,votes,created_at&order=votes.desc,created_at.desc"),
    ]);
    return send(res, 200, { rsvps, songs });
  } catch (e) {
    console.error(e);
    return send(res, 502, { error: "No pudimos leer la base de datos." });
  }
}
