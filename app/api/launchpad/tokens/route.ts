import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

const COOLDOWN_MINUTES = 15;
const redis = createClient({ url: process.env.REDIS_URL! });

redis.on('error', (err) => console.error('Redis Client Error', err));

export async function POST(request: NextRequest) {
  try {
    await redis.connect();

    const body = await request.json();
    const { ticker } = body;

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
      return NextResponse.json({ 
        error: `This ticker was launched recently. Please wait ${minutesLeft} minutes before reusing it.` 
      }, { status: 429 });
    }

    await redis.set(key, Date.now().toString(), { EX: COOLDOWN_MINUTES * 60 });
    await redis.quit();

    return NextResponse.json({ success: true, message: `${upperTicker} launched successfully` });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}