import { MARK_D, MARK_VIEWBOX } from "@/lib/mark";
import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={cn("text-lime", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path fillRule="evenodd" d={MARK_D} />
    </svg>
  );
}
