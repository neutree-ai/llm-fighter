import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext, GameResult } from "../types";

const GameResultDeleteItem = GameResult.pick({
  id: true,
});

export class GameResultDelete extends OpenAPIRoute {
  schema = {
    request: {
      params: z.object({
        id: Str(),
      }),
    },
    responses: {
      "200": {
        description: "Returns if the game result was deleted successfully",
        content: {
          "application/json": {
            schema: z.object({
              series: z.object({
                success: Bool(),
                result: z.object({
                  gameResult: GameResultDeleteItem,
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

    const { id } = data.params;

    const { results } = await c.env.DB.prepare(
      `DELETE FROM game_results WHERE id = ?`
    )
      .bind(id)
      .all<z.infer<typeof GameResultDeleteItem>>();

    return {
      result: {
        gameResult: results[0],
      },
      success: results.length > 0,
    };
  }
}
