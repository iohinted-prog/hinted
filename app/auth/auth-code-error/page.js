import Link from "next/link";

export default function AuthCodeError() {
  return (
    <main className="min-h-screen bg-[#fffaf7] flex items-center justify-center px-4">
      <div className="w-full max-w-[480px] text-center">
        <div className="text-4xl mb-4">🎁</div>
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-900">
          Sign in cancelled
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-slate-500">
          It looks like the sign in was cancelled or something went wrong. You can try again below.
        </p>
        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] text-sm font-semibold text-white shadow-lg"
          >
            Try again
          </Link>
          <Link
            href="/feed"
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#ead8ce] bg-white text-sm font-semibold text-slate-700 hover:bg-[#fff5f0]"
          >
            Go to feed
          </Link>
        </div>
      </div>
    </main>
  );
}
