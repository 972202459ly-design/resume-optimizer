import { NextRequest, NextResponse } from "next/server";
import { savePaidState } from "@/lib/db";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { resultId, transactionId } = body as Record<string, unknown>;

  if (
    typeof resultId !== "string" ||
    typeof transactionId !== "string" ||
    !resultId ||
    !transactionId
  ) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Basic format validation — Paddle transaction IDs start with "txn_"
  if (!transactionId.startsWith("txn_")) {
    return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
  }

  try {
    await savePaidState(resultId, transactionId, null);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("confirm-payment error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
