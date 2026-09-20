import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Github, Menu, X } from "lucide-react";
import { useState } from "react";
import { Mark } from "@/components/mark";
import { SceneCanvas } from "@/components/scene-canvas";
import { StudioCursor } from "@/components/studio-cursor";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

const NAV = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#studio", label: "Practice" },
  { href: "#life", label: "Off-screen" },
  { href: "#hello", label: "Say hello" },
];

const WORK = [
  {
    id: "atrium",
    n: "01",
    kicker: "Personal desk",
    version: "1.2.28",
    title: "Atrium",
    body: "A local-first desk I built to use: calendar, notes, weather, a briefing. No account. Data stays on the machine.",
    tags: ["TypeScript", "Tauri 2"],
    github: "https://github.com/eect13/atrium",
    live: "https://atrium-swart-seven.vercel.app",
  },
  {
    id: "font",
    n: "02",
    kicker: "Type on Windows",
    version: "1.0.202",
    title: "Font Manager",
    body: "A library so I can browse Google Fonts, drop in a TTF, and have Word or Figma see it for the session. Still learning the edges.",
    tags: ["Tauri 2", "React"],
    github: "https://github.com/eect13/font-manager",
    live: "https://font-manager-eta.vercel.app",
  },
  {
    id: "finance",
    n: "03",
    kicker: "Household books",
    version: "3.63.56",
    title: "Finance Manager",
    body: "Desktop and browser ledger for banks and invoices. Books stay here. A sample company ships with it so I can test without real money.",
    tags: ["Tauri 2", "IndexedDB"],
    github: "https://github.com/eect13/finance-manager",
    live: "https://finance-manager-phi-self.vercel.app",
  },
  {
    id: "potion",
    n: "04",
    kicker: "A folder for apps",
    version: "1.2.0",
    title: "Potion",
    body: "A place to keep small apps. Login optional. Guest files stay on the device — Windows, Android, or the browser.",
    tags: ["Tauri 2", "Windows"],
    github: "https://github.com/eect13/potion",
    live: "https://potion-red.vercel.app",
  },
];

