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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = event.data as any;
  const orderId: string = data.id ?? "";
  const customerEmail: string | null = data.customer?.email ?? null;

  // result_id might be in customData if passed by client, or already linked via confirm-payment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customData = (data.customData ?? {}) as Record<string, any>;
  const resultId: string = customData.result_id ?? "";

  if (orderId) {
    // If we have a result_id, link it now; otherwise just log (confirm-payment handles linking)
    if (resultId) {
      try {
        await savePaidState(resultId, orderId, customerEmail);
      } catch (err) {
        console.error("Webhook: failed to save paid state:", err);
      }
    } else {
      console.log("Webhook: transaction completed, no result_id in customData:", orderId);
    }
  }

  return NextResponse.json({ received: true });
}
