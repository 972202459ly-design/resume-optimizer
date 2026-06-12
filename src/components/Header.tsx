import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-white hover:text-[#ccc] transition-colors">
          AI Resume Optimizer
        </Link>
        <nav className="flex items-center gap-6 text-xs text-[#666]">
          <Link href="/" className="hover:text-[#aaa] transition-colors">Home</Link>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md bg-white text-black text-xs font-semibold hover:bg-[#e5e5e5] transition-colors"
          >
            Try for Free
          </Link>
        </nav>
      </div>
    </header>
  );
}
