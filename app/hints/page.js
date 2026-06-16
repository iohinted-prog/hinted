import Link from "next/link";

export const metadata = {
  title: "Hints | Hinted.io",
  description: "Save beautiful gift ideas in a clean visual board built for thoughtful planning.",
};

const hints = [
  {
    id: 1,
    title: "Sony noise-cancelling headphones",
    retailer: "amazon.co.uk",
    price: 249,
    priceLabel: "About £249",
    note: "A big-ticket gift that feels generous but still genuinely useful.",
    tags: ["Tech", "Birthday"],
    image: "from-[#e8d5c4] via-[#dcc1a4] to-[#c4a882]",
    person: "Sarah",
    savedBy: "You",
    highlighted: true,
  },
  {
    id: 2,
    title: "Weekend cabin stay",
    retailer: "airbnb.co.uk",
    price: 320,
    priceLabel: "From £320",
    note: "Best as a shared circle gift or for a major milestone.",
    tags: ["Travel", "Big gift"],
    image: "from-[#d8decf] via-[#b7c4a8] to-[#90a27b]",
    person: "James",
    savedBy: "Maya",
    highlighted: true,
  },
  {
    id: 3,
    title: "Silk pillowcase set",
    retailer: "johnlewis.com",
    price: 45,
    priceLabel: "About £45",
    note: "Small, thoughtful, and easy to gift well.",
    tags: ["Home", "Under £50"],
    image: "from-[#f3e5dc] via-[#ead6ca] to-[#d8b6a3]",
    person: "Mum",
    savedBy: "You",
    highlighted: false,
  },
  {
    id: 4,
    title: "Ceramics workshop for two",
    retailer: "classbento.co.uk",
    price: 78,
    priceLabel: "About £78",
    note: "Feels more memorable than buying another object.",
    tags: ["Experience", "Couples"],
    image: "from-[#f3d7cf] via-[#ebb6a7] to-[#dd8f7c]",
    person: "Sarah",
    savedBy: "You",
    highlighted: false,
  },
  {
    id: 5,
    title: "Kindle Paperwhite",
    retailer: "amazon.co.uk",
    price: 159,
    priceLabel: "About £159",
    note: "A strong practical option that still feels personal for a reader.",
    tags: ["Books", "Everyday"],
    image: "from-[#d3d9ea] via-[#b9c4db] to-[#8e9cbf]",
    person: "Dad",
    savedBy: "You",
    highlighted: false,
  },
  {
    id: 6,
    title: "Cast-iron casserole dish",
    retailer: "johnlewis.com",
    price: 89,
    priceLabel: "About £89",
    note: "Good for someone who actually enjoys cooking and hosting.",
    tags: ["Home", "Cooking"],
    image: "from-[#ded6cf] via-[#beaea1] to-[#927966]",
    person: "Mum",
    savedBy: "James",
    highlighted: false,
  },
  {
    id: 7,
    title: "Framed art print",
    retailer: "etsy.com",
    price: 38,
    priceLabel: "About £38",
    note: "Low spend, but can feel very personal if taste is right.",
    tags: ["Home", "Art"],
    image: "from-[#eadde8] via-[#d8bfd2] to-[#b796b4]",
    person: "Fiona",
    savedBy: "You",
    highlighted: false,
  },
  {
    id: 8,
    title: "Pourover coffee set",
    retailer: "hasbean.co.uk",
    price: 62,
    priceLabel: "About £62",
    note: "Nicely balanced between useful, aesthetic, and affordable.",
    tags: ["Coffee", "Home"],
    image: "from-[#d6e5ea] via-[#b7d0d9] to-[#90b4c4]",
    person: "Alex",
    savedBy: "You",
    highlighted: false,
  },
  {
    id: 9,
    title: "Leather weekend bag",
    retailer: "smythson.com",
    price: 425,
    priceLabel: "About £425",
    note: "A premium anchor idea for someone you really want to spoil.",
    tags: ["Luxury", "Travel"],
    image: "from-[#e7d7ce] via-[#ceb4a6] to-[#9b7c68]",
    person: "Tom",
    savedBy: "You",
    highlighted: true,
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
        <Link href="/account" className="block rounded-[16px] px-4 py-3 text-sm text-slate-700 hover:bg-[#faf6f3]">
          Account details
        </Link>
        <Link href="/settings" className="block rounded-[16px] px-4 py-3 text-sm text-slate-700 hover:bg-[#faf6f3]">
          Settings
        </Link>
        <Link href="/billing" className="block rounded-[16px] px-4 py-3 text-sm text-slate-700 hover:bg-[#faf6f3]">
          Payment details
        </Link>
      </div>
    </div>
  );
}

function getCardStyle(price, highlighted) {
  if (price >= 250) {
    return {
      height: "min-h-[390px]",
      label: "Big gift",
      labelClass: highlighted
        ? "bg-[#2f3b2d] text-white"
        : "bg-[#fff1e9] text-[#df7857]",
    };
  }

  if (price >= 120) {
    return {
      height: "min-h-[320px]",
      label: "Premium",
      labelClass: highlighted
        ? "bg-[#2f3b2d] text-white"
        : "bg-[#f4f0ff] text-[#7b5fbc]",
    };
  }

  if (price >= 60) {
    return {
      height: "min-h-[270px]",
      label: "Mid-range",
      labelClass: highlighted
        ? "bg-[#2f3b2d] text-white"
        : "bg-[#eef5ea] text-[#587a47]",
    };
  }

  return {
    height: "min-h-[220px]",
    label: "Smaller spend",
    labelClass: highlighted
      ? "bg-[#2f3b2d] text-white"
      : "bg-[#f8f3ee] text-slate-600",
  };
}

