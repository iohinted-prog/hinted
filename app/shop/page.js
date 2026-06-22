"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import AvatarMenu from "../components/AvatarMenu";

const DEFAULT_USER_INTERESTS = [
  "Home",
  "Beauty",
  "Tech",
  "Fashion",
  "Food",
  "Experiences",
];

const OCCASION_OPTIONS = [
  "All occasions",
  "Birthday",
  "Wedding",
  "Anniversary",
  "Housewarming",
  "Baby shower",
  "Graduation",
  "Thank you",
  "Christmas",
  "Just because",
];

const PRICE_OPTIONS = ["All prices", "Under £50", "£50-£100", "£100+", "Luxury"];

function LogoMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-white shadow-lg">
      <span className="text-lg">🎁</span>
    </div>
  );
}

function formatMoney(value, currency = "GBP") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function normaliseError(error, fallback = "Something went wrong.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || fallback;
  if (typeof error?.message === "string" && error.message.trim()) return error.message;
  if (typeof error?.error === "string" && error.error.trim()) return error.error;
  return fallback;
}

function extractInterestsFromProducts(items) {
  const values = new Set();
  items.forEach((item) => {
    if (Array.isArray(item.interests)) {
      item.interests.forEach((interest) => {
        const clean = String(interest || "").trim();
        if (clean) values.add(clean);
      });
    }
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function resolvePriceBucket(price) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return "Unknown";
  if (amount < 50) return "Under £50";
  if (amount <= 100) return "£50-£100";
  if (amount > 250) return "Luxury";
  return "£100+";
}

function resolveOutgoingUrl(item) {
  if (item.affiliate_url) return item.affiliate_url;
  return item.product_url;
}

function buildHintPayload(item, visibility, note) {
  return {
    title: item.title || "Saved hint",
    url: resolveOutgoingUrl(item) || item.product_url || "",
    retailer: item.retailer || "",
    imageurl: item.image_url || "",
    pricetext:
      item.price_text ||
      (item.numeric_price != null ? formatMoney(item.numeric_price, item.currency || "GBP") : "Price unavailable"),
    numericprice:
      item.numeric_price != null && Number.isFinite(Number(item.numeric_price))
        ? Number(item.numeric_price)
        : null,
    isprivate: visibility === "Private",
    starred: false,
    source: "shop",
    note,
  };
}

function ModalShell({ open, onClose, eyebrow, title, children, footer, maxWidth = "max-w-[760px]" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(42,26,20,0.38)] px-4 py-6 backdrop-blur-sm">
      <div className={`max-h-[92vh] w-full overflow-hidden rounded-[34px] border border-[#eddacf] bg-[#fffaf7] shadow-[0_24px_80px_rgba(88,46,31,0.22)] ${maxWidth}`}>
        <div className="flex items-start justify-between gap-4 border-b border-[#efe0d7] px-6 py-5">
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#df7b59]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.05em] text-slate-900">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white text-slate-500 hover:bg-[#fff2eb]"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[calc(92vh-160px)] overflow-y-auto">{children}</div>

        {footer ? <div className="border-t border-[#efe0d7] bg-[#fffaf7] px-6 py-5">{footer}</div> : null}
      </div>
    </div>
  );
}

function InterestTile({ label, active, isSuggested, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "border-[#3c4d39] bg-[#2f3b2d] text-white"
          : isSuggested
          ? "border-[#f0cdbf] bg-[#fff3ec] text-[#9a5f46] hover:bg-[#ffefe5]"
          : "border-[#ead8ce] bg-white text-slate-700 hover:bg-[#fff5f0]"
      }`}
    >
      <span>{label}</span>
      {isSuggested ? (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${active ? "bg-white/16 text-white" : "bg-[#fff8f4] text-[#bf7a5d]"}`}>
          Yours
        </span>
      ) : null}
    </button>
  );
}

