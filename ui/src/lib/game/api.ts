import type { GameResult } from "./runner";
import { QueryClient } from "@tanstack/react-query";

type ApiGameState = {
  id: string;
  created_at: string;
} & GameResult;

export const api = {
  listGames({ page }: { page: number }): Promise<ApiGameState[]> {
    return fetch(`/api/game-results?page=${page}&isCompleted=true`).then(
      (response) => response.json().then((data) => data.gameResults)
    );
  },
  getGame(gameId: string): Promise<ApiGameState | undefined> {
    return fetch(`/api/game-results/${gameId}`).then((response) => {
      if (response.ok) {
        return response.json().then((data) => data.gameResult);
      }
      return undefined;
    });
  },
  createGame(
    game: Omit<ApiGameState, "id" | "created_at">
  ): Promise<{ id: string }> {
    return fetch("/api/game-results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        winner: game.winner,
        gameConfig: JSON.stringify(game.gameConfig),
        logs: JSON.stringify(game.logs),
        violationLogs: JSON.stringify(game.violationLogs),
        tokenLogs: JSON.stringify(game.tokenLogs),
        p1Config: JSON.stringify(game.p1Config),
        p2Config: JSON.stringify(game.p2Config),
      }),
    }).then((response) => {
      if (response.ok) {
        return response.json().then((data) => data.gameResult);
      }
      throw new Error("Failed to create game");
    });
  },
  updateGame(gameId: string, result: GameResult): Promise<{ id: string }> {
    return fetch(`/api/game-results/${gameId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        winner: result.winner,
        gameConfig: JSON.stringify(result.gameConfig),
        logs: JSON.stringify(result.logs),
        violationLogs: JSON.stringify(result.violationLogs),
        tokenLogs: JSON.stringify(result.tokenLogs),
        p1Config: JSON.stringify(result.p1Config),
        p2Config: JSON.stringify(result.p2Config),
      }),
    }).then((response) => {
      if (response.ok) {
        return response.json().then((data) => data.gameResult);
      }
      throw new Error("Failed to update game");
    });
  },
  deleteGame(gameId: string): Promise<{ id: string }> {
    return fetch(`/api/game-results/${gameId}`, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        return response.json().then((data) => data.gameResult);
      }
      throw new Error("Failed to delete game");
    });
  },
};

export const queryClient = new QueryClient();
