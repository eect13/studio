import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, Menu, X } from "lucide-react";
import { useState } from "react";
import { SceneCanvas } from "@/components/scene-canvas";
import { SceneSwitcher } from "@/components/scene-switcher";
import { StudioCursor } from "@/components/studio-cursor";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

const NAV = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#studio", label: "Studio" },
  { href: "#life", label: "Off-screen" },
  { href: "#hello", label: "Say hello" },
];

const WORK = [
  {
    n: "01",
    kicker: "Command center",
    title: "Atrium",
    body: "Local-first personal desk — calendar with ICS, sticky notes, PSE-aware finance, weather, and a briefing. No account. Data stays on the machine.",
    tags: ["TypeScript", "Tauri 2", "Local-first"],
    github: "https://github.com/eect13/atrium",
    demo: "/atrium" as const,
  },
  {
    n: "02",
    kicker: "Desktop type",
    title: "Font Manager",
    body: "FontBase-style Windows library. Browse Google Fonts, upload TTF/OTF, activate faces so Word, Adobe, and Figma see them for the session.",
    tags: ["Tauri 2", "React", "Rust"],
    github: "https://github.com/eect13/font-manager",
  },
  {
    n: "03",
    kicker: "Treasury books",
    title: "Finance Manager",
    body: "Desktop and browser ledger — banks, invoices, employees, and a bank register. Books stay on this computer. Pacific Harbor sample ships with it.",
    tags: ["Tauri 2", "IndexedDB", "TypeScript"],
    github: "https://github.com/eect13/finance-manager",
  },
  {
    n: "04",
    kicker: "Folder for apps",
    title: "Potion",
    body: "A folder for your apps. Login optional. Sync only if you want it. Guest files stay on the device — Windows, Android, or the browser.",
    tags: ["Tauri 2", "Windows", "Android"],
    github: "https://github.com/eect13/potion",
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
        <a href="#top" className="mr-auto flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-dashed border-lime font-sans text-xs font-bold tracking-wide text-lime">
            EE
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <strong className="text-sm font-semibold">Eric Emerson</strong>
            <small className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              Logo placeholder
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
        <SceneSwitcher className="hidden sm:flex" />
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
          <SceneSwitcher className="sm:hidden" />
        </div>
      ) : null}

      <main id="top" className="relative z-10">
        <section className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-4 pb-16 pt-24 sm:px-8 sm:pt-28">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            Design & tech enthusiast · Philippines
          </p>
          <h1 className="text-[clamp(2.6rem,12vw,8.5rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.05em]">
            <span className="block">Eric</span>
            <span
              className="block text-lime"
              style={{ textShadow: "0 0 80px color-mix(in oklab, var(--color-lime) 28%, transparent)" }}
            >
              Emerson
            </span>
          </h1>
          <p className="mt-7 max-w-md text-muted">
            Multimedia arts graduate translating ambigrams, negative space, and optical tricks into
            identities you can print — and tools you can live in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href="#work">See the work</a>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/atrium">Launch Atrium</Link>
            </Button>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-24">
          <SectionHead idx="01" title="About me" />
          <div className="grid overflow-hidden rounded-xl border border-line bg-surface/90 md:grid-cols-[minmax(0,280px)_1fr] lg:grid-cols-[minmax(0,340px)_1fr]">
            <figure className="relative flex items-end justify-center bg-elevated px-5 pt-8 md:px-6 md:pt-10">
              <img
                src="/portrait.png?v=3"
                alt="Eric Emerson Tan, geometric vector portrait"
                width={1138}
                height={1591}
                className="portrait-theme relative z-[1] mx-auto h-auto max-h-72 w-full max-w-[220px] object-contain object-bottom sm:max-h-96 sm:max-w-[260px] md:max-h-[28rem] md:max-w-none"
                crossOrigin="anonymous"
              />
            </figure>
            <div className="p-5 sm:p-8">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Philippines · vector study
              </p>
              <h3 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                I am <em className="font-serif font-normal italic text-lime">not an expert</em> in
                anything yet.
              </h3>
              <p className="mb-3 text-muted">
                I am a Multimedia Arts graduate designing from my home in the Philippines.
                I’ll be the first to admit that I am simply someone who loves the messy process of
                learning.
              </p>
              <p className="text-muted">
                I’m drawn to clever visual frameworks — ambigrams, optical illusions, and negative
                space — and I am actively trying to translate those principles into scalable digital
                identities and tangible 3D prints. Every day is just a practice in trying to make
                things a little bit cleaner.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <Fact label="Focus" value="Identity, vectors, mesh" />
                <Fact label="Hardware" value="Creality K2 Pro" />
                <Fact label="Stack" value="SVG · Three.js · local-first" />
                <Fact label="Timezone" value="Asia / Manila" />
              </ul>
            </div>
          </div>
        </section>

        <section id="work" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-24">
          <SectionHead idx="02" title="Selected work" />
          <p className="mb-8 max-w-xl text-muted">
            Tools I actually use. Source lives on GitHub — Atrium also runs here as a live desk.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {WORK.map((item) => (
              <article key={item.title} className="flex flex-col rounded-xl border border-line bg-surface/90 p-6">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-lime">
                  {item.n} · {item.kicker}
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
                  {"demo" in item && item.demo ? (
                    <Button asChild variant="ghost">
                      <Link to={item.demo}>Open demo</Link>
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="studio" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-24">
          <SectionHead idx="03" title="Current focus" />
          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <article className="rounded-xl border border-line bg-surface/90 p-6">
              <h3 className="mb-4 text-2xl font-semibold">Digital canvas</h3>
              <ol className="list-decimal space-y-3 pl-5 text-muted marker:font-mono marker:text-lime">
                <li>
                  Practicing how to avoid generic ideas to build more memorable logos that stay
                  recognizable even when scaled down.
                </li>
                <li>
                  Broadening pattern knowledge and practicing vector graphics (.svg) to achieve
                  perfectly clean curves.
                </li>
                <li>
                  Learning how to export pristine outputs with true transparent or white
                  backgrounds.
                </li>
              </ol>
            </article>
            <article className="rounded-xl border border-line bg-surface/90 p-6">
              <h3 className="mb-4 text-2xl font-semibold">Physical space</h3>
              <ol className="list-decimal space-y-3 pl-5 text-muted marker:font-mono marker:text-lime">
                <li>Trying to wrap my head around advanced slicer configurations.</li>
                <li>Running endless parameter matrix tests (and failing often).</li>
                <li>
                  Learning the basics of tuning and maintaining hardware. Currently operating a
                  Creality K2 Pro.
                </li>
              </ol>
            </article>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Study
              title="Ambigram draft"
              kicker="Vector identity"
              body="Practicing symmetrical geometry and optical illusions for personal branding. Clever without losing readability."
            />
            <Study
              title="Negative space"
              kicker="Conceptual draft"
              body="Exploring how the absence of elements can create stronger, more intelligent visual metaphors in modern logo design."
            />
            <Study
              title="From vector to object"
              kicker="Mesh prototype"
              body="Translating digital vector work into physical objects by testing infill densities and slicing parameters on the K2 Pro."
            />
          </div>
        </section>

        <section id="life" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-24">
          <SectionHead idx="04" title="Off-screen" />
          <div className="grid gap-5 md:grid-cols-2">
            <LifeCard
              title="Audio fidelity"
              body="Evaluating sound signatures and technical performance. Currently listening on the Xenns Top and the Binary EP321. Edifier M90 on the desk, sub-out for precise low-end."
            />
            <LifeCard
              title="Music & focus"
              body="Workflow soundtrack leans into high-gloss electronic production and laid-back grooves — Disclosure, Satin Jackets, Post Malone."
            />
            <LifeCard
              title="Racquet sports"
              body="Badminton on a Li-Ning Axforce 90 New (Li-Ning No.1 strings). Recently picked up a Diadem Edge BluCore Pro 16mm for pickleball."
            />
            <LifeCard
              title="Strategy & travel"
              body="Chess frameworks and PSE equity tracking. Designated planner for family trips — Yunnan done, Vietnam itinerary for four in October 2026."
            />
          </div>
        </section>

        <section id="hello" className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12">
          <SectionHead idx="05" title="Say hello" />
          <p className="mb-6 max-w-[22ch] text-3xl font-semibold tracking-tight sm:text-4xl">
            If you want to talk identity, prints, or tools that stay on your machine —{" "}
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
        <span>Mark is a placeholder · Three.js scene</span>
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
