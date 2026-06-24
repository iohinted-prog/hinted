import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getSiteUrl(requestUrl) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || requestUrl.origin
  );
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/onboarding";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";
  const siteUrl = getSiteUrl(requestUrl);

  if (!code) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", siteUrl));
  }

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(new URL("/auth/auth-code-error", siteUrl));
  }

  return NextResponse.redirect(new URL(safeNext, siteUrl), {
    headers: response.headers,
  });
}
