import Link from "next/link";

export const metadata = {
  title: "Circles | Hinted.io",
  description: "Build gifting circles, invite contacts, and fund shared gift goals together.",
};

const contacts = [
  {
    id: 1,
    name: "Maya",
    role: "Friend",
    note: "Saved 8 hints",
    initials: "M",
    colors: "from-[#efc3af] to-[#ae6e57]",
  },
  {
    id: 2,
    name: "James",
    role: "Brother",
    note: "Saved 5 hints",
    initials: "J",
    colors: "from-[#4e596d] to-[#212a3c]",
  },
  {
    id: 3,
    name: "Fiona",
    role: "Friend",
    note: "Saved 4 hints",
    initials: "F",
    colors: "from-[#809168] to-[#41512e]",
  },
  {
    id: 4,
    name: "Mum",
    role: "Family",
    note: "Saved 6 hints",
    initials: "M",
    colors: "from-[#eac8b8] to-[#9d6957]",
  },
  {
    id: 5,
    name: "Sarah",
    role: "Partner",
    note: "Saved 10 hints",
    initials: "S",
    colors: "from-[#e8b9a7] to-[#bf755f]",
  },
  {
    id: 6,
    name: "Tom",
    role: "Friend",
    note: "Saved 3 hints",
    initials: "T",
    colors: "from-[#b7c8db] to-[#6b88a7]",
  },
];

const circles = [
  {
    id: 1,
    name: "Sarah Birthday Circle",
    subtitle: "Birthday · June 29",
    description:
      "A shared circle for Sarah’s next gift so everyone can contribute without duplicating ideas.",
    members: [
      {
        name: "You",
        initials: "Y",
        contributed: true,
        amount: 40,
        colors: "from-[#4e596d] to-[#212a3c]",
      },
      {
        name: "Maya",
        initials: "M",
        contributed: true,
        amount: 35,
        colors: "from-[#efc3af] to-[#ae6e57]",
      },
      {
        name: "James",
        initials: "J",
        contributed: false,
        amount: 0,
        colors: "from-[#4e596d] to-[#212a3c]",
      },
      {
        name: "Fiona",
        initials: "F",
        contributed: true,
        amount: 20,
        colors: "from-[#809168] to-[#41512e]",
      },
    ],
    pot: {
      active: true,
      item: "Weekend cabin stay",
      source: "From Sarah’s saved hints",
      target: 220,
      raised: 95,
      note: "Selected from Sarah’s own hints so the group has a clear goal.",
      image: "from-[#d5dccc] via-[#b8c4a7] to-[#8fa17b]",
    },
  },
  {
    id: 2,
    name: "Mum & Dad Anniversary",
    subtitle: "Anniversary · July 10",
    description:
      "A family circle for one stronger shared gift rather than several smaller separate ones.",
    members: [
      {
        name: "You",
        initials: "Y",
        contributed: true,
        amount: 50,
        colors: "from-[#4e596d] to-[#212a3c]",
      },
      {
        name: "Mum",
        initials: "M",
        contributed: false,
        amount: 0,
        colors: "from-[#eac8b8] to-[#9d6957]",
      },
      {
        name: "Sarah",
        initials: "S",
        contributed: false,
        amount: 0,
        colors: "from-[#e8b9a7] to-[#bf755f]",
      },
    ],
    pot: {
      active: true,
      item: "Le Creuset casserole dish",
      source: "From Mum’s hints",
      target: 180,
      raised: 50,
      note: "A practical family gift with a target everyone can work toward.",
      image: "from-[#d8d1cb] via-[#bcaea1] to-[#8f7765]",
    },
  },
  {
    id: 3,
    name: "James Promotion Circle",
    subtitle: "Milestone · July 16",
    description:
      "A smaller shared circle for celebrating James’s promotion with something useful and lasting.",
    members: [
      {
        name: "You",
        initials: "Y",
        contributed: false,
        amount: 0,
        colors: "from-[#4e596d] to-[#212a3c]",
      },
      {
        name: "Maya",
        initials: "M",
        contributed: false,
        amount: 0,
        colors: "from-[#efc3af] to-[#ae6e57]",
      },
    ],
    pot: {
      active: false,
      item: "",
      source: "",
      target: 0,
      raised: 0,
      note: "Choose one of James’s saved hints to turn this into a communal goal.",
      image: "",
    },
  },
];

function LogoMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-white shadow-lg">
      <span className="text-lg">🎁</span>
    </div>
  );
}

function AvatarMenu() {
  return (
    <div className="relative group">
      <button
        className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#4e596d] to-[#212a3c] text-sm font-bold text-white ring-4 ring-white/70"
        aria-label="Open account menu"
      >
        CG
      </button>

      <div className="invisible absolute right-0 top-[calc(100%+10px)] z-20 w-56 translate-y-1 rounded-[22px] border border-[#ecdcd2] bg-white p-2 opacity-0 shadow-[0_18px_45px_rgba(123,84,64,0.14)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <Link
          href="/account"
          className="block rounded-[16px] px-4 py-3 text-sm text-slate-700 hover:bg-[#faf6f3]"
        >
          Account details
        </Link>
        <Link
          href="/settings"
          className="block rounded-[16px] px-4 py-3 text-sm text-slate-700 hover:bg-[#faf6f3]"
        >
          Settings
        </Link>
        <Link
          href="/billing"
          className="block rounded-[16px] px-4 py-3 text-sm text-slate-700 hover:bg-[#faf6f3]"
        >
          Payment details
        </Link>
      </div>
    </div>
  );
}

function ContactCard({ contact }) {
  return (
    <article
      draggable
      className="cursor-grab rounded-[22px] border border-[#f0dfd6] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"
      aria-label={`Drag ${contact.name} into a circle`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b text-[12px] font-bold text-white ${contact.colors}`}
        >
          {contact.initials}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
          <p className="text-xs text-slate-500">
            {contact.role} · {contact.note}
          </p>
        </div>
      </div>
    </article>
  );
}

function MemberPill({ member }) {
  return (
    <div className="rounded-[20px] border border-[#eee1d9] bg-[#fffdfa] p-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b text-[11px] font-bold text-white ${member.colors}`}
        >
          {member.initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                member.contributed
                  ? "bg-[#edf6eb] text-[#4a7a3a]"
                  : "bg-[#fff3ee] text-[#d57a58]"
              }`}
            >
              {member.contributed ? "Contributed" : "Pending"}
            </span>
            <span className="text-[11px] text-slate-400">
              {member.contributed ? `£${member.amount}` : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributionMeter({ raised, target }) {
  const percentage = target > 0 ? Math.min((raised / target) * 100, 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-900">Progress</span>
        <span className="text-sm text-slate-500">
          £{raised} of £{target}
        </span>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#f3e7df]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff9b75] to-[#f36f64] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-[12px] text-slate-400">{Math.round(percentage)}% funded</p>
    </div>
  );
}

function CircleCard({ circle }) {
  return (
    <article className="rounded-[30px] border border-[#f0dfd6] bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Circle
              </p>
              <h2 className="mt-1 text-[26px] font-semibold tracking-[-0.05em] text-slate-900">
                {circle.name}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{circle.subtitle}</p>
            </div>

            <button className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]">
              Add directly
            </button>
          </div>

          <p className="mt-4 max-w-[60ch] text-[14px] leading-7 text-slate-600">
            {circle.description}
          </p>

          <div className="mt-5 rounded-[24px] border border-dashed border-[#e6d7cd] bg-[#fffaf7] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Members</p>
                <p className="mt-1 text-[13px] text-slate-500">
                  Drag contacts here to expand the circle, or add someone directly.
                </p>
              </div>

              <div className="rounded-full bg-[#fff1ea] px-3 py-1 text-[11px] font-semibold text-[#df7b59]">
                Drop zone
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {circle.members.map((member) => (
                <MemberPill key={member.name} member={member} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-[#eedfd6] bg-[#fffdfa] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Shared pot
              </p>
              <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
                {circle.pot.active ? circle.pot.item : "No pot created yet"}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-slate-500">
                {circle.pot.active ? circle.pot.source : circle.pot.note}
              </p>
            </div>

            <button className="inline-flex h-10 items-center justify-center rounded-full bg-[#2f3b2d] px-4 text-sm font-semibold text-white">
              {circle.pot.active ? "Edit pot" : "Create pot"}
            </button>
          </div>

          {circle.pot.active ? (
            <>
              <div
                className={`mt-5 h-[150px] rounded-[24px] bg-gradient-to-br ${circle.pot.image}`}
              />

              <p className="mt-4 text-[14px] leading-7 text-slate-600">
                {circle.pot.note}
              </p>

              <div className="mt-5">
                <ContributionMeter raised={circle.pot.raised} target={circle.pot.target} />
              </div>

              <div className="mt-5 rounded-[22px] bg-[#2f3b2d] p-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                  Pot status
                </p>
                <p className="mt-2 text-sm leading-7 text-white/90">
                  Members who have not contributed yet stay marked as pending so it’s easy
                  to see who still needs a nudge.
                </p>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-[22px] border border-dashed border-[#e5d8cf] bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Choose from saved hints</p>
              <p className="mt-2 text-[14px] leading-7 text-slate-600">
                Pick one of this contact’s saved hints and turn it into a communal funding
                goal for the whole circle.
              </p>

              <button className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]">
                Browse hints
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function CirclesPage() {
  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-800">
      <header className="border-b border-[#efe0d7] bg-[#fffaf7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link href="/feed" className="flex items-center gap-3.5">
              <LogoMark />
              <div className="text-[22px] font-extrabold tracking-[-0.05em] text-slate-900">
                Hinted<span className="text-[#f36f64]">.io</span>
              </div>
            </Link>

            <nav className="flex items-center gap-3">
              <Link
                href="/feed"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-[14px] font-semibold text-slate-700 hover:bg-[#fff5f0]"
              >
                Feed
              </Link>
              <Link
                href="/hints"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-[14px] font-semibold text-slate-700 hover:bg-[#fff5f0]"
              >
                Hints
              </Link>
              <Link
                href="/circles"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-[14px] font-semibold text-slate-900 shadow-sm"
              >
                Circles
              </Link>
            </nav>
          </div>

          <AvatarMenu />
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-8">
        <section className="rounded-[34px] border border-[#eeddd3] bg-[#fff7f2] p-4 shadow-[0_18px_60px_rgba(173,101,72,0.1)] sm:p-5">
          <div className="rounded-[28px] border border-[#f1dfd6] bg-white p-5 sm:p-6">
            <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <div className="rounded-[26px] border border-[#f0dfd6] bg-[#fffdfa] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Contacts
                  </p>
                  <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
                    People you can add
                  </h1>
                  <p className="mt-2 text-[14px] leading-7 text-slate-600">
                    Drag people into a circle, or add them directly while you build the group.
                  </p>

                  <div className="mt-5 space-y-3">
                    {contacts.map((contact) => (
                      <ContactCard key={contact.id} contact={contact} />
                    ))}
                  </div>

                  <button className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]">
                    Add new contact
                  </button>
                </div>
              </aside>

              <section className="min-w-0">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e37b57]">
                      Shared gifting
                    </div>
                    <h2 className="mt-3 text-[34px] font-semibold tracking-[-0.06em] text-slate-900 sm:text-[40px]">
                      Build circles around the people and moments that matter.
                    </h2>
                    <p className="mt-3 max-w-[760px] text-[15px] leading-7 text-slate-600">
                      Add members, choose a saved hint from the person the circle is for,
                      and turn it into a communal pot everyone can work toward together.
                    </p>
                  </div>

                  <button className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg">
                    Create new circle
                  </button>
                </div>

                <div className="space-y-5">
                  {circles.map((circle) => (
                    <CircleCard key={circle.id} circle={circle} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
