import { useEffect } from "react";
import { MARK_D, MARK_VIEWBOX } from "@/lib/mark";
import { useStudioTheme } from "@/lib/theme";

const CX = 366.75;
const CY = 417.25;

/** The real hourglass, upright and turned 180°, drawn as a plate. */
export function MarkStudy() {
  const ground = useStudioTheme((s) => s.ground);
  const on = ground === "mark";

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const show = !document.hidden && useStudioTheme.getState().ground === "mark";
      root.classList.toggle("study-paused", !show);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    const unsub = useStudioTheme.subscribe(sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      unsub();
      root.classList.remove("study-paused");
    };
  }, []);

  return (
    <div className="mark-study" data-off={on ? "false" : "true"} aria-hidden="true">
      <svg viewBox={MARK_VIEWBOX} className="mark-study-svg">
        <path className="study-fill" fillRule="evenodd" d={MARK_D} />
        <path className="study-line" pathLength={1} d={MARK_D} />
        <path
          className="study-line study-flip"
          pathLength={1}
          d={MARK_D}
          transform={`translate(14 -8) rotate(180 ${CX} ${CY})`}
        />
      </svg>
    </div>
  );
}
