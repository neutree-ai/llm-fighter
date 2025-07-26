import { Button } from "@/components/ui/button";
import { api, queryClient } from "@/lib/game/api";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Calendar, Plus } from "lucide-react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import PlayerCard from "@/components/PlayerCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { getGameConfigVersion, getPromptVersion } from "@/lib/game/config";
import { getRoleState } from "@/lib/game/runner";

const gamesQueryOptions = queryOptions({
  queryKey: ["games"],
  queryFn: () => api.listGames({ page: 0 }),
});

export const Route = createFileRoute("/games/")({
  loader: async () => {
    return queryClient.ensureQueryData(gamesQueryOptions);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: games } = useSuspenseQuery(gamesQueryOptions);
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen p-4  pt-[80px]">
      <div className="container mx-auto">
        <div className="flex justify-end">
          <Link to="/games/new">
            <Button variant="default">
              <Plus />
              New
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {games.map((game) => (
            <div
              key={game.id}
              className={cn(
                "group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl py-4 px-2 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden",
                `before:absolute before:inset-0 before:bg-[url('/background.png')] before:bg-cover before:bg-center before:opacity-20 before:transition-opacity before:duration-500 hover:before:opacity-80 before:-z-1 before:blur-xl hover:before:blur-none`
              )}
              onClick={() => navigate({ to: `/games/${game.id}` })}
            >
              <div className="flex justify-between">
                <Tooltip>
                  <TooltipTrigger>
                    <PlayerCard
                      playerName={game.p1Config.name}
                      width="100%"
                      height="12rem"
                      model={game.p1Config.model}
                      flipImage
                      className={cn(getRoleState(game, "p1"), "flex-1")}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {game.p1Config.name}
                    <br />
                    {game.p1Config.model}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <PlayerCard
                      playerName={game.p2Config.name}
                      width="100%"
                      height="12rem"
                      model={game.p2Config.model}
                      className={cn(getRoleState(game, "p2"), "flex-1")}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {game.p2Config.name}
                    <br />
                    {game.p2Config.model}
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="tags my-4 space-x-2">
                <Badge variant="outline">
                  game config: {getGameConfigVersion(game.gameConfig)}
                </Badge>
                <Badge variant="outline">
                  p1 prompt:{" "}
                  {getPromptVersion(game.p1Config.systemPrompt ?? "")}
                </Badge>
                <Badge variant="outline">
                  p2 prompt:{" "}
                  {getPromptVersion(game.p2Config.systemPrompt ?? "")}
                </Badge>
              </div>

              <div className="flex items-center text-gray-400 text-sm leading-relaxed line-clamp-3">
                <Calendar className="mr-2 w-3" />
                {new Date(game.created_at).toLocaleString()}
              </div>

              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
