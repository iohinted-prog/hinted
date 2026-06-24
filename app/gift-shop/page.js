"use client";

import Link from "next/link";
import Script from "next/script";
import GoogleAuthButtons from "../components/GoogleAuthButtons";

const FEATURED_PRODUCTS = [
  {
    id: "1",
    title: "Le Creuset Signature casserole",
    retailer: "johnlewis.com",
    price: "£245",
    image:
      "https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=1200&q=80",
    shortNote:
      "A lasting kitchen gift for weddings, anniversaries, and serious home cooks.",
    interestTags: ["Home"],
    occasionTags: ["Wedding"],
    category: "Home · Cooking",
  },
  {
    id: "2",
    title: "Weekend treehouse stay",
    retailer: "airbnb.co.uk",
    price: "From £180",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    shortNote:
      "An experience-led gift that feels generous without becoming generic.",
    interestTags: ["Travel"],
    occasionTags: ["Anniversary"],
    category: "Experiences · Travel",
  },
  {
    id: "3",
    title: "Silk pillowcase gift set",
    retailer: "etsy.com",
    price: "£42",
    image:
      "https://images.unsplash.com/photo-1616628182509-6f0c7ab0d15f?auto=format&fit=crop&w=1200&q=80",
    shortNote:
      "Easy to post, easy to love, and still personal enough to feel considered.",
    interestTags: ["Beauty"],
    occasionTags: ["Birthday"],
    category: "Beauty · Home",
  },
  {
    id: "4",
    title: "Noise-cancelling headphones",
    retailer: "amazon.co.uk",
    price: "£119",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    shortNote:
      "A dependable higher-value gift for commuters, students, and work-from-home setups.",
    interestTags: ["Tech"],
    occasionTags: ["Graduation"],
    category: "Tech · Everyday",
  },
  {
    id: "5",
    title: "Ceramics workshop for two",
    retailer: "classbento.co.uk",
    price: "£95",
    image:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1200&q=80",
    shortNote:
      "A thoughtful pick for people who prefer memories and time together over objects.",
    interestTags: ["Experiences"],
    occasionTags: ["Just because"],
    category: "Experiences · Creative",
  },
  {
    id: "6",
    title: "Coffee brewing set",
    retailer: "hasbean.co.uk",
    price: "£58",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    shortNote:
      "A strong option for everyday rituals, first homes, and low-risk gifting.",
    interestTags: ["Food"],
    occasionTags: ["Housewarming"],
    category: "Home · Coffee",
  },
];

const INTEREST_OPTIONS = [
  "Home",
  "Food",
  "Beauty",
  "Tech",
  "Travel",
  "Wellness",
  "Books",
  "Fashion",
  "Experiences",
  "Music",
  "Gaming",
  "Kids",
  "Hobbies",
];

const OCCASION_OPTIONS = [
  "Birthday",
  "Anniversary",
  "Thank you",
  "New baby",
  "Housewarming",
  "Wedding",
  "Graduation",
  "Just because",
];

function LandingLogo() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-2xl text-white shadow-lg">
        🎁
      </div>
      <div className="text-[22px] font-extrabold tracking-[-0.04em] text-slate-900">
        Hinted<span className="text-[#f36f64]">.io</span>
      </div>
    </div>
  );
}

function ShopCard({ product }) {
  return (
    <article
      className="group relative w-full overflow-hidden rounded-[30px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.60)] transition-all duration-300 hover:-translate-y-1"
      style={{
        aspectRatio: 0.9,
        maxHeight: "min(540px, 68vh)",
        boxShadow:
          "0 10px 30px rgba(176,118,86,0.10), inset 0 1px 0 rgba(255,255,255,0.24)",
      }}
    >
      <div className="absolute inset-0">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(16,12,10,0.84)_0%,rgba(16,12,10,0.40)_30%,rgba(16,12,10,0.10)_55%,rgba(255,255,255,0)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(22,18,16,0.72)] via-[rgba(22,18,16,0.18)] to-transparent" />
      </div>

      <div className="absolute left-4 right-4 top-4 z-30 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {product.interestTags.slice(0, 1).map((tag) => (
            <span
              key={`${product.id}-${tag}`}
              className="rounded-full border border-white/45 bg-white/76 px-3 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-md"
            >
              {tag}
            </span>
          ))}
          {product.occasionTags.slice(0, 1).map((tag) => (
            <span
              key={`${product.id}-${tag}`}
              className="rounded-full border border-white/45 bg-white/76 px-3 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="rounded-full border border-[#ffd8c9] bg-[#fff2ea] px-3 py-1 text-[11px] font-semibold text-[#e27956]">
          {product.price}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5">
        <div className="min-w-0">
          <h3
            className="overflow-hidden text-[22px] font-semibold tracking-[-0.05em] text-white"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              lineClamp: 2,
              textShadow: "0 1px 2px rgba(0,0,0,0.24)",
            }}
          >
            {product.title}
          </h3>

          <p className="mt-1 truncate text-[13px] text-white/80">
            {product.retailer}
          </p>

          <p
            className="mt-3 overflow-hidden text-[13px] leading-6 text-white/84"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              lineClamp: 3,
            }}
          >
            {product.shortNote}
          </p>

          <p className="mt-3 text-[12px] text-white/72">{product.category}</p>
        </div>

        <div className="pointer-events-auto mt-4 flex flex-wrap items-center gap-2">
          <Link
            href="/#signup"
            className="rounded-full border border-[#ffb38f] bg-[#ff875d] px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-md hover:bg-[#f47145]"
          >
            Add to hints
          </Link>

          <a
            href="#signup"
            className="rounded-full border border-white/45 bg-white/76 px-3 py-1.5 text-[12px] font-medium text-slate-700 backdrop-blur-md hover:bg-white"
          >
            View item
          </a>
        </div>
      </div>
    </article>
  );
}

