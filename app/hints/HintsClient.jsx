"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  MeasuringStrategy,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "../../lib/supabase/client";
import AvatarMenu from "../components/AvatarMenu";

const ACTIVE_CURRENCY = "GBP";
const PREVIEW_TIMEOUT_MS = 18000;
const CARD_MAX_HEIGHT = "min(540px, 68vh)";

const PREVIEW_NOTICE_BLOCKED =
  "This shop didn’t give us a usable preview, so you’ll need to add the details yourself.";

const PREVIEW_NOTICE_TIMEOUT =
  "This took too long to load, so you can carry on by adding the details manually.";

const PREVIEW_NOTICE_PARTIAL =
  "We found part of the information, but some details still need checking.";

const PREVIEW_NOTICE_INVALID =
  "Paste a valid product or retailer link to start.";

const EMPTY_NEW_HINT_FORM = {
  title: "",
  url: "",
  retailer: "",
  image: "",
  uploadedImage: null,
  priceInput: "",
  private: false,
  starred: false,
  needsReview: false,
  source: "preview",
};

const EMPTY_EDIT_FORM = {
  title: "",
  url: "",
  retailer: "",
  image: "",
  uploadedImage: null,
  priceInput: "",
};

const demoHints = [
  {
    id: "demo-1",
    title: "Weekend cabin",
    retailer: "airbnb.co.uk",
    priceLabel: "From £320",
    numericPrice: 320,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    fallbackGradient: "from-[#d9dfcf] via-[#b9c7aa] to-[#90a27e]",
    starred: true,
    private: false,
    url: "https://www.airbnb.co.uk/",
    position: 0,
    needsReview: false,
  },
  {
    id: "demo-2",
    title: "Sony headphones",
    retailer: "amazon.co.uk",
    priceLabel: "About £249",
    numericPrice: 249,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    fallbackGradient: "from-[#ead8ca] via-[#dbc0a8] to-[#c4a17f]",
    starred: false,
    private: false,
    url: "https://www.amazon.co.uk/",
    position: 1,
    needsReview: false,
  },
  {
    id: "demo-3",
    title: "Silk pillowcases",
    retailer: "johnlewis.com",
    priceLabel: "About £45",
    numericPrice: 45,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    fallbackGradient: "from-[#efe5de] via-[#e5d2c8] to-[#d1b2a4]",
    starred: false,
    private: true,
    url: "https://www.johnlewis.com/",
    position: 2,
    needsReview: false,
  },
  {
    id: "demo-4",
    title: "Hotel voucher",
    retailer: "booking.com",
    priceLabel: "From £1290",
    numericPrice: 1290,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    fallbackGradient: "from-[#d5dbee] via-[#b3c0df] to-[#8f9fc9]",
    starred: true,
    private: false,
    url: "https://www.booking.com/",
    position: 3,
    needsReview: false,
  },
];

function LogoMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#efc4b2] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-white shadow-lg">
      <span className="text-lg">🎁</span>
    </div>
  );
}

function BusyOverlay({ open, title, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(33,24,20,0.32)] px-4 backdrop-blur-sm">
      <div className="w-full max-w-[420px] rounded-[28px] border border-[#efdcd2] bg-white px-6 py-6 shadow-[0_28px_80px_rgba(75,45,30,0.18)]">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1e9]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#f1c4b2] border-t-[#f36f64]" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function errorToMessage(value) {
  if (!value) return "Something went wrong.";
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message || "Something went wrong.";

  if (typeof value === "object") {
    if (typeof value.message === "string" && value.message.trim()) return value.message;
    if (typeof value.error === "string" && value.error.trim()) return value.error;
    try {
      return JSON.stringify(value);
    } catch {
      return "Something went wrong.";
    }
  }

  return String(value);
}

function normaliseRetailer(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Saved link";
  }
}

