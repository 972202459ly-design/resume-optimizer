import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-white mb-8">Refund Policy</h1>
      <div className="text-sm text-[#888] space-y-4 leading-relaxed">
        <p><strong className="text-white">Last updated:</strong> June 2026</p>

        <h2 className="text-white font-semibold text-base mt-8">30-Day Money-Back Guarantee</h2>
        <p>
          We offer a 30-day money-back guarantee on the premium $9.90 one-time payment. If you are not
          satisfied with the optimization results, you can request a full refund within 30 days of purchase.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">How to Request a Refund</h2>
        <p>
          Refunds are processed by Paddle, our payment provider. To request a refund:
        </p>
        <ol className="list-decimal ml-6 space-y-1">
          <li>Contact Paddle support through their <a href="https://paddle.com/support" className="text-white underline hover:text-[#ccc]">support portal</a></li>
          <li>Include the email address used during purchase</li>
          <li>Include your order number (found in your receipt email)</li>
        </ol>
        <p className="mt-4">
          Alternatively, you can email us at refunds@airesu.me with your order details, and we will
          process the refund through Paddle on your behalf.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">Processing Time</h2>
        <p>
          Refunds are typically processed within 5-10 business days. The refund will be returned to the
          original payment method used during purchase.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">Exceptions</h2>
        <p>
          Refund requests made more than 30 days after purchase may not be honored. We reserve the right
          to refuse refunds in cases of suspected abuse.
        </p>
      </div>
    </div>
  );
}
