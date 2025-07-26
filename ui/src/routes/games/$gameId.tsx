import GameDetail from "@/components/GameDetail";
import { api } from "@/lib/game/api";
import { BattleRunner, type GameResult } from "@/lib/game/runner";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/games/$gameId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { gameId } = Route.useParams();

  const gameData = useQuery({
    queryKey: ["games", gameId],
    queryFn: () => api.getGame(gameId),
    enabled: !!gameId,
  });
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const runnerRef = useRef<BattleRunner>(null);

  useEffect(() => {
    if (runnerRef.current) {
      return;
    }

    if (!gameData.data || gameData.data.winner) {
      return;
    }

    runnerRef.current = new BattleRunner({
      checkpoint: gameData.data,
      onResult: async (result) => {
        await api.updateGame(gameId, result);
        setGameResult(result);
      },
    });

    // TODO: enable restore
    if (gameData.data.p1Config.apiKey !== "*") {
      runnerRef.current.runBattle();
    }
  }, [gameData.data, gameId]);

  if (!gameData.data) {
    return <div>Game not found</div>;
  }

  if (gameData.isLoading) {
    return <div>Loading...</div>;
  }

  return <GameDetail gameResult={gameResult ?? gameData.data} />;
}