function ShopCard({ item, selectedInterests, onAddToHints }) {
  const priceLabel =
    item.price_text ||
    (item.numeric_price != null ? formatMoney(item.numeric_price, item.currency || "GBP") : "");
  const matchedInterest = Array.isArray(item.interests)
    ? item.interests.find((interest) => selectedInterests.includes(interest))
    : null;

  return (
    <article className="group overflow-hidden rounded-[30px] border border-[#f0dfd6] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/4.3] overflow-hidden bg-[#f5ebe4]">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#f4ddd1] via-[#edd4c6] to-[#d9b39c]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(34,22,17,0.46)] via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[rgba(255,247,241,0.95)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7e5d4c]">
            {item.retailer}
          </span>

          {item.is_featured ? (
            <span className="rounded-full bg-[#fff1ea] px-3 py-1 text-[11px] font-semibold text-[#df7b59]">
              Featured
            </span>
          ) : null}

          {matchedInterest ? (
            <span className="rounded-full bg-[#2f3b2d] px-3 py-1 text-[11px] font-semibold text-white">
              Matches {matchedInterest}
            </span>
          ) : null}
        </div>

        {priceLabel ? (
          <div className="absolute bottom-4 left-4">
            <span className="rounded-full bg-[rgba(255,250,247,0.95)] px-3 py-2 text-sm font-semibold text-[#2d1c15]">
              {priceLabel}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Shop pick
          </p>
          <p className="text-xs text-slate-500">
            {resolvePriceBucket(item.numeric_price)}
          </p>
        </div>

        <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
          {item.title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          {item.description || "A curated gift pick from the shop, ready to save to hints or open with the retailer."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {Array.isArray(item.interests) && item.interests.length
            ? item.interests.slice(0, 3).map((interest) => (
                <span
                  key={`${item.id}-${interest}`}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    selectedInterests.includes(interest)
                      ? "bg-[#fff1ea] text-[#df7b59]"
                      : "bg-[#f6f1ed] text-slate-600"
                  }`}
                >
                  {interest}
                </span>
              ))
            : (
              <span className="rounded-full bg-[#f6f1ed] px-3 py-1 text-[11px] font-semibold text-slate-600">
                General gift
              </span>
            )}

          {Array.isArray(item.occasion_tags) && item.occasion_tags[0] ? (
            <span className="rounded-full bg-[#f3f6fb] px-3 py-1 text-[11px] font-semibold text-slate-600">
              {item.occasion_tags[0]}
            </span>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onAddToHints(item)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#efcabc] bg-[#fff4ee] px-4 text-sm font-semibold text-[#c96f4f] hover:bg-[#ffece2]"
          >
            Add to hints
          </button>

          <a
            href={resolveOutgoingUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg"
          >
            View item
          </a>
        </div>
      </div>
    </article>
  );
}

function AddToHintsModal({ open, item, onClose, onSave, isSaving }) {
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState("Public");

  useEffect(() => {
    if (!open) {
      setNote("");
      setVisibility("Public");
    }
  }, [open]);

  if (!open || !item) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      eyebrow="Add to hints"
      title="Save this to your board"
      maxWidth="max-w-[920px]"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <a
            href={resolveOutgoingUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-[#fff5f0]"
          >
            View item
          </a>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onSave({ item, note, visibility })}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#ee8d69] bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Add to hints"}
          </button>
        </div>
      }
    >
      <div className="grid gap-0 md:grid-cols-[0.94fr_1.06fr]">
        <div className="relative min-h-[340px] bg-[#f5ebe4]">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#eed8ce] via-[#e7cbbd] to-[#d6aa91]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,18,14,0.62)] via-transparent to-transparent" />

          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-[rgba(255,247,241,0.96)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f5b48]">
              {item.retailer}
            </span>

            {(item.price_text || item.numeric_price != null) ? (
              <span className="rounded-full bg-[rgba(255,247,241,0.96)] px-3 py-1 text-[11px] font-semibold text-[#7f5b48]">
                {item.price_text || formatMoney(item.numeric_price, item.currency || "GBP")}
              </span>
            ) : null}
          </div>

          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#ffe8de]">
              From shop
            </p>
            <h3 className="mt-2 text-[30px] font-semibold leading-[1.04] tracking-[-0.04em] text-white">
              {item.title}
            </h3>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b18c7c]">
            Review before saving
          </p>
          <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-900">
            Place this on your hints board.
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            Save it now and keep browsing. This uses the same hints flow and keeps the item ready for later planning.
          </p>

          <div className="mt-6 rounded-[24px] border border-[#eedfd6] bg-[#fffdfa] p-4">
            <div className="flex flex-wrap gap-2">
              {Array.isArray(item.interests) && item.interests.length
                ? item.interests.map((interest) => (
                    <span
                      key={`${item.id}-modal-${interest}`}
                      className="rounded-full bg-[#fff1ea] px-3 py-1 text-[11px] font-semibold text-[#df7b59]"
                    >
                      {interest}
                    </span>
                  ))
                : null}
            </div>

            {item.description ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for your future self, your hints board, or a circle."
                className="min-h-[120px] w-full rounded-[22px] border border-[#eadcd3] bg-[#fcfaf8] px-5 py-4 text-[15px] text-slate-700 outline-none focus:ring-2 focus:ring-[#f19a7850]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="h-12 w-full rounded-[18px] border border-[#eadcd3] bg-[#fcfaf8] px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#f19a7850]"
              >
                <option>Public</option>
                <option>Private</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="rounded-[30px] border border-dashed border-[#e5d8cf] bg-[#fffdfa] p-8 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Shop
      </p>
      <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-[48ch] text-sm leading-7 text-slate-500">
        {body}
      </p>
    </div>
  );
}

export default function ShopPage() {
  const supabase = createClient();

  const [sessionUser, setSessionUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [savedCount, setSavedCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingHint, setIsSavingHint] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("All occasions");
  const [selectedPrice, setSelectedPrice] = useState("All prices");

  const [userInterestDefaults] = useState(DEFAULT_USER_INTERESTS);
  const [selectedInterests, setSelectedInterests] = useState(DEFAULT_USER_INTERESTS);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        setIsLoading(true);
        setPageError("");
        setSuccessMessage("");

        const [{ data: authData, error: authError }, productsResult] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("shop_products")
            .select("*")
            .eq("is_active", true)
            .order("is_featured", { ascending: false })
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false }),
        ]);

        if (authError) {
          throw new Error(normaliseError(authError, "Failed to get logged-in user."));
        }

        if (productsResult.error) {
          throw new Error(normaliseError(productsResult.error, "Failed to load shop products."));
        }

        if (!active) return;

        setSessionUser(authData?.user || null);
        setProducts(Array.isArray(productsResult.data) ? productsResult.data : []);

        if (authData?.user?.id) {
          const { count } = await supabase
            .from("hints")
            .select("id", { count: "exact", head: true })
            .eq("userid", authData.user.id);

          if (active) setSavedCount(count || 0);
        }
      } catch (error) {
        if (!active) return;
        setPageError(error?.message || "Failed to load the Shop page.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [supabase]);

  const availableInterests = useMemo(() => {
    const fromProducts = extractInterestsFromProducts(products);
    const merged = new Set([...userInterestDefaults, ...fromProducts]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [products, userInterestDefaults]);

  const highlightedCount = useMemo(() => {
    return selectedInterests.filter((interest) => userInterestDefaults.includes(interest)).length;
  }, [selectedInterests, userInterestDefaults]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const searchHaystack = [
        item.title,
        item.description,
        item.retailer,
        ...(Array.isArray(item.interests) ? item.interests : []),
        ...(Array.isArray(item.occasion_tags) ? item.occasion_tags : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm.trim() || searchHaystack.includes(searchTerm.trim().toLowerCase());

      const matchesOccasion =
        selectedOccasion === "All occasions" ||
        (Array.isArray(item.occasion_tags) &&
          item.occasion_tags.some(
            (tag) => String(tag).toLowerCase() === selectedOccasion.toLowerCase()
          ));

      const matchesPrice =
        selectedPrice === "All prices" ||
        resolvePriceBucket(item.numeric_price) === selectedPrice;

      const matchesInterests =
        selectedInterests.length === 0 ||
        (Array.isArray(item.interests) &&
          item.interests.some((interest) => selectedInterests.includes(interest)));

      return matchesSearch && matchesOccasion && matchesPrice && matchesInterests;
    });
  }, [products, searchTerm, selectedOccasion, selectedPrice, selectedInterests]);

  function toggleInterest(interest) {
    setSuccessMessage("");
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((value) => value !== interest)
        : [...current, interest]
    );
  }

  function turnOnYourInterests() {
    setSelectedInterests((current) => {
      const merged = new Set([...current, ...userInterestDefaults]);
      return Array.from(merged);
    });
  }

  function turnOffYourInterests() {
    setSelectedInterests((current) =>
      current.filter((interest) => !userInterestDefaults.includes(interest))
    );
  }

  async function handleSaveToHints({ item, note, visibility }) {
    if (!sessionUser?.id) {
      setPageError("You must be signed in to add products to hints.");
      return;
    }

    try {
      setIsSavingHint(true);
      setPageError("");
      setSuccessMessage("");

      const payload = buildHintPayload(item, visibility, note);

      const { error } = await supabase.from("hints").insert({
        userid: sessionUser.id,
        title: payload.title,
        url: payload.url,
        imageurl: payload.imageurl,
        retailer: payload.retailer,
        pricetext: payload.pricetext,
        numericprice: payload.numericprice,
        isprivate: payload.isprivate,
        starred: payload.starred,
        source: payload.source,
        note: payload.note,
        position: 0,
      });

      if (error) {
        throw new Error(normaliseError(error, "Failed to save this item to hints."));
      }

      setSavedCount((current) => current + 1);
      setSelectedProduct(null);
      setSuccessMessage("Saved to hints.");
    } catch (error) {
      setPageError(error?.message || "Failed to save this item to hints.");
    } finally {
      setIsSavingHint(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-800">
      <AddToHintsModal
        open={Boolean(selectedProduct)}
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSave={handleSaveToHints}
        isSaving={isSavingHint}
      />

      <header className="border-b border-[#efe0d7] bg-[#fffaf795] backdrop-blur">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-4 md:px-8">
          <Link href="/feed" className="flex items-center gap-3.5">
            <LogoMark />
            <div className="text-[22px] font-extrabold tracking-[-0.05em] text-slate-900">
              Hinted<span className="text-[#f36f64]">.io</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/feed"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-[14px] font-semibold text-slate-700 hover:bg-[#fff5f0] sm:px-5"
              >
                Feed
              </Link>
              <Link
                href="/hints"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-[14px] font-semibold text-slate-700 hover:bg-[#fff5f0] sm:px-5"
              >
                Hints
              </Link>
              <Link
                href="/circles"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-[14px] font-semibold text-slate-700 hover:bg-[#fff5f0] sm:px-5"
              >
                Circles
              </Link>
              <Link
                href="/shop"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#3c4d39] bg-[#2f3b2d] px-4 text-[14px] font-semibold text-white sm:px-5"
              >
                Shop
              </Link>
            </nav>

            <AvatarMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1380px] px-5 py-8 md:px-8">
        {pageError ? (
          <div className="mb-5 rounded-[22px] border border-[#efc0ba] bg-[#fff4f2] px-4 py-3 text-sm text-[#b14f43]">
            {pageError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-5 rounded-[22px] border border-[#d8e8d3] bg-[#f3fbf1] px-4 py-3 text-sm text-[#4a7a3a]">
            {successMessage}
          </div>
        ) : null}

        <section className="rounded-[34px] border border-[#eeddd3] bg-[#fff7f2] p-4 shadow-[0_18px_60px_rgba(173,101,72,0.10)] sm:p-5">
          <div className="rounded-[28px] border border-[#f1dfd6] bg-white p-5 sm:p-6">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="inline-flex rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e37b57]">
                  Curated gifting
                </div>

                <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.06em] text-slate-900 sm:text-[40px]">
                  Shop by interests, then save the best finds to hints.
                </h1>

                <p className="mt-3 max-w-[760px] text-[15px] leading-7 text-slate-600">
                  The shop starts by highlighting your interests, but every category stays available. Turn your own interests off, bring them back on, or mix in other categories as you browse for different people and occasions.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-[#eedfd6] bg-[#fffdfa] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Your interests
                  </p>
                  <p className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-slate-900">
                    {highlightedCount}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Highlighted now from your default shop mix.
                  </p>
                </div>

                <div className="rounded-[24px] border border-[#eedfd6] bg-[#fffdfa] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Saved to hints
                  </p>
                  <p className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-slate-900">
                    {savedCount}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Shop items already added to your board.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] border border-[#eedfd6] bg-[#fffaf7] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Interest tiles
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your interests are highlighted by default, but every category can be switched on or off.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={turnOnYourInterests}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-[#fff5f0]"
                  >
                    Turn yours on
                  </button>
                  <button
                    type="button"
                    onClick={turnOffYourInterests}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[#efc0ba] bg-[#fff4f2] px-4 text-sm font-semibold text-[#b14f43] hover:bg-[#ffe9e5]"
                  >
                    Turn yours off
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {availableInterests.map((interest) => (
                  <InterestTile
                    key={interest}
                    label={interest}
                    active={selectedInterests.includes(interest)}
                    isSuggested={userInterestDefaults.includes(interest)}
                    onClick={() => toggleInterest(interest)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_220px_220px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search gifts, retailers, interests, or occasions"
                className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
              />

              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
              >
                {OCCASION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
              >
                {PRICE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Results
              </p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-slate-900">
                A curated board of gifts for hints, circles, and easy checkout.
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[30px] border border-[#f0dfd6] bg-white"
                >
                  <div className="aspect-[4/4.3] animate-pulse bg-[#f4ece6]" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-24 animate-pulse rounded bg-[#f1e7e0]" />
                    <div className="h-7 w-3/4 animate-pulse rounded bg-[#f1e7e0]" />
                    <div className="h-4 w-full animate-pulse rounded bg-[#f5ede7]" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-[#f5ede7]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="Nothing matches that mix yet."
              body="Try turning one of your highlighted interests back on, broadening the price range, or switching the occasion filter."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((item) => (
                <ShopCard
                  key={item.id}
                  item={item}
                  selectedInterests={selectedInterests}
                  onAddToHints={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
