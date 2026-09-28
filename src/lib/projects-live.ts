import { createServerFn } from "@tanstack/react-start";
import { isOwnedHost, probe } from "@/lib/live-probe";
import { PROJECT_SEEDS, seedCard, type ProjectCard, type ProjectSeed } from "@/lib/projects";

const TTL_MS = 10 * 60 * 1000;

type RefreshResult = { cards: ProjectCard[]; synced: boolean };

let cache: { at: number; result: RefreshResult } | null = null;

export const refreshProjects = createServerFn({ method: "POST" }).handler(async (): Promise<RefreshResult> => {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.result;

  const rows = await Promise.all(PROJECT_SEEDS.map(refreshOne));
  const result: RefreshResult = {
    cards: rows.map((row) => row.card),
    synced: rows.some((row) => row.fromGithub),
  };
  if (result.synced) cache = { at: Date.now(), result };
  return result;
});

async function refreshOne(seed: ProjectSeed): Promise<{ card: ProjectCard; fromGithub: boolean }> {
  const card = seedCard(seed);
  const metaPromise = seed.repo ? githubMeta(seed.repo) : Promise.resolve(null);
  const livePromise = pickLive(seed.liveCandidates, seed.expect);
  const [meta, live] = await Promise.all([metaPromise, livePromise]);

  if (meta?.version) card.version = meta.version;
  if (meta?.pushedAt) card.pushedAt = meta.pushedAt;
  if (!meta && seed.liveVersion) {
    const scraped = versionIn(live.head);
    if (scraped) {
      card.version = scraped;
      card.pushedAt = null;
    }
  }

  let url = live.url;
  let ok = live.ok;
  if (meta?.homepage && !seed.liveCandidates.includes(meta.homepage)) {
    const extra = await probe(meta.homepage, seed.expect);
    if (extra.status === "up") {
      url = meta.homepage;
      ok = true;
    }
  }
  card.live = url;
  card.liveOk = ok;
  return { card, fromGithub: meta !== null };
}

async function githubMeta(repo: string): Promise<{ version?: string; pushedAt?: string; homepage?: string } | null> {
  const headers = {
    accept: "application/vnd.github+json",
    "user-agent": "eric-emerson-studio",
  };
  try {
    const signal = AbortSignal.timeout(6000);
    const [repoRes, pkgRes] = await Promise.all([
      fetch(`https://api.github.com/repos/eect13/${repo}`, { headers, signal }),
      fetch(`https://api.github.com/repos/eect13/${repo}/contents/package.json`, { headers, signal }),
    ]);
    if (!repoRes.ok) return null;
    const repoJson = (await repoRes.json()) as { pushed_at?: string; homepage?: string | null };
    let version: string | undefined;
    if (pkgRes.ok) {
      const pkg = (await pkgRes.json()) as { content?: string };
      if (pkg.content) {
        const raw = atob(pkg.content.replace(/\s/g, ""));
        const match = raw.match(/"version"\s*:\s*"([^"]+)"/);
        if (match) version = match[1];
      }
    }
    return {
      version,
      pushedAt: repoJson.pushed_at,
      homepage: repoJson.homepage || undefined,
    };
  } catch {
    return null;
  }
}

async function pickLive(
  candidates: string[],
  expect: string,
): Promise<{ url: string | null; ok: boolean; head: string }> {
  if (!candidates.length) return { url: null, ok: false, head: "" };
  const results = await Promise.all(candidates.map(async (url) => ({ url, ...(await probe(url, expect)) })));
  const up = results.find((r) => r.status === "up");
  if (up) return { url: up.url, ok: true, head: up.head };
  const maybe = results.find((r) => r.status === "unknown" && isOwnedHost(r.url));
  if (maybe) return { url: maybe.url, ok: true, head: "" };
  return { url: null, ok: false, head: "" };
}

function versionIn(html: string) {
  const match = html.match(/v(?:<!--\s*-->)?(\d+\.\d+\.\d+)/);
  return match?.[1];
}
