"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import PaddleCheckout from "@/components/PaddleCheckout";

interface ResultData {
  original: string;
  targetJob: string | null;
  suggestions: string;
  optimizedResume: string;
  comparisonHtml: string;
  createdAt: number;
}

function ResultInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No result ID found.");
      setLoading(false);
      return;
    }
    fetch(`/api/optimize?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setData(d);
        }
      })
      .catch(() => setError("Failed to load results."))
      .finally(() => setLoading(false));
  }, [id]);

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
        <a href="/" className="text-sm text-[#888] hover:text-white transition-colors underline">
          Try again
        </a>
      </div>
    );
  }

  // Split suggestions at 50% for free preview
  const halfPoint = Math.floor(data.suggestions.length / 2);
  const preview = data.suggestions.slice(0, halfPoint);
  const locked = data.suggestions.slice(halfPoint);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-white mb-2">Optimization Results</h1>
      {data.targetJob && (
        <p className="text-sm text-[#888] mb-8">Tailored for: <span className="text-white">{data.targetJob}</span></p>
      )}

      {/* Suggestions */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-white mb-4">Suggestions</h2>
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <div className="prose prose-sm prose-invert max-w-none">
            <RenderMarkdown content={preview} />
          </div>

          {!paid && (
            <div className="relative mt-8">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111] pointer-events-none" style={{ top: "-2rem" }} />
              <div className="border-t border-[#333] pt-6 mt-4">
                <div className="text-center space-y-4">
                  <p className="text-sm text-[#555]">
                    Unlock the full analysis + before/after comparison + optimized resume
                  </p>
                  <PaddleCheckout
                    onSuccess={() => setPaid(true)}
                  />
                </div>
              </div>
            </div>
          )}

          {paid && (
            <div className="mt-8 pt-6 border-t border-[#333]">
              <RenderMarkdown content={locked} />
            </div>
          )}
        </div>
      </section>

      {/* Comparison Table — locked until paid */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-white mb-4">Before vs After</h2>
        {paid ? (
          <div
            className="bg-[#111] border border-[#222] rounded-xl p-6 text-sm [&_table]:w-full [&_th]:text-left [&_th]:p-2 [&_th]:text-[#888] [&_th]:border-b [&_th]:border-[#333] [&_td]:p-2 [&_td]:border-b [&_td]:border-[#222] [&_td]:align-top"
            dangerouslySetInnerHTML={{ __html: data.comparisonHtml }}
          />
        ) : (
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 text-center text-sm text-[#555]">
            <p>Upgrade to see side-by-side comparison</p>
          </div>
        )}
      </section>

      {/* Optimized Resume — locked until paid */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-white mb-4">Optimized Resume</h2>
        {paid ? (
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <pre className="text-sm text-[#ccc] whitespace-pre-wrap font-sans">{data.optimizedResume}</pre>
            <button
              onClick={() => navigator.clipboard.writeText(data.optimizedResume)}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-black hover:bg-[#e5e5e5] transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        ) : (
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 text-center text-sm text-[#555]">
            <p>Upgrade to see the full optimized resume</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="text-center">
        <a href="/" className="text-sm text-[#555] hover:text-[#888] transition-colors underline">
          Optimize another resume
        </a>
      </div>
    </div>
  );
}

function RenderMarkdown({ content }: { content: string }) {
  // Simple markdown rendering — split into lines and render headings/bold/lists
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-white font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="text-white font-semibold text-lg mt-6 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith("# ")) {
          return <h1 key={i} className="text-white font-bold text-xl mt-6 mb-3">{line.slice(2)}</h1>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return <li key={i} className="text-[#ccc] ml-4 list-disc">{line.slice(2)}</li>;
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="text-white font-semibold mt-3 mb-1">{line.slice(2, -2)}</p>;
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        return <p key={i} className="text-[#ccc]">{line}</p>;
      })}
    </>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#888] text-sm">Loading...</p>
      </div>
    }>
      <ResultInner />
    </Suspense>
  );
}
