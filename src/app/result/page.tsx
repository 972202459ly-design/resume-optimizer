"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import ReactMarkdown from "react-markdown";
import PaddleCheckout from "@/components/PaddleCheckout";

interface ResultData {
  original: string;
  targetJob: string | null;
  suggestions: string;
  optimizedResume: string;
  comparisonHtml: string;
  createdAt: number;
}

// Split suggestions: show first 2 sections free, lock the rest
function splitSuggestions(content: string): { preview: string; locked: string } {
  const lines = content.split("\n");
  let sectionCount = 0;
  let splitIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      sectionCount++;
      if (sectionCount === 3) {
        splitIndex = i;
        break;
      }
    }
  }

  return {
    preview: lines.slice(0, splitIndex).join("\n"),
    locked: lines.slice(splitIndex).join("\n"),
  };
}

const mdComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-white font-bold text-xl mt-6 mb-3">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-white font-semibold text-lg mt-6 mb-2 border-b border-[#333] pb-1">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-white font-semibold mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-[#ccc] mb-3 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="space-y-1 mb-3 pl-4">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="space-y-1 mb-3 pl-4 list-decimal">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-[#ccc] list-disc leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="text-[#aaa] italic">{children}</em>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-[#444] pl-4 text-[#888] my-3">{children}</blockquote>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="bg-[#1a1a1a] text-[#e5c07b] px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
  ),
  hr: () => <hr className="border-[#333] my-4" />,
};

function ResultInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(id ? "" : "No result ID found.");
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      // Load result — use localStorage as cache to avoid redundant fetches
      const cached = localStorage.getItem(`result_${id}`);
      if (cached) {
        try { setData(JSON.parse(cached)); } catch { /* fall through */ }
      }
      if (!cached) {
        try {
          const r = await fetch(`/api/optimize?id=${id}`);
          const d = await r.json();
          if (d.error) { setError(d.error); setLoading(false); return; }
          setData(d);
          localStorage.setItem(`result_${id}`, JSON.stringify(d));
        } catch {
          setError("Failed to load results.");
          setLoading(false);
          return;
        }
      }

      // Always check paid status from server — cannot be faked client-side
      try {
        const r = await fetch(`/api/paid-check?id=${id}`);
        const d = await r.json();
        setPaid(d.paid === true);
      } catch { /* treat as unpaid on error */ }

      setLoading(false);
    };

    loadData();
  }, [id]);

  function handleCopy() {
    if (!data) return;
    navigator.clipboard.writeText(data.optimizedResume).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#888] text-sm">Loading your results...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{error || "Result not found."}</p>
        <Link href="/" className="text-sm text-[#888] hover:text-white transition-colors underline">
          Try again
        </Link>
      </div>
    );
  }

  const { preview, locked } = splitSuggestions(data.suggestions);
  const hasLockedContent = locked.trim().length > 0;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Optimization Results</h1>
        {data.targetJob && (
          <p className="text-sm text-[#888]">
            Tailored for: <span className="text-white">{data.targetJob}</span>
          </p>
        )}
      </div>

      {/* Suggestions */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">AI Analysis</h2>
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <ReactMarkdown components={mdComponents}>{preview}</ReactMarkdown>

          {!paid && hasLockedContent && (
            <div className="mt-6 relative">
              {/* Fade overlay */}
              <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-[#111] pointer-events-none" />
              <div className="border-t border-[#2a2a2a] pt-6">
                <div className="text-center space-y-3">
                  <p className="text-sm font-medium text-white">
                    {locked.match(/^## /gm)?.length ?? 0} more sections locked
                  </p>
                  <p className="text-xs text-[#555]">
                    Keywords · Achievements · Before/After comparison · Optimized resume
                  </p>
                  <PaddleCheckout
          onSuccess={async () => {
            // Re-check server — webhook may arrive slightly after redirect
            for (let i = 0; i < 5; i++) {
              await new Promise((r) => setTimeout(r, 1500));
              const res = await fetch(`/api/paid-check?id=${id}`);
              const d = await res.json();
              if (d.paid) { setPaid(true); return; }
            }
            setPaid(true); // optimistic fallback after 5 retries
          }}
          resultId={id}
        />
                </div>
              </div>
            </div>
          )}

          {paid && hasLockedContent && (
            <div className="mt-2">
              <ReactMarkdown components={mdComponents}>{locked}</ReactMarkdown>
            </div>
          )}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Before vs After</h2>
        {paid ? (
          <div
            className="bg-[#111] border border-[#222] rounded-xl p-6 text-sm overflow-x-auto
              [&_table]:w-full [&_table]:border-collapse
              [&_th]:text-left [&_th]:p-3 [&_th]:text-[#888] [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide [&_th]:border-b [&_th]:border-[#333]
              [&_td]:p-3 [&_td]:border-b [&_td]:border-[#1e1e1e] [&_td]:align-top [&_td]:text-[#ccc] [&_td]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: data.comparisonHtml }}
          />
        ) : (
          <div className="bg-[#111] border border-[#222] rounded-xl p-8 text-center">
            <p className="text-sm text-[#555]">Unlock Premium to see side-by-side comparison</p>
          </div>
        )}
      </section>

      {/* Optimized Resume */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Optimized Resume</h2>
        {paid ? (
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <pre className="text-sm text-[#ccc] whitespace-pre-wrap font-sans leading-relaxed">
              {data.optimizedResume}
            </pre>
            <button
              onClick={handleCopy}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-black hover:bg-[#e5e5e5] transition-colors"
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        ) : (
          <div className="bg-[#111] border border-[#222] rounded-xl p-8 text-center">
            <p className="text-sm text-[#555]">Unlock Premium to get the full optimized resume</p>
          </div>
        )}
      </section>

      <div className="text-center">
        <Link href="/" className="text-sm text-[#555] hover:text-[#888] transition-colors underline">
          Optimize another resume
        </Link>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#888] text-sm">Loading...</p>
        </div>
      }
    >
      <ResultInner />
    </Suspense>
  );
}
