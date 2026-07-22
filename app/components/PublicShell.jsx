"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#ff875d"/>
      <text x="20" y="27" textAnchor="middle" fontSize="20" fill="white">🎁</text>
    </svg>
  );
}

export default function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-[#fffaf7] text-slate-800">
      <header className="border-b border-[#efe0d7] bg-[#fffaf7]/95 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark />
            <div className="text-[22px] font-extrabold tracking-[-0.05em] text-slate-900">
              Hint<span className="text-[#ff875d]">Drop</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/shop" className="hidden md:flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-slate-600 border border-[#ead8ce] hover:bg-[#fff5f0] transition">
              🛍️ Gift Shop
            </Link>
            <Link href="/login" className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold bg-gradient-to-b from-[#ff966f] to-[#ff7e54] text-white shadow-sm hover:opacity-90 transition">
              Sign in
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
