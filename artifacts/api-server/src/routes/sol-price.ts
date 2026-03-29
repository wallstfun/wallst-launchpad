import { Router, type IRouter } from "express";

/* ─── Server-side in-memory cache ────────────────────────────────────────────
 *
 * Budget math (CoinGecko Demo plan: 10,000 calls/month, 30 RPM):
 *
 *   10,000 calls  ÷  30 days  ÷  24 h  ÷  60 min  ÷  60 s  =  1 call / 259 s
 *
 *   Cache TTL = 270 s  →  max 9,600 calls/month  (400-call safety buffer)
 *   Rate limit: 30 req/min → polling at 1 per 270 s = 0.22 req/min (well within)
 *
 *   All browser clients poll /api/sol-price every 120 s.  The Express server
 *   only hits CoinGecko when the 270 s TTL expires; every other request is
 *   served from the cache instantly.
 * ─────────────────────────────────────────────────────────────────────────── */

const CACHE_TTL_MS = 270_000; // 4.5 minutes

let cachedPrice: number | null = null;
let cacheTimestamp = 0;

const router: IRouter = Router();

router.get("/sol-price", async (_req, res) => {
  const now = Date.now();

  if (cachedPrice !== null && now - cacheTimestamp < CACHE_TTL_MS) {
    res.json({ price: cachedPrice, cachedAt: cacheTimestamp, stale: false });
    return;
  }

  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: "COINGECKO_API_KEY not configured",
      price: cachedPrice,
    });
    return;
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { headers: { "x-cg-demo-api-key": apiKey } }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko responded ${response.status}`);
    }

    const data = await response.json() as { solana?: { usd?: number } };
    const price = data?.solana?.usd;

    if (typeof price !== "number") {
      throw new Error("Unexpected CoinGecko response shape");
    }

    cachedPrice = price;
    cacheTimestamp = now;

    res.json({ price, cachedAt: cacheTimestamp, stale: false });
  } catch (err) {
    console.error("[sol-price] CoinGecko fetch failed:", err);

    if (cachedPrice !== null) {
      res.json({ price: cachedPrice, cachedAt: cacheTimestamp, stale: true });
      return;
    }

    res.status(502).json({ error: "Failed to fetch SOL price", price: null });
  }
});

export default router;
