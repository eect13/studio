import { THEME_IDS, THEMES, useStudioTheme, type ThemeId } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ className }: { className?: string }) {
  const theme = useStudioTheme((s) => s.theme);
  const setTheme = useStudioTheme((s) => s.setTheme);

  return (
    <div
      className={cn(
        "flex h-11 shrink-0 items-center rounded-full border border-line bg-surface/80 px-1 backdrop-blur-md",
        className,
      )}
      role="radiogroup"
      aria-label="Color theme"
    >
      {THEME_IDS.map((id) => {
        const t = THEMES[id];
        const on = theme === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={t.label}
            title={t.label}
            onClick={() => setTheme(id as ThemeId)}
            className="grid h-11 w-8 place-items-center sm:w-9"
          >
            <span
              className={cn(
                "rounded-full",
                on ? "size-4 ring-2 ring-fg sm:size-[1.125rem]" : "size-3.5 border border-line sm:size-4",
              )}
              style={{ background: t.accent, boxShadow: `inset 0 0 0 3px ${t.bg}` }}
            />
          </button>
        );
      })}
    </div>
  );
}
