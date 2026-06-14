import Link from "next/link";

export const metadata = {
  title: "Onboarding | Hinted.io",
  description: "Set up your Hinted account with your name, email, and optional profile details.",
};

export default function OnboardingPage() {
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
              <div className="text-xs text-slate-500">Onboarding</div>
            </div>
          </div>

          <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
            Sign in
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[900px] px-6 py-16">
        <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
          New account setup
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          Set up your account.
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          We only need the basics first. You can skip optional steps and fill them in later.
        </p>

        <div className="mt-10 space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Step 1</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Email</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Required
              </span>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-900" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-slate-400"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95">
                Continue
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Step 2</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Name</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Required
              </span>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-900" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-slate-400"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95">
                Continue
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Step 3</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Birthday</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Optional
              </span>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-900" htmlFor="birthday">
                Birthday
              </label>
              <input
                id="birthday"
                type="date"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-slate-400"
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Skip this step
              </button>
              <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95">
                Continue
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Step 4</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Invite people</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Optional
              </span>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-900" htmlFor="invite">
                Invite someone by email
              </label>
              <input
                id="invite"
                type="email"
                placeholder="friend@example.com"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-slate-400"
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button c
