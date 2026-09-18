import { createFileRoute } from "@tanstack/react-router";
import { AtriumApp } from "@/components/atrium/app";

export const Route = createFileRoute("/atrium")({ component: AtriumPage });

function AtriumPage() {
  return <AtriumApp />;
}