function isValidHttpUrl(value = "") {
  try {
    const withProtocol =
      value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
    const parsed = new URL(withProtocol);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function normaliseInputUrl(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
}

function detectCurrency(raw = "") {
  const text = String(raw || "").trim();
  if (!text) return null;
  if (text.includes("£")) return "GBP";
  if (text.includes("$") && !text.includes("A$") && !text.includes("C$") && !text.includes("NZ$"))
    return "USD";
  if (text.includes("€")) return "EUR";
  if (/\bR\s?\d/i.test(text) || /\bZAR\b/i.test(text)) return "ZAR";
  return null;
}

function extractNumericPrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "string") return null;

  const cleaned = value.replace(/,/g, "");
  const match =
    cleaned.match(/(?:£|\$|€)\s?(\d+(?:\.\d{1,2})?)/) ||
    cleaned.match(/\bR\s?(\d+(?:\.\d{1,2})?)/i) ||
    cleaned.match(/(\d+(?:\.\d{1,2})?)/);

  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPriceLabel(price, rawPrice, currency = ACTIVE_CURRENCY) {
  if (currency !== ACTIVE_CURRENCY) return "Price unavailable";
  if (rawPrice && typeof rawPrice === "string" && detectCurrency(rawPrice) === ACTIVE_CURRENCY) {
    return rawPrice;
  }
  if (price == null) return "Price unavailable";
  if (currency === "GBP") return `About £${Math.round(price)}`;
  return `About ${Math.round(price)}`;
}

function sanitisePrice(rawPrice, numericPrice) {
  const detectedCurrency = detectCurrency(rawPrice) || ACTIVE_CURRENCY;
  if (detectedCurrency !== ACTIVE_CURRENCY) {
    return { numericPrice: null, priceLabel: "Price unavailable" };
  }
  return {
    numericPrice,
    priceLabel: formatPriceLabel(numericPrice, rawPrice, ACTIVE_CURRENCY),
  };
}

function buildFallbackGradient(index) {
  const gradients = [
    "from-[#ead8ca] via-[#dbc0a8] to-[#c4a17f]",
    "from-[#d9dfcf] via-[#b9c7aa] to-[#90a27e]",
    "from-[#f3d5cc] via-[#e9b39f] to-[#d98c76]",
    "from-[#d5dbee] via-[#b3c0df] to-[#8f9fc9]",
    "from-[#eadce8] via-[#d8bfd1] to-[#bb9ab6]",
    "from-[#d6e7eb] via-[#b5ced7] to-[#8fb3c5]",
  ];
  return gradients[index % gradients.length];
}

function shortenTitle(title = "", retailer = "") {
  const source = String(title || "").trim();
  if (!source) return "Saved hint";

  const cleanRetailer = String(retailer || "")
    .replace(/^www\./i, "")
    .replace(/\.(co\.uk|com|co|net|org)$/i, "")
    .trim()
    .toLowerCase();

  const stopWords = new Set([
    "the",
    "and",
    "with",
    "for",
    "from",
    "new",
    "latest",
    "edition",
    "model",
    "official",
    "amazon",
    "uk",
    "black",
    "white",
    "silver",
    "blue",
    "green",
    "pink",
    "grey",
    "gray",
    "wireless",
    "bluetooth",
  ]);

  let cleaned = source
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/[|:;,/]/g, " ")
    .replace(/\b[A-Z0-9-]{6,}\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let words = cleaned.split(" ").filter(Boolean);
  words = words.filter((word) => {
    const lower = word.toLowerCase();
    if (stopWords.has(lower)) return false;
    if (lower === cleanRetailer) return false;
    if (/^\d+$/.test(lower)) return false;
    return true;
  });

  if (!words.length) return "Saved hint";
  const result = words.slice(0, 2).join(" ").trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function splitIntoColumns(items, columnCount = 3) {
  const columns = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

function loadImageAspectRatio(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        resolve(img.naturalWidth / img.naturalHeight);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fallbackCardRatio(hint) {
  if (hint?.image) return 0.82;
  return 1;
}

function getCardAspectRatio(hint, imageRatios) {
  const imageRatio = imageRatios[hint.id];
  if (imageRatio && Number.isFinite(imageRatio)) {
    return imageRatio;
  }
  return fallbackCardRatio(hint);
}

function buildDraftFromPreview(data, rawUrl) {
  const extractedNumericPrice =
    typeof data?.numericPrice === "number" ? data.numericPrice : extractNumericPrice(data?.priceText);
  const priceMeta = sanitisePrice(data?.priceText, extractedNumericPrice);
  const retailer = data?.siteName || normaliseRetailer(rawUrl);
  const title = shortenTitle(data?.title || "Saved hint", retailer);
  const image = typeof data?.image === "string" && data.image.startsWith("http") ? data.image : "";
  const finalUrl = data?.url || normaliseInputUrl(rawUrl);
  const needsReview = Boolean(data?.needsReview) || !image || !title || !priceMeta.numericPrice;

  return {
    title,
    retailer,
    image,
    uploadedImage: null,
    url: finalUrl,
    priceInput: priceMeta.numericPrice != null ? String(priceMeta.numericPrice) : "",
    priceLabel: priceMeta.priceLabel,
    numericPrice: priceMeta.numericPrice,
    starred: false,
    private: false,
    needsReview,
    source: data?.source || "preview",
  };
}

function buildManualDraft(rawUrl) {
  const normalisedUrl = normaliseInputUrl(rawUrl);
  const retailer = normaliseRetailer(normalisedUrl);

  return {
    title: "",
    retailer,
    image: "",
    uploadedImage: null,
    url: normalisedUrl,
    priceInput: "",
    priceLabel: "Price unavailable",
    numericPrice: null,
    starred: false,
    private: false,
    needsReview: true,
    source: "manual-timeout",
  };
}

function createPreviewTimeoutError() {
  const error = new Error("PREVIEW_TIMEOUT");
  error.code = "PREVIEW_TIMEOUT";
  return error;
}

async function fetchPreviewWithTimeout(url, timeoutMs = PREVIEW_TIMEOUT_MS) {
  const controller = new AbortController();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch("/api/link-preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url, currency: ACTIVE_CURRENCY }),
      signal: controller.signal,
    });

    const raw = await response.text();
    let data = null;

    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      throw new Error(raw || "The preview service returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          (typeof data === "string" ? data : "Could not fetch this link preview.")
      );
    }

    return data;
  } catch (err) {
    if (err?.name === "AbortError") {
      throw createPreviewTimeoutError();
    }
    throw err;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function ModalShell({ isOpen, onClose, eyebrow, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(33,24,20,0.42)] px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-6">
      <div className="flex min-h-full items-start justify-center">
        <div className="flex w-full max-w-[620px] flex-col overflow-hidden rounded-[30px] border border-[#efdcd2] bg-white shadow-[0_28px_80px_rgba(75,45,30,0.18)] max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]">
          <div className="shrink-0 border-b border-[#f2e5de] bg-white px-6 py-5 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#e08a67]">
                  {eyebrow}
                </p>
                <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-slate-900">
                  {title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#efe0d7] text-slate-500 hover:bg-[#faf6f3]"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-7">{children}</div>

          <div className="shrink-0 border-t border-[#f2e5de] bg-white px-6 py-4 sm:px-7">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldHint({ id, children, tone = "muted" }) {
  const toneClass =
    tone === "error" ? "text-[#c46545]" : tone === "warning" ? "text-[#9b553d]" : "text-slate-500";

  return (
    <p id={id} className={`mt-2 text-sm ${toneClass}`}>
      {children}
    </p>
  );
}

function HintFormFields({
  form,
  setForm,
  prefix = "new",
  showToggles = true,
  imageHelpText = "No image yet. Upload one here if you want to add a photo.",
}) {
  const previewImage = form.uploadedImage || form.image;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${prefix}-link`} className="mb-2 block text-sm font-medium text-slate-700">
          Link
        </label>
        <input
          id={`${prefix}-link`}
          aria-describedby={`${prefix}-link-help`}
          type="url"
          value={form.url}
          onChange={(e) => setForm((current) => ({ ...current, url: e.target.value }))}
          placeholder="Paste the store or product link"
          className="h-14 w-full rounded-[18px] border border-[#eadcd3] bg-[#fcfaf8] px-5 text-[15px] text-slate-700 outline-none focus:ring-2 focus:ring-[#f19a78]/50"
        />
        <FieldHint id={`${prefix}-link-help`}>
          Add the original retailer link so this card still opens to the right page.
        </FieldHint>
      </div>

      <div>
        <label htmlFor={`${prefix}-title`} className="mb-2 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id={`${prefix}-title`}
          aria-describedby={`${prefix}-title-help`}
          type="text"
          value={form.title}
          onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
          placeholder="Give this hint a clear name"
          className="h-14 w-full rounded-[18px] border border-[#eadcd3] bg-[#fcfaf8] px-5 text-[15px] text-slate-700 outline-none focus:ring-2 focus:ring-[#f19a78]/50"
        />
        <FieldHint id={`${prefix}-title-help`}>
          Use the short name you want people to see on the card.
        </FieldHint>
      </div>

      <div>
        <label htmlFor={`${prefix}-price`} className="mb-2 block text-sm font-medium text-slate-700">
          Price (optional)
        </label>
        <input
          id={`${prefix}-price`}
          aria-describedby={`${prefix}-price-help`}
          type="text"
          value={form.priceInput}
          onChange={(e) => setForm((current) => ({ ...current, priceInput: e.target.value }))}
          placeholder="Leave blank if you don’t want to add a price"
          className="h-14 w-full rounded-[18px] border border-[#eadcd3] bg-[#fcfaf8] px-5 text-[15px] text-slate-700 outline-none focus:ring-2 focus:ring-[#f19a78]/50"
        />
        <FieldHint id={`${prefix}-price-help`}>
          Add a price only if you want it shown on the card.
        </FieldHint>
      </div>

      <div>
        <label htmlFor={`${prefix}-image`} className="mb-2 block text-sm font-medium text-slate-700">
          Photo (optional)
        </label>
        <input
          id={`${prefix}-image`}
          aria-describedby={`${prefix}-image-help`}
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const imageUrl = await fileToDataUrl(file);
            setForm((current) => ({ ...current, uploadedImage: imageUrl }));
          }}
          className="block w-full rounded-[18px] border border-dashed border-[#eadcd3] bg-[#fcfaf8] px-4 py-4 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#fff1e9] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#df7c59]"
        />
        <FieldHint id={`${prefix}-image-help`}>{imageHelpText}</FieldHint>

        {previewImage ? (
          <div className="mt-3 overflow-hidden rounded-[20px] border border-[#efe0d7] bg-[#faf6f3]">
            <img
              src={previewImage}
              alt={form.title || "Selected hint image"}
              className="max-h-[320px] w-full object-cover"
            />
          </div>
        ) : (
          <div className="mt-3 rounded-[20px] border border-dashed border-[#efe0d7] bg-[#faf6f3] px-4 py-8 text-center text-sm text-slate-500">
            No image yet. Upload one if you want to add a photo now.
          </div>
        )}
      </div>

      {showToggles ? (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setForm((current) => ({ ...current, starred: !current.starred }))}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              form.starred
                ? "border-[#ffd8c9] bg-[#fff2ea] text-[#e27956]"
                : "border-[#efe0d7] bg-[#f7f2ee] text-slate-700 hover:bg-[#f1ebe6]"
            }`}
          >
            {form.starred ? "★ Starred" : "★ Star"}
          </button>

          <button
            type="button"
            onClick={() => setForm((current) => ({ ...current, private: !current.private }))}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              form.private
                ? "border-[#ffd8c9] bg-[#fffaf7] text-[#e08a67]"
                : "border-[#efe0d7] bg-[#f7f2ee] text-slate-700 hover:bg-[#f1ebe6]"
            }`}
          >
            {form.private ? "🔒 Private" : "🔓 Public"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AddHintModal({
  isOpen,
  form,
  setForm,
  onClose,
  onSubmit,
  isSaving,
  notice,
  previewState,
}) {
  const modalState =
    previewState === "success"
      ? {
          eyebrow: "New hint",
          title: "Review before saving",
          helper: "We found some details from the link. Check everything before you save.",
          primaryCta: "Save hint",
        }
      : previewState === "partial"
        ? {
            eyebrow: "New hint",
            title: "Check details before saving",
            helper:
              "We found part of the information, but some details still need your input.",
            primaryCta: "Save hint",
          }
        : {
            eyebrow: "New hint",
            title: "Add details manually",
            helper:
              "We couldn’t pull everything from this shop, so add the name, photo, and price yourself.",
            primaryCta: "Save hint",
          };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={modalState.eyebrow}
      title={modalState.title}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSaving}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#ee8d69] bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg disabled:opacity-70"
          >
            {isSaving ? "Saving..." : modalState.primaryCta}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {notice ? (
          <div className="rounded-[22px] border border-[#f4cdbd] bg-[#fff6f1] p-4 text-sm text-[#9b553d]">
            {notice}
          </div>
        ) : null}

        <p className="text-sm text-slate-500">{modalState.helper}</p>

        <HintFormFields
          form={form}
          setForm={setForm}
          prefix="new"
          showToggles
          imageHelpText="No image yet. Upload one if you want to add a photo now."
        />
      </div>
    </ModalShell>
  );
}

function EditHintModal({
  isOpen,
  editForm,
  setEditForm,
  onClose,
  onSave,
  onRefreshFromLink,
  onDelete,
  isRefreshing,
  isSaving,
  hint,
}) {
  return (
    <ModalShell
      isOpen={isOpen && !!hint}
      onClose={onClose}
      eyebrow="Edit hint"
      title="Update this card"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#f1c9bb] bg-[#fff4ef] px-5 text-sm font-semibold text-[#d56949] hover:bg-[#ffe9df]"
          >
            Delete hint
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRefreshFromLink}
              disabled={isRefreshing}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#efe0d7] bg-[#f7f2ee] px-5 text-sm font-semibold text-slate-700 hover:bg-[#f1ebe6] disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh from link"}
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#ee8d69] bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      }
    >
      <HintFormFields
        form={editForm}
        setForm={setEditForm}
        prefix="edit"
        showToggles={false}
        imageHelpText="No image yet. Add or replace a photo here if you want."
      />
    </ModalShell>
  );
}

function HintCard({
  hint,
  imageRatios,
  onEdit,
  onToggleStarred,
  onTogglePrivate,
  isDragging,
  dragHandleListeners,
  dragHandleAttributes,
}) {
  const ratio = getCardAspectRatio(hint, imageRatios);

  return (
    <article
      className={`group relative w-full overflow-hidden rounded-[30px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.60)] transition-all duration-300 ${
        isDragging ? "scale-[1.02]" : "hover:-translate-y-1"
      }`}
      style={{
        aspectRatio: `${ratio}`,
        maxHeight: CARD_MAX_HEIGHT,
        boxShadow: isDragging
          ? "0 26px 70px rgba(113,74,49,0.22), inset 0 1px 0 rgba(255,255,255,0.24)"
          : "0 10px 30px rgba(176,118,86,0.10), inset 0 1px 0 rgba(255,255,255,0.24)",
      }}
    >
      <div className="absolute inset-0">
        {hint.image ? (
          <>
            <img
              src={hint.image}
              alt={hint.title}
              className={`h-full w-full object-cover transition-transform duration-500 ${
                isDragging ? "scale-[1.01]" : "group-hover:scale-[1.03]"
              } ${hint.private ? "opacity-84" : ""}`}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(16,12,10,0.84)_0%,rgba(16,12,10,0.42)_26%,rgba(16,12,10,0.10)_50%,rgba(255,255,255,0)_72%)]" />
          </>
        ) : (
          <>
            <div
              className={`absolute inset-0 bg-gradient-to-br ${hint.fallbackGradient} ${
                hint.private ? "opacity-80" : ""
              }`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(22,18,16,0.72)] via-[rgba(22,18,16,0.18)] to-transparent" />
          </>
        )}
      </div>

      <div className="absolute left-4 right-4 top-4 z-30 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="pointer-events-auto flex min-h-[40px] cursor-grab items-center gap-1 rounded-full border border-white/45 bg-white/72 px-3 py-2 text-[11px] font-semibold text-slate-700 backdrop-blur-md active:cursor-grabbing"
            {...dragHandleAttributes}
            {...dragHandleListeners}
          >
            ⋮⋮ Drag
          </button>

          {hint.starred && (
            <div className="rounded-full border border-[#ffd8c9] bg-[#fff2ea] px-3 py-1 text-[11px] font-semibold text-[#e27956]">
              Top pick
            </div>
          )}

          {hint.private && (
            <div className="rounded-full border border-white/45 bg-white/72 px-3 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-md">
              Private
            </div>
          )}

          {hint.needsReview && (
            <div className="rounded-full border border-[#f6d2c2] bg-[#fff6f1] px-3 py-1 text-[11px] font-semibold text-[#c46545]">
              Needs review
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(hint)}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/72 text-[15px] text-slate-500 backdrop-blur-md hover:text-slate-800"
            aria-label="Edit hint"
          >
            ✎
          </button>

          <button
            onClick={() => onToggleStarred(hint)}
            className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/72 text-[16px] backdrop-blur-md ${
              hint.starred ? "text-[#f36f64]" : "text-slate-400 hover:text-[#f36f64]"
            }`}
            aria-label={hint.starred ? "Unhighlight hint" : "Highlight hint"}
            type="button"
          >
            ★
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#ffd8c9] bg-[#fff1e9] px-2.5 py-1 text-[11px] font-semibold text-[#df7c59]">
            {hint.priceLabel}
          </span>
        </div>

        <h2
          className="mt-3 overflow-hidden text-[22px] font-semibold tracking-[-0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.24)]"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            lineClamp: 2,
          }}
        >
          {hint.title}
        </h2>

        <p className="mt-1 truncate text-[13px] text-white/78">{hint.retailer}</p>

        <div className="pointer-events-auto mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onTogglePrivate(hint)}
            className="rounded-full border border-white/45 bg-white/76 px-3 py-1.5 text-[12px] font-medium text-slate-700 backdrop-blur-md hover:bg-white"
          >
            {hint.private ? "🔒 Private" : "🔓 Public"}
          </button>

          <a
            href={hint.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/45 bg-white/76 px-3 py-1.5 text-[12px] font-medium text-slate-700 backdrop-blur-md hover:bg-white"
          >
            Open
          </a>
        </div>
      </div>
    </article>
  );
}

