import { NextRequest, NextResponse } from "next/server";
import { getDb, tokensTable } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const TICKER_COOLDOWN_MS = 15 * 60 * 1000;

const CreateTokenBody = z.object({
  name: z.string().min(1),
  ticker: z.string().min(1).max(10),
  description: z.string().default(""),
  imageUrl: z.string().nullable().optional(),
  bondingCurveTarget: z.number().default(42),
  creatorWallet: z.string().nullable().optional(),
  mintAddress: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const db = getDb();
    const tokens = await db
      .select()
      .from(tokensTable)
      .orderBy(desc(tokensTable.createdAt));
    return NextResponse.json(tokens);
  } catch (err) {
    console.error("GET /api/launchpad/tokens:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const json = await req.json();
    const body = CreateTokenBody.parse(json);

    const upperTicker = body.ticker.toUpperCase();

    const recentTokens = await db
      .select()
      .from(tokensTable)
      .where(eq(tokensTable.ticker, upperTicker));

    const mostRecent = recentTokens.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    if (mostRecent) {
      const elapsed = Date.now() - new Date(mostRecent.createdAt).getTime();
      if (elapsed < TICKER_COOLDOWN_MS) {
        const minutesRemaining = Math.ceil(
          (TICKER_COOLDOWN_MS - elapsed) / 60000
        );
        return NextResponse.json(
          {
            error: `This ticker was launched recently. Please wait ${minutesRemaining} minutes before reusing it.`,
            minutesRemaining,
          },
          { status: 409 }
        );
      }
    }

    const [token] = await db
      .insert(tokensTable)
      .values({
        name: body.name,
        ticker: upperTicker,
        description: body.description,
        imageUrl: body.imageUrl ?? null,
        bondingCurveTarget: body.bondingCurveTarget,
        solRaised: 0,
        creatorWallet: body.creatorWallet ?? null,
        mintAddress: body.mintAddress ?? null,
        migrated: false,
      })
      .returning();

    return NextResponse.json(token, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("POST /api/launchpad/tokens:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
