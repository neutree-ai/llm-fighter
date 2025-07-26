import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, GameResult } from "../types";

const GameResultCreateItem = GameResult.pick({
  id: true,
});

export class GameResultCreate extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          "application/json": {
            schema: GameResult.omit({
              id: true,
              created_at: true,
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created game result id",
        content: {
          "application/json": {
            schema: z.object({
              series: z.object({
                success: Bool(),
                result: z.object({
                  gameResult: GameResultCreateItem,
                }),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const gameResultToCreate = data.body;

    const row = await c.env.DB.prepare(
      `INSERT INTO game_results (
				winner,
				gameConfig,
				logs,
				violationLogs,
				tokenLogs,
				p1Config,
				p2Config
			) VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING id`
    )
      .bind(
        gameResultToCreate.winner,
        gameResultToCreate.gameConfig,
        gameResultToCreate.logs,
        gameResultToCreate.violationLogs,
        gameResultToCreate.tokenLogs,
        gameResultToCreate.p1Config,
        gameResultToCreate.p2Config
      )
      .first();

    return {
      success: Boolean(row),
      gameResult: {
        id: row?.id,
      },
    };
  }
}
