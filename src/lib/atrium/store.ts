import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewId = "dashboard" | "calendar" | "notes" | "finance" | "news" | "settings";

export type EventItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  cat: string;
  loc: string;
};

export type NoteItem = {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
};

export type Tx = { id: string; date: string; payee: string; amount: number; cat: string };
export type Account = { id: string; name: string; balance: number };
export type Budget = { id: string; name: string; limit: number };
export type Feed = { id: string; name: string; url: string; category: string; enabled: boolean };
export type NewsItem = { title: string; link: string; desc: string; date: string; src: string; category: string };

export const NOTE_COLORS = ["#f5e6a8", "#ffd0d6", "#c7f0d8", "#cde4ff", "#e4d6ff", "#ffd9b8"];
export const TZ = "Asia/Manila";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function seed() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const at = (day: number, h: number, min = 0) => new Date(y, m, day, h, min).toISOString();
  return {
    name: "Eric",
    city: "Philippines",
    lat: 14.4508,
    lon: 120.9828,
    theme: "dark" as "dark" | "light",
    modules: { notes: true, finance: true, news: true },
    events: [
      { id: uid(), title: "Weekly planning", start: at(d, 9, 0), end: at(d, 10, 0), cat: "work", loc: "" },
      { id: uid(), title: "Lunch with family", start: at(d, 12, 30), end: at(d, 14, 0), cat: "family", loc: "Home" },
      {
        id: uid(),
        title: "Deep work block",
        start: at(Math.min(d + 1, 28), 14, 0),
        end: at(Math.min(d + 1, 28), 17, 0),
        cat: "work",
        loc: "",
      },
    ] as EventItem[],
    notes: [
      { id: uid(), text: "Ship Atrium dashboard v1\n— calendar ICS\n— finance watcher", color: NOTE_COLORS[0], x: 24, y: 24 },
      { id: uid(), text: "Read markets before 9am.", color: NOTE_COLORS[3], x: 220, y: 80 },
    ] as NoteItem[],
    accounts: [
      { id: "cash", name: "Cash / wallet", balance: 8500 },
      { id: "bank", name: "BDO checking", balance: 126400 },
      { id: "gcash", name: "GCash", balance: 4320 },
    ] as Account[],
    budgets: [
      { id: "food", name: "Food", limit: 15000 },
      { id: "trans", name: "Transport", limit: 4000 },
      { id: "bills", name: "Bills", limit: 18000 },
    ] as Budget[],
    txs: [
      { id: uid(), date: isoDate(now), payee: "Grocery — S&R", amount: -2850, cat: "food" },
      { id: uid(), date: isoDate(now), payee: "Salary", amount: 72000, cat: "income" },
      { id: uid(), date: isoDate(addDays(now, -1)), payee: "Grab", amount: -248, cat: "trans" },
    ] as Tx[],
    feeds: [
      { id: "gnews", name: "Top stories", url: "https://news.google.com/rss?hl=en-PH&gl=PH&ceid=PH:en", category: "Top", enabled: true },
      { id: "verge", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "Tech", enabled: true },
      { id: "rappler", name: "Rappler", url: "https://www.rappler.com/feed/", category: "PH", enabled: true },
    ] as Feed[],
    news: [] as NewsItem[],
    newsAt: 0,
    prices: {} as Record<string, { usd?: number; php?: number; usd_24h_change?: number }>,
  };
}

export type AtriumState = ReturnType<typeof seed> & {
  addEvent: (title: string, start?: string, end?: string) => void;
  addNote: (text: string) => void;
  moveNote: (id: string, x: number, y: number) => void;
  addSpend: (amount: number, payee: string) => void;
  setNews: (items: NewsItem[]) => void;
  setPrices: (p: AtriumState["prices"]) => void;
  toggleModule: (key: keyof AtriumState["modules"]) => void;
  toggleTheme: () => void;
  exportICS: () => void;
};

