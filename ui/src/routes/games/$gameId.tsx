import GameDetail from "@/components/GameDetail";
import { useApiKeyStore } from "@/lib/api-key-manager";
import { useWhoami } from "@/lib/auth";
import { api } from "@/lib/game/api";
import { BattleRunner, type GameResult } from "@/lib/game/runner";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/games/$gameId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { gameId } = Route.useParams();

  const { data, isLoading: isAuthing } = useWhoami();

  const gameData = useQuery({
    queryKey: ["games", gameId],
    queryFn: () => api.getGame(gameId, { userId: data?.user.userId ?? "" }),
    enabled: !!gameId && !isAuthing,
  });
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const runnerRef = useRef<BattleRunner>(null);

  const { getApiKeys } = useApiKeyStore();

  useEffect(() => {
    if (runnerRef.current) {
      return;
    }

    if (!gameData.data || gameData.data.winner) {
      return;
    }

    const { p1Key, p2Key } = getApiKeys(gameData.data.id);

    runnerRef.current = new BattleRunner({
      checkpoint: {
        ...gameData.data,
        p1Config: {
          ...gameData.data.p1Config,
          apiKey: p1Key,
        },
        p2Config: {
          ...gameData.data.p2Config,
          apiKey: p2Key,
        },
      },
      onResult: async (result) => {
        await api.updateGame(gameId, {
          ...result,
          public: gameData.data?.public ?? true,
          featured: false,
        });
        setGameResult(result);
      },
    });

    // TODO: enable restore
    if (p1Key && p2Key) {
      runnerRef.current.runBattle();
    }
  }, [gameData.data, gameId, getApiKeys]);

  if (gameData.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!gameData.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Game not found
      </div>
    );
  }

  return <GameDetail gameResult={gameResult ?? gameData.data} />;
}
