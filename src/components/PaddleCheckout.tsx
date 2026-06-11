"use client";

import { useEffect, useState } from "react";
import type { Paddle } from "@paddle/paddle-js";

interface Props {
  onSuccess: () => void;
  resultId?: string | null;
}

const PAID_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function storePaidState(resultId: string) {
  localStorage.setItem(`paid_${resultId}`, String(Date.now()));
}

export function isPaidState(resultId: string): boolean {
  const stored = localStorage.getItem(`paid_${resultId}`);
  if (!stored) return false;
  const timestamp = parseInt(stored, 10);
  if (isNaN(timestamp)) return false;
  return Date.now() - timestamp < PAID_EXPIRY_MS;
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
    if (!paddle) return;

    paddle.Checkout.open({
      items: [
        {
          priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID!,
          quantity: 1,
        },
      ],
      settings: {
        displayMode: "overlay",
        theme: "dark",
        successUrl: typeof window !== "undefined"
          ? `${window.location.origin}${window.location.pathname}${window.location.search}&paid=1`
          : undefined,
      },
    });
  }

  // Listen for the success redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      // Persist paid state for this result
      if (resultId) {
        storePaidState(resultId);
      }
      onSuccess();
      // Clean up the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("paid");
      window.history.replaceState({}, "", url.toString());
    }
  }, [onSuccess, resultId]);

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
