"use client";

import { useEffect, useState } from "react";
import type { Paddle } from "@paddle/paddle-js";

interface Props {
  onSuccess: () => void;
  resultId?: string | null;
}

export default function PaddleCheckout({ onSuccess, resultId }: Props) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);

  useEffect(() => {
    const initPaddle = async () => {
      try {
        const { initializePaddle } = await import("@paddle/paddle-js");
        const instance = await initializePaddle({
          environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
        });
        if (instance) setPaddle(instance);
      } catch {
        console.warn("Paddle failed to initialize");
      }
    };
    initPaddle();
  }, []);

  function handleCheckout() {
    if (!paddle || !resultId) return;

    paddle.Checkout.open({
      items: [{ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID!, quantity: 1 }],
      // Pass result_id so webhook can link the payment to this result
      customData: { result_id: resultId },
      settings: {
        displayMode: "overlay",
        theme: "dark",
        successUrl: typeof window !== "undefined"
          ? `${window.location.origin}${window.location.pathname}${window.location.search}&paid=1`
          : undefined,
      },
    });
  }

  // Detect redirect back from Paddle success page and re-check paid status
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      onSuccess();
      const url = new URL(window.location.href);
      url.searchParams.delete("paid");
      window.history.replaceState({}, "", url.toString());
    }
  }, [onSuccess]);

  return (
    <button
      onClick={handleCheckout}
      disabled={!paddle}
      className="w-full py-3 rounded-lg font-semibold text-sm bg-white text-black hover:bg-[#e5e5e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {paddle ? "Unlock Full Results — $9.90" : "Loading payment..."}
    </button>
  );
}
