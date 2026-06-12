import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#1a1a1a] py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#555]">© {new Date().getFullYear()} AI Resume Optimizer</p>
        <div className="flex gap-5 text-xs text-[#555]">
          <Link href="/privacy" className="hover:text-[#888] transition-colors">Privacy</Link>
          <Link href="/tos" className="hover:text-[#888] transition-colors">Terms</Link>
          <Link href="/refund" className="hover:text-[#888] transition-colors">Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}
