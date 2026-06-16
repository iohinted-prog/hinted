import Link from "next/link";

export const metadata = {
  title: "Hinted.io | Never forget. Always thoughtful.",
  description:
    "Hinted helps you remember important moments and find better gift ideas with a little help from your friends.",
};

const sideNav = [
  { label: "Calendar", icon: "📅", active: true },
  { label: "Reminders", icon: "🔔", active: false },
  { label: "People", icon: "👥", active: false },
  { label: "Gift ideas", icon: "🎁", active: false },
  { label: "Collections", icon: "♡", active: false },
  { label: "Activity", icon: "↗", active: false },
  { label: "Settings", icon: "⚙", active: false },
];

const reminders = [
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
  {
    title: "Alex's Birthday",
    date: "July 16",
    colors: "from-[#c1a79a] to-[#765549]",
  },
];

const calendarCells = [
  { day: "25", muted: true },
  { day: "26", muted: true },
  { day: "27", muted: true },
  { day: "28", muted: true },
  { day: "29", muted: true, event: "Sarah Birthday", tone: "pink" },
  { day: "30", muted: true },
  { day: "31", muted: true },

  { day: "1" },
  { day: "2" },
  { day: "3" },
  { day: "4" },
  { day: "5" },
  { day: "6", event: "James Promotion", tone: "blue" },
  { day: "7" },

  { day: "8" },
  { day: "9" },
  { day: "10", event: "Mom & Dad", tone: "peach" },
  { day: "11" },
  { day: "12" },
  { day: "13", selected: true },
  { day: "14" },

  { day: "15" },
  { day: "16", soft: true, event: "Alex Birthday", tone: "pink" },
  { day: "17" },
  { day: "18" },
  { day: "19" },
  { day: "20" },
  { day: "21" },

  { day: "22" },
  { day: "23" },
  { day: "24", event: "Olivia Grad", tone: "peach" },
  { day: "25" },
  { day: "26" },
  { day: "27" },
  { day: "28" },

  { day: "29" },
  { day: "30" },
  { day: "1", muted: true },
  { day: "2", muted: true },
  { day: "3", muted: true },
  { day: "4", muted: true },
  { day: "5", muted: true },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function EventPill({ event, tone }) {
  const toneBg =
    tone === "blue"
      ? "bg-sky-50 text-sky-700"
      : tone === "peach"
        ? "bg-[#fff4ec] text-[#9a624d]"
        : "bg-[#fff3ef] text-[#9b6151]";

  const toneDot =
    tone === "blue"
      ? "from-[#8fb9d4] to-[#4d7399]"
      : tone === "peach"
        ? "from-[#d9b8a4] to-[#8a5946]"
        : "from-[#d0ab96] to-[#7b4a39]";

  return (
    <div
      className={`mt-1 hidden rounded-full px-2 py-1 text-[10px] font-medium leading-tight md:flex md:items-center md:gap-1.5 ${toneBg}`}
    >
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-b ${toneDot}`}
      />
      <span className="truncate">{event}</span>
    </div>
  );
}

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

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffaf7] text-slate-800">
      <div className="mx-auto max-w-[1320px] px-5 pb-10 pt-6 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-6 pb-8">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-2xl text-white shadow-lg">
              🎁
            </div>

            <div className="text-[22px] font-extrabold tracking-[-0.04em] text-slate-900">
              Hinted<span className="text-[#f36f64]">.io</span>
            </div>
          </div>

          <nav className="hidden items-center gap-9 text-[15px] text-slate-600 lg:flex">
            <Link href="#how-it-works">How it works</Link>
            <Link href="#offers">Offers</Link>
          </nav>

          <div className="flex w-full items-center justify-center gap-4 sm:w-auto">
            <Link
              href="/login"
              className="text-[15px] font-semibold text-slate-800"
            >
              Log in
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] px-6 text-[15px] font-bold text-white shadow-lg"
            >
              Get started
            </Link>
          </div>
        </header>

        <section className="grid items-start gap-10 xl:grid-cols-[minmax(420px,0.92fr)_minmax(620px,1.08fr)]">
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
                  <i
