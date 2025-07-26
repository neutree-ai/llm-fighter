import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, GameResult } from "../types";

const GameResultListItem = GameResult.pick({
  id: true,
  winner: true,
  p1Config: true,
  p2Config: true,
  gameConfig: true,
  created_at: true,
  owner_id: true,
});

export const GameResultListSchema = {
  request: {
    query: z.object({
      page: Num({
        description: "Page number",
        default: 0,
      }),
      isCompleted: Bool({
        description: "Filter by completed flag",
        required: false,
      }),
    }),
  },
  responses: {
    "200": {
      description: "Returns a list of game results",
      content: {
        "application/json": {
          schema: z.object({
            series: z.object({
              success: Bool(),
              result: z.object({
                gameResults: GameResultListItem.array(),
              }),
            }),
          }),
        },
      },
    },
  },
};

export class GameResultList extends OpenAPIRoute {
  schema = GameResultListSchema;

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const props = c.executionCtx.props;

    const { page, isCompleted } = data.query;

    const params: any[] = [props.userId];

    let where = "WHERE (public = 1 OR owner_id = ?)";

    if (isCompleted === true) where += " AND winner IS NOT NULL";
    if (isCompleted === false) where += " AND winner IS NULL";

    const sql = `SELECT * FROM game_results ${where} ORDER BY created_at DESC LIMIT 50 OFFSET ?`;

    params.push(page * 50);
    const { results } = await c.env.DB.prepare(sql)
      .bind(...params)
      .all<z.infer<typeof GameResult>>();

    return {
      success: true,
      gameResults: results.map((result) => ({
        id: result.id,
        winner: result.winner,
        p1Config: JSON.parse(result.p1Config),
        p2Config: JSON.parse(result.p2Config),
        gameConfig: JSON.parse(result.gameConfig),
        created_at: result.created_at,
        owner_id: result.owner_id,
      })),
    };
  }
}
