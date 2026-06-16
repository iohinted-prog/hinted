import Link from "next/link";

export const metadata = {
  title: "Hints | Hinted.io",
  description: "Save beautiful gift ideas and organise them in one visual board.",
};

const hints = [
  {
    id: 1,
    title: "Sony noise-cancelling headphones",
    retailer: "amazon.co.uk",
    price: 249,
    priceLabel: "About £249",
    tags: ["Tech", "Birthday"],
    image: "from-[#e8d5c4] via-[#d7b795] to-[#bb8d67]",
    starred: true,
    note: "A premium gift that feels generous and genuinely useful.",
    addedBy: "You",
  },
  {
    id: 2,
    title: "Ceramics workshop for two",
    retailer: "classbento.co.uk",
    price: 78,
    priceLabel: "About £78",
    tags: ["Experience", "Couples"],
    image: "from-[#f6d8cf] via-[#eab3a2] to-[#d88871]",
    starred: false,
    note: "Thoughtful, memorable, and better than another predictable object.",
    addedBy: "Maya",
  },
  {
    id: 3,
    title: "Silk pillowcase set",
    retailer: "johnlewis.com",
    price: 45,
    priceLabel: "About £45",
    tags: ["Home", "Under £50"],
    image: "from-[#f4e7df] via-[#ecd5c8] to-[#d4b3a3]",
    starred: false,
    note: "A smaller spend that still feels polished.",
    addedBy: "You",
  },
  {
    id: 4,
    title: "Weekend cabin stay",
    retailer: "airbnb.co.uk",
    price: 320,
    priceLabel: "From £320",
    tags: ["Travel", "Big gift"],
    image: "from-[#d8dfcf] via-[#b0bd9a] to-[#83966d]",
    starred: true,
    note: "Best saved for a milestone or shared circle contribution.",
    addedBy: "James",
  },
  {
    id: 5,
    title: "Kindle Paperwhite",
    retailer: "amazon.co.uk",
    price: 159,
    priceLabel: "About £159",
    tags: ["Books", "Everyday"],
    image: "from-[#d5dbec] via-[#bcc7de] to-[#92a3c6]",
    starred: false,
    note: "A strong practical option with long-term value.",
    addedBy: "You",
  },
  {
    id: 6,
    title: "Cast-iron casserole dish",
    retailer: "johnlewis.com",
    price: 89,
    priceLabel: "About £89",
    tags: ["Home", "Cooking"],
    image: "from-[#dfd6d0] via-[#bfaea3] to-[#947a69]",
    starred: false,
    note: "Feels grown-up, useful, and lasting.",
    addedBy: "You",
  },
  {
    id: 7,
    title: "Framed art print",
    retailer: "etsy.com",
    price: 38,
    priceLabel: "About £38",
    tags: ["Home", "Under £50"],
    image: "from-[#eadfeb] via-[#d4bfd8] to-[#b596ba]",
    starred: false,
    note: "Small budget, but high personality if you get the style right.",
    addedBy: "Fiona",
  },
  {
    id: 8,
    title: "Pourover coffee set",
    retailer: "hasbean.co.uk",
    price: 62,
    priceLabel: "About £62",
    tags: ["Coffee", "Home"],
    image: "from-[#dce8eb] via-[#bfd6dc] to-[#92b7c2]",
    starred: false,
    note: "A good middle-ground option with everyday appeal.",
    addedBy: "You",
  },
  {
    id: 9,
    title: "Leather weekend bag",
    retailer: "harrods.com",
    price: 285,
    priceLabel: "About £285",
    tags: ["Travel", "Luxury"],
    image: "from-[#e4d5ca] via-[#c7a992] to-[#9b755d]",
    starred: true,
    note: "A standout premium piece for a major occasion.",
    addedBy: "Mum",
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

function getCardStyle(price, starred) {
  if (price >= 250) {
    return {
      height: "min-h-[380px]",
      tier: "Big gift",
      tierClass: starred
        ? "bg-[#2f3b2d] text-white"
        : "bg-[#2f3b2d] text-white",
      imageHeight: "h-[210px]",
    };
  }

  if (price >= 120) {
    return {
      height: "min-h-[320px]",
      tier: "Premium",
      tierClass: "bg-[#fff1e8] text-[#df7a59]",
      imageHeight: "h-[190px]",
    };
  }

  if (price >= 60) {
    return {
      height: "min-h-[280px]",
      tier: "Mid-range",
      tierClass: "bg-[#f4f0ff] text-[#7b5fbc]",
      imageHeight: "h-[170px]",
    };
  }

  return {
    height: "min-h-[230px]",
    tier: "Smaller spend",
    tierClass: "bg-[#eef5ea] text-[#5f7c4f]",
    imageHeight: "h-[145px]",
  };
}

function HintCard({ hint }) {
  const style = getCardStyle(hint.price, hint.starred);

  return (
    <article
      className={`group mb-4 break-inside-avoid overflow-hidden rounded-[28px] border transition-all duration-200 hover:-translate-y-1 ${
        hint.starred
          ? "border-[#efcfbf] bg-[#fffaf7] shadow-[0_16px_36px_rgba(181,117,82,0.12)]"
          : "border-[#f0dfd6] bg-white shadow-sm hover:shadow-[0_14px_30px_rgba(167,114,84,0.12)]"
      } ${style.height}`}
    >
      <div className={`relative w-full bg-gradient-to-br ${hint.image} ${style.imageHeight}`}>
        <div className="flex items-start justify-between p-4">
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${style.tierClass}`}>
            {style.tier}
          </span>

          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm ${
              hint.starred
                ? "border-white/50 bg-white/75 text-[#f36f64]"
                : "border-white/50 bg-white/65 text-slate-400 hover:text-[#f36f64]"
            }`}
            aria-label={hint.starred ? "Remove highlight" : "Highlight hint"}
          >
            ★
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
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

        <h2 className="mt-4 text-[20px] font-semibold leading-tight tracking-[-0.04em] text-slate-900">
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
        <section className="rounded-[34px] border border-[#eeddd3] bg-[#fff7f2] p-4 shadow-[0_18px_60px_rgba(173,101,72,0.1)] sm:p-5">
          <div className="rounded-[28px] border border-[#f1dfd6] bg-white p-5 sm:p-6">
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
              <div>
                <div className="inline-flex rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e37b57]">
                  Main board
                </div>

                <h1 className="mt-4 text-[34px] font-semibold tracking-[-0.06em] text-slate-900 sm:text-[44px]">
                  The place for every good gift idea.
                </h1>

                <p className="mt-3 max-w-[720px] text-[15px] leading-7 text-slate-600">
                  Save links in one step, then let Hinted turn them into a clean visual board where better, bigger, and more important ideas naturally stand out.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#efdfd7] bg-[#fffdfa] p-4 sm:p-5">
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
                    placeholder="Paste any product or experience link"
                    className="h-14 w-full rounded-full border border-[#e8ddd5] bg-white px-5 text-sm text-slate-700 outline-none focus:border-[#f19a78]/60 focus:ring-4 focus:ring-[#f19a78]/10"
                  />
                  <button className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg">
                    Add hint
                  </button>
                </div>

                <p className="mt-3 text-[12px] leading-6 text-slate-500">
                  Drop in a product page, wishlist link, or experience URL and turn it into a saved hint.
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
                Saved hints
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#eadfd8] bg-white px-3 py-2 text-[12px] font-medium text-slate-500">
                Bigger cards = higher spend
              </span>
              <span className="rounded-full border border-[#eadfd8] bg-white px-3 py-2 text-[12px] font-medium text-slate-500">
                Starred = priority
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
