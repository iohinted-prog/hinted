import Link from "next/link";

export const metadata = {
  title: "Hints | Hinted.io",
  description: "Collect, organise, and revisit gift ideas in one beautiful board.",
};

const hints = [
  {
    id: 1,
    title: "Noise-cancelling headphones",
    retailer: "amazon.co.uk",
    price: 249,
    priceLabel: "About £249",
    image: "from-[#e8d5c4] via-[#dcc1a4] to-[#c4a882]",
    tags: ["Tech", "Birthday"],
    starred: true,
    note: "A strong all-rounder and one of the safest premium picks.",
    addedBy: "You",
  },
  {
    id: 2,
    title: "Ceramics workshop for two",
    retailer: "classbento.co.uk",
    price: 78,
    priceLabel: "About £78",
    image: "from-[#f5d2c8] via-[#edb7a4] to-[#db8d75]",
    tags: ["Experience", "Couples"],
    starred: false,
    note: "Feels thoughtful without needing loads of planning.",
    addedBy: "Maya",
  },
  {
    id: 3,
    title: "Silk pillowcase set",
    retailer: "johnlewis.com",
    price: 45,
    priceLabel: "About £45",
    image: "from-[#f2e5dc] via-[#ead7cb] to-[#d7b7a4]",
    tags: ["Home", "Under £50"],
    starred: false,
    note: "Easy win and still feels personal.",
    addedBy: "Mum",
  },
  {
    id: 4,
    title: "Weekend cabin stay",
    retailer: "airbnb.co.uk",
    price: 320,
    priceLabel: "From £320",
    image: "from-[#d5dccc] via-[#b8c4a7] to-[#8fa17b]",
    tags: ["Travel", "Big gift"],
    starred: true,
    note: "Better suited to a shared circle or milestone gift.",
    addedBy: "James",
  },
  {
    id: 5,
    title: "Kindle Paperwhite",
    retailer: "amazon.co.uk",
    price: 159,
    priceLabel: "About £159",
    image: "from-[#cdd4e8] via-[#b4bfd8] to-[#8d9bbf]",
    tags: ["Books", "Everyday"],
    starred: false,
    note: "Practical, useful, and easy to justify.",
    addedBy: "You",
  },
  {
    id: 6,
    title: "Cast-iron casserole dish",
    retailer: "johnlewis.com",
    price: 89,
    priceLabel: "About £89",
    image: "from-[#d8d1cb] via-[#bcaea1] to-[#8f7765]",
    tags: ["Home", "Cooking"],
    starred: false,
    note: "A good long-term household gift.",
    addedBy: "You",
  },
  {
    id: 7,
    title: "Art print for the living room",
    retailer: "etsy.com",
    price: 38,
    priceLabel: "About £38",
    image: "from-[#eadbe8] via-[#d8bfd3] to-[#b998b7]",
    tags: ["Home", "Under £50"],
    starred: false,
    note: "Smaller spend, but high personality if the taste is right.",
    addedBy: "Fiona",
  },
  {
    id: 8,
    title: "Pourover coffee set",
    retailer: "hasbean.co.uk",
    price: 62,
    priceLabel: "About £62",
    image: "from-[#d5e5ea] via-[#b8d0d8] to-[#90b4c4]",
    tags: ["Coffee", "Home"],
    starred: false,
    note: "Nice middle-ground option with daily-use appeal.",
    addedBy: "You",
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

function getHintStyles(price, starred) {
  if (price >= 220) {
    return {
      height: "min-h-[380px]",
      imageHeight: "h-[200px]",
      badge: "Big gift",
      badgeClass: starred
        ? "bg-[#2f3b2d] text-white"
        : "bg-[#2f3b2d] text-white",
    };
  }

  if (price >= 120) {
    return {
      height: "min-h-[320px]",
      imageHeight: "h-[180px]",
      badge: "Premium",
      badgeClass: "bg-[#fff2ea] text-[#df7a59]",
    };
  }

  if (price >= 60) {
    return {
      height: "min-h-[280px]",
      imageHeight: "h-[165px]",
      badge: "Mid-range",
      badgeClass: "bg-[#f4f0ff] text-[#7b5fbc]",
    };
  }

  return {
    height: "min-h-[230px]",
    imageHeight: "h-[135px]",
    badge: "Smaller spend",
    badgeClass: "bg-[#f3f6ef] text-[#5f7c4f]",
  };
}

function HintCard({ hint }) {
  const styles = getHintStyles(hint.price, hint.starred);

  return (
    <article
      className={`group mb-4 break-inside-avoid overflow-hidden rounded-[28px] border ${
        hint.starred
          ? "border-[#efcfbf] bg-[#fffaf7] shadow-[0_14px_30px_rgba(184,122,92,0.12)]"
          : "border-[#f0dfd6] bg-white shadow-sm"
      } transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(171,114,84,0.14)] ${styles.height}`}
    >
      <div className={`relative w-full bg-gradient-to-br ${hint.image} ${styles.imageHeight}`}>
        <div className="flex items-start justify-between p-4">
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${styles.badgeClass}`}>
            {styles.badge}
          </span>

          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm ${
              hint.starred
                ? "border-white/50 bg-white/70 text-[#f36f64]"
                : "border-white/50 bg-white/60 text-slate-400 hover:text-[#f36f64]"
            }`}
            aria-label={hint.starred ? "Unhighlight hint" : "Highlight hint"}
          >
            ★
          </button>
        </div>
      </div>

      <div className="flex h-full flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {hint.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-[#faf9f7] px-2.5 py-1 text-[11px] font-medium text-slate-500"
            >
              {tag}
            </span>
          ))}

          {hint.starred && (
            <span className="rounded-full bg-[#fff0e9] px-2.5 py-1 text-[11px] font-semibold text-[#e27956]">
              Top pick
            </span>
          )}
        </div>

        <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.04em] text-slate-900">
          {hint.title}
        </h2>

        <p className="mt-2 text-[14px] text-slate-500">
          {hint.retailer} · {hint.priceLabel}
        </p>

        <p className="mt-3 text-[14px] leading-7 text-slate-600">
          {hint.note}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#efc3af] to-[#ae6e57] text-[10px] font-bold text-white">
                {hint.addedBy.slice(0, 1)}
              </div>
              <span className="text-[12px] text-slate-400">Added by {hint.addedBy}</span>
            </div>

            <button className="rounded-full border border-[#ebddd5] px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-[#faf7f4]">
              View
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
        <section className="rounded-[34px] border border-[#eeddd3] bg-[#fff7f2] p-4 shadow-[0_18px_60px_rgba(173,101,72,0.1)] sm:p-5">
          <div className="rounded-[28px] border border-[#f1dfd6] bg-white p-5 sm:p-6">
            <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
              <div>
                <div className="inline-flex rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e37b57]">
                  Your board
                </div>
                <h1 className="mt-4 text-[34px] font-semibold tracking-[-0.06em] text-slate-900 sm:text-[42px]">
                  Collect better hints, beautifully.
                </h1>
                <p className="mt-3 max-w-[700px] text-[15px] leading-7 text-slate-600">
                  Save gift ideas from anywhere with a single link, then let the board organise
                  them into a clean visual collection where the bigger spends naturally stand out.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#efdfd7] bg-[#fffdfa] p-4">
                <label
                  htmlFor="hint-link"
                  className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                >
                  Paste a link
                </label>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="hint-link"
                    type="url"
                    placeholder="Paste any product or gift link"
                    className="h-14 w-full rounded-full border border-[#e8ddd5] bg-white px-5 text-sm text-slate-700 outline-none focus:border-[#f19a78]/60 focus:ring-4 focus:ring-[#f19a78]/10"
                  />
                  <button className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg">
                    Add hint
                  </button>
                </div>

                <p className="mt-3 text-[12px] leading-6 text-slate-500">
                  Paste a product, experience, or wishlist link and Hinted can turn it into a
                  clean card on your board.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Visual board
              </p>
              <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
                Saved hints
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#eadfd8] bg-white px-3 py-2 text-[12px] font-medium text-slate-500">
                Size follows price
              </span>
              <span className="rounded-full border border-[#eadfd8] bg-white px-3 py-2 text-[12px] font-medium text-slate-500">
                Highlight top picks
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
