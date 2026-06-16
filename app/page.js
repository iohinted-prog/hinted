import Link from "next/link";

export const metadata = {
  title: "Hinted.io | Never forget. Always thoughtful.",
  description:
    "Hinted helps you remember important moments and find better gift ideas with a little help from your friends.",
};

const hints = [
  {
    id: 1,
    title: "Favorite coffee",
    text: "Likes oat milk lattes and always tries new cafés when travelling.",
    tone: "bg-[#fff6f1]",
  },
  {
    id: 2,
    title: "Birthday idea",
    text: "Been hinting at a ceramics workshop and soft cashmere throw.",
    tone: "bg-white",
  },
  {
    id: 3,
    title: "Last conversation",
    text: "Talked about a promotion dinner in July and a weekend away.",
    tone: "bg-[#f8f5ff]",
  },
  {
    id: 4,
    title: "Reminder",
    text: "Check in next Friday and ask how the new role is going.",
    tone: "bg-white",
  },
];

const lowerReminders = [
  {
    title: "Sarah's Birthday",
    date: "June 29",
    colors: "from-[#efc3af] to-[#ae6e57]",
  },
  {
    title: "Mom & Dad Anniversary",
    date: "July 10",
    colors: "from-[#eac8b8] to-[#9d6957]",
  },
  {
    title: "James Promotion",
    date: "July 6",
    colors: "from-[#809168] to-[#41512e]",
  },
];

const calendarDays = [
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
];

