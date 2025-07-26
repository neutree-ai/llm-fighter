import { fromHono, Obj } from "chanfana";
import { Hono } from "hono";
import { GameResultCreate } from "./endpoints/game-result-create";
import { GameResultDelete } from "./endpoints/game-result-delete";
import { GameResultFetch } from "./endpoints/game-result-fetch";
import { GameResultList } from "./endpoints/game-result-list";
import { GameResultUpdate } from "./endpoints/game-result-update";
import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import { PublicGameResultList } from "./endpoints/public-game-result-list";
import { PublicGameResultFetch } from "./endpoints/public-game-fetch";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/openapi-docs",
});

// Register OpenAPI endpoints
openapi.get("/api/private/game-results", GameResultList);
openapi.post("/api/private/game-results", GameResultCreate);
openapi.put("/api/private/game-results/:id", GameResultUpdate);
openapi.get("/api/private/game-results/:id", GameResultFetch);
openapi.delete("/api/private/game-results/:id", GameResultDelete);

openapi.get("/api/public/game-results", PublicGameResultList);
openapi.get("/api/public/game-results/:id", PublicGameResultFetch);

// Auth
app.get("/api/private/whoami", (c) => {
  const props = c.executionCtx?.props;
  return c.json({ props });
});

const apiHandler = {
  fetch: (req: Request, env: Env, ctx: ExecutionContext) =>
    app.fetch(req, env, ctx),
};

const defaultHandler = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/auth/authorize") {
      const oauthReq = await (env as any).OAUTH_PROVIDER.parseAuthRequest(
        request
      );

      const state = crypto
        .getRandomValues(new Uint8Array(16))
        .reduce((s, b) => s + b.toString(16).padStart(2, "0"), "");
      await env.SESSIONS_KV.put(`oauth:${state}`, JSON.stringify(oauthReq), {
        expirationTtl: 3600,
      });

      const ghAuthUrl = new URL("https://github.com/login/oauth/authorize");
      ghAuthUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      ghAuthUrl.searchParams.set("redirect_uri", env.GITHUB_REDIRECT_URI);
      ghAuthUrl.searchParams.set("scope", "read:user user:email");
      ghAuthUrl.searchParams.set("state", state);
      return Response.redirect(ghAuthUrl.toString(), 302);
    }

    if (url.pathname === "/auth/github/callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (!code || !state)
        return new Response("Missing code/state", { status: 400 });
      const raw = await env.SESSIONS_KV.get(`oauth:${state}`);
      if (!raw) return new Response("Invalid state", { status: 400 });
      const oauthReq = JSON.parse(raw);
      await env.SESSIONS_KV.delete(`oauth:${state}`);

      const tokenResp = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: (env as any).GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: env.GITHUB_REDIRECT_URI,
          }),
        }
      ).then((r) => r.json() as Promise<{ access_token?: string }>);
      if (!tokenResp.access_token)
        return new Response("Token exchange failed", { status: 400 });

      const ghUser = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenResp.access_token}`,
          "User-Agent": "cf-worker",
        },
      }).then(
        (r) =>
          r.json() as Promise<{
            id: number;
            login: string;
            avatar_url?: string;
          }>
      );

      const userId = `github_${ghUser.id}`;
      await env.DB.batch([
        env.DB.prepare(
          `INSERT OR IGNORE INTO users (id, login, avatar_url) VALUES (?, ?, ?)`
        ).bind(userId, ghUser.login, ghUser.avatar_url ?? null),
        env.DB.prepare(
          `INSERT OR REPLACE INTO oauth_accounts (provider, provider_user_id, user_id) VALUES ('github', ?, ?)`
        ).bind(String(ghUser.id), userId),
      ]);

      const { redirectTo } = await (
        env as any
      ).OAUTH_PROVIDER.completeAuthorization({
        request: oauthReq,
        userId,
        scope: oauthReq.scope ? oauthReq.scope : [],
        metadata: { provider: "github", login: ghUser.login },
        props: {
          userId,
          login: ghUser.login,
          avatarUrl: ghUser.avatar_url ?? null,
        },
      });
      return Response.redirect(redirectTo, 302);
    }

    return app.fetch(request, env, ctx);
  },
};

export default new OAuthProvider({
  apiRoute: ["/api/private"],
  // TODO: fix types in-compatibility
  apiHandler: apiHandler as any,
  defaultHandler: defaultHandler as any,
  authorizeEndpoint: "/auth/authorize",
  tokenEndpoint: "/auth/token",
  clientRegistrationEndpoint: "/auth/register",
});
