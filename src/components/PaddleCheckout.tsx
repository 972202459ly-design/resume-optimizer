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
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const resultIdRef = useRef(resultId);

  useEffect(() => { onSuccessRef.current = onSuccess; });
  useEffect(() => { resultIdRef.current = resultId; });

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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const txnId: string = (event.data as any)?.transaction_id ?? "";
              const rid = resultIdRef.current;
              if (txnId && rid) {
                fetch("/api/confirm-payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ resultId: rid, transactionId: txnId }),
                }).catch(() => {});
              }
              onSuccessRef.current();
            }
            // Capture checkout errors for debugging
            if (
              event.name === "checkout.error" ||
              event.name === "checkout.failed" ||
              event.name === "checkout.payment.failed" ||
              event.name === "checkout.payment.error"
            ) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const err = event as any;
              const code = err.code ?? err.data?.code ?? "unknown";
              const detail = err.detail ?? err.data?.detail ?? event.name;
              console.error("Paddle checkout error:", event);
              if (mounted) setCheckoutError(`Error ${code}: ${detail}`);
            }
          },
        });
        if (mounted && instance) {
          setPaddle(instance);
          setReady(true);
        }
      } catch (e) {
        console.warn("Paddle failed to initialize", e);
        if (mounted) {
          setCheckoutError("Failed to initialize payment system");
          setReady(true);
        }
      }
    };
    initPaddle();
    return () => { mounted = false; };
  }, []);

  function handleCheckout() {
    if (!paddle || !resultId) return;
    setCheckoutError(null);
    paddle.Checkout.open({
      items: [{ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID!, quantity: 1 }],
      settings: {
        displayMode: "overlay",
        theme: "dark",
      },
    });
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={!ready || !paddle}
        className="w-full py-3 rounded-lg font-semibold text-sm bg-white text-black hover:bg-[#e5e5e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {ready ? "Unlock Full Results — $9.99" : "Loading..."}
      </button>
      {checkoutError && (
        <p className="text-xs text-red-400 text-center break-all">{checkoutError}</p>
      )}
    </div>
  );
}
