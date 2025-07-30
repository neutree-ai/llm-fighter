import { Bool, Num, OpenAPIRoute, Str } from "chanfana";
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
  public: true,
  featured: true,
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
      model: Str({
        required: false,
        description: "Filter by model",
      }),
      section: Str({
        required: false,
        description: "Filter by section: my, featured, recent",
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

export function createSqlWhere(
  base: string,
  {
    isCompleted,
    model,
    section,
  }: z.infer<typeof GameResultListSchema.request.query>,
  params: any[],
  userId?: string
) {
  let where = base;

  if (isCompleted === true) where += " AND winner IS NOT NULL";
  if (isCompleted === false) where += " AND winner IS NULL";

  if (model) {
    where +=
      " AND (p1Config ->> '$.model' LIKE ? OR p2Config ->> '$.model' LIKE ?)";

    params.push(`%${model}%`, `%${model}%`);
  }

  // Handle section filtering
  if (section === "my" && userId) {
    where += ` AND owner_id = ?`;
    params.push(userId);
  } else if (section === "featured") {
    where += ` AND public = 1 AND featured = 1`;
  } else if (section === "recent") {
    where += ` AND public = 1`;
  }

  return where;
}

export function getSectionLimit(section?: string): number {
  if (section === "recent") return 6;
  if (section === "featured") return 20;
  return 50;
}

export function parseGameResult(result: z.infer<typeof GameResult>) {
  return {
    id: result.id,
    winner: result.winner,
    p1Config: JSON.parse(result.p1Config),
    p2Config: JSON.parse(result.p2Config),
    gameConfig: JSON.parse(result.gameConfig),
    created_at: result.created_at,
    owner_id: result.owner_id,
    public: result.public,
    featured: result.featured,
  };
}

export async function queryGames(
  db: D1Database,
  query: z.infer<typeof GameResultListSchema.request.query>,
  userId?: string
) {
  const { page, section } = query;
  const params: any[] = [];
  const limit = getSectionLimit(section);

  const where = createSqlWhere(
    "WHERE (public = 1 OR owner_id = ?)",
    query,
    params,
    userId
  );

  if (userId) {
    params.unshift(userId);
  }

  const sql = `SELECT * FROM game_results ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ?`;
  params.push(page * limit);

  const { results } = await db
    .prepare(sql)
    .bind(...params)
    .all<z.infer<typeof GameResult>>();

  return results.map(parseGameResult);
}

export async function queryPublicGames(
  db: D1Database,
  query: z.infer<typeof GameResultListSchema.request.query>
) {
  const { page, section } = query;
  const params: any[] = [];
  const limit = getSectionLimit(section);

  const where = createSqlWhere("WHERE public = 1", query, params, undefined);

  const sql = `SELECT * FROM game_results ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ?`;
  params.push(page * limit);

  const { results } = await db
    .prepare(sql)
    .bind(...params)
    .all<z.infer<typeof GameResult>>();

  return results.map(parseGameResult);
}

export class GameResultList extends OpenAPIRoute {
  schema = GameResultListSchema;

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const props = c.executionCtx.props;

    const gameResults = await queryGames(c.env.DB, data.query, props.userId);

    return {
      success: true,
      gameResults,
    };
  }
}
