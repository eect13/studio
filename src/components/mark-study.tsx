import { useEffect, useRef } from "react";
import { MARK_D, MARK_VIEWBOX } from "@/lib/mark";
import { useStudioTheme } from "@/lib/theme";

/** Outer hourglass, eye, and the e. Same geometry as the filled logo. */
const PARTS = MARK_D.split(/(?=M)/).filter((d) => d.startsWith("M"));

export function MarkStudy() {
  const ground = useStudioTheme((s) => s.ground);
  const on = ground === "mark";
  const runners = useRef<Array<SVGPathElement | null>>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paths = runners.current.filter((p): p is SVGPathElement => p instanceof SVGPathElement);
    const lengths = paths.map((p) => p.getTotalLength() || 1);
    const pointer = { x: 0, y: 0 };

    const paint = (now: number) => {
      const scrolling = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);
      paths.forEach((p, i) => {
        const len = lengths[i];
        if (reduce) {
          p.style.strokeDasharray = "none";
          p.style.strokeDashoffset = "0";
          return;
        }
        const dash = len * 0.22;
        const phase = (now / 14000 + i * 0.33 + pointer.x * 0.07 + pointer.y * 0.04 + scrolling * 0.2) % 1;
        const along = ((phase % 1) + 1) % 1;
        p.style.strokeDasharray = `${dash} ${Math.max(len - dash, 1)}`;
        p.style.strokeDashoffset = `${-along * len}`;
      });
    };

    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    let raf = 0;
    const tick = (now: number) => {
      const show = !document.hidden && useStudioTheme.getState().ground === "mark";
      if (!show) {
        raf = 0;
        return;
      }
      paint(now);
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && !document.hidden && useStudioTheme.getState().ground === "mark") {
        raf = requestAnimationFrame(tick);
      }
    };

    paint(performance.now());
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", wake);
    const unsub = useStudioTheme.subscribe(wake);
    wake();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", wake);
      unsub();
    };
  }, []);

  return (
    <div className="mark-study" data-off={on ? "false" : "true"} aria-hidden="true">
      <svg viewBox={MARK_VIEWBOX} className="mark-study-svg">
        <path className="study-fill" fillRule="evenodd" d={MARK_D} />
        {PARTS.map((d) => (
          <path key={`guide-${d.slice(0, 12)}`} className="study-guide" d={d} />
        ))}
        {PARTS.map((d, i) => (
          <path
            key={`run-${d.slice(0, 12)}`}
            ref={(node) => {
              runners.current[i] = node;
            }}
            className="study-line"
            d={d}
          />
        ))}
      </svg>
    </div>
  );
}
