import { createFileRoute } from "@tanstack/react-router";
import DocPage from "@/components/DocPage";
import content from "./faq.md?raw";

export const Route = createFileRoute("/docs/faq")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DocPage content={content} />;
}
