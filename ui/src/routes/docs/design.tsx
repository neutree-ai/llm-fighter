import { createFileRoute } from "@tanstack/react-router";
import DocPage from "@/components/DocPage";
import content from "./design.md?raw";

export const Route = createFileRoute("/docs/design")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DocPage content={content} />;
}
