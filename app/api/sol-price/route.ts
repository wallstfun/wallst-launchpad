import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';

export async function GET() {
  try {
    const response = await fetch(COINGECKO_API, {
      next: { revalidate: 30 }, // Cache for 30 seconds to avoid rate limits
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const solPrice = data.solana?.usd;

    if (!solPrice) {
      throw new Error('Invalid price data from CoinGecko');
    }

    return NextResponse.json({
      price: solPrice,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('SOL price fetch error:', error);
    
    // Fallback price (current rough market value as of March 2026)
    return NextResponse.json({
      price: 81.5,
      timestamp: Date.now(),
      fallback: true,
    }, { status: 200 }); // Still return 200 so UI doesn't break
  }
}