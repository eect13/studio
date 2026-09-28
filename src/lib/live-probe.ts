/** Hosts Eric actually publishes. A name ending in -eect13.vercel.app is not proof. */
const OWNED_HOSTS = new Set([
  "atrium-swart-seven.vercel.app",
  "courtwire.netlify.app",
  "font-manager-eta.vercel.app",
  "finance-manager-phi-self.vercel.app",
  "eect13.netlify.app",
]);

export function isOwnedHost(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return OWNED_HOSTS.has(host);
  } catch {
    return false;
  }
}

function titleIn(html: string) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1].trim();
}

export async function probe(url: string, expect: string): Promise<{ status: "up" | "down" | "unknown"; head: string }> {
  if (!isOwnedHost(url)) return { status: "unknown", head: "" };
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
      headers: { "user-agent": "eric-emerson-studio" },
    });
    if (res.status === 404 || res.status >= 500) return { status: "down", head: "" };
    if (res.url.includes("vercel.com/login") || res.url.includes("vercel.com/sso")) return { status: "down", head: "" };
    const head = await readHead(res, 8000);
    const hay = head.toLowerCase();
    if (hay.includes("vercel.com/login") || hay.includes("deployment is protected")) return { status: "down", head };
    return { status: titleIn(head) === expect ? "up" : "down", head };
  } catch {
    return { status: "unknown", head: "" };
  }
}

async function readHead(res: Response, max: number) {
  const reader = res.body?.getReader();
  if (!reader) return (await res.text()).slice(0, max);
  const dec = new TextDecoder();
  let out = "";
  while (out.length < max) {
    const { done, value } = await reader.read();
    if (done) break;
    out += dec.decode(value, { stream: true });
  }
  reader.cancel().catch(() => {});
  return out;
}