function HintCard({ hint }) {
  const cardStyle = getCardStyle(hint.price, hint.highlighted);

  return (
    <article
      className={`group mb-4 break-inside-avoid overflow-hidden rounded-[30px] border transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(170,114,84,0.16)] ${
        hint.highlighted
          ? "border-[#eccdbf] bg-[#fffaf7] shadow-[0_10px_25px_rgba(184,122,92,0.10)]"
          : "border-[#f0dfd6] bg-white shadow-sm"
      } ${cardStyle.height}`}
    >
      <div className={`relative h-[150px] bg-gradient-to-br ${hint.image} sm:h-[180px]`}>
        <div className="flex items-start justify-between p-4">
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${cardStyle.labelClass}`}>
            {cardStyle.label}
          </span>

          <button
            aria-label={hint.highlighted ? "Remove highlight" : "Highlight hint"}
            className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition ${
              hint.highlighted
                ? "border-white/50 bg-white/75 text-[#f36f64]"
                : "border-white/50 bg-white/60 text-slate-400 hover:text-[#f36f64]"
            }`}
          >
            ★
          </button>
        </div>
      </div>

      <div className="flex h-full flex-col p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {hint.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-[#faf9f7] px-2.5 py-1 text-[11px] font-medium text-slate-500"
            >
              {tag}
            </span>
          ))}
          {hint.highlighted && (
            <span className="rounded-full bg-[#fff1e8] px-2.5 py-1 text-[11px] font-semibold text-[#e37856]">
              Top pick
            </span>
          )}
        </div>

        <h2 className="mt-4 text-[20px] font-semibold leading-tight tracking-[-0.04em] text-slate-900">
          {hint.title}
        </h2>

        <p className="mt-2 text-[14px] text-slate-500">
          {hint.retailer} · {hint.priceLabel}
        </p>

        <p className="mt-3 text-[14px] leading-7 text-slate-600">
          {hint.note}
        </p>

        <div className="mt-5 rounded-[22px] bg-[#faf7f4] px-4 py-3">
          <p className="text-[12px] font-medium text-slate-500">Saved for</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{hint.person}</p>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#efc3af] to-[#ae6e57] text-[10px] font-bold text-white">
                {hint.savedBy.slice(0, 1)}
              </div>
              <span className="text-[12px] text-slate-400">Saved by {hint.savedBy}</span>
            </div>

            <button className="rounded-full border border-[#ebddd5] px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-[#faf7f4]">
              Open
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HintsPage() {
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
                href="/hints"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-[14px] font-semibold text-slate-900 shadow-sm"
              >
                Hints
              </Link>
            </nav>
          </div>

          <AvatarMenu />
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-8">
        <section className="rounded-[36px] border border-[#eeddd3] bg-[#fff7f2] p-4 shadow-[0_18px_60px_rgba(173,101,72,0.1)] sm:p-5">
          <div className="rounded-[28px] border border-[#f1dfd6] bg-white p-5 sm:p-6">
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
              <div>
                <div className="inline-flex rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e37b57]">
                  The main board
                </div>

                <h1 className="mt-4 text-[34px] font-semibold tracking-[-0.06em] text-slate-900 sm:text-[44px]">
                  Save ideas worth remembering.
                </h1>

                <p className="mt-3 max-w-[700px] text-[15px] leading-7 text-slate-600">
                  Paste a link and turn it into a clean, visual hint card. Bigger gifts take up more space, smaller ideas stay light, and the best ones can be highlighted so they never disappear into the board.
                </p>
              </div>

              <div className="rounded-[26px] border border-[#efdfd7] bg-[#fffdfa] p-4 sm:p-5">
                <label
                  htmlFor="hint-link"
                  className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                >
                  Add a hint by link
                </label>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="hint-link"
                    type="url"
                    placeholder="Paste any gift, product, experience, or wishlist link"
                    className="h-14 w-full rounded-full border border-[#e8ddd5] bg-white px-5 text-sm text-slate-700 outline-none focus:border-[#f19a78]/60 focus:ring-4 focus:ring-[#f19a78]/10"
                  />
                  <button className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg">
                    Add hint
                  </button>
                </div>

                <p className="mt-3 text-[12px] leading-6 text-slate-500">
                  Keep it simple — one link is enough to start building the board.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Visual collection
              </p>
              <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
                Your hints board
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#eadfd8] bg-white px-3 py-2 text-[12px] font-medium text-slate-500">
                Bigger cards = higher spend
              </span>
              <span className="rounded-full border border-[#eadfd8] bg-white px-3 py-2 text-[12px] font-medium text-slate-500">
                Highlight your best ideas
              </span>
            </div>
          </div>

          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {hints.map((hint) => (
              <HintCard key={hint.id} hint={hint} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
