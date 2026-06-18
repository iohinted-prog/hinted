"use client";

import { useRouter } from "next/navigation";

export default function BackButton({
  fallback = "/",
  label = "Back",
  className = "",
}) {
  const router = useRouter();

  function handleBack() {
    if (typeof window === "undefined") {
      router.push(fallback);
      return;
    }

    const referrer = document.referrer;

    if (referrer) {
      try {
        const refUrl = new URL(referrer);
        const currentOrigin = window.location.origin;

        if (refUrl.origin === currentOrigin) {
          router.back();
          return;
        }
      } catch (e) {}
    }

    router.push(fallback);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={
        className ||
        "inline-flex h-11 items-center gap-2 rounded-full border border-[#ead8ce] bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-[#faf6f3]"
      }
      aria-label={label}
    >
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </button>
  );
}
