import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Command,
  LayoutDashboard,
  Newspaper,
  Settings,
  StickyNote,
  SunMoon,
  Wallet,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchHeadlines, fetchMarket } from "@/lib/atrium/feeds";
import {
  greet,
  parseCommand,
  peso,
  todayEvents,
  useAtrium,
  type ViewId,
} from "@/lib/atrium/store";
import { cn } from "@/lib/utils";

const NAV: { id: ViewId; label: string; icon: typeof LayoutDashboard; optional?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "notes", label: "Notes", icon: StickyNote, optional: true },
  { id: "finance", label: "Finance", icon: Wallet, optional: true },
  { id: "news", label: "News", icon: Newspaper, optional: true },
  { id: "settings", label: "Modules", icon: Settings },
];

export function AtriumApp() {
  const store = useAtrium();
  const [view, setView] = useState<ViewId>("dashboard");
  const [omni, setOmni] = useState("");
  const [clock, setClock] = useState("");
  const [weather, setWeather] = useState<string>("Fetching weather…");
  const [toast, setToast] = useState("");
  const light = store.theme === "light";

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleString("en-PH", {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "Asia/Manila",
        }),
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${store.lat}&longitude=${store.lon}&current=temperature_2m,weather_code&timezone=Asia%2FManila`,
    )
      .then((r) => r.json())
      .then((j) => {
        const t = j?.current?.temperature_2m;
        setWeather(t != null ? `${Math.round(t)}° · Philippines` : "Philippines");
      })
      .catch(() => setWeather("Philippines"));
  }, [store.city, store.lat, store.lon]);

  useEffect(() => {
    if (Date.now() - store.newsAt < 20 * 60 * 1000 && store.news.length) return;
    void fetchHeadlines()
      .then((items) => {
        if (items.length) store.setNews(items);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchMarket()
      .then((j) => {
        if (j && Object.keys(j).length) store.setPrices(j);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  function runCommand() {
    const parsed = parseCommand(omni);
    if (parsed.kind === "note") {
      store.addNote(parsed.text);
      flash("Note pinned");
    } else if (parsed.kind === "spend") {
      store.addSpend(parsed.amount, parsed.payee);
      flash("Spend logged");
    } else {
      store.addEvent(parsed.title, parsed.start, parsed.end);
      flash("Event added");
    }
    setOmni("");
  }

  const visibleNav = NAV.filter((n) => !n.optional || store.modules[n.id as "notes" | "finance" | "news"]);

  return (
    <div
      className={cn(
        "flex min-h-svh",
        light ? "bg-[#f4efe4] text-[#1a1408]" : "bg-atrium text-fg",
      )}
      data-app="atrium"
    >
      <aside className="hidden w-56 shrink-0 flex-col border-r border-atrium-line p-4 md:flex">
        <Link to="/" className="mb-6 text-xs font-medium text-gold hover:underline">
          ← Studio
        </Link>
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-gold text-sm font-bold text-gold-ink">
            A
          </span>
          <div>
            <p className="font-semibold leading-tight">Atrium</p>
            <p className="text-xs text-muted">Command center</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {visibleNav.map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setView(n.id)}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-md px-3 text-left text-sm",
                  view === n.id ? "bg-gold text-gold-ink" : "hover:bg-atrium-surface",
                )}
              >
                <Icon className="size-4" />
                {n.label}
              </button>
            );
          })}
        </nav>
        <p className="mt-auto text-[11px] text-muted">Local-first · Asia/Manila</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-atrium-line px-4 py-3">
          <Link to="/" className="text-xs text-gold md:hidden">
            Studio
          </Link>
          <h1 className="hidden text-lg font-semibold capitalize md:block">{view}</h1>
          <label className="flex min-h-11 min-w-[12rem] flex-1 items-center gap-2 rounded-full border border-atrium-line bg-atrium-surface px-3">
            <Command className="size-4 text-gold" />
            <input
              value={omni}
              onChange={(e) => setOmni(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runCommand();
              }}
              placeholder="Lunch Friday 1pm · note: buy rice · spend 500 Grab"
              className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
            />
          </label>
          <span className="hidden font-mono text-xs tabular-nums text-muted sm:inline">{clock}</span>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-atrium-line"
            onClick={store.toggleTheme}
            aria-label="Toggle theme"
          >
            <SunMoon className="size-4" />
          </button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-atrium-line px-3 py-2 md:hidden">
          {visibleNav.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setView(n.id)}
              className={cn(
                "min-h-10 shrink-0 rounded-full px-3 text-sm",
                view === n.id ? "bg-gold text-gold-ink" : "text-muted",
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {view === "dashboard" && <Dashboard weather={weather} />}
          {view === "calendar" && <CalendarView />}
          {view === "notes" && <NotesView />}
          {view === "finance" && <FinanceView />}
          {view === "news" && <NewsView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-ink">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-atrium-line bg-atrium-surface p-4", className)}>
      {children}
    </section>
  );
}

function Dashboard({ weather }: { weather: string }) {
  const { name, events, accounts, news, prices, notes } = useAtrium();
  const agenda = todayEvents(events);
  const cash = accounts.reduce((s, a) => s + a.balance, 0);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <p className="text-sm text-muted">{weather}</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">
          {greet()}, {name}.
        </h2>
        <p className="mt-3 max-w-prose text-muted">
          Today’s agenda, liquid cash, and a short briefing — all on this machine.
        </p>
      </Card>
      <Card>
        <p className="text-xs uppercase tracking-[0.14em] text-gold">Liquid</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums">{peso(cash)}</p>
        <p className="mt-1 text-sm text-muted">{accounts.length} accounts</p>
      </Card>
      <Card>
        <h3 className="mb-3 font-semibold">Agenda</h3>
        {agenda.length === 0 ? (
          <p className="text-sm text-muted">Nothing on the calendar today.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {agenda.map((e) => (
              <li key={e.id}>
                <span className="font-mono text-xs text-gold">
                  {new Date(e.start).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}
                </span>{" "}
                {e.title}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        <h3 className="mb-3 font-semibold">Watch</h3>
        <ul className="space-y-2 text-sm tabular-nums">
          {["bitcoin", "ethereum"].map((id) => (
            <li key={id} className="flex justify-between">
              <span className="uppercase text-muted">{id.slice(0, 3)}</span>
              <span>{prices[id]?.usd != null ? `$${prices[id]!.usd!.toLocaleString()}` : "—"}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h3 className="mb-3 font-semibold">Pinned notes</h3>
        <ul className="space-y-2 text-sm text-muted">
          {notes.slice(0, 3).map((n) => (
            <li key={n.id}>{n.text.split("\n")[0]}</li>
          ))}
        </ul>
      </Card>
      <Card className="lg:col-span-3">
        <h3 className="mb-3 font-semibold">Briefing</h3>
        <ul className="grid gap-3 md:grid-cols-3">
          {(news.length ? news : []).slice(0, 6).map((n) => (
            <li key={n.link}>
              <a href={n.link} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                <span className="block text-[11px] uppercase tracking-wide text-gold">{n.src}</span>
                {n.title}
              </a>
            </li>
          ))}
          {!news.length ? <li className="text-sm text-muted">Headlines load when the feed is reachable.</li> : null}
        </ul>
      </Card>
    </div>
  );
}

function CalendarView() {
  const { events, addEvent, exportICS } = useAtrium();
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = useMemo(() => {
    const out: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) out.push(null);
    for (let d = 1; d <= days; d++) out.push(d);
    return out;
  }, [days, startPad]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button type="button" className="min-h-11 px-3" onClick={() => setCursor(new Date(year, month - 1, 1))}>
          Prev
        </button>
        <h2 className="text-xl font-semibold">
          {cursor.toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
        </h2>
        <button type="button" className="min-h-11 px-3" onClick={() => setCursor(new Date(year, month + 1, 1))}>
          Next
        </button>
        <Button variant="gold" onClick={exportICS}>
          Export ICS
        </Button>
        <Button
          variant="atriumGhost"
          onClick={() => addEvent("Focus block")}
        >
          Add focus block
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs uppercase text-muted">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          const dayEvents =
            d == null
              ? []
              : events.filter((e) => {
                  const x = new Date(e.start);
                  return x.getFullYear() === year && x.getMonth() === month && x.getDate() === d;
                });
          return (
            <div
              key={i}
              className="min-h-20 rounded-md border border-atrium-line bg-atrium-surface p-1 text-left text-xs"
            >
              <span className="text-muted">{d ?? ""}</span>
              {dayEvents.map((e) => (
                <p key={e.id} className="mt-1 truncate text-gold">
                  {e.title}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotesView() {
  const { notes, addNote, moveNote } = useAtrium();
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);

  return (
    <div>
      <Button variant="gold" onClick={() => addNote("New sticky")}>
        New note
      </Button>
      <div
        className="relative mt-4 min-h-[28rem] overflow-hidden rounded-xl border border-atrium-line"
        onPointerMove={(e) => {
          if (!drag) return;
          moveNote(drag.id, e.clientX - drag.dx, e.clientY - drag.dy);
        }}
        onPointerUp={() => setDrag(null)}
      >
        {notes.map((n) => (
          <article
            key={n.id}
            className="absolute w-44 cursor-grab rounded-md p-3 text-sm text-gold-ink shadow-sm"
            style={{ left: n.x, top: n.y, background: n.color }}
            onPointerDown={(e) => {
              const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
              setDrag({ id: n.id, dx: e.clientX - rect.left - n.x, dy: e.clientY - rect.top - n.y });
            }}
          >
            {n.text}
          </article>
        ))}
      </div>
    </div>
  );
}

function FinanceView() {
  const { accounts, budgets, txs, addSpend } = useAtrium();
  const cash = accounts.reduce((s, a) => s + a.balance, 0);
  const spent = (cat: string) =>
    txs.filter((t) => t.cat === cat && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <p className="text-xs uppercase tracking-[0.14em] text-gold">Cash</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums">{peso(cash)}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {accounts.map((a) => (
            <li key={a.id} className="flex justify-between">
              <span>{a.name}</span>
              <span className="tabular-nums">{peso(a.balance)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h3 className="mb-3 font-semibold">Budgets</h3>
        <ul className="space-y-3">
          {budgets.map((b) => {
            const used = spent(b.id);
            const pct = Math.min(100, Math.round((used / b.limit) * 100));
            return (
              <li key={b.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{b.name}</span>
                  <span className="tabular-nums">
                    {peso(used)} / {peso(b.limit)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg">
                  <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
        <Button className="mt-4" variant="gold" onClick={() => addSpend(180, "Coffee")}>
          Log coffee ₱180
        </Button>
      </Card>
      <Card className="md:col-span-2">
        <h3 className="mb-3 font-semibold">Recent</h3>
        <ul className="space-y-2 text-sm">
          {txs.map((t) => (
            <li key={t.id} className="flex justify-between">
              <span>
                {t.payee} <span className="text-muted">{t.date}</span>
              </span>
              <span className="tabular-nums">{peso(t.amount)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function NewsView() {
  const { news } = useAtrium();
  return (
    <ul className="space-y-3">
      {news.map((n) => (
        <li key={n.link} className="rounded-xl border border-atrium-line bg-atrium-surface p-4">
          <span className="text-[11px] uppercase tracking-wide text-gold">
            {n.src} · {n.category}
          </span>
          <a href={n.link} target="_blank" rel="noopener noreferrer" className="mt-1 block font-semibold hover:text-gold">
            {n.title}
          </a>
          <p className="mt-1 text-sm text-muted">{n.desc}</p>
        </li>
      ))}
      {!news.length ? <p className="text-muted">No headlines cached yet.</p> : null}
    </ul>
  );
}

function SettingsView() {
  const { modules, toggleModule } = useAtrium();
  return (
    <Card className="max-w-lg">
      <h3 className="mb-3 font-semibold">Optional racks</h3>
      <p className="mb-4 text-sm text-muted">Calendar stays on. Notes, finance, and news can be hidden.</p>
      {(Object.keys(modules) as (keyof typeof modules)[]).map((key) => (
        <label key={key} className="mb-2 flex min-h-11 items-center justify-between">
          <span className="capitalize">{key}</span>
          <input type="checkbox" checked={modules[key]} onChange={() => toggleModule(key)} />
        </label>
      ))}
    </Card>
  );
}
