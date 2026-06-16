import Link from "next/link";

export const metadata = {
  title: "Feed | Hinted.io",
  description: "Your Hinted feed with updates, reminders, and activity in one place.",
};

const feedFilters = ["All", "Hints", "Reminders", "Circles", "Saved", "Soon"];

const activityGroups = [
  {
    label: "Today",
    items: [
      {
        id: 1,
        type: "hint",
        avatar: "M",
        avatarColors: "from-[#eac8b8] to-[#9d6957]",
        name: "Mum",
        action: "added a new hint",
        detail: "Silk pillowcase set",
        meta: "2m ago",
        badge: "New hint",
        badgeBg: "bg-[#fff3ee]",
        badgeText: "text-[#e07c54]",
        preview: {
          title: "Silk pillowcase set",
          subtitle: "Soft, practical, and easy to buy later.",
        },
      },
      {
        id: 2,
        type: "reminder",
        avatar: "S",
        avatarColors: "from-[#efc3af] to-[#ae6e57]",
        name: "Sarah's Birthday",
        action: "is 2 weeks away",
        detail: "June 29 · She hinted at a ceramics workshop",
        meta: "Just now",
        badge: "Reminder",
        badgeBg: "bg-[#fff3ee]",
        badgeText: "text-[#e07c54]",
        preview: {
          title: "Gift angle",
          subtitle: "Ceramics workshop, dinnerware, or a thoughtful card.",
        },
      },
      {
        id: 3,
        type: "circle",
        avatar: "MF",
        avatarColors: "from-[#809168] to-[#41512e]",
        name: "Max & Fiona",
        action: "wedding circle pot is 80% full",
        detail: "£320 of £400 raised · 4 contributors",
        meta: "1h ago",
        badge: "Circle",
        badgeBg: "bg-[#f0f7ee]",
        badgeText: "text-[#4a7a3a]",
        preview: {
          title: "Progress update",
          subtitle: "Two contributors left before the group gift is ready.",
        },
      },
    ],
  },
  {
    label: "This week",
    items: [
      {
        id: 4,
        type: "hint",
        avatar: "J",
        avatarColors: "from-[#4e596d] to-[#212a3c]",
        name: "James",
        action: "starred a hint in your shared circle",
        detail: "Weekend cabin stay · Experiences",
        meta: "3h ago",
        badge: "Saved",
        badgeBg: "bg-[#f5f3ff]",
        badgeText: "text-[#7c5cbf]",
        preview: {
          title: "Shared save",
          subtitle: "Looks like a strong option for the group trip pot.",
        },
      },
      {
        id: 5,
        type: "reminder",
        avatar: "P",
        avatarColors: "from-[#c4dde8] to-[#90b4c4]",
        name: "Priya",
        action: "updated her wishlist",
        detail: "Added: coffee set, framed print, small lamp",
        meta: "5h ago",
        badge: "Wishlist",
        badgeBg: "bg-[#f4f0ff]",
        badgeText: "text-[#6f58b7]",
        preview: {
          title: "Worth remembering",
          subtitle: "New items added this week may shape the next gift idea.",
        },
      },
    ],
  },
];

const rightRailCards = [
  {
    title: "Upcoming reminders",
    badge: "3 soon",
    items: [
      { name: "Sarah's Birthday", date: "June 29", tone: "from-[#efc3af] to-[#ae6e57]" },
      { name: "Mom & Dad Anniversary", date: "July 10", tone: "from-[#eac8b8] to-[#9d6957]" },
      { name: "James Promotion", date: "July 6", tone: "from-[#809168] to-[#41512e]" },
    ],
  },
  {
    title: "Circle status",
    badge: "Live",
    items: [
      { name: "Wedding Circle", date: "80% full", tone: "from-[#809168] to-[#41512e]" },
      { name: "Cabin Trip", date: "4 contributors", tone: "from-[#c4dde8] to-[#90b4c4]" },
    ],
  },
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

function SectionHeader({ title, badge }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {badge}
        </p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
          {title}
        </h2>
      </div>
    </div>
  );
}

