import { useEffect, useRef, useState } from "react";
import { THEME_IDS, THEMES, useStudioTheme, type ThemeId } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ className }: { className?: string }) {
  const theme = useStudioTheme((s) => s.theme);
  const setTheme = useStudioTheme((s) => s.setTheme);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = THEMES[theme];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        className="flex h-11 items-center gap-2 rounded-full border border-line bg-surface/80 px-2.5 backdrop-blur-md sm:px-3"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Color theme, ${current.label}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="size-4 rounded-full ring-2 ring-fg"
          style={{ background: current.accent, boxShadow: `inset 0 0 0 3px ${current.bg}` }}
        />
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:inline">
          {current.label}
        </span>
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="Color theme"
          className="absolute right-0 top-[calc(100%+6px)] z-50 flex items-center gap-0.5 rounded-full border border-line bg-surface/95 p-1 shadow-lg backdrop-blur-md"
        >
          {THEME_IDS.map((id) => {
            const t = THEMES[id];
            const on = theme === id;
            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={on}
                aria-label={t.label}
                title={t.label}
                onClick={() => {
                  setTheme(id as ThemeId);
                  setOpen(false);
                }}
                className="grid size-11 place-items-center"
              >
                <span
                  className={cn(
                    "rounded-full",
                    on ? "size-4 ring-2 ring-fg" : "size-3.5 border border-line",
                  )}
                  style={{ background: t.accent, boxShadow: `inset 0 0 0 3px ${t.bg}` }}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