export default function GiftShopPage() {
  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-800">
      <Script
        id="skimlinks-loader"
        strategy="afterInteractive"
        src="https://s.skimresources.com/js/305122X1793314.skimlinks.js"
      />

      <div className="mx-auto max-w-[1380px] px-5 pb-16 pt-6 md:px-8">
        <header className="grid items-center gap-5 pb-8 lg:grid-cols-[auto_1fr_auto] lg:gap-8">
          <LandingLogo />

          <nav className="hidden items-center justify-center gap-9 text-[15px] text-slate-600 lg:flex">
            <Link href="/" className="transition hover:text-slate-900">
              Home
            </Link>
          </nav>

          <div className="flex items-center justify-start gap-4 whitespace-nowrap sm:justify-end">
            <GoogleAuthButtons variant="header-login" />
            <GoogleAuthButtons variant="header-get-started" />
          </div>
        </header>

        <section className="rounded-[34px] border border-[#eeddd3] bg-[#fff7f2] p-4 shadow-[0_18px_60px_rgba(173,101,72,0.10)] sm:p-5">
          <div className="rounded-[28px] border border-[#f1dfd6] bg-white p-5 sm:p-6">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="min-w-0">
                <div className="inline-flex rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e37b57]">
                  Curated gifting
                </div>

                <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.06em] text-slate-900 sm:text-[40px]">
                  Browse thoughtful gift ideas before you sign in.
                </h1>

                <p className="mt-3 max-w-[760px] text-[15px] leading-7 text-slate-600">
                  This is the public version of Shop. You can explore the kinds of
                  gifts Hinted curates, then sign in with Google when you want to
                  save ideas to hints, build circles, and unlock the full planning
                  flow.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    placeholder="Search gifts, retailers, interests, or occasions"
                    className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none"
                    disabled
                  />

                  <select
                    className="h-12 min-w-[190px] rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none"
                    disabled
                    defaultValue=""
                  >
                    <option value="">All occasions</option>
                    {OCCASION_OPTIONS.map((occasion) => (
                      <option key={occasion} value={occasion}>
                        {occasion}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-sm font-semibold text-slate-700"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <aside className="rounded-[26px] border border-[#f0dfd6] bg-[#fffdfa] p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  How Shop works
                </p>

                <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
                  Curated first, off-site second
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="rounded-[20px] bg-[#faf7f4] p-4">
                    <span className="inline-flex rounded-full bg-[#fff4ee] px-2.5 py-1 text-[11px] font-semibold text-[#df7b59]">
                      1. Browse
                    </span>
                    <p className="mt-3 text-[13px] leading-6 text-slate-600">
                      Explore a thoughtful edit of gifts grouped around interests,
                      occasions, and real-life gifting moments.
                    </p>
                  </div>

                  <div className="rounded-[20px] bg-[#faf7f4] p-4">
                    <span className="inline-flex rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-semibold text-[#5676b3]">
                      2. Save
                    </span>
                    <p className="mt-3 text-[13px] leading-6 text-slate-600">
                      Once signed in, you can save the good finds into hints for
                      later or use them inside circle gifting flows.
                    </p>
                  </div>

                  <div className="rounded-[20px] bg-[#faf7f4] p-4">
                    <span className="inline-flex rounded-full bg-[#edf6eb] px-2.5 py-1 text-[11px] font-semibold text-[#4a7a3a]">
                      3. View item
                    </span>
                    <p className="mt-3 text-[13px] leading-6 text-slate-600">
                      When available, the retailer link can open through your
                      affiliate flow in a new tab.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[20px] bg-[#fffaf7] p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Sign in to unlock saves
                  </p>
                  <p className="mt-2 text-[13px] leading-6 text-slate-500">
                    The public page is for browsing. Your personalised hints,
                    circles, and saved gift planning stay behind Google sign-in.
                  </p>

                  <div className="mt-4">
                    <GoogleAuthButtons variant="hero-primary" />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="relative rounded-[36px] border border-[#efe0d7] bg-[#fffdfb] p-3 shadow-[0_12px_32px_rgba(176,118,86,0.08)] sm:p-5">
            <div
              className="pointer-events-none absolute inset-0 rounded-[36px] opacity-70"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(214, 195, 184, 0.28) 1px, transparent 1px), linear-gradient(to bottom, rgba(214, 195, 184, 0.28) 1px, transparent 1px)",
                backgroundSize: "76px 76px",
                backgroundPosition: "center center",
              }}
            />

            <div className="relative columns-1 gap-6 md:columns-2 xl:columns-3">
              {FEATURED_PRODUCTS.map((product) => (
                <div key={product.id} className="mb-6 break-inside-avoid">
                  <ShopCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-[#eaded6] bg-[#fffaf7]">
          <div className="flex flex-col gap-4 px-0 py-6 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-[720px] text-xs leading-5 text-slate-500 lg:text-sm">
              By continuing, you agree to{" "}
              <Link
                href="/terms"
                className="font-medium text-slate-700 underline underline-offset-2 transition hover:text-slate-900"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-slate-700 underline underline-offset-2 transition hover:text-slate-900"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <Link href="/for-brands" className="transition hover:text-slate-900">
                For Brands
              </Link>
              <Link href="/contact" className="transition hover:text-slate-900">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
