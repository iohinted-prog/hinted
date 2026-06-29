"use client";

import { useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

function getBaseUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "";
}

function buildRedirectTo(inviteToken, inviteType) {
  const baseUrl = getBaseUrl();
  const url = new URL(`${baseUrl}/auth/callback`);

  if (inviteToken) {
    url.searchParams.set("invite_token", inviteToken);
  }

  if (inviteType) {
    url.searchParams.set("invite_type", inviteType);
  }

  return url.toString();
}

function rememberProvider(provider) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem("hinted_auth_provider", provider);
  } catch (_) {}
}

export default function InviteAuthButtons({ inviteToken, inviteType }) {
  const supabase = useMemo(() => createClient(), []);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [pageError, setPageError] = useState("");

  async function handleGoogleSignIn() {
    try {
      setPageError("");
      setLoadingProvider("google");
      rememberProvider("google");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildRedirectTo(inviteToken, inviteType),
        },
      });

      if (error) throw error;
    } catch (error) {
      setPageError(error?.message || "Google sign in failed.");
      setLoadingProvider(null);
    }
  }

  async function handleMicrosoftSignIn() {
    try {
      setPageError("");
      setLoadingProvider("azure");
      rememberProvider("azure");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          scopes: "email",
          redirectTo: buildRedirectTo(inviteToken, inviteType),
        },
      });

      if (error) throw error;
    } catch (error) {
      setPageError(error?.message || "Microsoft sign in failed.");
      setLoadingProvider(null);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loadingProvider !== null}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] px-5 text-sm font-bold text-white shadow-lg transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loadingProvider === "google"
          ? "Connecting Google..."
          : "Continue with Google"}
      </button>

      <button
        type="button"
        onClick={handleMicrosoftSignIn}
        disabled={loadingProvider !== null}
        className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-[#f8f5f2] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loadingProvider === "azure"
          ? "Connecting Microsoft..."
          : "Continue with Microsoft"}
      </button>

      {pageError ? (
        <p className="rounded-[18px] border border-[#f1d2c6] bg-[#fff4ef] px-4 py-3 text-sm text-[#b85c3e]">
          {pageError}
        </p>
      ) : null}
    </div>
  );
}
