import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tokensTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  CreateTokenBody,
  CheckTickerQueryParams,
  UpdateTokenProgressBody,
  UpdateTokenProgressParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const TICKER_COOLDOWN_MS = 15 * 60 * 1000;

router.get("/tokens", async (_req, res) => {
  const tokens = await db
    .select()
    .from(tokensTable)
    .orderBy(desc(tokensTable.createdAt));
  res.json(tokens);
});

router.post("/tokens", async (req, res) => {
  const body = CreateTokenBody.parse(req.body);

  const upperTicker = body.ticker.toUpperCase();

  const recentTokens = await db
    .select()
    .from(tokensTable)
    .where(eq(tokensTable.ticker, upperTicker));

  const mostRecent = recentTokens.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  if (mostRecent) {
    const elapsed = Date.now() - new Date(mostRecent.createdAt).getTime();
    if (elapsed < TICKER_COOLDOWN_MS) {
      const minutesRemaining = Math.ceil((TICKER_COOLDOWN_MS - elapsed) / 60000);
      res.status(409).json({
        error: `This ticker was launched recently. Please wait ${minutesRemaining} minutes before reusing it.`,
        minutesRemaining,
      });
      return;
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

  res.status(201).json(token);
});

router.get("/check-ticker", async (req, res) => {
  const query = CheckTickerQueryParams.parse(req.query);
  const upperTicker = query.ticker.toUpperCase();

  const recentTokens = await db
    .select()
    .from(tokensTable)
    .where(eq(tokensTable.ticker, upperTicker));

  const mostRecent = recentTokens.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  if (!mostRecent) {
    res.json({ available: true, minutesRemaining: null });
    return;
  }

  const elapsed = Date.now() - new Date(mostRecent.createdAt).getTime();
  if (elapsed >= TICKER_COOLDOWN_MS) {
    res.json({ available: true, minutesRemaining: null });
    return;
  }

  const minutesRemaining = Math.ceil((TICKER_COOLDOWN_MS - elapsed) / 60000);
  res.json({ available: false, minutesRemaining });
});

router.patch("/tokens/:id/update-progress", async (req, res) => {
  const params = UpdateTokenProgressParams.parse(req.params);
  const body = UpdateTokenProgressBody.parse(req.body);

  const [token] = await db
    .select()
    .from(tokensTable)
    .where(eq(tokensTable.id, params.id));

  if (!token) {
    res.status(404).json({ error: "Token not found" });
    return;
  }

  const migrated = body.solRaised >= token.bondingCurveTarget;

  const [updated] = await db
    .update(tokensTable)
    .set({ solRaised: body.solRaised, migrated })
    .where(eq(tokensTable.id, params.id))
    .returning();

  res.json(updated);
});

export default router;
