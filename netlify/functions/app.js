// Netlify Functions: Node 18 hat fetch bereits eingebaut
import fs from "fs/promises";

export async function handler() {
  try {
    const target = (await fs.readFile("target.txt", "utf8")).trim();
    if (!/^https?:\/\//i.test(target)) {
      return { statusCode: 500, body: "Ungültige URL in target.txt" };
    }

    // Holt die Apps-Script-Seite serverseitig
    const resp = await fetch(target, {
      // Unauffälliger UA; du kannst ihn auch weglassen
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });

    const body = await resp.text();

    // Content-Type so gut es geht durchreichen, sonst HTML
    const ct = resp.headers.get("content-type") || "text/html; charset=utf-8";

    return {
      statusCode: resp.status,
      headers: {
        "content-type": ct,
        "cache-control": "no-store",
      },
      body,
    };
  } catch (e) {
    return { statusCode: 500, body: "Proxy-Fehler: " + e.message };
  }
}
