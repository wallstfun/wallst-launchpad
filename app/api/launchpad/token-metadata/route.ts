import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/launchpad/token-metadata
 *
 * Returns Metaplex-compatible SPL token metadata JSON.
 * Used as the `uri` parameter when creating a LaunchLab token on Raydium.
 *
 * Query params:
 *   name        - token name
 *   symbol      - token ticker
 *   description - token description (optional)
 *   image       - token image URL (optional)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const symbol = searchParams.get("symbol");
  const description = searchParams.get("description");
  const image = searchParams.get("image");

  if (!name || !symbol) {
    return NextResponse.json(
      { error: "name and symbol are required" },
      { status: 400 }
    );
  }

  const metadata = {
    name: String(name),
    symbol: String(symbol),
    description: description ? String(description) : "",
    image: image ? String(image) : "",
    external_url: "",
    attributes: [],
    properties: {
      files: image ? [{ uri: String(image), type: "image/png" }] : [],
      category: "image",
    },
  };

  return NextResponse.json(metadata, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
