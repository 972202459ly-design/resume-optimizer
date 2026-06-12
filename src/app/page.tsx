"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [resume, setResume] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    const validTypes = [".pdf", ".docx"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(ext)) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error || "Failed to parse file.");
      return;
    }
    setResume(data.text);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleOptimize() {
    if (!resume.trim()) {
      setError("Please paste your resume first.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume: resume.trim(), targetJob: targetJob.trim() || null }),
    });

    if (!res.ok) {
      setLoading(false);
      const err = await res.json().catch(() => ({ error: "Something went wrong. Try again." }));
      setError(err.error || "Something went wrong. Try again.");
      return;
    }

    const data = await res.json();
    const id = data.id;
    // Store full data in localStorage so result page can find it across serverless instances
    localStorage.setItem(`result_${id}`, JSON.stringify(data));
    setLoading(false);
    router.push(`/result?id=${id}`);
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-3xl px-6 pt-14 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          AI Resume Optimizer
        </h1>
        <p className="mt-4 text-lg text-[#888] max-w-xl mx-auto">
          Paste your resume and get AI-powered suggestions to land more interviews.
          Free preview, instant results.
        </p>
      </section>

      {/* Input Section */}
      <section className="w-full max-w-3xl px-6 pb-16">
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-[#aaa] mb-2">
              Paste your resume
            </label>
            <textarea
              id="resume"
              rows={12}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-4 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#666] transition-colors resize-y"
              placeholder={`John Doe\njohn@email.com | (555) 123-4567\n\nEXPERIENCE\nSenior Software Engineer\nTech Corp — Jan 2020 – Present\n- Led development of...`}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="targetJob" className="block text-sm font-medium text-[#aaa] mb-2">
              Target job title <span className="text-[#555]">(optional)</span>
            </label>
            <input
              id="targetJob"
              type="text"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#666] transition-colors"
              placeholder="e.g. Senior Frontend Engineer"
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
              dragOver ? "border-[#666] bg-[#1a1a1a]" : "border-[#333] hover:border-[#555]"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileUpload")?.click()}
          >
            <input
              id="fileUpload"
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {uploading ? (
              <p className="text-sm text-[#888]">Parsing file...</p>
            ) : (
              <>
                <p className="text-sm text-[#888]">
                  Or drop a <span className="text-white">PDF</span> / <span className="text-white">DOCX</span> file here
                </p>
                <p className="text-xs text-[#555] mt-1">Max 10MB</p>
              </>
            )}
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm bg-white text-black hover:bg-[#e5e5e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Optimizing..." : "Optimize Now"}
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full max-w-3xl px-6 pb-16">
        <h2 className="text-xl font-semibold text-white text-center mb-8">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Paste Resume", desc: "Copy and paste your current resume into the editor." },
            { step: "2", title: "AI Analysis", desc: "Our AI analyzes your resume for impact, keywords, and structure." },
            { step: "3", title: "Get Suggestions", desc: "Receive actionable suggestions to improve your resume." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-white text-black font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                {item.step}
              </div>
              <h3 className="text-white font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-[#888]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full max-w-3xl px-6 pb-24">
        <h2 className="text-xl font-semibold text-white text-center mb-8">Simple Pricing</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 text-center">
            <h3 className="text-white font-semibold text-lg mb-2">Free</h3>
            <p className="text-3xl font-bold text-white mb-4">$0</p>
            <ul className="text-sm text-[#888] space-y-2 mb-6">
              <li>AI resume analysis</li>
              <li>Preview 50% of suggestions</li>
              <li>Instant results</li>
            </ul>
            <div className="text-sm text-[#555]">No credit card needed</div>
          </div>
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-semibold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Premium</h3>
            <p className="text-3xl font-bold text-white mb-4">$9.90</p>
            <ul className="text-sm text-[#888] space-y-2 mb-6">
              <li>Unlock 100% of suggestions</li>
              <li>Before/after comparison view</li>
              <li>One-click copy optimized resume</li>
            </ul>
            <div className="text-sm text-[#555]">One-time payment, lifetime access</div>
          </div>
        </div>
      </section>

    </div>
  );
}
