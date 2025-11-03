// Netlify Functions (Node 18+)
// Holt die Ziel-URL aus target.txt und liefert deren Inhalt aus

import fs from "fs/promises";

export async function handler() {
  try {
    const target = (await fs.readFile("target.txt", "utf8")).trim();

    if (!/^https?:\/\//i.test(target)) {
      return { statusCode: 500, body: "Ungültige URL in target.txt" };
    }

    // Serverseitiger Abruf deiner Apps Script WebApp
    const resp = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0 (Netlify Proxy)" },
      redirect: "follow",
    });

    const body = await resp.text();
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