function AvatarStack() {
  const avatars = [
    ["AB", "from-[#efb19d] to-[#b25f54]"],
    ["JM", "from-[#4e596d] to-[#212a3c]"],
    ["SL", "from-[#e8c5ad] to-[#a86752]"],
    ["PT", "from-[#6f7d54] to-[#324421]"],
  ];

  return (
    <div className="flex items-center">
      {avatars.map(([label, colors], index) => (
        <div
          key={label}
          className={`-ml-2.5 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#fff8f4] bg-gradient-to-b text-[12px] font-bold text-white first:ml-0 ${colors}`}
          style={{ zIndex: avatars.length - index }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function HintCard({ title, text, tone, large = false }) {
  return (
    <article
      className={`rounded-[28px] border border-slate-200 ${
        tone || "bg-white"
      } p-5 shadow-sm ${large ? "min-h-[170px]" : "min-h-[138px]"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em] text-slate-900">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
        </div>

        <button className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500">
          Edit
        </button>
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffaf7] text-slate-800">
      <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-6 md:px-8">
        <header className="grid items-center gap-5 pb-8 lg:grid-cols-[auto_1fr_auto] lg:gap-8">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-2xl text-white shadow-lg">
              🎁
            </div>

            <div className="text-[22px] font-extrabold tracking-[-0.04em] text-slate-900">
              Hinted<span className="text-[#f36f64]">.io</span>
            </div>
          </div>

          <nav className="hidden items-center justify-center gap-9 text-[15px] text-slate-600 lg:flex">
            <Link href="#how-it-works">How it works</Link>
            <Link href="#offers">Offers</Link>
          </nav>

          <div className="flex items-center justify-start gap-4 whitespace-nowrap sm:justify-end">
            <Link
              href="/login"
              className="shrink-0 text-[15px] font-semibold text-slate-800"
            >
              Log in
            </Link>

            <Link
              href="/onboarding"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] px-6 text-[15px] font-bold text-white shadow-lg"
            >
              Get started
            </Link>
          </div>
        </header>

        <section className="grid items-start gap-10 xl:grid-cols-[minmax(420px,0.92fr)_minmax(560px,1.08fr)] xl:gap-10">
          <div className="py-2 lg:pl-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[14px] font-bold text-[#eb7b58] shadow-sm">
              <span>♡</span>
              <span>Social gifting & reminders, made simple</span>
            </div>

            <h1 className="mt-7 max-w-[580px] text-[48px] font-extrabold leading-[0.98] tracking-[-0.065em] text-slate-900 sm:text-[64px] lg:text-[82px]">
              Never forget.
              <br />
              Always <span className="text-[#ff9a7b]">thoughtful.</span>
            </h1>

            <p className="mt-7 max-w-[560px] text-[16px] leading-8 text-slate-500 sm:text-[18px]">
              Hinted helps you remember the important moments and find better
              gift ideas with a little help from your friends.
            </p>

            <div className="mt-8 max-w-[540px] rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl md:p-7">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
                    Sign in to Hinted
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Keep your circles, hints, and reminders connected.
                  </p>
                </div>

                <div className="rounded-full bg-[#fff0e8] px-3 py-2 text-[12px] font-bold text-[#ea7451]">
                  Welcome back
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium text-slate-900"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="mt-2 h-[54px] w-full rounded-[18px] border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#f36f64]/50 focus:ring-4 focus:ring-[#f36f64]/10"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-slate-900"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    className="mt-2 h-[54px] w-full rounded-[18px] border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#f36f64]/50 focus:ring-4 focus:ring-[#f36f64]/10"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex h-[52px] min-w-[145px] items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg"
                  >
                    Sign in
                  </button>

                  <Link
                    href="/onboarding"
                    className="inline-flex h-[52px] min-w-[160px] items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700"
                  >
                    Create account
                  </Link>
                </div>
              </form>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                You can use an email and password now, then connect other sign-in
                methods later.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3.5 text-[15px] text-slate-500">
              <AvatarStack />
              <p className="max-w-[320px]">
                Join thoughtful gifters staying on top of birthdays, milestones,
                and group surprises.
              </p>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="rounded-[34px] border border-[#efd8ce] bg-[#fff7f2] p-4 shadow-[0_25px_80px_rgba(173,101,72,0.16)] sm:p-5">
              <div className="rounded-[28px] border border-[#f1dfd6] bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2ea] shadow-sm ring-1 ring-[#f3dfd4]">
                      <span className="text-lg">💬</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-tight text-slate-900">
                        Hinted.io
                      </div>
                      <div className="text-xs text-slate-500">Hints</div>
                    </div>
                  </div>

                  <div className="hidden items-center gap-4 text-sm text-slate-500 md:flex">
                    <span>Home</span>
                    <span>Feed</span>
                    <span>Offers</span>
                  </div>
                </div>

                <div className="pt-5">
                  <div className="inline-flex rounded-full bg-[#f8f4ef] px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    Saved context
                  </div>

                  <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-slate-900 sm:text-[42px]">
                    Your hints.
                  </h2>

                  <p className="mt-3 max-w-[540px] text-[15px] leading-7 text-slate-600 sm:text-[16px]">
                    Keep the useful details that help you remember people,
                    conversations, gift ideas, and follow-ups.
                  </p>

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <HintCard
                      title={hints[0].title}
                      text={hints[0].text}
                      tone={hints[0].tone}
                    />
                    <HintCard
                      title={hints[1].title}
                      text={hints[1].text}
                      tone={hints[1].tone}
                    />
                    <HintCard
                      title={hints[2].title}
                      text={hints[2].text}
                      tone={hints[2].tone}
                      large
                    />
                    <HintCard
                      title={hints[3].title}
                      text={hints[3].text}
                      tone={hints[3].tone}
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <div className="rounded-full bg-[#2f3b2d] px-4 py-2 text-sm font-semibold text-white">
                      Add hint
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                      Organise cards
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                      Customise view
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[36px] border border-[#eeddd3] bg-[#fff7f2] px-5 py-8 shadow-[0_18px_60px_rgba(173,101,72,0.1)] md:px-8 md:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                Plan ahead
              </div>
              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[38px]">
                Calendar and reminders
              </h2>
              <p className="mt-3 max-w-[680px] text-[16px] leading-7 text-slate-600">
                Track birthdays, anniversaries, and follow-ups in one calm view,
                without squeezing the experience into the hero.
              </p>
            </div>

            <button className="inline-flex rounded-full bg-[#2f3b2d] px-5 py-3 text-sm font-semibold text-white">
              View full planner
            </button>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
            <div className="rounded-[28px] border border-[#f0dfd6] bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Dashboard
                  </p>
                  <h3 className="mt-1 text-[26px] font-semibold tracking-[-0.04em] text-slate-900">
                    July calendar
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500">
                    ←
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500">
                    →
                  </button>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={`${day}-${index}`}
                    className={`min-h-[88px] rounded-[20px] border p-3 ${
                      day === "13"
                        ? "border-[#f5b49a] bg-[#fff1ea]"
                        : "border-slate-100 bg-[#fffdfa]"
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        index < 7 || index > 30 ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {day}
                    </div>

                    {["29", "6", "10", "16", "24"].includes(day) ? (
                      <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[#b78671]" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#f0dfd6] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900">
                  Upcoming reminders
                </h3>
                <span className="rounded-full bg-[#fff5ef] px-2.5 py-1 text-[11px] font-semibold text-[#e77756]">
                  3 soon
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {lowerReminders.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-[#f1e4dc] bg-[#fffdfa] p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-b ${item.colors}`}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] bg-[#2f3b2d] p-5 text-white">
                <p className="text-xs uppercase tracking-[0.14em] text-white/60">
                  Gift prompt
                </p>
                <p className="mt-2 text-sm leading-7 text-white/90">
                  Sarah saved “ceramic dinnerware” and “weekend city break” to
                  her wishlist.
                </p>
                <button className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-800">
                  View ideas
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
