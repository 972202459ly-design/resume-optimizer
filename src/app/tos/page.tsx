import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
      <div className="text-sm text-[#888] space-y-4 leading-relaxed">
        <p><strong className="text-white">Last updated:</strong> June 2026</p>
        <p>
          AI Resume Optimizer is operated by <strong className="text-white">wc26live</strong> ("we", "us", or "our").
          By accessing or using this Service, you agree to be bound by these Terms of Service.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">1. Acceptance of Terms</h2>
        <p>
          By using AI Resume Optimizer ("the Service"), operated by wc26live, you agree to these Terms of Service.
          If you do not agree, do not use the Service.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">2. Description of Service</h2>
        <p>
          AI Resume Optimizer provides AI-powered resume analysis and optimization suggestions. The Service is
          provided "as is" and we make no guarantees about job interview outcomes or employment results.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">3. User Responsibilities</h2>
        <p>
          You are responsible for the accuracy of the resume content you submit. You agree not to submit
          resume content that is illegal, infringes on third-party rights, or contains malicious code.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">4. Payments and Refunds</h2>
        <p>
          The premium feature is a one-time payment of $9.90 USD, processed by Paddle. Refunds are handled
          in accordance with our Refund Policy. All prices are in USD and are subject to applicable taxes.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">5. Limitation of Liability</h2>
        <p>
          AI Resume Optimizer is not responsible for any damages arising from the use or inability to use
          the Service. The AI-generated suggestions are for reference only and should be reviewed by the user.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">6. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of the Service after changes
          constitutes acceptance of the new terms.
        </p>
      </div>
    </div>
  );
}
