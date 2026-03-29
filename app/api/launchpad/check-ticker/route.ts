import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';   // Relative path from app/api/launchpad/check-ticker/

export async function GET(request: NextRequest) {
  try {
    const ticker = request.nextUrl.searchParams.get('ticker')?.toUpperCase().trim();

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    const key = `cooldown:${ticker}`;

    const cooldownUntil = await redis.get(key);

    if (cooldownUntil && Number(cooldownUntil) > Date.now()) {
      const remainingMs = Number(cooldownUntil) - Date.now();
      const minutesRemaining = Math.ceil(remainingMs / 60000);

      return NextResponse.json({
        onCooldown: true,
        minutesRemaining: Math.max(1, minutesRemaining)
      });
    }

    // Set 15 min cooldown
    const expiresAt = Date.now() + 15 * 60 * 1000;
    await redis.set(key, expiresAt.toString(), { ex: 900 });

    return NextResponse.json({ onCooldown: false });

  } catch (error: any) {
    console.error('Check-ticker full error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error?.message || String(error) 
    }, { status: 500 });
  }
}