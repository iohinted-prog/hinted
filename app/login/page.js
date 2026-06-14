import Link from "next/link";

export const metadata = {
  title: "Log in | Hinted.io",
  description: "Sign in to Hinted to keep your circles, hints, and reminders connected.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-slate-800">
      <header className="border-b border-slate-200/80 bg-[#f7f4ef]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <span className="text-lg">💬</span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Hinted.io</div>
              <div className="text-xs text-slate-500">Sign in</div>
            </div>
          </div>

          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            Home
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1200px] gap-12 px-6 py-16 md:grid-cols-2 md:items-center">
        <div>
          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            Welcome back
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
            Sign in to Hinted.
          </h1>

          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
            Keep your circles, hints, and reminders connected to your account.
          </p>

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
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
                  type="password"
                  placeholder="Your password"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-slate-400"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/feed"
                className="rounded-full bg-[#f36f64] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                Sign in
              </Link>

              <Link
                href="/onboarding"
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Create account
              </Link>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              You can use an email/password account now and connect other sign-in methods later.
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-[28px] bg-[#fbf8f4] p-5 ring-1 ring-slate-200/70">
            <div className="text-sm font-semibold text-slate-900">Why sign in?</div>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="text-sm font-medium text-slate-900">Keep everything saved</div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Your dates, hints, and circles stay connected to your account.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="text-sm font-medium text-slate-900">Pick up later</div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  You can edit your setup after you&apos;ve started using the app.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="text-sm font-medium text-slate-900">Move at your own pace</div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  This is just the starting point — not everything has to be finished today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
