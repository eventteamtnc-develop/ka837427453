// Holt target.txt von der eigenen Netlify-Site (statisch) und proxyt dann die Ziel-URL

export async function handler(event) {
  try {
    // Basis-URL der aktuellen Site ermitteln
    const proto = event.headers["x-forwarded-proto"] || "https";
    const host = event.headers.host;
    const base = `${proto}://${host}`;

    // target.txt als statische Datei laden (liegt im Repo-Root / Publish-Root)
    const tResp = await fetch(`${base}/target.txt`, { cache: "no-store" });
    if (!tResp.ok) {
      return { statusCode: 500, body: "target.txt nicht gefunden (HTTP " + tResp.status + ")" };
    }
    const target = (await tResp.text()).trim();
    try { new URL(target); } catch { return { statusCode: 500, body: "Ungültige URL in target.txt" }; }

    // Ziel-URL serverseitig abrufen
    const resp = await fetch(target, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (Netlify Proxy)" } });
    const body = await resp.text();
    const ct = resp.headers.get("content-type") || "text/html; charset=utf-8";

    return {
      statusCode: resp.status,
      headers: { "content-type": ct, "cache-control": "no-store" },
      body
    };
  } catch (e) {
    return { statusCode: 500, body: "Proxy-Fehler: " + e.message };
  }
}
