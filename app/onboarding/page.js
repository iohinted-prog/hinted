import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-[1200px] items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <div className="inline-flex rounded-full bg-[#fbf8f4] px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              Early access
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Create your account.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 md:text-base">
              Join Hinted to organize your circles, keep context on the people you care about, and never forget important follow-ups.
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-900" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-slate-400"
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="submit"
                className="rounded-full bg-[#f36f64] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                Create account
              </button>

              <Link
                href="/login"
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign in instead
              </Link>
            </div>
          </form>

          <p className="mt-6 text-xs leading-5 text-slate-500">
            By continuing, you agree to the early access terms for Hinted.
          </p>
        </div>
      </div>
    </main>
  );
}
