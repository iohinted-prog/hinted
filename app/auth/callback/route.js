import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const inviteToken = requestUrl.searchParams.get("invite_token");
  const inviteType = requestUrl.searchParams.get("invite_type");

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/auth-code-error", requestUrl.origin)
    );
  }

  const cookiesToWrite = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => cookiesToWrite.push(cookie));
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

  let destination = "/";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    const onboardingComplete = Boolean(profile?.onboarding_completed);

    if (inviteToken && inviteType) {
      const joinUrl = new URL(
        onboardingComplete ? "/feed" : "/onboarding",
        requestUrl.origin
      );
      joinUrl.searchParams.set("invite_token", inviteToken);
      joinUrl.searchParams.set("invite_type", inviteType);
      destination = `${joinUrl.pathname}${joinUrl.search}`;
    } else {
      destination = onboardingComplete ? "/feed" : "/onboarding";
    }
  }

  const response = NextResponse.redirect(
    new URL(destination, requestUrl.origin)
  );

  response.headers.set("Cache-Control", "private, no-store");

  cookiesToWrite.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
