// POST /api/rsvp — guarda o actualiza una confirmación de asistencia.
// Control de duplicados: una respuesta por nombre (normalizado). Si la misma persona
// vuelve a confirmar, se actualiza su registro en lugar de crear otro.
import { send, sb, configured, rateLimited, readBody, clean, normalizeKey, looksLikeBot, ipHash } from "./_lib.js";

const MAX_COMPANIONS = Number(process.env.MAX_COMPANIONS || 2);

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, { error: "Método no permitido" }); }
  if (!configured()) return send(res, 503, { error: "La base de datos aún no está configurada." });
  if (rateLimited(req, 6, 60000, "rsvp")) return send(res, 429, { error: "Demasiados intentos. Espera un minuto." });

  const b = readBody(req);
  if (looksLikeBot(b)) return send(res, 200, { ok: true, status: "created" }); // respuesta silenciosa al bot

  const name = clean(b.name, 80);
  const attending = b.attending === true;
  const companions = attending ? Math.max(0, Math.min(MAX_COMPANIONS, parseInt(b.companions, 10) || 0)) : 0;
  const phone = clean(b.phone, 20).replace(/[^\d+]/g, "");
  if (name.length < 5 || name.split(" ").length < 2) return send(res, 400, { error: "Escribe tu nombre y apellido." });
  if (typeof b.attending !== "boolean") return send(res, 400, { error: "Indica si asistirás." });
  if (phone && (phone.replace(/\D/g, "").length < 7 || phone.replace(/\D/g, "").length > 15)) return send(res, 400, { error: "Revisa el número de celular." });

  const row = {
    name, name_key: normalizeKey(name), attending, companions,
    companion_names: attending ? clean(b.companionNames, 160) : "",
    phone, diet: attending ? clean(b.diet, 120) : "", message: clean(b.message, 400),
    ip_hash: ipHash(req), updated_at: new Date().toISOString(),
  };

  try {
    const existing = await sb(`rsvps?name_key=eq.${encodeURIComponent(row.name_key)}&select=id`);
    await sb("rsvps?on_conflict=name_key", { method: "POST", body: row, prefer: "resolution=merge-duplicates,return=minimal" });
    return send(res, 200, { ok: true, status: existing && existing.length ? "updated" : "created" });
  } catch (e) {
    console.error(e);
    return send(res, 502, { error: "No pudimos guardar tu respuesta. Inténtalo de nuevo." });
  }
}
