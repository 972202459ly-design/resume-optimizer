import { NextRequest } from "next/server";
import { savePaidState } from "@/lib/db";

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET!;

// Verify Paddle webhook signature using HMAC-SHA256
async function verifySignature(body: string, signatureHeader: string): Promise<boolean> {
  try {
    // Header format: "ts=1234567890;h1=abc123..."
    const parts = Object.fromEntries(
      signatureHeader.split(";").map((p) => p.split("=") as [string, string])
    );
    const ts = parts["ts"];
    const h1 = parts["h1"];
    if (!ts || !h1) return false;

    const signed = `${ts}:${body}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
    const expected = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return expected === h1;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signatureHeader = request.headers.get("paddle-signature") ?? "";

  if (!await verifySignature(body, signatureHeader)) {
    console.warn("Webhook signature verification failed");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event_type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle successful payment events
  if (event.event_type === "transaction.completed" && event.data) {
    const data = event.data;
    const orderId = (data.id as string) ?? "";
    const customData = (data.custom_data as Record<string, string> | null) ?? {};
    const resultId = customData["result_id"] ?? "";
    const customerEmail = (data.customer as { email?: string } | null)?.email ?? null;

    if (resultId && orderId) {
      try {
        await savePaidState(resultId, orderId, customerEmail);
      } catch (err) {
        console.error("Failed to save paid state:", err);
        return Response.json({ error: "DB error" }, { status: 500 });
      }
    }
  }

  return Response.json({ ok: true });
}
