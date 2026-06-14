import Link from "next/link";

export const metadata = {
  title: "Offers | Hinted.io",
  description: "View special access, trials, and upgrade offers inside Hinted.",
};

export default function OffersPage() {
  const offers = [
    {
      id: 1,
      title: "Early access invite",
      text: "Invite a friend and unlock an early feature.",
    },
    {
      id: 2,
      title: "Pro trial",
      text: "Try premium tools for 7 days.",
    },
    {
      id: 3,
      title: "Shared circle",
      text: "Create a shared space for a team or group.",
    },
  ];

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
              <div className="text-xs text-slate-500">Offers</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
              Home
            </Link>
            <Link href="/feed" className="text-sm text-slate-600 hover:text-slate-900">
              Feed
            </Link>
            <Link href="/hints" className="text-sm text-slate-600 hover:text-slate-900">
              Hints
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[900px] px-6 py-16">
        <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
          Special access
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          Offers and upgrades.
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          This is where you can show special features, plans, invites, or promo items later.
        </p>

        <div className="mt-10 space-y-4">
          {offers.map((offer) => (
            <article
              key={offer.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">{offer.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{offer.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
