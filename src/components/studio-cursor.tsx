import { useEffect, useRef } from "react";

export function StudioCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-studio-cursor");

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rEl = ring.current;
    const dEl = dot.current;
    if (!fine || !rEl || !dEl) {
      return () => root.classList.remove("has-studio-cursor");
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let hover = false;
    let raf = 0;

    const interactive = (el: EventTarget | null) => {
      if (!(el instanceof Element)) return false;
      return Boolean(el.closest("a, button, [role='radio'], [role='button'], input, label, select, textarea"));
    };

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      hover = interactive(e.target);
      if (reduce) {
        x = tx;
        y = ty;
        rEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${hover ? 1.55 : 1})`;
        dEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
    };

    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      rEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${hover ? 1.55 : 1})`;
      dEl.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", move, { passive: true });
    if (!reduce) raf = requestAnimationFrame(tick);

    return () => {
      root.classList.remove("has-studio-cursor");
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="studio-cursor-ring" aria-hidden="true" />
      <div ref={dot} className="studio-cursor-dot" aria-hidden="true" />
    </>
  );
}