function parseWhen(text: string) {
  const now = new Date();
  let title = text.trim();
  let start = new Date(now);
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const days: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  const lower = title.toLowerCase();
  if (/\btomorrow\b/.test(lower)) {
    start = addDays(now, 1);
    start.setHours(9, 0, 0, 0);
    title = title.replace(/tomorrow/gi, "").trim();
  }
  for (const [name, idx] of Object.entries(days)) {
    if (new RegExp("\\b" + name + "\\b", "i").test(lower)) {
      const cur = now.getDay();
      let add = (idx - cur + 7) % 7;
      if (add === 0) add = 7;
      start = addDays(now, add);
      start.setHours(9, 0, 0, 0);
      title = title.replace(new RegExp(name, "ig"), "").trim();
    }
  }
  const tm = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (tm) {
    let h = Number(tm[1]);
    const min = tm[2] ? Number(tm[2]) : 0;
    const ap = tm[3];
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    start.setHours(h, min, 0, 0);
    title = title.replace(/\b\d{1,2}(?::\d{2})?\s*(am|pm)?\b/i, "").trim();
  }
  title = title.replace(/\s+(at|on)\s*$/i, "").replace(/\s+/g, " ");
  if (!title) title = "New event";
  const end = new Date(start.getTime() + 60 * 60000);
  return { title, start: start.toISOString(), end: end.toISOString() };
}

export function parseCommand(raw: string) {
  const text = raw.trim();
  const note = text.match(/^note:\s*(.+)/i);
  if (note) return { kind: "note" as const, text: note[1] };
  const spend = text.match(/^spend\s+(\d+(?:\.\d+)?)\s+(.+)/i);
  if (spend) return { kind: "spend" as const, amount: Number(spend[1]), payee: spend[2] };
  return { kind: "event" as const, ...parseWhen(text) };
}

export const useAtrium = create<AtriumState>()(
  persist(
    (set, get) => ({
      ...seed(),
      addEvent: (title, start, end) => {
        const parsed = parseWhen(title);
        set({
          events: [
            ...get().events,
            {
              id: uid(),
              title: parsed.title,
              start: start ?? parsed.start,
              end: end ?? parsed.end,
              cat: "work",
              loc: "",
            },
          ],
        });
      },
      addNote: (text) => {
        set({
          notes: [
            ...get().notes,
            {
              id: uid(),
              text,
              color: NOTE_COLORS[get().notes.length % NOTE_COLORS.length],
              x: 40 + (get().notes.length % 4) * 28,
              y: 40 + get().notes.length * 16,
            },
          ],
        });
      },
      moveNote: (id, x, y) => {
        set({ notes: get().notes.map((n) => (n.id === id ? { ...n, x, y } : n)) });
      },
      addSpend: (amount, payee) => {
        set({
          txs: [{ id: uid(), date: isoDate(new Date()), payee, amount: -Math.abs(amount), cat: "other" }, ...get().txs],
        });
      },
      setNews: (items) => set({ news: items, newsAt: Date.now() }),
      setPrices: (p) => set({ prices: p }),
      toggleModule: (key) => set({ modules: { ...get().modules, [key]: !get().modules[key] } }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      exportICS: () => {
        const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Atrium//EN", "CALSCALE:GREGORIAN"];
        const pad = (n: number) => String(n).padStart(2, "0");
        const toICS = (iso: string) => {
          const d = new Date(iso);
          return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
        };
        for (const ev of get().events) {
          lines.push("BEGIN:VEVENT", "UID:" + ev.id + "@atrium.local", "DTSTAMP:" + toICS(new Date().toISOString()), "DTSTART:" + toICS(ev.start), "DTEND:" + toICS(ev.end), "SUMMARY:" + ev.title.replace(/,/g, "\\,"), "END:VEVENT");
        }
        lines.push("END:VCALENDAR");
        const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "atrium.ics";
        a.click();
      },
    }),
    {
      name: "atrium.v1",
      onRehydrateStorage: () => (state) => {
        if (state && /las pi/i.test(state.city)) state.city = "Philippines";
      },
    },
  ),
);

export function peso(n: number) {
  return "₱" + Number(n).toLocaleString("en-PH", { maximumFractionDigits: 0 });
}

export function greet() {
  const hour = Number(
    new Date().toLocaleString("en-PH", { hour: "numeric", hour12: false, timeZone: TZ }),
  );
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function todayEvents(events: EventItem[]) {
  const now = new Date();
  return events.filter((e) => {
    const x = new Date(e.start);
    return x.getFullYear() === now.getFullYear() && x.getMonth() === now.getMonth() && x.getDate() === now.getDate();
  });
}
