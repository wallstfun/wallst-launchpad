import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ticker = body.ticker?.toUpperCase()?.trim();

    if (!ticker || ticker.length < 2) {
      return NextResponse.json({ error: "Ticker is required and must be at least 2 characters" }, { status: 400 });
    }

    // === STRICT 15-MINUTE TICKER COOLDOWN ===
    const cooldownKey = `cooldown:${ticker}`;
    const cooldownUntil = await redis.get<number>(cooldownKey);

    if (cooldownUntil && cooldownUntil > Date.now()) {
      const remainingMs = cooldownUntil - Date.now();
      const minutesRemaining = Math.ceil(remainingMs / 60000);

      return NextResponse.json({
        error: `Ticker "${ticker}" cannot be launched again yet.`,
        onCooldown: true,
        minutesRemaining,
        message: `Please wait ${minutesRemaining} minute(s) before trying this ticker again.`
      }, { status: 429 });
    }

    // Set new 15-minute cooldown
    const expiresAt = Date.now() + 15 * 60 * 1000;
    await redis.set(cooldownKey, expiresAt, { ex: 900 });

    // TODO: Your actual memecoin launch logic goes here (Raydium LaunchLab, bonding curve, etc.)
    // For now we return success so you can test the cooldown + form flow

    console.log(`✅ Ticker ${ticker} passed cooldown check and can be launched`);

    return NextResponse.json({
      success: true,
      ticker,
      message: `Ticker ${ticker} passed cooldown and is ready for launch.`,
      note: "Actual on-chain launch logic to be added next"
    });

  } catch (error: any) {
    console.error('Launch POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message 
    }, { status: 500 });
  }
}