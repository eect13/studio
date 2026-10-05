import { create } from "zustand";
import { persist } from "zustand/middleware";

export const THEMES = {
  volt: {
    label: "Volt",
    bg: "#070807",
    surface: "#111412",
    elevated: "#1a1f1a",
    fg: "#f3f4ef",
    muted: "#9aa394",
    faint: "#7f877b",
    accent: "#c6ff1a",
    ink: "#111411",
    scheme: "dark",
  },
  tide: {
    label: "Tide",
    bg: "#071114",
    surface: "#0e1b20",
    elevated: "#14242b",
    fg: "#e8f4f6",
    muted: "#8aa3aa",
    faint: "#708d95",
    accent: "#5eead4",
    ink: "#06201c",
    scheme: "dark",
  },
  ember: {
    label: "Ember",
    bg: "#120c09",
    surface: "#1c1410",
    elevated: "#261c16",
    fg: "#f6eee6",
    muted: "#b09a8a",
    faint: "#958276",
    accent: "#ff7a3d",
    ink: "#1a0e08",
    scheme: "dark",
  },
  paper: {
    label: "Paper",
    bg: "#f1eee6",
    surface: "#fffdf8",
    elevated: "#e7e2d6",
    fg: "#17150f",
    muted: "#6b675c",
    faint: "#696559",
    accent: "#1f6f4a",
    ink: "#f1eee6",
    scheme: "light",
  },
  night: {
    label: "Night",
    bg: "#09090b",
    surface: "#131316",
    elevated: "#1c1c21",
    fg: "#f4f4f5",
    muted: "#a1a1aa",
    faint: "#83838c",
    accent: "#e4e4e7",
    ink: "#09090b",
    scheme: "dark",
  },
} as const;

export type ThemeId = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export type GroundId = "mark" | "orbit" | "still";

type ThemeStore = {
  theme: ThemeId;
  ground: GroundId;
  setTheme: (id: ThemeId) => void;
  setGround: (id: GroundId) => void;
};

export const useStudioTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "volt",
      ground: "mark",
      setTheme: (id) => set({ theme: id }),
      setGround: (id) => set({ ground: id }),
    }),
    {
      name: "studio.theme",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ThemeStore>;
        const ground =
          p.ground === "orbit" || p.ground === "mark" || p.ground === "still" ? p.ground : current.ground;
        return {
          ...current,
          ...p,
          theme: p.theme && p.theme in THEMES ? p.theme : current.theme,
          ground,
        };
      },
    },
  ),
);

export function applyTheme(id: ThemeId) {
  const t = THEMES[id];
  const root = document.documentElement;
  root.dataset.theme = id;
  root.style.setProperty("--studio-bg", t.bg);
  root.style.setProperty("--studio-surface", t.surface);
  root.style.setProperty("--studio-elevated", t.elevated);
  root.style.setProperty("--studio-fg", t.fg);
  root.style.setProperty("--studio-muted", t.muted);
  root.style.setProperty("--studio-faint", t.faint);
  root.style.setProperty("--studio-accent", t.accent);
  root.style.setProperty("--studio-ink", t.ink);
  root.style.colorScheme = t.scheme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t.bg);
}

export function parseCssHex(value: string, fallback = 0xc6ff1a) {
  const m = value.trim().match(/#([0-9a-f]{6})/i);
  return m ? parseInt(m[1], 16) : fallback;
}
