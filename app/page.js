import Link from "next/link";

export const metadata = {
  title: "Hinted.io | Gifting made easy.",
  description:
    "Hinted makes gifting easy without the awkwardness, with thoughtful planning, shared pots, and curated offers.",
};

const hints = [
  {
    id: 1,
    title: "Noise-cancelling headphones",
    text: "amazon.co.uk · ~£120",
    image: "from-[#ead8cb] to-[#d6b39d]",
    tag: "Tech",
    rotate: "-rotate-1",
    starred: true,
  },
  {
    id: 2,
    title: "Weekend cabin stay",
    text: "airbnb.co.uk · Price varies",
    image: "from-[#efd7cf] to-[#dfb09e]",
    tag: "Travel",
    rotate: "rotate-1",
    starred: false,
  },
  {
    id: 3,
    title: "Cast-iron casserole dish",
    text: "johnlewis.com · ~£85",
    image: "from-[#e8e0d2] to-[#c9b79a]",
    tag: "Home",
    rotate: "-rotate-[0.6deg]",
    starred: false,
  },
  {
    id: 4,
    title: "Kindle or similar e-reader",
    text: "amazon.co.uk · ~£100",
    image: "from-[#dde7dc] to-[#adc0a8]",
    tag: "Books",
    rotate: "rotate-[0.8deg]",
    starred: false,
  },
  {
    id: 5,
    title: "Art print for the living room",
    text: "etsy.com · ~£40",
    image: "from-[#ecdcd4] to-[#d8b19f]",
    tag: "Home",
    rotate: "-rotate-[0.8deg]",
    starred: false,
  },
  {
    id: 6,
    title: "Nice pourover coffee set",
    text: "hasbean.co.uk · ~£60",
    image: "from-[#dce5df] to-[#b8c9c0]",
    tag: "Coffee",
    rotate: "rotate-[0.5deg]",
    starred: false,
  },
];

const shopCards = [
  {
    id: 1,
    title: "Silk pillowcase set",
    text: "johnlewis.com · £45",
    image: "from-[#f1ddd5] to-[#ddb09f]",
    tag: "Beauty",
    rotate: "-rotate-[0.8deg]",
  },
  {
    id: 2,
    title: "Leather weekender",
    text: "arket.com · £129",
    image: "from-[#e8dfd2] to-[#ccb89b]",
    tag: "Travel",
    rotate: "rotate-[0.7deg]",
  },
  {
    id: 3,
    title: "Espresso cups",
    text: "etsy.com · £32",
    image: "from-[#dde7df] to-[#b5c6b7]",
    tag: "Home",
    rotate: "-rotate-[0.5deg]",
  },
];

const feedItems = [
  {
    id: 1,
    type: "hint",
    avatar: "M",
    avatarColors: "from-[#e7cab8] to-[#b97d66]",
    name: "Mum",
    action: "added a new hint",
    detail: "Silk pillowcase set",
    time: "2m ago",
    icon: "🎁",
  },
  {
    id: 2,
    type: "reminder",
    avatar: "S",
    avatarColors: "from-[#efcdbf] to-[#c88c73]",
    name: "Sarah's Birthday",
    action: "is 2 weeks away",
    detail: "June 29",
    time: "Now",
    icon: "🎂",
  },
  {
    id: 3,
    type: "circle",
    avatar: "MF",
    avatarColors: "from-[#98a47d] to-[#5f7046]",
    name: "Max & Fiona",
    action: "Circle Pot is 80% full",
    detail: "£320 of £400 raised",
    time: "1h ago",
    icon: "💍",
  },
  {
    id: 4,
    type: "shop",
    avatar: "H",
    avatarColors: "from-[#dcc4b5] to-[#b78972]",
    name: "Hinted Shop",
    action: "added a curated offer",
    detail: "Best under £50",
    time: "Today",
    icon: "✦",
  },
];

const reminders = [
  {
    title: "Sarah's Birthday",
    date: "June 29",
    colors: "from-[#efcdbf] to-[#c88c73]",
  },
  {
    title: "Mom & Dad Anniversary",
    date: "July 10",
    colors: "from-[#ead0c0] to-[#bf856d]",
  },
  {
    title: "James Promotion",
    date: "July 6",
    colors: "from-[#9cab86] to-[#5f7046]",
  },
];

const calendarDays = [
  "25","26","27","28","29","30","31",
  "1","2","3","4","5","6","7",
  "8","9","10","11","12","13","14",
  "15","16","17","18","19","20","21",
  "22","23","24","25","26","27","28",
];

