"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function AvatarMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#efcdbf] to-[#bb8168] text-sm font-bold text-white shadow-sm ring-4 ring-white/70 transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#bb8168]/20"
      >
        CG
      </button>

      <div
        className={`absolute right-0 top-[calc(100%+10px)] z-30 w-60 rounded-[22px] border border-[#ecdcd2] bg-white p-2 shadow-[0_18px_45px_rgba(123,84,64,0.14)] transition-all duration-200 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-1 opacity-0"
        }`}
      >
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Cian G</p>
          <p className="text-xs text-slate-500">Manage your account</p>
        </div>

        <div className="my-1 h-px bg-[#f1e5de]" />

        <Link
          href="/account"
          className="block rounded-[16px] px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-[#faf6f3] hover:text-slate-900"
          onClick={() => setOpen(false)}
        >
          Account details
        </Link>

        <Link
          href="/settings"
          className="block rounded-[16px] px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-[#faf6f3] hover:text-slate-900"
          onClick={() => setOpen(false)}
        >
          Settings
        </Link>

        <Link
          href="/billing"
          className="block rounded-[16px] px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-[#faf6f3] hover:text-slate-900"
          onClick={() => setOpen(false)}
        >
          Payment details
        </Link>

        <div className="my-1 h-px bg-[#f1e5de]" />

        <button
          type="button"
          className="block w-full rounded-[16px] px-4 py-3 text-left text-sm font-medium text-[#b25f54] transition-colors hover:bg-[#fff4ef]"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