function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-svh overflow-x-clip bg-bg text-fg">
      <StudioCursor />
      <SceneCanvas />
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden="true"
      />

      <header className="fixed inset-x-0 top-0 z-40 flex items-center gap-2 bg-gradient-to-b from-bg/90 to-transparent px-4 py-3 sm:px-8">
        <a href="#top" className="mr-auto flex min-w-0 items-center gap-3" aria-label="Eric Emerson Studio">
          <Mark className="h-10 w-9 shrink-0" />
          <span className="hidden flex-col leading-tight sm:flex">
            <strong className="text-sm font-semibold">Eric Emerson</strong>
            <small className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              Philippines
            </small>
          </span>
        </a>
        <nav className="hidden items-center gap-5 text-sm font-medium text-muted xl:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-fg">
              {item.label}
            </a>
          ))}
        </nav>
        <ThemeSwitcher />
        <button
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-md text-fg xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-bg/96 px-6 text-2xl xl:hidden">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </div>
      ) : null}

      <main id="top" className="relative z-10">
        <section className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-4 pb-16 pt-24 sm:px-8 sm:pt-28">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            Multimedia arts graduate · Philippines
          </p>
          <h1 className="text-[clamp(2.6rem,12vw,8.5rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.05em]">
            <span className="block">Eric</span>
            <span className="hero-glow block text-lime">Emerson</span>
          </h1>
          <p className="mt-7 max-w-md text-muted">
            Learning identity, small local-first tools, and a printer. I under-promise on purpose.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href="#work">See the work</a>
            </Button>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-24">
          <SectionHead idx="01" title="About" />
          <div className="grid overflow-hidden rounded-xl border border-line bg-surface/90 md:grid-cols-[minmax(0,280px)_1fr] lg:grid-cols-[minmax(0,320px)_1fr]">
            <figure className="relative flex items-end justify-center px-5 pt-8 md:px-6 md:pt-10">
              <img
                src="/portrait.png?v=4"
                alt="Eric Emerson Tan, geometric vector portrait"
                width={900}
                height={1326}
                className="portrait-theme relative z-[1] mx-auto h-auto max-h-72 w-full max-w-[220px] object-contain object-bottom sm:max-h-96 sm:max-w-[260px] md:max-h-[28rem] md:max-w-none"
                crossOrigin="anonymous"
                decoding="async"
              />
            </figure>
            <div className="p-5 sm:p-8">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Philippines · still learning
              </p>
              <h3 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                I like making things a little{" "}
                <em className="font-serif font-normal italic text-lime">cleaner</em> than yesterday.
              </h3>
              <p className="mb-3 text-muted">
                Multimedia Arts graduate, working from home. I have one ambigram: the hourglass mark
                in the header. That’s my personal logo — not a client set, not a studio roster.
              </p>
              <p className="text-muted">
                I write small tools because I need them. I practice SVG. I run a Creality K2 Pro as a
                beginner: test prints, bad slicer settings, and all. The version numbers in the work
                list are just the apps I keep shipping.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <Fact label="Identity" value="One mark — mine" />
                <Fact label="Printer" value="K2 Pro · beginner" />
                <Fact label="Learning" value="SVG, Tauri, TypeScript" />
                <Fact label="Timezone" value="Asia / Manila" />
              </ul>
            </div>
          </div>
        </section>

        <section id="work" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-24">
          <SectionHead idx="02" title="Selected work" />
          <p className="mb-8 max-w-xl text-muted">
            One identity piece. Four tools I actually use. Versions from GitHub.
          </p>

          <article
            data-work="mark"
            className="mb-5 grid items-center gap-6 rounded-xl border border-line bg-surface/90 p-6 sm:grid-cols-[minmax(0,160px)_1fr] sm:p-8"
          >
            <Mark className="mx-auto h-32 w-28 sm:h-40 sm:w-36" />
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-lime">
                00 · Personal mark
              </p>
              <h3 className="mb-2 text-2xl font-semibold tracking-tight">Hourglass</h3>
              <p className="text-muted">
                One ambigram. Eye as counter, e in the lens. That’s the identity work so far — not a
                branding practice, just the logo I live with.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag>SVG</Tag>
                <Tag>Ambigram</Tag>
              </div>
            </div>
          </article>

          <div className="work-bento">
            {WORK.map((item) => (
              <article
                key={item.id}
                data-work={item.id}
                className="flex min-h-[15rem] flex-col rounded-xl border border-line bg-surface/90 p-6"
              >
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-lime">
                  {item.n} · {item.kicker} · v{item.version}
                </p>
                <h3 className="mb-2 text-2xl font-semibold tracking-tight">{item.title}</h3>
                <p className="text-muted">{item.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5">
                  <a
                    className="inline-flex min-h-11 items-center gap-2 border-b border-faint text-sm text-muted hover:border-lime hover:text-lime"
                    href={item.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="size-4" />
                    GitHub
                  </a>
                  <a
                    className="inline-flex min-h-11 items-center gap-2 border-b border-faint text-sm text-muted hover:border-lime hover:text-lime"
                    href={item.live}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Live
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="studio" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-24">
          <SectionHead idx="03" title="What I’m practicing" />
          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <article className="rounded-xl border border-line bg-surface/90 p-6">
              <h3 className="mb-4 text-2xl font-semibold">On screen</h3>
              <ol className="list-decimal space-y-3 pl-5 text-muted marker:font-mono marker:text-lime">
                <li>Keeping the hourglass readable when it gets small.</li>
                <li>Cleaner SVG curves. I still fight nodes.</li>
                <li>Exports with a true transparent background — no leftover halo.</li>
              </ol>
            </article>
            <article className="rounded-xl border border-line bg-surface/90 p-6">
              <h3 className="mb-4 text-2xl font-semibold">On the printer</h3>
              <ol className="list-decimal space-y-3 pl-5 text-muted marker:font-mono marker:text-lime">
                <li>Beginner on a Creality K2 Pro. I am not a pro.</li>
                <li>Slicer settings, infill tests, and prints that fail.</li>
                <li>Learning to keep the machine in tune, one job at a time.</li>
              </ol>
            </article>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Study
              title="The hourglass"
              kicker="The one mark"
              body="My only ambigram so far. Personal logo. Practice in negative space — not a catalog."
            />
            <Study
              title="Cleaner curves"
              kicker="SVG practice"
              body="Trying to make paths that still look sharp at 16 pixels. Most days I redo the last node."
            />
            <Study
              title="First prints"
              kicker="K2 Pro · beginner"
              body="Turning a vector into plastic. Infill, temperature, and a lot of scrap. That’s the level."
            />
          </div>
        </section>

        <section id="life" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-24">
          <SectionHead idx="04" title="Off-screen" />
          <div className="grid gap-5 md:grid-cols-2">
            <LifeCard
              title="Audio"
              body="Listening on the Xenns Top and the Binary EP321. Edifier M90 on the desk, sub-out for low end. Still figuring out what I like."
            />
            <LifeCard
              title="Music"
              body="Work soundtrack leans electronic and easy — Disclosure, Satin Jackets, Post Malone."
            />
            <LifeCard
              title="Racquet sports"
              body="Badminton on a Li-Ning Axforce 90 New. Recently picked up a Diadem Edge BluCore Pro 16mm for pickleball."
            />
            <LifeCard
              title="Travel"
              body="Family trip planner. Yunnan done. Vietnam itinerary for four in October 2026."
            />
          </div>
        </section>

        <section id="hello" className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12">
          <SectionHead idx="05" title="Say hello" />
          <p className="mb-6 max-w-[28ch] text-3xl font-semibold tracking-tight sm:text-4xl">
            If you want to talk about a mark, a small tool, or a print I’m still learning —{" "}
            <em className="font-serif font-normal italic text-lime">write.</em>
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-lg">
            <a className="border-b border-line pb-0.5 hover:border-lime hover:text-lime" href="mailto:eect13@gmail.com">
              eect13@gmail.com
            </a>
            <a
              className="border-b border-line pb-0.5 hover:border-lime hover:text-lime"
              href="https://github.com/eect13"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              className="border-b border-line pb-0.5 hover:border-lime hover:text-lime"
              href="https://x.com/EricEmersonTan"
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>
          </div>
        </section>
      </main>

      <footer className="relative z-10 flex flex-wrap justify-between gap-3 border-t border-line px-4 py-6 font-mono text-[11px] uppercase tracking-[0.12em] text-faint sm:px-8">
        <span>© 2026 Eric Emerson Tan</span>
        <span>All rights reserved</span>
      </footer>
    </div>
  );
}

function SectionHead({ idx, title }: { idx: string; title: string }) {
  return (
    <div className="mb-8 flex items-baseline gap-4 border-t border-line pt-4">
      <span className="font-mono text-xs uppercase tracking-[0.14em] text-lime">{idx}</span>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <li>
      <span className="mb-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-lime">
        {label}
      </span>
      {value}
    </li>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
      {children}
    </span>
  );
}

function Study({ title, kicker, body }: { title: string; kicker: string; body: string }) {
  return (
    <article className="rounded-xl border border-line bg-bg/60 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{kicker}</p>
      <h3 className="my-1 text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted">{body}</p>
    </article>
  );
}

function LifeCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-xl border border-line bg-surface/80 p-6">
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted">{body}</p>
    </article>
  );
}
