/* Servidor local para ver la invitación en tu computador.
   Uso:  npm run dev     →  http://localhost:3000
   Solo usa Node, no descarga nada. Las rutas /api/* se responden
   igual que en Vercel para que puedas probar el formulario completo. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT || 3000);

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".woff2": "font/woff2", ".woff": "font/woff", ".mp3": "audio/mpeg", ".ogg": "audio/ogg",
  ".mp4": "video/mp4", ".webm": "video/webm", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json",
  ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8",
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let path = decodeURIComponent(url.pathname);

  // Rutas de la API: las mismas funciones que corren en Vercel
  if (path.startsWith("/api/")) {
    const name = path.slice(5).replace(/\/$/, "");
    if (!/^[a-z-]+$/.test(name)) { res.writeHead(404).end("No encontrado"); return; }
    try {
      const chunks = []; for await (const c of req) chunks.push(c);
      req.body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString() || "{}") : {};
      const mod = await import(`./api/${name}.js?t=${Date.now()}`);   // recarga en caliente
      await mod.default(req, res);
    } catch (e) {
      console.error(`[api/${name}]`, e.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Error en la función local." }));
    }
    return;
  }

  if (path === "/") path = "/index.html";
  if (path === "/admin") path = "/admin.html";                        // igual que cleanUrls en Vercel

  const file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ""));
  if (!file.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) { res.writeHead(403).end("Prohibido"); return; }

  try {
    const info = await stat(file);
    if (info.isDirectory()) throw new Error("directorio");
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-cache",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end('<meta charset="utf-8"><p style="font:16px system-ui;padding:40px">No se encontró el archivo.</p>');
  }
}).listen(PORT, () => {
  console.log(`\n  ✦ Invitación de Kishany\n`);
  console.log(`    Invitación   http://localhost:${PORT}`);
  console.log(`    Panel        http://localhost:${PORT}/admin\n`);
  console.log(`    Para guardar las confirmaciones, crea un archivo .env.local`);
  console.log(`    con SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y ADMIN_PASSWORD,`);
  console.log(`    y arranca con:  node --env-file=.env.local server.js\n`);
  console.log(`    Detener: Ctrl + C\n`);
});