function AvatarStack() {
  const avatars = [
    ["AB", "from-[#efcdbf] to-[#bb8168]"],
    ["JM", "from-[#dcc4b5] to-[#b78972]"],
    ["SL", "from-[#e7cab8] to-[#b97d66]"],
    ["PT", "from-[#98a47d] to-[#5f7046]"],
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

function MiniCard({ title, text, image, tag, rotate, starred = false }) {
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[24px] border border-[#ece2db] bg-white shadow-sm transition-transform duration-200 hover:scale-[1.02] hover:shadow-md ${rotate}`}
    >
      <div className={`h-[112px] w-full bg-gradient-to-br ${image}`}>
        <div className="flex justify-end p-3">
          <div className="h-4 w-7 rounded-full bg-white/50" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-[13px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
          {title}
        </h3>
        <p className="mt-1 text-[12px] text-slate-400">{text}</p>

        <div className="mt-2.5 flex items-center justify-between">
          <span className="rounded-full border border-slate-200 bg-[#faf9f7] px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {tag}
          </span>
          <button
            type="button"
            className={`text-[16px] transition-transform duration-150 hover:scale-125 ${
              starred ? "text-[#f36f64]" : "text-slate-200 hover:text-[#f36f64]"
            }`}
            aria-label={starred ? "Unstar" : "Star"}
          >
            ★
          </button>
        </div>
      </div>
    </article>
  );
}

function FeedItem({ item }) {
  const typeBg =
    item.type === "reminder"
      ? "bg-[#fff3ee]"
      : item.type === "circle"
        ? "bg-[#f0f7ee]"
        : item.type === "shop"
          ? "bg-[#f8f4ef]"
          : "bg-[#fff7f2]";

  const typeText =
    item.type === "reminder"
      ? "text-[#d97652]"
      : item.type === "circle"
        ? "text-[#4f7440]"
        : item.type === "shop"
          ? "text-[#8b6f5d]"
          : "text-[#8b6a5a]";

  return (
    <article className="flex gap-3 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b text-[12px] font-bold text-white ${item.avatarColors}`}
      >
        {item.avatar}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] leading-[1.5] text-slate-700">
            <span className="font-semibold text-slate-900">{item.name}</span>{" "}
            {item.action}
          </p>
          <span className="shrink-0 text-[10px] text-slate-400">{item.time}</span>
        </div>

        <div className={`mt-2 inline-flex max-w-[220px] items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${typeBg} ${typeText}`}>
          <span>{item.icon}</span>
          <span className="truncate">{item.detail}</span>
        </div>
      </div>
    </article>
  );
}

function CirclesTeaser() {
  const contributors = [
    ["CG", "from-[#efcdbf] to-[#bb8168]"],
    ["MF", "from-[#9cab86] to-[#5f7046]"],
    ["JM", "from-[#dcc4b5] to-[#b78972]"],
  ];

  return (
    <article className="rounded-[30px] border border-[#efdcd2] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f9a78]">
            Circles
          </p>
          <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
            Shared pots
          </h3>
        </div>
        <div className="flex items-center">
          {contributors.map(([label, colors], index) => (
            <div
              key={label}
              className={`-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-b text-[11px] font-bold text-white first:ml-0 ${colors}`}
              style={{ zIndex: contributors.length - index }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[24px] bg-[#f6faf3] p-4">
        <p className="text-[12px] uppercase tracking-[0.14em] text-[#87936f]">
          Max & Fiona
        </p>
        <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-slate-900">
          £320 / £400
        </p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#dde8d4]">
          <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-[#9cad84] to-[#5f7046]" />
        </div>
      </div>
    </article>
  );
}

function ShopTeaser() {
  return (
    <article className="rounded-[30px] border border-[#efdcd2] bg-white p-5 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b28672]">
          Shop
        </p>
        <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
          Curated offers
        </h3>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {shopCards.map((card) => (
          <MiniCard
            key={card.id}
            title={card.title}
            text={card.text}
            image={card.image}
            tag={card.tag}
            rotate={card.rotate}
          />
        ))}
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

          <div />

          <div className="flex items-center justify-start gap-4 whitespace-nowrap sm:justify-end">
            <Link href="/feed" className="shrink-0 text-[15px] font-semibold text-slate-800">
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

        <section className="grid items-start gap-10 xl:grid-cols-[minmax(420px,0.9fr)_minmax(580px,1.1fr)] xl:gap-10">
          <div className="py-2 lg:pl-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[14px] font-bold text-[#eb7b58] shadow-sm">
              <span>♡</span>
              <span>Gifting made easy</span>
            </div>

            <h1 className="mt-7 max-w-[620px] text-[48px] font-extrabold leading-[0.98] tracking-[-0.065em] text-slate-900 sm:text-[64px] lg:text-[80px]">
              Gifting made easy.
              <br />
              Without the <span className="text-[#ff9a7b]">awkwardness.</span>
            </h1>

            <p className="mt-7 max-w-[560px] text-[17px] leading-8 text-slate-500 sm:text-[18px]">
              Thoughtful planning. Shared pots. Curated offers.
              <br className="hidden sm:block" />
              Hinted helps you remember the date, save the idea, and sort the gift.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/onboarding"
                className="inline-flex h-[54px] min-w-[160px] items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg"
              >
                Get started
              </Link>
              <Link
                href="/feed"
                className="inline-flex h-[54px] min-w-[140px] items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700"
              >
                See the product
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3.5 text-[15px] text-slate-500">
              <AvatarStack />
              <p className="max-w-[320px]">
                Stay on top of birthdays, milestones, shared gifts, and better ideas.
              </p>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="rounded-[34px] border border-[#efd8ce] bg-[#fff7f2] p-4 shadow-[0_25px_80px_rgba(173,101,72,0.16)] sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[28px] border border-[#f1dfd6] bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#efcdbf] to-[#bb8168] text-[16px] font-bold text-white shadow-sm ring-2 ring-[#f3dfd4]">
                        M
                      </div>
                      <div>
                        <div className="text-sm font-semibold tracking-tight text-slate-900">Maya</div>
                        <div className="text-xs text-slate-500">Hints</div>
                      </div>
                    </div>
                    <div className="hidden items-center gap-4 text-sm text-slate-500 md:flex">
                      <span>Feed</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-slate-900 sm:text-[34px]">
                      Your hints.
                    </h2>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {hints.map((hint) => (
                        <MiniCard
                          key={hint.id}
                          title={hint.title}
                          text={hint.text}
                          image={hint.image}
                          tag={hint.tag}
                          rotate={hint.rotate}
                          starred={hint.starred}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#f1dfd6] bg-white p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Live
                      </p>
                      <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
                        Feed
                      </h3>
                    </div>
                    <span className="flex h-2 w-2 rounded-full bg-[#f36f64]">
                      <span className="h-2 w-2 animate-ping rounded-full bg-[#f36f64] opacity-75" />
                    </span>
                  </div>

                  <div className="space-y-3">
                    {feedItems.map((item) => (
                      <FeedItem key={item.id} item={item} />
                    ))}
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
                Planner
              </div>
              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[38px]">
                Plan ahead.
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_300px]">
            <div className="rounded-[28px] border border-[#f0dfd6] bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
                    July
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500">←</button>
                  <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500">→</button>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={`${day}-${index}`}
                    className={`min-h-[58px] rounded-[14px] border p-2 ${
                      day === "13" ? "border-[#f5b49a] bg-[#fff1ea]" : "border-slate-100 bg-[#fffdfa]"
                    }`}
                  >
                    <div className={`text-xs font-semibold ${index < 7 || index > 30 ? "text-slate-300" : "text-slate-700"}`}>
                      {day}
                    </div>
                    {["29", "6", "10", "16", "24"].includes(day) ? (
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-[#b78671]" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#f0dfd6] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900">Upcoming</h3>
                <span className="rounded-full bg-[#fff5ef] px-2.5 py-1 text-[11px] font-semibold text-[#e77756]">3 soon</span>
              </div>

              <div className="mt-4 space-y-3">
                {reminders.map((item) => (
                  <div key={item.title} className="rounded-[22px] border border-[#f1e4dc] bg-[#fffdfa] p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-b ${item.colors}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <CirclesTeaser />
            <ShopTeaser />
          </div>
        </section>

        <section className="mt-20 rounded-[36px] border border-[#eeddd3] bg-white p-5 shadow-[0_18px_60px_rgba(173,101,72,0.08)] md:p-8">
          <div className="min-h-[280px] rounded-[28px] border border-dashed border-[#e5d3c7] bg-[#fff8f4]" />
        </section>
      </div>
    </main>
  );
}
