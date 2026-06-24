import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/auth-code-error", requestUrl.origin)
    );
  }

  const response = NextResponse.redirect(
    new URL("/feed", requestUrl.origin)
  );
  response.headers.set("Cache-Control", "private, no-store");

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
    return NextResponse.redirect(
      new URL("/auth/auth-code-error", requestUrl.origin)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/", requestUrl.origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  const destination =
    !profile || !profile.onboarding_completed ? "/onboarding" : "/feed";

  return NextResponse.redirect(new URL(destination, requestUrl.origin), {
    headers: response.headers,
  });
}
