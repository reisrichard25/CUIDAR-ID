import { temporary } from "./temporary";
import { profilesAPI } from "./profiles";
/** Cloudflare Worker entry point for the vinext-starter template. */
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  TEMP: KVNamespace;
  DB?: D1Database;
  CUIDAR_ADMIN_EMAIL?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/temporarias" || url.pathname.startsWith("/temporaria/")) return temporary(request, env.TEMP);
    if (url.pathname.startsWith("/api/")) return profilesAPI(request, env.DB, env.CUIDAR_ADMIN_EMAIL);

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
