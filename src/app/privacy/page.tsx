import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
      <div className="text-sm text-[#888] space-y-4 leading-relaxed">
        <p><strong className="text-white">Last updated:</strong> June 2026</p>

        <h2 className="text-white font-semibold text-base mt-8">1. Information We Collect</h2>
        <p>
          When you use AI Resume Optimizer, we collect the resume content and target job title you submit for analysis.
          This data is processed by our AI provider (Anthropic) to generate optimization suggestions and is temporarily
          stored to display your results. We do not sell, share, or use your resume data for any other purpose.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">2. How We Use Your Information</h2>
        <p>
          Your resume content is used solely to generate AI-powered optimization suggestions. We may collect
          anonymized usage analytics (via Google Analytics) to improve our service.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">3. Data Retention</h2>
        <p>
          Resume analysis results are stored temporarily in memory and may be deleted at any time.
          We do not maintain a database of user resumes. For payment processing, Paddle handles all
          transaction data — we do not store payment information.
        </p>

        <h2 className="text-white font-semibold text-base mt-8">4. Third-Party Services</h2>
        <p>
          We use the following third-party services:
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong className="text-white">Anthropic (Claude)</strong> — AI analysis of resume content</li>
          <li><strong className="text-white">Paddle</strong> — Payment processing</li>
          <li><strong className="text-white">Google Analytics</strong> — Anonymous usage tracking</li>
          <li><strong className="text-white">Vercel</strong> — Hosting and infrastructure</li>
        </ul>

        <h2 className="text-white font-semibold text-base mt-8">5. Contact</h2>
        <p>
          If you have questions about this privacy policy, please contact us at privacy@airesu.me.
        </p>
      </div>
    </div>
  );
}
