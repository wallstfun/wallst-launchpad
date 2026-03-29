import { NextRequest, NextResponse } from "next/server";
import { getDb, tokensTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateProgressBody = z.object({
  solRaised: z.number().min(0),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const tokenId = parseInt(id, 10);

    if (isNaN(tokenId)) {
      return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
    }

    const json = await req.json();
    const body = UpdateProgressBody.parse(json);

    const [token] = await db
      .select()
      .from(tokensTable)
      .where(eq(tokensTable.id, tokenId));

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const migrated = body.solRaised >= token.bondingCurveTarget;

    const [updated] = await db
      .update(tokensTable)
      .set({ solRaised: body.solRaised, migrated })
      .where(eq(tokensTable.id, tokenId))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("PATCH /api/launchpad/[id]/update-progress:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
