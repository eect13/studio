import { createServerFn } from "@tanstack/react-start";
import type { NewsItem } from "./store";

const DEFAULT_FEEDS = [
  { name: "Top stories", url: "https://news.google.com/rss?hl=en-PH&gl=PH&ceid=PH:en", category: "Top" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "Tech" },
  { name: "Rappler", url: "https://www.rappler.com/feed/", category: "PH" },
];

export const fetchMarket = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,php&include_24hr_change=true",
    );
    if (!res.ok) return {};
    return (await res.json()) as Record<string, { usd?: number; php?: number; usd_24h_change?: number }>;
  } catch {
    return {};
  }
});

export const fetchHeadlines = createServerFn({ method: "POST" }).handler(async () => {
  const chunks = await Promise.all(
    DEFAULT_FEEDS.map(async (f) => {
      try {
        const res = await fetch(
          "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(f.url) + "&count=8",
        );
        if (!res.ok) return [] as NewsItem[];
        const json = (await res.json()) as {
          status?: string;
          items?: { title: string; link: string; description?: string; pubDate: string }[];
        };
        if (json.status !== "ok" || !json.items) return [] as NewsItem[];
        return json.items.map((it) => ({
          title: it.title,
          link: it.link,
          desc: (it.description || "").replace(/<[^>]+>/g, "").slice(0, 140),
          date: it.pubDate,
          src: f.name,
          category: f.category,
        }));
      } catch {
        return [] as NewsItem[];
      }
    }),
  );
  return chunks.flat().sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 24);
});
