"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function AuthCodeError() {
  const router = useRouter();

  useEffect(() => {
    async function handleError() {
      const supabase = createClient();
      await supabase.auth.signOut();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();
        router.replace(profile?.onboarding_completed ? "/feed" : "/onboarding");
      } else {
        router.replace("/");
      }
    }
    handleError();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#fffaf7] flex items-center justify-center px-4">
      <div className="text-center text-slate-400 text-sm">Redirecting...</div>
    </main>
  );
}
