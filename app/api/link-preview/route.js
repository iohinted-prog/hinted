import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ACTIVE_CURRENCY = "GBP";

function json(data, init) {
  return NextResponse.json(data, init);
}

function normaliseUrl(input = "") {
  const trimmed = String(input).trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function detectCurrency(raw = "") {
  const text = String(raw || "").trim();
  if (!text) return null;
  if (text.includes("£")) return "GBP";
  if (text.includes("€")) return "EUR";
  if (text.includes("$") && !text.includes("A$") && !text.includes("C$") && !text.includes("NZ$")) {
    return "USD";
  }
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

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function pickFirst(...values) {
  for (const value of values) {
    const cleaned = cleanText(value);
    if (cleaned) return cleaned;
  }
  return "";
}

function absolutifyUrl(src, baseUrl) {
  if (!src) return "";
  try {
    return new URL(src, baseUrl).toString();
  } catch {
    return "";
  }
}

function getMeta($, keys) {
  for (const key of keys) {
    const byProperty = $(`meta[property="${key}"]`).attr("content");
    if (byProperty && cleanText(byProperty)) return cleanText(byProperty);

    const byName = $(`meta[name="${key}"]`).attr("content");
    if (byName && cleanText(byName)) return cleanText(byName);
  }
  return "";
}

function getTitle($) {
  return pickFirst(
    getMeta($, ["og:title", "twitter:title"]),
    $("title").first().text(),
    $("h1").first().text()
  );
}

function getImage($, baseUrl) {
  const image = pickFirst(
    getMeta($, ["og:image", "twitter:image"]),
    $('meta[itemprop="image"]').attr("content"),
    $('img[src]').first().attr("src")
  );

  return absolutifyUrl(image, baseUrl);
}

function getSiteName($, url) {
  const metaSite = pickFirst(
    getMeta($, ["og:site_name", "application-name"]),
    $('meta[name="publisher"]').attr("content")
  );

  if (metaSite) return metaSite;

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Saved link";
  }
}

function getCanonicalUrl($, url) {
  const canonical = $('link[rel="canonical"]').attr("href");
  return absolutifyUrl(canonical, url) || url;
}

function extractPriceCandidates($) {
  const candidates = new Set();

  const metaKeys = [
    "product:price:amount",
    "og:price:amount",
    "price",
    "twitter:data1",
  ];

  for (const key of metaKeys) {
    const content = getMeta($, [key]);
    if (content) candidates.add(content);
  }

  const selectors = [
    '[itemprop="price"]',
    '[data-price]',
    '[class*="price"]',
    '[id*="price"]',
    'meta[property="product:price:amount"]',
  ];

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const node = $(el);
      const content =
        node.attr("content") ||
        node.attr("data-price") ||
        node.text();

      const cleaned = cleanText(content);
      if (cleaned && /(?:£|\$|€|\bR\s?\d|\d+\.\d{2}|\d{2,})/.test(cleaned)) {
        candidates.add(cleaned);
      }
    });
  }

  return Array.from(candidates);
}

function chooseBestPrice(candidates, preferredCurrency = ACTIVE_CURRENCY) {
  let best = null;

  for (const candidate of candidates) {
    const currency = detectCurrency(candidate);
    const numeric = extractNumericPrice(candidate);
    if (!numeric) continue;

    const score =
      (currency === preferredCurrency ? 3 : 0) +
      (/[£$€R]/.test(candidate) ? 2 : 0) +
      (candidate.length < 32 ? 1 : 0);

    if (!best || score > best.score) {
      best = {
        raw: candidate,
        numeric,
        currency,
        score,
      };
    }
  }

  return best;
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

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; HintedBot/1.0; +https://hinted.io)",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "accept-language": "en-GB,en;q=0.9",
    },
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Preview request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    throw new Error("This URL did not return an HTML page.");
  }

  return response.text();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const url = normaliseUrl(body?.url || "");
    const currency = body?.currency || ACTIVE_CURRENCY;

    if (!url) {
      return json({ error: "A URL is required." }, { status: 400 });
    }

    let parsed;
    try {
      parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return json({ error: "Only http and https URLs are supported." }, { status: 400 });
      }
    } catch {
      return json({ error: "Please provide a valid URL." }, { status: 400 });
    }

    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const siteName = getSiteName($, url);
    const rawTitle = getTitle($);
    const title = shortenTitle(rawTitle, siteName);
    const image = getImage($, url);
    const finalUrl = getCanonicalUrl($, url);

    const priceCandidates = extractPriceCandidates($);
    const chosenPrice = chooseBestPrice(priceCandidates, currency);

    const hasSupportedCurrency =
      chosenPrice?.currency == null || chosenPrice.currency === currency;

    const numericPrice = hasSupportedCurrency ? chosenPrice?.numeric ?? null : null;
    const priceText = hasSupportedCurrency ? chosenPrice?.raw || "" : "";
    const blocked = !rawTitle && !image && !chosenPrice;
    const needsReview = !title || !image || numericPrice == null;

    return json({
      ok: true,
      url: finalUrl,
      siteName,
      title,
      rawTitle,
      image,
      priceText,
      numericPrice,
      currency: hasSupportedCurrency ? currency : chosenPrice?.currency || null,
      blocked,
      needsReview,
      source: "preview",
    });
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not fetch this link preview.",
      },
      { status: 500 }
    );
  }
}
