import { useStudioTheme, type GroundId } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { id: GroundId; label: string; name: string }[] = [
  { id: "mark", label: "Study", name: "Hourglass study" },
  { id: "orbit", label: "Orbit", name: "Orbit" },
];

export function GroundSwitch() {
  const ground = useStudioTheme((s) => s.ground);
  const setGround = useStudioTheme((s) => s.setGround);

  return (
    <div
      role="group"
      aria-label="Background"
      className="flex h-11 shrink-0 items-center rounded-full border border-line bg-surface/80 p-0.5 backdrop-blur-md"
    >
      {OPTIONS.map((opt) => {
        const on = ground === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={on}
            aria-label={opt.name}
            onClick={() => setGround(opt.id)}
            className={cn(
              "h-9 rounded-full px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] sm:px-3",
              on ? "bg-lime text-ink" : "text-muted hover:text-fg",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