function SortableHintCard({ hint, imageRatios, onEdit, onToggleStarred, onTogglePrivate }) {
  const animateLayoutChanges = (args) => {
    if (args.isSorting || args.wasDragging) return defaultAnimateLayoutChanges(args);
    return true;
  };

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: hint.id,
    animateLayoutChanges,
    transition: {
      duration: 240,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-6 break-inside-avoid">
      <HintCard
        hint={hint}
        imageRatios={imageRatios}
        onEdit={onEdit}
        onToggleStarred={onToggleStarred}
        onTogglePrivate={onTogglePrivate}
        isDragging={isDragging}
        dragHandleAttributes={attributes}
        dragHandleListeners={listeners}
      />
    </div>
  );
}

export default function HintsClient() {
  const [hints, setHints] = useState([]);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [editingHintId, setEditingHintId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [isRefreshingEdit, setIsRefreshingEdit] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [imageRatios, setImageRatios] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingNewHint, setIsSubmittingNewHint] = useState(false);
  const [pendingHint, setPendingHint] = useState(null);
  const [newHintForm, setNewHintForm] = useState(EMPTY_NEW_HINT_FORM);
  const [addModalNotice, setAddModalNotice] = useState("");
  const [previewState, setPreviewState] = useState("success");
  const [busyState, setBusyState] = useState({ open: false, title: "", message: "" });
  const busyLongTimerRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const measuring = {
    droppable: { strategy: MeasuringStrategy.Always },
  };

  function clearBusyTimers() {
    if (busyLongTimerRef.current) {
      window.clearTimeout(busyLongTimerRef.current);
      busyLongTimerRef.current = null;
    }
  }

  function closeBusy() {
    clearBusyTimers();
    setBusyState({ open: false, title: "", message: "" });
  }

  function beginFetchBusy() {
    clearBusyTimers();

    setBusyState({
      open: true,
      title: "Fetching your item...",
      message: "Pulling the title, image, and price from the link...",
    });

    busyLongTimerRef.current = window.setTimeout(() => {
      setBusyState((current) =>
        current.open
          ? {
              ...current,
              title: "Still fetching...",
              message:
                "This is taking a little longer than expected. You’ll be able to fill in the details yourself if the shop doesn’t respond.",
            }
          : current
      );
    }, 5000);
  }

  function beginSaveBusy() {
    clearBusyTimers();
    setBusyState({
      open: true,
      title: "Saving hint",
      message: "Adding this card to your board...",
    });
  }

  function beginEditSaveBusy() {
    clearBusyTimers();
    setBusyState({
      open: true,
      title: "Saving changes",
      message: "Updating this hint...",
    });
  }

  useEffect(() => {
    return () => clearBusyTimers();
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function loadSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user || null);
    }

    loadSession();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setHints([]);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    async function loadHints() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("hints")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        setError(errorToMessage(error));
        setHints([]);
        setIsLoading(false);
        return;
      }

      setHints(
        (data || []).map((row, index) => ({
          id: row.id,
          title: row.title || "Saved hint",
          retailer: row.retailer || normaliseRetailer(row.url || ""),
          priceLabel: row.price_text || formatPriceLabel(row.numeric_price, null, ACTIVE_CURRENCY),
          numericPrice: row.numeric_price,
          image: row.image_url || "",
          fallbackGradient: buildFallbackGradient(index),
          starred: Boolean(row.starred),
          private: Boolean(row.is_private),
          url: row.url || "",
          position: row.position ?? index,
          needsReview: Boolean(row.needs_review),
        }))
      );

      setIsLoading(false);
    }

    loadHints();
  }, [currentUser]);

  const visibleHints = hints.length > 0 ? hints : demoHints;
  const activeHint = visibleHints.find((hint) => hint.id === activeId) || null;
  const editingHint = hints.find((hint) => hint.id === editingHintId) || null;
  const columns = useMemo(() => splitIntoColumns(visibleHints, 3), [visibleHints]);

  useEffect(() => {
    let cancelled = false;

    async function measureRatios() {
      const itemsWithImages = visibleHints.filter((hint) => hint.image && !imageRatios[hint.id]);
      if (!itemsWithImages.length) return;

      const nextEntries = await Promise.all(
        itemsWithImages.map(async (hint) => {
          const ratio = await loadImageAspectRatio(hint.image);
          return [hint.id, ratio];
        })
      );

      if (cancelled) return;

      setImageRatios((current) => {
        const next = { ...current };
        for (const [id, ratio] of nextEntries) {
          if (ratio && Number.isFinite(ratio)) next[id] = ratio;
        }
        return next;
      });
    }

    measureRatios();

    return () => {
      cancelled = true;
    };
  }, [visibleHints, imageRatios]);

  async function persistOrder(nextHints) {
    if (!currentUser) return;
    const supabase = createClient();

    await Promise.all(
      nextHints.map((hint, index) => supabase.from("hints").update({ position: index }).eq("id", hint.id))
    );
  }

  function rebuildFromColumns(nextColumns) {
    return nextColumns.flat().map((hint, index) => ({ ...hint, position: index }));
  }

  function openEditModal(hint) {
    setEditingHintId(hint.id);
    setEditForm({
      title: hint.title || "",
      url: hint.url || "",
      retailer: hint.retailer || "",
      image: hint.image || "",
      uploadedImage: null,
      priceInput: hint.numericPrice != null ? String(hint.numericPrice) : "",
    });
  }

  function closeEditModal() {
    setEditingHintId(null);
    setEditForm(EMPTY_EDIT_FORM);
    setIsRefreshingEdit(false);
    setIsSavingEdit(false);
  }

  function closeAddModal() {
    setIsAddModalOpen(false);
    setPendingHint(null);
    setIsSubmittingNewHint(false);
    setNewHintForm(EMPTY_NEW_HINT_FORM);
    setAddModalNotice("");
    setPreviewState("success");
  }

  async function saveEditChanges() {
    if (!currentUser || editingHintId == null) return;

    const trimmedTitle = editForm.title.trim() || "Saved hint";
    const trimmedUrl = editForm.url.trim();
    const trimmedRetailer = editForm.retailer?.trim() || normaliseRetailer(trimmedUrl);
    const parsedNumericPrice = extractNumericPrice(editForm.priceInput);
    const priceMeta = sanitisePrice(editForm.priceInput, parsedNumericPrice);
    const finalImage = editForm.uploadedImage || editForm.image || "";

    setIsSavingEdit(true);
    setError("");
    beginEditSaveBusy();

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("hints")
        .update({
          title: trimmedTitle,
          url: trimmedUrl,
          retailer: trimmedRetailer,
          image_url: finalImage,
          price_text: priceMeta.priceLabel,
          numeric_price: priceMeta.numericPrice,
          needs_review: false,
        })
        .eq("id", editingHintId);

      if (error) {
        setError(errorToMessage(error));
        setIsSavingEdit(false);
        closeBusy();
        return;
      }

      if (finalImage) {
        const ratio = await loadImageAspectRatio(finalImage);
        if (ratio) {
          setImageRatios((current) => ({ ...current, [editingHintId]: ratio }));
        }
      }

      setHints((current) =>
        current.map((hint) =>
          hint.id === editingHintId
            ? {
                ...hint,
                title: trimmedTitle,
                url: trimmedUrl || hint.url,
                retailer: trimmedRetailer,
                image: finalImage,
                priceLabel: priceMeta.priceLabel,
                numericPrice: priceMeta.numericPrice,
                needsReview: false,
              }
            : hint
        )
      );

      setIsSavingEdit(false);
      closeBusy();
      closeEditModal();
    } catch (err) {
      setError(errorToMessage(err));
      setIsSavingEdit(false);
      closeBusy();
    }
  }

  async function deleteHint() {
    if (!currentUser || editingHintId == null) return;
    const supabase = createClient();
    const { error } = await supabase.from("hints").delete().eq("id", editingHintId);

    if (error) {
      setError(errorToMessage(error));
      return;
    }

    setHints((current) => current.filter((hint) => hint.id !== editingHintId));
    closeEditModal();
  }

  async function toggleStarred(hint) {
    if (!currentUser) return;
    const supabase = createClient();
    const newStarred = !hint.starred;

    setHints((current) => current.map((h) => (h.id === hint.id ? { ...h, starred: newStarred } : h)));

    const { error } = await supabase.from("hints").update({ starred: newStarred }).eq("id", hint.id);

    if (error) {
      setHints((current) => current.map((h) => (h.id === hint.id ? { ...h, starred: hint.starred } : h)));
      setError(errorToMessage(error));
    }
  }

  async function togglePrivate(hint) {
    if (!currentUser) return;
    const supabase = createClient();
    const newPrivate = !hint.private;

    setHints((current) => current.map((h) => (h.id === hint.id ? { ...h, private: newPrivate } : h)));

    const { error } = await supabase.from("hints").update({ is_private: newPrivate }).eq("id", hint.id);

    if (error) {
      setHints((current) => current.map((h) => (h.id === hint.id ? { ...h, private: hint.private } : h)));
      setError(errorToMessage(error));
    }
  }

  async function refreshHintFromLink() {
    const trimmed = editForm.url.trim();

    if (!trimmed || editingHintId == null) return;

    if (!isValidHttpUrl(trimmed)) {
      setError("Please enter a valid URL.");
      return;
    }

    setIsRefreshingEdit(true);
    setError("");
    beginFetchBusy();

    try {
      const preview = await fetchPreviewWithTimeout(trimmed);
      const draft = buildDraftFromPreview(preview, trimmed);

      setEditForm((current) => ({
        ...current,
        title: draft.title || current.title,
        retailer: draft.retailer || current.retailer,
        image: draft.image || current.image,
        uploadedImage: null,
        priceInput: draft.numericPrice != null ? String(draft.numericPrice) : current.priceInput,
        url: draft.url || current.url,
      }));
    } catch (err) {
      setError(
        err?.code === "PREVIEW_TIMEOUT"
          ? PREVIEW_NOTICE_TIMEOUT
          : "We couldn’t refresh that link automatically."
      );
    } finally {
      setIsRefreshingEdit(false);
      closeBusy();
    }
  }

  async function saveNewHint() {
    if (!currentUser || !pendingHint) return;

    const trimmedTitle = newHintForm.title.trim() || "Saved hint";
    const trimmedUrl = newHintForm.url.trim();
    const trimmedRetailer = newHintForm.retailer?.trim() || normaliseRetailer(trimmedUrl);
    const parsedNumericPrice = extractNumericPrice(newHintForm.priceInput);
    const priceMeta = sanitisePrice(newHintForm.priceInput, parsedNumericPrice);
    const finalImage = newHintForm.uploadedImage || newHintForm.image || "";
    const nextPosition = hints.length;

    setIsSubmittingNewHint(true);
    setError("");
    beginSaveBusy();

    try {
      const supabase = createClient();

      const payload = {
        user_id: currentUser.id,
        title: trimmedTitle,
        url: trimmedUrl,
        retailer: trimmedRetailer,
        image_url: finalImage,
        price_text: priceMeta.priceLabel,
        numeric_price: priceMeta.numericPrice,
        starred: Boolean(newHintForm.starred),
        is_private: Boolean(newHintForm.private),
        position: nextPosition,
        needs_review: Boolean(
          !trimmedTitle || !finalImage || priceMeta.numericPrice == null || newHintForm.needsReview
        ),
      };

      const { data, error } = await supabase.from("hints").insert(payload).select("*").single();

      if (error) {
        setError(errorToMessage(error));
        setIsSubmittingNewHint(false);
        closeBusy();
        return;
      }

      if (finalImage) {
        const ratio = await loadImageAspectRatio(finalImage);
        if (ratio) {
          setImageRatios((current) => ({ ...current, [data.id]: ratio }));
        }
      }

      setHints((current) => [
        ...current,
        {
          id: data.id,
          title: data.title || trimmedTitle,
          retailer: data.retailer || trimmedRetailer,
          priceLabel: data.price_text || priceMeta.priceLabel,
          numericPrice: data.numeric_price,
          image: data.image_url || finalImage,
          fallbackGradient: buildFallbackGradient(current.length),
          starred: Boolean(data.starred),
          private: Boolean(data.is_private),
          url: data.url || trimmedUrl,
          position: data.position ?? current.length,
          needsReview: Boolean(data.needs_review),
        },
      ]);

      setLink("");
      setLinkError("");
      setIsSubmittingNewHint(false);
      closeBusy();
      closeAddModal();
    } catch (err) {
      setError(errorToMessage(err));
      setIsSubmittingNewHint(false);
      closeBusy();
    }
  }

  async function handleAddFromLink(e) {
    e.preventDefault();
    setError("");
    setLinkError("");

    const trimmed = link.trim();

    if (!trimmed || !isValidHttpUrl(trimmed)) {
      setLinkError(PREVIEW_NOTICE_INVALID);
      return;
    }

    setIsAdding(true);
    beginFetchBusy();

    try {
      const preview = await fetchPreviewWithTimeout(trimmed);
      const draft = buildDraftFromPreview(preview, trimmed);

      const isBlocked = Boolean(preview?.blocked);
      const isPartial =
        draft.needsReview || !draft.title || !draft.image || draft.numericPrice == null;

      setPendingHint(draft);
      setNewHintForm(draft);

      if (isBlocked) {
        setAddModalNotice(PREVIEW_NOTICE_BLOCKED);
        setPreviewState("manual");
      } else if (isPartial) {
        setAddModalNotice(PREVIEW_NOTICE_PARTIAL);
        setPreviewState("partial");
      } else {
        setAddModalNotice("");
        setPreviewState("success");
      }

      setIsAddModalOpen(true);
    } catch (err) {
      const isTimeout = err?.code === "PREVIEW_TIMEOUT" || err?.message === "PREVIEW_TIMEOUT";

      const manualDraft = buildManualDraft(trimmed);
      setPendingHint(manualDraft);
      setNewHintForm(manualDraft);
      setAddModalNotice(isTimeout ? PREVIEW_NOTICE_TIMEOUT : PREVIEW_NOTICE_BLOCKED);
      setPreviewState("manual");
      setIsAddModalOpen(true);
    } finally {
      closeBusy();
      setIsAdding(false);
    }
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || hints.length === 0) return;

    const oldIndex = hints.findIndex((item) => item.id === active.id);
    const newIndex = hints.findIndex((item) => item.id === over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    const nextHints = arrayMove(hints, oldIndex, newIndex).map((hint, index) => ({
      ...hint,
      position: index,
    }));

    setHints(nextHints);
    await persistOrder(nextHints);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <div className="min-h-screen bg-[#f8f4f1] text-slate-900">
      <BusyOverlay open={busyState.open} title={busyState.title} message={busyState.message} />

      <AddHintModal
        isOpen={isAddModalOpen}
        form={newHintForm}
        setForm={setNewHintForm}
        onClose={closeAddModal}
        onSubmit={saveNewHint}
        isSaving={isSubmittingNewHint}
        notice={addModalNotice}
        previewState={previewState}
      />

      <EditHintModal
        isOpen={Boolean(editingHintId)}
        editForm={editForm}
        setEditForm={setEditForm}
        onClose={closeEditModal}
        onSave={saveEditChanges}
        onRefreshFromLink={refreshHintFromLink}
        onDelete={deleteHint}
        isRefreshing={isRefreshingEdit}
        isSaving={isSavingEdit}
        hint={editingHint}
      />

      <header className="sticky top-0 z-40 border-b border-[#efe2da] bg-[rgba(248,244,241,0.86)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <Link href="/" className="text-[18px] font-semibold tracking-[-0.04em] text-slate-900">
                Hint board
              </Link>
              <p className="text-sm text-slate-500">Save ideas people will actually want.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-full border border-[#eadbd2] bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm sm:inline-flex"
            >
              Home
            </Link>
            <AvatarMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
        <section className="rounded-[32px] border border-[#efdfd5] bg-white p-6 shadow-[0_18px_60px_rgba(132,94,72,0.08)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#df7c59]">
                Add a new hint
              </p>
              <h1 className="mt-3 text-[40px] font-semibold tracking-[-0.06em] text-slate-900 sm:text-[52px]">
                Add a link, then check the details before it goes on your board.
              </h1>
              <p className="mt-4 max-w-[62ch] text-[16px] leading-7 text-slate-600">
                Paste a retailer or product link and we’ll try to pull in the title, image, and
                price. If the shop blocks us or takes too long, you can still add everything
                manually.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#f0e2d9] bg-[#fcfaf8] p-5 sm:p-6">
              <form className="space-y-4" onSubmit={handleAddFromLink}>
                <div>
                  <label htmlFor="new-link" className="mb-2 block text-sm font-medium text-slate-700">
                    Product or retailer link
                  </label>
                  <input
                    id="new-link"
                    type="url"
                    aria-describedby="new-link-help new-link-error"
                    value={link}
                    onChange={(e) => {
                      setLink(e.target.value);
                      if (linkError) setLinkError("");
                    }}
                    placeholder="Paste the link here"
                    className={`h-14 w-full rounded-[18px] bg-white px-5 text-[15px] text-slate-700 outline-none focus:ring-2 focus:ring-[#f19a78]/50 ${
                      linkError ? "border border-[#efb6a2]" : "border border-[#eadcd3]"
                    }`}
                  />
                  <FieldHint id="new-link-help">
                    We’ll try to fetch the name, image, and price from this page first.
                  </FieldHint>
                  {linkError ? (
                    <FieldHint id="new-link-error" tone="error">
                      {linkError}
                    </FieldHint>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={isAdding}
                  className="inline-flex h-13 w-full items-center justify-center rounded-full border border-[#ee8d69] bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isAdding ? "Fetching..." : "Fetch details"}
                </button>
              </form>

              <div className="mt-5 rounded-[20px] border border-[#f2e5de] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-slate-800">What happens next</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>We try to pull the title, image, and price from the link.</li>
                  <li>If anything is missing, you can edit it before saving.</li>
                  <li>If the shop blocks us, you can still fill in the card manually.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-6 rounded-[22px] border border-[#f2cbbb] bg-[#fff5ef] px-5 py-4 text-sm text-[#a05941]">
            {error}
          </div>
        ) : null}

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#df7c59]">
                Your hints
              </p>
              <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-slate-900">
                Saved cards
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              Drag cards to reorder them. Edit any card to fix missing details.
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-[28px] border border-[#efe0d7] bg-white p-8 text-sm text-slate-500 shadow-[0_18px_60px_rgba(132,94,72,0.06)]">
              Loading your hints...
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              measuring={measuring}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="grid gap-6 lg:grid-cols-3">
                {columns.map((column, columnIndex) => (
                  <SortableContext
                    key={`column-${columnIndex}`}
                    items={column.map((hint) => hint.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="min-w-0">
                      {column.map((hint) => (
                        <SortableHintCard
                          key={hint.id}
                          hint={hint}
                          imageRatios={imageRatios}
                          onEdit={openEditModal}
                          onToggleStarred={toggleStarred}
                          onTogglePrivate={togglePrivate}
                        />
                      ))}
                    </div>
                  </SortableContext>
                ))}
              </div>

              <DragOverlay>
                {activeHint ? (
                  <div className="w-[320px] max-w-[92vw] opacity-95">
                    <HintCard
                      hint={activeHint}
                      imageRatios={imageRatios}
                      onEdit={() => {}}
                      onToggleStarred={() => {}}
                      onTogglePrivate={() => {}}
                      isDragging
                      dragHandleAttributes={{}}
                      dragHandleListeners={{}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </section>
      </main>
    </div>
  );
}
