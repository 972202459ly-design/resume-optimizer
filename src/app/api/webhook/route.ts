import { NextRequest, NextResponse } from "next/server";
import { EventName, Webhooks } from "@paddle/paddle-node-sdk";
import { savePaidState } from "@/lib/db";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature") || "";

  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("PADDLE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const webhooks = new Webhooks();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = await webhooks.unmarshal(rawBody, secret, signature);
  } catch {
    console.warn("Paddle webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.eventType !== EventName.TransactionCompleted) {
    return NextResponse.json({ received: true });
  }

  const data = event.data;
  const orderId: string = data.id ?? "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customData = (data.customData ?? {}) as Record<string, any>;
  const resultId: string = customData.result_id ?? "";
  const customerEmail: string | null =
    data.customer?.email ?? data.customerEmail ?? null;

  if (resultId && orderId) {
    try {
      await savePaidState(resultId, orderId, customerEmail);
    } catch (err) {
      console.error("Failed to save paid state:", err);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  } else {
    console.warn("Webhook: missing result_id or orderId", { resultId, orderId });
  }

  return NextResponse.json({ received: true });
}
