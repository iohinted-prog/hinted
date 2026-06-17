import Link from "next/link";

export const metadata = {
  title: "Billing | Hinted.io",
  description: "Manage your plan, payment method, and billing history.",
};

const invoices = [
  {
    id: "INV-2026-004",
    date: "17 June 2026",
    amount: "£12",
    status: "Paid",
  },
  {
    id: "INV-2026-003",
    date: "17 May 2026",
    amount: "£12",
    status: "Paid",
  },
  {
    id: "INV-2026-002",
    date: "17 April 2026",
    amount: "£12",
    status: "Paid",
  },
];

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-[#fffaf7] px-5 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-[980px]">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#ead8ce] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]"
          >
            ← Back to home
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#df7b59]">
            billing
          </p>
          <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.05em] text-slate-900">
            Plan and billing
          </h1>
          <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-slate-600">
            Manage your subscription, payment method, and invoice history.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#eddacf] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-[20px] font-semibold text-slate-900">Current plan</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Your active Hinted subscription and renewal schedule.
                  </p>
                </div>

                <span className="rounded-full bg-[#fff0e8] px-3 py-2 text-[12px] font-bold text-[#ea7451]">
                  Active
                </span>
              </div>

              <div className="mt-6 rounded-[24px] bg-[#fff7f2] p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Hinted Plus</p>
                    <p className="mt-1 text-[32px] font-semibold tracking-[-0.05em] text-slate-900">
                      £12<span className="text-base font-medium text-slate-500"> / month</span>
                    </p>
                  </div>

                  <div className="text-sm text-slate-500">
                    Renews on <span className="font-medium text-slate-900">17 July 2026</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex h-[48px] items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg"
                >
                  Change plan
                </button>

                <button
                  type="button"
                  className="inline-flex h-[48px] items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-[#faf6f3]"
                >
                  Cancel subscription
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#eddacf] bg-white p-6 shadow-sm">
              <h2 className="text-[20px] font-semibold text-slate-900">Payment method</h2>
              <p className="mt-2 text-sm text-slate-500">
                Update the card used for your Hinted subscription.
              </p>

              <div className="mt-6 rounded-[24px] border border-[#f1e4dc] bg-[#fffdfa] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Visa ending in 4242</p>
                    <p className="mt-1 text-xs text-slate-500">Expires 08/2028</p>
                  </div>

                  <span className="rounded-full bg-[#f3f7ef] px-3 py-1 text-[11px] font-semibold text-[#58703f]">
                    Default
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-900" htmlFor="billingEmail">
                    Billing email
                  </label>
                  <input
                    id="billingEmail"
                    type="email"
                    defaultValue="cian@example.com"
                    className="mt-2 h-[54px] w-full rounded-[18px] border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#f36f64]/50 focus:ring-4 focus:ring-[#f36f64]/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900" htmlFor="country">
                    Billing country
                  </label>
                  <select
                    id="country"
                    defaultValue="GB"
                    className="mt-2 h-[54px] w-full rounded-[18px] border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#f36f64]/50 focus:ring-4 focus:ring-[#f36f64]/10"
                  >
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="IE">Ireland</option>
                    <option value="FR">France</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex h-[48px] items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-[#faf6f3]"
                >
                  Update payment method
                </button>

                <button
                  type="button"
                  className="inline-flex h-[48px] items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-[#faf6f3]"
                >
                  Download latest invoice
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#eddacf] bg-white p-6 shadow-sm">
              <h2 className="text-[20px] font-semibold text-slate-900">Billing history</h2>
              <p className="mt-2 text-sm text-slate-500">
                Review your recent invoices and payment status.
              </p>

              <div className="mt-6 overflow-hidden rounded-[22px] border border-[#f1e4dc]">
                <div className="grid grid-cols-[1.2fr_1fr_auto_auto] gap-3 bg-[#fff7f2] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <div>Invoice</div>
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>

                <div className="divide-y divide-[#f3e7df] bg-white">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="grid grid-cols-[1.2fr_1fr_auto_auto] gap-3 px-4 py-4 text-sm text-slate-700"
                    >
                      <div className="font-medium text-slate-900">{invoice.id}</div>
                      <div>{invoice.date}</div>
                      <div>{invoice.amount}</div>
                      <div>
                        <span className="rounded-full bg-[#f3f7ef] px-3 py-1 text-[11px] font-semibold text-[#58703f]">
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-[#eddacf] bg-white p-6 shadow-sm">
              <h2 className="text-[18px] font-semibold text-slate-900">Summary</h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Plan</span>
                  <span className="font-medium text-slate-900">Hinted Plus</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Billing cycle</span>
                  <span className="font-medium text-slate-900">Monthly</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Next charge</span>
                  <span className="font-medium text-slate-900">£12</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Renewal</span>
                  <span className="font-medium text-slate-900">17 July 2026</span>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] bg-[#2f3b2d] p-6 text-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">
                Need help?
              </p>
              <p className="mt-3 text-sm leading-7 text-white/90">
                Questions about invoices, payment issues, or plan changes?
              </p>
              <Link
                href="/settings"
                className="mt-5 inline-flex h-[44px] items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-slate-900"
              >
                Contact support
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
