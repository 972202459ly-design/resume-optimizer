import { NextResponse } from "next/server";

// Returns public Paddle config for debugging — these are already in the JS bundle
export async function GET() {
  return NextResponse.json({
    env: process.env.NEXT_PUBLIC_PADDLE_ENV,
    token_prefix: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.slice(0, 12) + "...",
    price_id: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID,
  });
}
