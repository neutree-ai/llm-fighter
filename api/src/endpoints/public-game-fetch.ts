import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, GameResult } from "../types";
import { GameResultFetchSchema } from "./game-result-fetch";

export class PublicGameResultFetch extends OpenAPIRoute {
  schema = GameResultFetchSchema;

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { id } = data.params;

    const { results } = await c.env.DB.prepare(
      `SELECT * FROM game_results WHERE id = ? AND public = 1`
    )
      .bind(id)
      .all<z.infer<typeof GameResult>>();

    if (results.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Object not found",
        },
        {
          status: 404,
        }
      );
    }

    return {
      success: true,
      gameResult: {
        id: results[0].id,
        winner: results[0].winner,
        gameConfig: JSON.parse(results[0].gameConfig),
        logs: JSON.parse(results[0].logs),
        violationLogs: JSON.parse(results[0].violationLogs),
        tokenLogs: JSON.parse(results[0].tokenLogs),
        p1Config: JSON.parse(results[0].p1Config),
        p2Config: JSON.parse(results[0].p2Config),
        created_at: results[0].created_at,
      },
    };
  }
}
