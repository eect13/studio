import { useEffect } from "react";

/**
 * Two print-sheet patterns in the margins. Strokes draw themselves
 * (trim path), then the pattern swaps. The center stays with the orbit.
 */
export function TrimField() {
  useEffect(() => {
    const root = document.documentElement;
    const onVis = () => root.classList.toggle("trim-paused", document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      root.classList.remove("trim-paused");
    };
  }, []);

  return (
    <div className="trim-field" aria-hidden="true">
      <svg className="trim-sheet" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="trim-stroke" pathLength={1} d="M 7 9 H 93 V 91 H 7 Z" style={{ animationDelay: "0.2s" }} />
        <path className="trim-stroke trim-stroke-dim" pathLength={1} d="M 10 12 H 90 V 88 H 10 Z" style={{ animationDelay: "1.4s" }} />
      </svg>

      {(["tl", "tr", "bl", "br"] as const).map((corner) => (
        <svg key={corner} className={`trim-corner ${corner}`} viewBox="0 0 120 120">
          <g className="trim-swap trim-a">
            <path className="trim-stroke" pathLength={1} d="M 16 28 H 52" />
            <path className="trim-stroke" pathLength={1} d="M 28 16 V 52" style={{ animationDelay: "0.35s" }} />
            <path className="trim-stroke trim-stroke-dim" pathLength={1} d="M 16 44 H 36" style={{ animationDelay: "0.7s" }} />
            <path className="trim-stroke trim-stroke-dim" pathLength={1} d="M 44 16 V 36" style={{ animationDelay: "0.95s" }} />
          </g>
          <g className="trim-swap trim-b">
            <path className="trim-stroke" pathLength={1} d="M 86 18 A 68 68 0 0 0 18 86" />
            <path className="trim-stroke" pathLength={1} d="M 70 18 A 52 52 0 0 0 18 70" style={{ animationDelay: "0.45s" }} />
            <path className="trim-stroke trim-stroke-dim" pathLength={1} d="M 54 18 A 36 36 0 0 0 18 54" style={{ animationDelay: "0.9s" }} />
          </g>
        </svg>
      ))}
    </div>
  );
}
