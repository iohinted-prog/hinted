"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function GoogleAuthButtons({ variant = "hero-primary" }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const isLogin = variant === "header-login";
  const nextPath = isLogin ? "/feed" : "/onboarding";

  const handleGoogleAuth = async () => {
    if (loading) return;

    setLoading(true);

    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
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
      setLoading(false);
    }
  };

  return (
    <>
      {variant === "header-login" ? (
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className={`shrink-0 text-[15px] font-semibold ${
            loading ? "cursor-not-allowed text-slate-400" : "text-slate-800"
          }`}
        >
          {loading ? "Getting things ready..." : "Log in"}
        </button>
      ) : variant === "header-get-started" ? (
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className={`inline-flex h-12 shrink-0 items-center justify-center rounded-full px-6 text-[15px] font-bold text-white shadow-lg ${
            loading
              ? "cursor-not-allowed bg-[#e9a48d]"
              : "bg-gradient-to-b from-[#ff966f] to-[#ff7e54]"
          }`}
        >
          {loading ? "Getting things ready..." : "Get started"}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className={`inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-full px-5 text-sm font-semibold text-white shadow-lg ${
            loading
              ? "cursor-not-allowed bg-[#e9a48d]"
              : "bg-gradient-to-b from-[#ff946d] to-[#f36f64]"
          }`}
        >
          <span className="text-base">G</span>
          <span>{loading ? "Getting things ready..." : "Continue with Google"}</span>
        </button>
      )}

      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fffaf7]/90 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] border border-[#efd8ce] bg-white p-8 text-center shadow-[0_25px_80px_rgba(173,101,72,0.14)]">
            <div className="mx-auto h-14 w-14 rounded-full bg-[#fff1ea] p-3">
              <div className="h-full w-full animate-spin rounded-full border-2 border-[#f6d8ca] border-t-[#f36f64]" />
            </div>

            <h2 className="mt-6 text-[28px] font-semibold tracking-[-0.04em] text-slate-900">
              We’re getting your profile ready
            </h2>

            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              Taking you securely through Google and bringing you back to your space.
            </p>

            <div className="mt-6 rounded-full bg-[#f5eee9] p-1">
              <div className="h-2 w-2/3 animate-pulse rounded-full bg-gradient-to-r from-[#ff946d] to-[#f36f64]" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
