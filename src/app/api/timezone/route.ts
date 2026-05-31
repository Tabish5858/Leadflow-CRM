import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/timezone
 * Proxies IP-based timezone lookup server-side (avoids CORS issues).
 * Falls back to Intl if not available.
 */
export async function GET(req: NextRequest) {
  try {
    // Get client IP from various headers (Cloudflare, standard proxy, direct)
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("true-client-ip") ||
      "";

    if (!clientIp || clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "localhost") {
      return NextResponse.json({ timezone: null });
    }

    const res = await fetch(`http://ip-api.com/json/${clientIp}?fields=timezone`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      return NextResponse.json({ timezone: null });
    }

    const data = await res.json();
    return NextResponse.json({ timezone: data.timezone || null });
  } catch {
    return NextResponse.json({ timezone: null });
  }
}
