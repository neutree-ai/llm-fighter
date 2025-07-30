import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useWhoami } from "@/lib/auth";
import { GameGrid } from "@/components/GameGrid";

export const Route = createFileRoute("/games/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useWhoami();

  const stableNotLogin = !data?.user.userId && !isLoading;

  return (
    <div className="bg-background min-h-screen p-4 pt-[80px]">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Games</h1>
          <Link
            to="/games/new"
            disabled={stableNotLogin}
            className="w-full sm:w-auto"
          >
            <Button
              variant="default"
              disabled={stableNotLogin}
              className="w-full sm:w-auto"
            >
              <Plus />
              New
            </Button>
          </Link>
        </div>

        {data?.user.userId && (
          <GameGrid
            title="My Games"
            section="my"
            emptyMessage="No games found. Start by creating a new game."
            defaultExpanded={true}
          />
        )}

        <GameGrid
          title="Featured Games"
          section="featured"
          emptyMessage="No featured games yet."
          defaultExpanded={stableNotLogin}
        />

        <GameGrid
          title="Recent Games"
          section="recent"
          showFilter={false}
          showPagination={false}
          emptyMessage="No recent games found."
          defaultExpanded={stableNotLogin}
        />
      </div>
    </div>
  );
}
