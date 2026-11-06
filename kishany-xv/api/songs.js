// GET  /api/songs — lista pública de canciones sugeridas (solo título y nombre de pila).
// POST /api/songs — agrega una canción. Si ya existe, suma un voto en lugar de duplicarla.
import { send, sb, configured, rateLimited, readBody, clean, normalizeKey, looksLikeBot, ipHash } from "./_lib.js";

const ALLOWED = /(^|\.)(spotify\.com|spotify\.link|youtube\.com|youtu\.be|music\.apple\.com|deezer\.com|soundcloud\.com)$/i;

async function publicList() {
  const rows = await sb("songs?select=song,guest_name,votes&order=created_at.desc&limit=40");
  return (rows || []).map(r => ({ song: r.song, by: (r.guest_name || "").split(" ")[0], votes: r.votes }));
}

export default async function handler(req, res) {
  if (!configured()) return send(res, 503, { error: "La base de datos aún no está configurada." });

  if (req.method === "GET") {
    try { return send(res, 200, { songs: await publicList() }); }
    catch (e) { console.error(e); return send(res, 502, { error: "No pudimos cargar la lista." }); }
  }
  if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return send(res, 405, { error: "Método no permitido" }); }
  if (rateLimited(req, 5, 60000, "songs")) return send(res, 429, { error: "Espera un momento antes de sugerir otra canción." });

  const b = readBody(req);
  if (looksLikeBot(b)) return send(res, 200, { ok: true });

  const song = clean(b.song, 120), by = clean(b.by, 60);
  let link = clean(b.link, 300);
  if (link) { try { const u = new URL(link); if (u.protocol !== "https:" || !ALLOWED.test(u.hostname)) throw 0; } catch { return send(res, 400, { error: "El enlace debe ser de Spotify, YouTube, Apple Music, Deezer o SoundCloud." }); } }
  if (song.length < 2 && !link) return send(res, 400, { error: "Escribe el nombre de la canción." });

  const key = normalizeKey(link || song);
  try {
    const existing = await sb(`songs?song_key=eq.${encodeURIComponent(key)}&select=id,votes`);
    if (existing && existing.length) {
      await sb(`songs?id=eq.${existing[0].id}`, { method: "PATCH", body: { votes: (existing[0].votes || 1) + 1 }, prefer: "return=minimal" });
      return send(res, 200, { ok: true, duplicate: true, songs: await publicList() });
    }
    await sb("songs", { method: "POST", body: { song, song_key: key, link, guest_name: by, votes: 1, ip_hash: ipHash(req) }, prefer: "return=minimal" });
    return send(res, 200, { ok: true, songs: await publicList() });
  } catch (e) {
    console.error(e);
    return send(res, 502, { error: "No pudimos guardar tu canción. Inténtalo de nuevo." });
  }
}
