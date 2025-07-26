import { OpenAPIRoute } from "chanfana";
import { type AppContext, GameResult } from "../types";
import { createSqlWhere, GameResultListSchema } from "./game-result-list";
import { z } from "zod";

export class PublicGameResultList extends OpenAPIRoute {
  schema = GameResultListSchema;

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const { page } = data.query;

    const params: any[] = [];

    const where = createSqlWhere("WHERE public = 1", data.query, params);

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
        public: result.public,
      })),
    };
  }
}
