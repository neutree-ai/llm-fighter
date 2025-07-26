import { useQuery } from "@tanstack/react-query";
import { api } from "./game/api";

// --- PKCE utils ---
function base64url(buf: ArrayBuffer) {
  const str = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function randomString(len = 64) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ("0" + b.toString(16)).slice(-2)).join("");
}
async function sha256(input: string) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return base64url(digest);
}

const STORAGE_KEY = "oauth_tokens";
type Tokens = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
};

export function getTokens(): Tokens | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
function setTokens(t: Tokens | null) {
  if (t) localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  else localStorage.removeItem(STORAGE_KEY);
}

const STATE_KEY = "pkce_state";
const VERIFIER_KEY = "pkce_verifier";

const BASE = import.meta.env.VITE_APP_AUTH_ORIGIN ?? location.origin;
const CLIENT_ID = "JPSwfoTzCqEjfYkm";
const REDIRECT_URI = `${location.origin}/oauth/callback`;

export async function signIn(scope = "profile") {
  const state = randomString(16);
  const verifier = randomString(64); // 43~128
  const challenge = await sha256(verifier);

  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(VERIFIER_KEY, verifier);

  const url = new URL("/auth/authorize", BASE);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  window.location.href = url.toString();
}

export async function handleAuthCallback() {
  const now = Math.floor(Date.now() / 1000);
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);

  if (!code || !state || !savedState || !verifier || state !== savedState) {
    throw new Error("Invalid OAuth state or code");
  }

  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", CLIENT_ID);
  body.set("code", code);
  body.set("redirect_uri", REDIRECT_URI);
  body.set("code_verifier", verifier);

  const resp = await fetch(new URL("/auth/token", BASE), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) throw new Error("Token exchange failed");
  const tok = (await resp.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  setTokens({
    access_token: tok.access_token,
    refresh_token: tok.refresh_token,
    expires_at: tok.expires_in ? now + tok.expires_in - 30 : undefined, // 提前30s
  });

  return {
    ok: true,
  };
}

export async function refreshTokens() {
  const t = getTokens();
  if (!t?.refresh_token) return null;

  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("client_id", CLIENT_ID);
  body.set("refresh_token", t.refresh_token);

  const resp = await fetch(new URL("/auth/token", BASE), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) {
    setTokens(null);
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  const tok = (await resp.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
  const newTokens: Tokens = {
    access_token: tok.access_token,
    refresh_token: tok.refresh_token ?? t.refresh_token,
    expires_at: tok.expires_in ? now + tok.expires_in - 30 : undefined,
  };
  setTokens(newTokens);
  return newTokens;
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  let t = getTokens();
  const now = Math.floor(Date.now() / 1000);

  if (t?.expires_at && t.expires_at <= now) {
    t = (await refreshTokens()) ?? t;
  }

  const headers = new Headers(init.headers);
  if (t?.access_token) {
    headers.set("Authorization", `Bearer ${t.access_token}`);
  }
  const resp = await fetch(input, { ...init, headers });

  if (resp.status === 401 && t?.refresh_token) {
    const nt = await refreshTokens();
    if (nt?.access_token) {
      headers.set("Authorization", `Bearer ${nt.access_token}`);
      return fetch(input, { ...init, headers });
    }
  }
  return resp;
}

export function signOut() {
  setTokens(null);
  location.reload();
}

export function useWhoami() {
  const authed = Boolean(getTokens());

  const { data, error, isLoading } = useQuery({
    queryKey: ["whoami"],
    queryFn: api.whoami,
    enabled: authed,
    retry: 1,
  });

  return {
    authed,
    data,
    error,
    isLoading,
  };
}