function ActivityCard({ item }) {
  const typeBg =
    item.type === "reminder"
      ? "bg-[#fff3ee]"
      : item.type === "circle"
        ? "bg-[#f0f7ee]"
        : "bg-[#f5f3ff]";

  const typeText =
    item.type === "reminder"
      ? "text-[#e07c54]"
      : item.type === "circle"
        ? "text-[#4a7a3a]"
        : "text-[#7c5cbf]";

  return (
    <article className="rounded-[24px] border border-[#f0dfd6] bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b text-[12px] font-bold text-white ${item.avatarColors}`}
        >
          {item.avatar}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] leading-[1.55] text-slate-700">
              <span className="font-semibold text-slate-900">{item.name}</span>{" "}
              {item.action}
            </p>
            <span className="shrink-0 text-[11px] text-slate-400">{item.meta}</span>
          </div>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${typeBg} ${typeText}">
            <span>{item.type === "circle" ? "💍" : item.type === "reminder" ? "🎂" : "🎁"}</span>
            <span className="truncate max-w-[160px]">{item.detail}</span>
          </div>

          {item.preview && (
            <div className="mt-3 rounded-[18px] border border-[#f1e4dc] bg-[#fffdfa] p-3">
              <p className="text-[12px] font-semibold text-slate-800">{item.preview.title}</p>
              <p className="mt-1 text-[12px] leading-6 text-slate-500">
                {item.preview.subtitle}
              </p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              Save
            </button>
            <button className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              Mark done
            </button>
            <button className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              View
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function SidebarCard({ title, badge, items }) {
  return (
    <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-[#fff5ef] px-2.5 py-1 text-[11px] font-semibold text-[#e77756]">
          {badge}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.name} className="rounded-[22px] border border-[#f1e4dc] bg-[#fffdfa] p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`mt-1 h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-b ${item.tone}`} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                <p className="mt-1 text-xs text-slate-500">{item.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function FeedPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffaf7] text-slate-800">
      <header className="sticky top-0 z-20 border-b border-[#eeddd3] bg-[#fffaf7]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-[48px] w-[48px] items-center justify-center rounded-[18px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-2xl text-white shadow-lg">
              🎁
            </div>
            <div>
              <div className="text-[18px] font-extrabold tracking-[-0.04em] text-slate-900">
                Hinted<span className="text-[#f36f64]">.io</span>
              </div>
              <div className="text-[12px] text-slate-500">Feed</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {["All", "Hints", "Reminders", "Circles"].map((item, index) => (
              <button
                key={item}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  index === 0
                    ? "bg-[#2f3b2d] text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="hidden text-sm font-medium text-slate-600 lg:block">
              Home
            </Link>
            <Link href="/hints" className="hidden text-sm font-medium text-slate-600 lg:block">
              Hints
            </Link>
            <button className="inline-flex h-11 items-center justify-center rounded-full bg-[#2f3b2d] px-5 text-sm font-semibold text-white">
              Add update
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1320px] px-5 py-8 md:px-8 md:py-10">
        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="space-y-4">
            <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff5ef] px-3 py-1 text-xs font-medium text-[#e77756] ring-1 ring-[#f3dfd4]">
                Live stream
              </div>

              <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.05em] text-slate-900">
                Your feed.
              </h1>

              <p className="mt-3 text-[14px] leading-7 text-slate-600">
                Keep track of hints, reminders, and group gifting activity in one calm view.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <AvatarStack />
                <span className="text-[13px] text-slate-500">12 people active this week</span>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Filters
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {feedFilters.map((filter, index) => (
                  <button
                    key={filter}
                    className={`rounded-full px-3.5 py-2 text-sm font-medium ${
                      index === 0
                        ? "bg-[#2f3b2d] text-white"
                        : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Quick actions
              </p>
              <div className="mt-4 space-y-2">
                {["Add hint", "Create reminder", "Start circle"].map((action) => (
                  <button
                    key={action}
                    className="flex h-12 w-full items-center justify-between rounded-[18px] border border-slate-200 bg-[#fffdfa] px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <span>{action}</span>
                    <span className="text-slate-400">→</span>
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <main className="space-y-6">
            {activityGroups.map((group) => (
              <section
                key={group.label}
                className="rounded-[32px] border border-[#f0dfd6] bg-[#fff7f2] p-4 shadow-[0_25px_80px_rgba(173,101,72,0.08)] sm:p-5"
              >
                <SectionHeader title={group.label} badge="Activity" />
                <div className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <ActivityCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </main>

          <aside className="space-y-4">
            {rightRailCards.map((card) => (
              <SidebarCard
                key={card.title}
                title={card.title}
                badge={card.badge}
                items={card.items}
              />
            ))}

            <section className="rounded-[28px] bg-[#2f3b2d] p-5 text-white">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">
                Gift prompt
              </p>
              <p className="mt-3 text-[15px] leading-7 text-white/90">
                Sarah saved "ceramic dinnerware" and "weekend city break" to her wishlist.
              </p>
              <button className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-800">
                View ideas
              </button>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
