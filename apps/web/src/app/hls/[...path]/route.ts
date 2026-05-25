import type { NextRequest } from "next/server";

/**
 * Reverse proxy from `/hls/*` to MediaMTX (or whatever HLS host is
 * configured). We can't use Next.js `rewrites()` here because MediaMTX
 * issues 302 redirects to paths under `/live/*`, which the browser
 * would follow back to this Next.js origin and 404. A route handler
 * follows the redirects server-side so the client only ever sees the
 * final 200 with the playlist body.
 *
 * Used in dev + ngrok testing. Production points VITE_HLS_HOST direct
 * at the stream subdomain and this route is bypassed.
 */

const TARGET = (process.env.HLS_PROXY_TARGET || "http://localhost:8888").replace(
  /\/$/,
  "",
);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, await params);
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, await params);
}

async function proxy(req: NextRequest, { path }: { path: string[] }) {
  const search = new URL(req.url).search;
  const upstream = `${TARGET}/${path.join("/")}${search}`;

  let res: Response;
  try {
    res = await fetch(upstream, {
      method: req.method,
      redirect: "follow",
      headers: pickForwardableHeaders(req),
    });
  } catch (err) {
    return new Response(
      `HLS upstream unreachable: ${err instanceof Error ? err.message : String(err)}`,
      { status: 502 },
    );
  }

  const headers = new Headers();
  // Forward content-type + CORS so the browser is happy; strip hop-by-hop.
  for (const [k, v] of res.headers) {
    const lower = k.toLowerCase();
    if (lower === "content-type" || lower === "content-length") headers.set(k, v);
  }
  headers.set("Cache-Control", "no-cache");
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(res.body, { status: res.status, headers });
}

function pickForwardableHeaders(req: NextRequest): HeadersInit {
  const out: Record<string, string> = {};
  const ua = req.headers.get("user-agent");
  const range = req.headers.get("range");
  if (ua) out["user-agent"] = ua;
  if (range) out["range"] = range;
  return out;
}
