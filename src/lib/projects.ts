export type ProjectSeed = {
  id: string;
  n: string;
  kicker: string;
  title: string;
  body: string;
  tags: string[];
  version: string;
  /** Public GitHub repo slug. Null when the repo is private. */
  repo: string | null;
  /** Exact `<title>` of the live page. Hosts outside Eric's Vercel/Netlify are never "up". */
  expect: string;
  liveCandidates: string[];
  /** Read `v1.2.3` from the live page when the repo is private. */
  liveVersion?: boolean;
  pushedAt: string | null;
};

export type ProjectCard = {
  id: string;
  n: string;
  kicker: string;
  title: string;
  body: string;
  tags: string[];
  version: string;
  github: string | null;
  live: string | null;
  /** False only when every candidate answered and none was the app. */
  liveOk: boolean;
  pushedAt: string | null;
};

export const PROJECT_SEEDS: ProjectSeed[] = [
  {
    id: "atrium",
    n: "01",
    kicker: "Personal desk",
    title: "Atrium",
    body: "A desk I actually open, set to Manila time: calendar, notes, weather, a short briefing. No account. Data stays on the machine.",
    tags: ["TypeScript", "Tauri 2"],
    version: "1.2.34",
    repo: "atrium",
    expect: "Atrium",
    liveCandidates: ["https://atrium-swart-seven.vercel.app"],
    pushedAt: "2026-09-27T13:17:46Z",
  },
  {
    id: "court",
    n: "02",
    kicker: "Fantasy sheet",
    title: "CourtWire",
    body: "A 2026–27 fantasy basketball page. Nine categories, rankings in the browser, no account. I am still learning what those numbers are — and what they are not. The repo is private.",
    tags: ["TypeScript", "Browser"],
    version: "1.29.4",
    repo: null,
    expect: "CourtWire",
    liveCandidates: ["https://courtwire.netlify.app"],
    liveVersion: true,
    pushedAt: null,
  },
  {
    id: "font",
    n: "03",
    kicker: "Type on Windows",
    title: "Font Manager",
    body: "A library so I can try a font and have Word or Figma see it for the session. Still rough. The public link is a catalog. The Windows app is the one that matters.",
    tags: ["Tauri 2", "React"],
    version: "1.0.207",
    repo: "font-manager",
    expect: "Font Manager",
    liveCandidates: ["https://font-manager-eta.vercel.app"],
    pushedAt: "2026-09-27T11:13:41Z",
  },
  {
    id: "finance",
    n: "04",
    kicker: "Household books",
    title: "Finance Manager",
    body: "Desktop and browser ledger for banks and invoices. A sample company ships with it so I can click around without real money. Books stay on this computer.",
    tags: ["Tauri 2", "IndexedDB"],
    version: "3.63.60",
    repo: "finance-manager",
    expect: "Finance Manager",
    liveCandidates: ["https://finance-manager-phi-self.vercel.app"],
    pushedAt: "2026-09-27T12:48:05Z",
  },
  {
    id: "potion",
    n: "05",
    kicker: "A folder",
    title: "Potion",
    body: "A folder for files. Login is optional. Guest files stay on the device. I would not put something I cannot lose on a public link.",
    tags: ["Tauri 2", "Windows"],
    version: "1.7.0",
    repo: "potion",
    expect: "Potion",
    liveCandidates: [],
    pushedAt: "2026-09-27T12:43:07Z",
  },
];

export function seedCard(seed: ProjectSeed): ProjectCard {
  return {
    id: seed.id,
    n: seed.n,
    kicker: seed.kicker,
    title: seed.title,
    body: seed.body,
    tags: seed.tags,
    version: seed.version,
    github: seed.repo ? `https://github.com/eect13/${seed.repo}` : null,
    live: seed.liveCandidates[0] ?? null,
    liveOk: Boolean(seed.liveCandidates[0]),
    pushedAt: seed.pushedAt,
  };
}

export function seedCards(): ProjectCard[] {
  return PROJECT_SEEDS.map(seedCard);
}
