import type { ReactNode } from "react";
import { MARK_D, MARK_VIEWBOX } from "@/lib/mark";
import { Mark } from "@/components/mark";
import { cn } from "@/lib/utils";

function Frame({
  n,
  label,
  children,
}: {
  n: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="min-w-0">
      <div className="mark-frame">{children}</div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
        {n} · {label}
      </p>
    </li>
  );
}

function MarkSketch({ className }: { className?: string }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={cn("h-full w-auto text-lime", className)}
      fill="none"
      aria-hidden="true"
    >
      <line
        x1="366.75"
        y1="12"
        x2="366.75"
        y2="822"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="11 13"
        opacity="0.32"
      />
      <line
        x1="18"
        y1="417"
        x2="715"
        y2="417"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="11 13"
        opacity="0.32"
      />
      <path
        d="M148 14L585 14C678 32 724 108 718 198L608 417L718 636C724 726 670 804 585 820L148 820C62 804 10 726 16 636L125 417L16 198C10 108 62 32 148 14Z"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <ellipse
        cx="366.75"
        cy="417"
        rx="230"
        ry="138"
        stroke="currentColor"
        strokeWidth="6"
        opacity="0.75"
      />
      <circle cx="366.75" cy="428" r="96" stroke="currentColor" strokeWidth="8" />
      <line
        x1="272"
        y1="400"
        x2="460"
        y2="400"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MarkProcess() {
  return (
    <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Frame n="01" label="Sketch">
        <MarkSketch />
      </Frame>
      <Frame n="02" label="Paths">
        <svg viewBox={MARK_VIEWBOX} className="h-full w-auto text-lime" fill="none" aria-hidden="true">
          <path d={MARK_D} fillRule="evenodd" stroke="currentColor" strokeWidth="7" />
        </svg>
      </Frame>
      <Frame n="03" label="SVG">
        <Mark className="h-full w-auto" />
      </Frame>
    </ol>
  );
}
