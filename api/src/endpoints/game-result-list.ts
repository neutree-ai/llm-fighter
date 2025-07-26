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
});

export class GameResultList extends OpenAPIRoute {
  schema = {
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

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const { page, isCompleted } = data.query;

    let query: string;
    let stmt: D1PreparedStatement;
    if (isCompleted === undefined) {
      query = `SELECT * FROM game_results ORDER BY created_at DESC LIMIT 50 OFFSET ?`;
      stmt = c.env.DB.prepare(query).bind(page * 50);
    } else if (isCompleted) {
      query = `SELECT * FROM game_results WHERE winner IS NOT NULL ORDER BY created_at DESC LIMIT 50 OFFSET ?`;
      stmt = c.env.DB.prepare(query).bind(page * 50);
    } else {
      query = `SELECT * FROM game_results WHERE winner IS NULL ORDER BY created_at DESC LIMIT 50 OFFSET ?`;
      stmt = c.env.DB.prepare(query).bind(page * 50);
    }
    const { results } = await stmt.all<z.infer<typeof GameResultListItem>>();

    return {
      success: true,
      gameResults: results.map((result) => ({
        id: result.id,
        winner: result.winner,
        p1Config: JSON.parse(result.p1Config),
        p2Config: JSON.parse(result.p2Config),
        gameConfig: JSON.parse(result.gameConfig),
        created_at: result.created_at,
      })),
    };
  }
}
