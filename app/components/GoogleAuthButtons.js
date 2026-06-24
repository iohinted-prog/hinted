"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function GoogleAuthButtons({ variant = "hero-primary" }) {
  const supabase = createClient();
  const [loadingProvider, setLoadingProvider] = useState(null);

  const isLogin = variant === "header-login";
  const nextPath = isLogin ? "/feed" : "/onboarding";

  const buildRedirectTo = () => {
    const origin = window.location.origin;
    return `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  };

  const handleGoogleAuth = async () => {
    if (loadingProvider) return;

    setLoadingProvider("google");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildRedirectTo(),
        scopes: [
          "openid",
          "email",
          "profile",
          "https://www.googleapis.com/auth/contacts.readonly",
        ].join(" "),
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
      setLoadingProvider(null);
    }
  };

  const handleMicrosoftAuth = async () => {
    if (loadingProvider) return;

    setLoadingProvider("azure");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: buildRedirectTo(),
        scopes: "email",
      },
    });

    if (error) {
      console.error("Microsoft sign-in error:", error.message);
      setLoadingProvider(null);
    }
  };

  if (variant === "header-login") {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={!!loadingProvider}
          className={`shrink-0 text-[15px] font-semibold ${
            loadingProvider ? "cursor-not-allowed text-slate-400" : "text-slate-800"
          }`}
        >
          {loadingProvider === "google" ? "Redirecting..." : "Google"}
        </button>

        <button
          type="button"
          onClick={handleMicrosoftAuth}
          disabled={!!loadingProvider}
          className={`shrink-0 text-[15px] font-semibold ${
            loadingProvider ? "cursor-not-allowed text-slate-400" : "text-slate-800"
          }`}
        >
          {loadingProvider === "azure" ? "Redirecting..." : "Microsoft"}
        </button>
      </div>
    );
  }

  if (variant === "header-get-started") {
    return (
      <button
        type="button"
        onClick={handleMicrosoftAuth}
        disabled={!!loadingProvider}
        className={`inline-flex h-12 shrink-0 items-center justify-center rounded-full px-6 text-[15px] font-bold text-white shadow-lg ${
          loadingProvider
            ? "cursor-not-allowed bg-[#e9a48d]"
            : "bg-gradient-to-b from-[#ff966f] to-[#ff7e54]"
        }`}
      >
        {loadingProvider === "azure" ? "Redirecting..." : "Get started"}
      </button>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={!!loadingProvider}
        className={`inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-full px-5 text-sm font-semibold text-white shadow-lg ${
          loadingProvider
            ? "cursor-not-allowed bg-[#e9a48d]"
            : "bg-gradient-to-b from-[#ff946d] to-[#f36f64]"
        }`}
      >
        <span className="text-base">G</span>
        <span>
          {loadingProvider === "google" ? "Redirecting..." : "Continue with Google"}
        </span>
      </button>

      <button
        type="button"
        onClick={handleMicrosoftAuth}
        disabled={!!loadingProvider}
        className={`inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-full border px-5 text-sm font-semibold shadow-lg ${
          loadingProvider
            ? "cursor-not-allowed border-[#ead8ce] bg-[#f3e3da] text-slate-400"
            : "border-[#ead8ce] bg-white text-slate-800"
        }`}
      >
        <span className="text-base">⊞</span>
        <span>
          {loadingProvider === "azure"
            ? "Redirecting..."
            : "Continue with Microsoft"}
        </span>
      </button>
    </div>
  );
}
