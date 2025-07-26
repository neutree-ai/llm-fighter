import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext, GameResult } from "../types";

const GameResultUpdateItem = GameResult.pick({
  id: true,
});

export class GameResultUpdate extends OpenAPIRoute {
  schema = {
    request: {
      params: z.object({
        id: Str(),
      }),
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
        description: "Returns the updated game result",
        content: {
          "application/json": {
            schema: z.object({
              series: z.object({
                success: Bool(),
                result: z.object({
                  gameResult: GameResultUpdateItem,
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
    const props = c.executionCtx.props;

    const { id } = data.params;
    const gameResultToUpdate = data.body;

    const row = await c.env.DB.prepare(
      `UPDATE game_results SET
        winner = ?,
        gameConfig = ?,
        logs = ?,
        violationLogs = ?,
        tokenLogs = ?,
        p1Config = ?,
        p2Config = ?,
        public = ?
      WHERE id = ? AND owner_id = ?
      RETURNING id`
    )
      .bind(
        gameResultToUpdate.winner,
        gameResultToUpdate.gameConfig,
        gameResultToUpdate.logs,
        gameResultToUpdate.violationLogs,
        gameResultToUpdate.tokenLogs,
        gameResultToUpdate.p1Config,
        gameResultToUpdate.p2Config,
        gameResultToUpdate.public ? 1 : 0,
        id,
        props.userId
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
