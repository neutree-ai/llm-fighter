import { apiFetch } from "../auth";
import type { GameResult } from "./runner";
import { QueryClient } from "@tanstack/react-query";

type ApiGameState = {
  id: string;
  created_at: string;
  public: boolean | null;
  owner_id: string | null;
} & GameResult;

const getApiScope = (userId: string) => {
  return userId ? "private" : "public";
};

export const api = {
  listGames(
    { page, model }: { page: number; model?: string },
    { userId }: { userId: string }
  ): Promise<ApiGameState[]> {
    const search = new URLSearchParams();
    search.set("page", page.toString());
    search.set("isCompleted", "true");
    if (model) {
      search.set("model", model);
    }

    return apiFetch(
      `/api/${getApiScope(userId)}/game-results?${search.toString()}`
    ).then((response) => response.json().then((data) => data.gameResults));
  },
  getGame(
    gameId: string,
    { userId }: { userId: string }
  ): Promise<ApiGameState | undefined> {
    return apiFetch(`/api/${getApiScope(userId)}/game-results/${gameId}`).then(
      (response) => {
        if (response.ok) {
          return response.json().then((data) => data.gameResult);
        }
        return undefined;
      }
    );
  },
  createGame(
    game: Omit<ApiGameState, "id" | "created_at" | "owner_id">
  ): Promise<{ id: string }> {
    return apiFetch("/api/private/game-results", {
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
        public: game.public,
      }),
    }).then((response) => {
      if (response.ok) {
        return response.json().then((data) => data.gameResult);
      }
      throw new Error("Failed to create game");
    });
  },
  updateGame(
    gameId: string,
    result: Omit<ApiGameState, "id" | "created_at" | "owner_id">
  ): Promise<{ id: string }> {
    return apiFetch(`/api/private/game-results/${gameId}`, {
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
        public: result.public,
      }),
    }).then((response) => {
      if (response.ok) {
        return response.json().then((data) => data.gameResult);
      }
      throw new Error("Failed to update game");
    });
  },
  deleteGame(gameId: string): Promise<{ id: string }> {
    return apiFetch(`/api/private/game-results/${gameId}`, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        return response.json().then((data) => data.gameResult);
      }
      throw new Error("Failed to delete game");
    });
  },
  whoami(): Promise<{
    user: { userId: string; login: string; avatarUrl: string };
  }> {
    return apiFetch("/api/private/whoami").then((response) => {
      if (response.ok) {
        return response.json().then((data) => {
          return {
            user: data.props,
          };
        });
      }
      throw new Error("Failed to fetch user information");
    });
  },
};

export const queryClient = new QueryClient();
