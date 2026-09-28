import { createServerFn } from "@tanstack/react-start";
import { isOwnedHost, probe } from "./live-probe.ts";
import { PROJECT_SEEDS, seedCard, type ProjectCard, type ProjectSeed } from "./projects.ts";

const TTL_MS = 10 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;
const FAIL_TTL_CAP_MS = 10 * 60 * 1000;

type RefreshResult = { cards: ProjectCard[]; synced: boolean };

type GithubMeta = { version?: string; pushedAt?: string; homepage?: string };

type GithubOutcome =
  | { kind: "skip" }
  | { kind: "ok"; meta: GithubMeta }
  | { kind: "miss" }
  | { kind: "limited"; holdMs: number };

let cache: { at: number; result: RefreshResult } | null = null;
let negative: { until: number; result: RefreshResult } | null = null;
const etags = new Map<string, { tag: string; json: unknown }>();

export function resetProjectRefreshState() {
  cache = null;
  negative = null;
  etags.clear();
}

export const refreshProjects = createServerFn({ method: "POST" }).handler(async (): Promise<RefreshResult> => {
  return runRefresh();
});

export async function runRefresh(fetchImpl: typeof fetch = globalThis.fetch): Promise<RefreshResult> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.result;
  if (negative && now < negative.until) return negative.result;

  const rows = await Promise.all(PROJECT_SEEDS.map((seed) => refreshOne(seed, fetchImpl)));
  const result: RefreshResult = {
    cards: rows.map((row) => row.card),
    synced: rows.some((row) => row.fromGithub),
  };
  const limited = rows.find((row) => row.limited);
  if (limited?.limited) {
    negative = { until: Date.now() + limited.limited, result };
    cache = null;
  } else if (result.synced) {
    cache = { at: Date.now(), result };
    negative = null;
  }
  return result;
}

async function refreshOne(
  seed: ProjectSeed,
  fetchImpl: typeof fetch,
): Promise<{ card: ProjectCard; fromGithub: boolean; limited?: number }> {
  const card = seedCard(seed);
  const metaPromise = seed.repo ? githubMeta(seed.repo, fetchImpl) : Promise.resolve({ kind: "skip" } as GithubOutcome);
  const livePromise = pickLive(seed.liveCandidates, seed.expect);
  const [meta, live] = await Promise.all([metaPromise, livePromise]);

  if (meta.kind === "ok") {
    if (meta.meta.version) card.version = meta.meta.version;
    if (meta.meta.pushedAt) card.pushedAt = meta.meta.pushedAt;
  }
  if (meta.kind !== "ok" && seed.liveVersion) {
    const scraped = versionIn(live.head);
    if (scraped) {
      card.version = scraped;
      card.pushedAt = null;
    }
  }

  let url = live.url;
  let ok = live.ok;
  if (meta.kind === "ok" && meta.meta.homepage && !seed.liveCandidates.includes(meta.meta.homepage)) {
    const extra = await probe(meta.meta.homepage, seed.expect);
    if (extra.status === "up") {
      url = meta.meta.homepage;
      ok = true;
    }
  }
  card.live = url;
  card.liveOk = ok;
  return {
    card,
    fromGithub: meta.kind === "ok",
    limited: meta.kind === "limited" ? meta.holdMs : undefined,
  };
}

function githubHeaders(url: string): Record<string, string> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "eric-emerson-studio",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.authorization = `Bearer ${token}`;
    const prior = etags.get(url);
    if (prior) headers["if-none-match"] = prior.tag;
  }
  return headers;
}

function holdMs(res: Response | undefined): number {
  if (!res) return FAIL_TTL_MS;
  const retry = res.headers.get("retry-after");
  if (retry) {
    const seconds = Number(retry);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(Math.max(seconds * 1000, 1000), FAIL_TTL_CAP_MS);
    }
    const when = Date.parse(retry);
    if (!Number.isNaN(when)) return Math.min(Math.max(when - Date.now(), 1000), FAIL_TTL_CAP_MS);
  }
  const reset = res.headers.get("x-ratelimit-reset");
  if (reset && /^\d+$/.test(reset)) {
    const ms = Number(reset) * 1000 - Date.now();
    if (ms > 0) return Math.min(ms, FAIL_TTL_CAP_MS);
  }
  return FAIL_TTL_MS;
}

async function githubGet(url: string, fetchImpl: typeof fetch, signal: AbortSignal): Promise<
  | { kind: "json"; json: unknown }
  | { kind: "miss" }
  | { kind: "limited"; holdMs: number }
> {
  try {
    const res = await fetchImpl(url, { headers: githubHeaders(url), signal });
    if (res.status === 304 && process.env.GITHUB_TOKEN) {
      const prior = etags.get(url);
      if (prior) return { kind: "json", json: prior.json };
    }
    if (res.status === 403 || res.status === 429) return { kind: "limited", holdMs: holdMs(res) };
    if (!res.ok) return { kind: "miss" };
    const json = (await res.json()) as unknown;
    const tag = res.headers.get("etag");
    if (process.env.GITHUB_TOKEN && tag) etags.set(url, { tag, json });
    return { kind: "json", json };
  } catch {
    return { kind: "limited", holdMs: FAIL_TTL_MS };
  }
}

async function githubMeta(repo: string, fetchImpl: typeof fetch): Promise<GithubOutcome> {
  const signal = AbortSignal.timeout(6000);
  const repoUrl = `https://api.github.com/repos/eect13/${repo}`;
  const pkgUrl = `https://api.github.com/repos/eect13/${repo}/contents/package.json`;
  const [repoHit, pkgHit] = await Promise.all([
    githubGet(repoUrl, fetchImpl, signal),
    githubGet(pkgUrl, fetchImpl, signal),
  ]);
  if (repoHit.kind === "limited") return repoHit;
  if (pkgHit.kind === "limited") return pkgHit;
  if (repoHit.kind !== "json") return { kind: "miss" };
  const repoJson = repoHit.json as { pushed_at?: string; homepage?: string | null };
  let version: string | undefined;
  if (pkgHit.kind === "json") {
    const pkg = pkgHit.json as { content?: string };
    if (pkg.content) {
      const raw = atob(pkg.content.replace(/\s/g, ""));
      const match = raw.match(/"version"\s*:\s*"([^"]+)"/);
      if (match) version = match[1];
    }
  }
  return {
    kind: "ok",
    meta: {
      version,
      pushedAt: repoJson.pushed_at,
      homepage: repoJson.homepage || undefined,
    },
  };
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
