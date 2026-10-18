import { useEffect, useRef } from "react";
import { MARK_D, MARK_VIEWBOX } from "@/lib/mark";
import { useStudioTheme } from "@/lib/theme";

/** Outer hourglass, eye, and the e. Same geometry as the filled logo. */
const PARTS = MARK_D.split(/(?=M)/).filter((d) => d.startsWith("M"));

export function MarkStudy() {
  const ground = useStudioTheme((s) => s.ground);
  const on = ground !== "orbit";
  const runners = useRef<Array<SVGPathElement | null>>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paths = runners.current.filter((p): p is SVGPathElement => p instanceof SVGPathElement);
    const lengths = paths.map((p) => p.getTotalLength() || 1);
    const pointer = { x: 0, y: 0 };

    const paint = (now: number) => {
      const svg = paths[0]?.ownerSVGElement;
      const width = svg?.getBoundingClientRect().width || 1;
      const scale = width / 733.5;
      const stroke = Math.min(12, Math.max(1.7, 4.6 / scale));
      svg?.style.setProperty("--study-stroke", String(stroke));
      const scrolling = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const period = 10000 + Math.min(scale, 2.2) * 4200;
      paths.forEach((p, i) => {
        const len = lengths[i];
        if (reduce || useStudioTheme.getState().ground === "still") {
          p.style.strokeDasharray = "none";
          p.style.strokeDashoffset = "0";
          return;
        }
        const dash = len * (0.14 + Math.min(scale, 1.6) * 0.05);
        const phase =
          (now / period + i * 0.33 + pointer.x * 0.08 + pointer.y * 0.05 + scrolling * 0.25) % 1;
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
      if (useStudioTheme.getState().ground === "still") paint(performance.now());
      if (!raf && !document.hidden && useStudioTheme.getState().ground === "mark") {
        raf = requestAnimationFrame(tick);
      }
    };

    paint(performance.now());
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", wake);
    document.addEventListener("visibilitychange", wake);
    const unsub = useStudioTheme.subscribe(wake);
    wake();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", wake);
      document.removeEventListener("visibilitychange", wake);
      unsub();
    };
  }, []);

  return (
    <div
      className="mark-study"
      data-off={on ? "false" : "true"}
      data-still={ground === "still" ? "true" : "false"}
      aria-hidden="true"
    >
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
