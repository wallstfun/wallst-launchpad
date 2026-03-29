import { NextRequest, NextResponse } from "next/server";
import { getDb, tokensTable } from "@/lib/db";
import { eq } from "drizzle-orm";

const TICKER_COOLDOWN_MS = 15 * 60 * 1000;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get("ticker");

    if (!ticker) {
      return NextResponse.json({ error: "ticker is required" }, { status: 400 });
    }

    const db = getDb();
    const upperTicker = ticker.toUpperCase();

    const recentTokens = await db
      .select()
      .from(tokensTable)
      .where(eq(tokensTable.ticker, upperTicker));

    const mostRecent = recentTokens.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    if (!mostRecent) {
      return NextResponse.json({ available: true, minutesRemaining: null });
    }

    const elapsed = Date.now() - new Date(mostRecent.createdAt).getTime();
    if (elapsed >= TICKER_COOLDOWN_MS) {
      return NextResponse.json({ available: true, minutesRemaining: null });
    }

    const minutesRemaining = Math.ceil((TICKER_COOLDOWN_MS - elapsed) / 60000);
    return NextResponse.json({ available: false, minutesRemaining });
  } catch (err) {
    console.error("GET /api/launchpad/check-ticker:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
