"use client";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    const reloaded = sessionStorage.getItem("error-reloaded");
    if (!reloaded) {
      sessionStorage.setItem("error-reloaded", "1");
      window.location.reload();
    } else {
      sessionStorage.removeItem("error-reloaded");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fffaf7] flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-4xl">🎁</div>
      <p className="text-[15px] text-slate-500">Loading...</p>
    </div>
  );
}
