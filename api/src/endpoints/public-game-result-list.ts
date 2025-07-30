import { OpenAPIRoute } from "chanfana";
import { type AppContext } from "../types";
import { queryPublicGames, GameResultListSchema } from "./game-result-list";

export class PublicGameResultList extends OpenAPIRoute {
  schema = GameResultListSchema;

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const gameResults = await queryPublicGames(c.env.DB, data.query);

    return {
      success: true,
      gameResults,
    };
  }
}
