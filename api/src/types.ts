import { DateTime, Str, Enumeration } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const GameResult = z.object({
  id: Str(),
  winner: Str().nullable(),
  gameConfig: Str(),
  logs: Str(),
  violationLogs: Str(),
  tokenLogs: Str(),
  p1Config: Str(),
  p2Config: Str(),
  created_at: DateTime({
    default: true,
  }),
});
