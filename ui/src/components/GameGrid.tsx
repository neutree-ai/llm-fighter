import { api, queryClient } from "@/lib/game/api";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { useWhoami } from "@/lib/auth";
import DoubleCheckDeleteButton from "@/components/DoubleCheckDeleteButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface GameGridProps {
  title: string;
  section: string;
  showFilter?: boolean;
  showPagination?: boolean;
  emptyMessage?: string;
  defaultExpanded?: boolean;
}

export function GameGrid({
  title,
  section,
  showFilter = true,
  showPagination = true,
  emptyMessage,
  defaultExpanded = false,
}: GameGridProps) {
  const navigate = useNavigate();
  const { data: userData, isLoading: isAuthing } = useWhoami();
  const [filters, setFilters] = useState<{ model: string }>({ model: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const debouncedModel = useDebouncedValue(filters.model, 500);

  const {
    data: games,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["games", section, currentPage, debouncedModel],
    queryFn: () =>
      api.listGames(
        { page: currentPage, model: debouncedModel, section },
        {
          userId: userData?.user.userId ?? "",
        }
      ),
    enabled: !isAuthing,
  });

  // Reset to first page when filters change
  const handleModelFilterChange = (value: string) => {
    setFilters({ model: value });
    setCurrentPage(0);
  };

  const { mutateAsync: deleteGame, isPending: isDeleting } = useMutation({
    mutationKey: ["deleteGame", section],
    mutationFn: (gameId: string) => api.deleteGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games", section] });
    },
  });

  // Calculate if we should show pagination
  const getSectionLimit = (section: string) => {
    if (section === "recent") return 6;
    if (section === "featured") return 20;
    return 50;
  };

  const sectionLimit = getSectionLimit(section);
  const hasNextPage = games && games.length === sectionLimit;
  const hasPrevPage = currentPage > 0;

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-foreground" />
          )}
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        {isExpanded && showFilter && (
          <div className="filters flex flex-col sm:flex-row gap-2 sm:items-center">
            <Label className="text-foreground whitespace-nowrap">
              Filter By Model
            </Label>
            <Input
              className="text-foreground sm:max-w-xs"
              value={filters.model}
              onChange={(e) => handleModelFilterChange(e.target.value)}
              placeholder="Type to filter..."
            />
          </div>
        )}
      </div>

      {isExpanded && isLoading && (
        <Loader2 className="w-8 h-8 animate-spin text-foreground mx-auto mt-10" />
      )}

      {isExpanded && error && (
        <div className="text-red-500 text-center mt-4">
          <p>Error loading games: {error.message}</p>
        </div>
      )}

      {isExpanded && !isLoading && !error && games?.length === 0 && (
        <div className="text-gray-500 text-center mt-10">
          {emptyMessage || "No games found."}
        </div>
      )}

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(games || []).map((game) => (
          <div
            key={game.id}
            className={cn(
              "group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl py-4 px-2 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden",
              `before:absolute before:inset-0 before:bg-[url('/background.webp')] before:bg-cover before:bg-center before:opacity-20 before:transition-opacity before:duration-500 hover:before:opacity-80 before:-z-1 before:blur-xl hover:before:blur-none`
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
              <Badge variant="secondary">
                game config: {getGameConfigVersion(game.gameConfig)}
              </Badge>
              <Badge variant="secondary">
                p1 prompt: {getPromptVersion(game.p1Config.systemPrompt ?? "")}
              </Badge>
              <Badge variant="secondary">
                p2 prompt: {getPromptVersion(game.p2Config.systemPrompt ?? "")}
              </Badge>
              <Badge variant="secondary">
                {game.public ? "public" : "private"}
              </Badge>
            </div>

            <div className="flex items-center text-foreground text-sm leading-relaxed line-clamp-3 justify-between">
              <div className="flex items-center py-1">
                <Calendar className="mr-2 w-3" />
                {new Date(game.created_at).toLocaleString()}
              </div>

              {userData?.user.userId &&
                game.owner_id === userData.user.userId && (
                  <DoubleCheckDeleteButton
                    className="hidden group-hover:block cursor-pointer z-10"
                    onDelete={() => deleteGame(game.id)}
                    disabled={isDeleting}
                  />
                )}
            </div>

            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
          </div>
        ))}
        </div>
      )}

      {isExpanded && showPagination && (hasPrevPage || hasNextPage) && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              {hasPrevPage && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink className="cursor-default">
                  Page {currentPage + 1}
                </PaginationLink>
              </PaginationItem>

              {hasNextPage && (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
