import Link from "next/link";

export const metadata = {
  title: "Hints | Hinted.io",
  description: "Collect and organise gift ideas in one clean visual board.",
};

const hints = [
  {
    id: 1,
    title: "Noise-cancelling headphones",
    retailer: "amazon.co.uk",
    priceLabel: "£249",
    image: "from-[#ead8cb] via-[#d9bda6] to-[#b88969]",
    tags: ["Tech", "Birthday"],
    starred: true,
    size: "tall",
  },
  {
    id: 2,
    title: "Weekend cabin stay",
    retailer: "airbnb.co.uk",
    priceLabel: "£320",
    image: "from-[#d8dfcf] via-[#b8c5aa] to-[#90a37d]",
    tags: ["Travel", "Circle"],
    starred: true,
    size: "tall",
  },
  {
    id: 3,
    title: "Silk pillowcase set",
    retailer: "johnlewis.com",
    priceLabel: "£45",
    image: "from-[#f1e6df] via-[#e5d2c5] to-[#cfad98]",
    tags: ["Home", "Under £50"],
    starred: false,
    size: "short",
  },
  {
    id: 4,
    title: "Kindle Paperwhite",
    retailer: "amazon.co.uk",
    priceLabel: "£159",
    image: "from-[#d3d9ea] via-[#bcc6dd] to-[#97a6c9]",
    tags: ["Books", "Everyday"],
    starred: false,
    size: "medium",
  },
  {
    id: 5,
    title: "Ceramics workshop",
    retailer: "classbento.co.uk",
    priceLabel: "£78",
    image: "from-[#f3d5ca] via-[#ecb7a6] to-[#db907a]",
    tags: ["Experiences", "Birthday"],
    starred: false,
    size: "medium",
  },
  {
    id: 6,
    title: "Art print for the living room",
    retailer: "etsy.com",
    priceLabel: "£38",
    image: "from-[#e9dce9] via-[#d6c0d5] to-[#b996b6]",
    tags: ["Home", "Smaller gift"],
    starred: false,
    size: "short",
  },
  {
    id: 7,
    title: "Cast-iron casserole dish",
    retailer: "johnlewis.com",
    priceLabel: "£89",
    image: "from-[#ddd5cf] via-[#c0b0a4] to-[#957c69]",
    tags: ["Cooking", "Home"],
    starred: false,
    size: "medium",
  },
  {
    id: 8,
    title: "Pourover coffee set",
    retailer: "hasbean.co.uk",
    priceLabel: "£62",
    image: "from-[#d6e5ea] via-[#bad0d7] to-[#94b4c3]",
    tags: ["Coffee", "Home"],
    starred: false,
    size: "short",
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
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead9cf] bg-[#fff4ec] text-sm font-bold text-[#d77352] shadow-sm"
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

function HintCard({ hint }) {
  const heightClass =
    hint.size === "tall"
      ? "min-h-[420px]"
      : hint.size === "medium"
        ? "min-h-[320px]"
        : "min-h-[250px]";

  return (
    <article
      className={`mb-8 break-inside-avoid overflow-hidden rounded-[28px] border ${
        hint.starred
          ? "border-[#efcfbf] bg-[#fffaf7] shadow-[0_14px_30px_rgba(184,122,92,0.12)]"
          : "border-[#f0dfd6] bg-white shadow-sm"
      } transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(171,114,84,0.14)] ${heightClass}`}
    >
      <div className={`relative h-[170px] w-full bg-gradient-to-br ${hint.image}`}>
        <div className="flex items-start justify-between p-4">
          <div className="flex flex-wrap gap-2">
            {hint.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/40 bg-white/65 px-2.5 py-1 text-[11px] font-medium text-slate-700 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/70 backdrop-blur-sm ${
              hint.starred ? "text-[#f36f64]" : "text-slate-400 hover:text-[#f36f64]"
            }`}
            aria-label={hint.starred ? "Unhighlight hint" : "Highlight hint"}
          >
            ★
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {hint.starred && (
          <span className="mb-3 inline-flex w-fit rounded-full bg-[#fff0e9] px-2.5 py-1 text-[11px] font-semibold text-[#e27956]">
            Top pick
          </span>
        )}

        <h2 className="text-[20px] font-semibold tracking-[-0.04em] text-slate-900">
          {hint.title}
        </h2>

        <p className="mt-2 text-[14px] text-slate-500">
          {hint.retailer} · {hint.priceLabel}
        </p>

        <div className="mt-auto pt-6">
          <button className="rounded-full border border-[#ebddd5] px-4 py-2 text-[12px] font-medium text-slate-600 hover:bg-[#faf7f4]">
            View hint
          </button>
        </div>
      </div>
    </article>
  );
}

export default function HintsPage() {
  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-800">
      <header className="border-b border-[#efe0d7] bg-[#fffaf7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 md:px-8">
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
              <Link
                href="/circles"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-[14px] font-semibold text-slate-600 hover:bg-[#fff5f0]"
              >
                Circles
              </Link>
            </nav>
          </div>

          <AvatarMenu />
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] px-5 py-8 md:px-8">
        <section className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[34px] font-semibold tracking-[-0.06em] text-slate-900 sm:text-[42px]">
                Your hints
              </h1>
              <p className="mt-2 text-[15px] leading-7 text-slate-600">
                Save gift ideas from anywhere and keep the best ones close.
              </p>
            </div>

            <div className="w-full max-w-[620px]">
              <div className="flex h-14 items-center gap-3 rounded-full border border-[#ebddd5] bg-white px-3 shadow-sm">
                <input
                  id="hint-link"
                  type="url"
                  placeholder="Paste a gift or product link"
                  className="h-full w-full bg-transparent px-2 text-sm text-slate-700 outline-none"
                />
                <button className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg">
                  Add
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="columns-1 gap-8 sm:columns-2 xl:columns-3 2xl:columns-4">
            {hints.map((hint) => (
              <HintCard key={hint.id} hint={hint} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
