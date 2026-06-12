"use client";

import { useEffect, useRef, useState } from "react";
import type { Paddle } from "@paddle/paddle-js";

interface Props {
  onSuccess: () => void;
  resultId?: string | null;
}

export default function PaddleCheckout({ onSuccess, resultId }: Props) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [ready, setReady] = useState(false);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  useEffect(() => {
    let mounted = true;
    const initPaddle = async () => {
      try {
        const { initializePaddle } = await import("@paddle/paddle-js");
        const instance = await initializePaddle({
          environment:
            process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
              ? "production"
              : "sandbox",
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
          eventCallback: (event) => {
            if (event.name === "checkout.completed") {
              onSuccessRef.current();
            }
          },
        });
        if (mounted && instance) {
          setPaddle(instance);
          setReady(true);
        }
      } catch {
        console.warn("Paddle failed to initialize");
        if (mounted) setReady(true);
      }
    };
    initPaddle();
    return () => { mounted = false; };
  }, []);

  function handleCheckout() {
    if (!paddle || !resultId) return;
    paddle.Checkout.open({
      items: [{ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID!, quantity: 1 }],
      customData: { result_id: resultId },
      settings: {
        displayMode: "overlay",
        theme: "dark",
      },
    });
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={!ready || !paddle}
      className="w-full py-3 rounded-lg font-semibold text-sm bg-white text-black hover:bg-[#e5e5e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {ready ? "Unlock Full Results — $9.99" : "Loading..."}
    </button>
  );
}
