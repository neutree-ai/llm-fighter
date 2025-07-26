import { fromHono } from "chanfana";
import { Hono } from "hono";
import { GameResultCreate } from "./endpoints/game-result-create";
import { GameResultDelete } from "./endpoints/game-result-delete";
import { GameResultFetch } from "./endpoints/game-result-fetch";
import { GameResultList } from "./endpoints/game-result-list";
import { GameResultUpdate } from "./endpoints/game-result-update";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/game-results", GameResultList);
openapi.post("/api/game-results", GameResultCreate);
openapi.put("/api/game-results/:id", GameResultUpdate);
openapi.get("/api/game-results/:id", GameResultFetch);
openapi.delete("/api/game-results/:id", GameResultDelete);

// Export the Hono app
export default app;
