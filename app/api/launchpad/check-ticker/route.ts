import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

const COOLDOWN_MINUTES = 15;
const redis = createClient({ url: process.env.REDIS_URL! });

redis.on('error', (err) => console.error('Redis Client Error', err));

export async function GET(request: NextRequest) {
  try {
    await redis.connect();

    const ticker = request.nextUrl.searchParams.get("ticker");
    if (!ticker) {
      await redis.quit();
      return NextResponse.json({ error: "ticker is required" }, { status: 400 });
    }

    const upperTicker = ticker.toUpperCase();
    const key = `cooldown:${upperTicker}`;
    const lastLaunch = await redis.get(key);

    if (lastLaunch && Date.now() - parseInt(lastLaunch as string) < COOLDOWN_MINUTES * 60 * 1000) {
      const minutesLeft = Math.ceil((COOLDOWN_MINUTES * 60 * 1000 - (Date.now() - parseInt(lastLaunch as string))) / 60000);
      await redis.quit();
      return NextResponse.json({ onCooldown: true, minutesRemaining: minutesLeft });
    }

    await redis.quit();
    return NextResponse.json({ onCooldown: false });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}