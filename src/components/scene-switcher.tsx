import { SCENE_IDS, SCENES, useStudioTheme, type SceneId } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function SceneSwitcher({ className }: { className?: string }) {
  const scene = useStudioTheme((s) => s.scene);
  const setScene = useStudioTheme((s) => s.setScene);

  return (
    <div
      className={cn(
        "flex h-11 shrink-0 items-center rounded-full border border-line bg-surface/80 px-1 backdrop-blur-md",
        className,
      )}
      role="radiogroup"
      aria-label="Background"
    >
      {SCENE_IDS.map((id) => {
        const on = scene === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={SCENES[id].label}
            title={SCENES[id].label}
            onClick={() => setScene(id as SceneId)}
            className={cn(
              "grid h-11 min-w-11 place-items-center rounded-full px-2.5 font-mono text-[10px] uppercase tracking-[0.12em]",
              on ? "text-fg" : "text-faint",
            )}
          >
            {SCENES[id].label}
          </button>
        );
      })}
    </div>
  );
}
