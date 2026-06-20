import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// Headers — rotate through these to reduce bot detection
// ---------------------------------------------------------------------------

const HEADER_PROFILES = [
  {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Ch-Ua": '"Google Chrome";v="125", "Chromium";v="125", "Not-A.Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "DNT": "1",
  },
  {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "no-cache",
  },
  {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Linux"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Upgrade-Insecure-Requests": "1",
  },
];

// ---------------------------------------------------------------------------
// Retailer-specific config
// ---------------------------------------------------------------------------

const RETAILER_RULES = {
  amazon: {
    match: (h) => /(^|\.)amazon\./i.test(h),
    titleSelectors: ["#productTitle", 'meta[property="og:title"]', "h1"],
    priceSelectors: [
      "#corePrice_feature_div .a-price .a-offscreen",
      "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
      "#apex_desktop .a-price .a-offscreen",
      ".priceToPay .a-offscreen",
      "#price_inside_buybox",
      ".a-price .a-offscreen",
    ],
    imageSelectors: ["#landingImage", "#imgBlkFront", 'meta[property="og:image"]'],
    cleanTitle: (t) =>
      t
        .replace(/\s*:\s*Amazon\.[A-Za-z.]+.*$/i, "")
        .replace(/\s*\|\s*Amazon\.[A-Za-z.]+.*$/i, "")
        .replace(/\s*-\s*Amazon\.[A-Za-z.]+.*$/i, "")
        .replace(/\s{2,}/g, " ")
        .trim(),
  },
  johnlewis: {
    match: (h) => /(^|\.)johnlewis\.com$/i.test(h),
    titleSelectors: ['meta[property="og:title"]', "h1"],
    priceSelectors: [
      '[data-test="price"]',
      '[data-testid*="price"]',
      '[class*="price"]',
      '[itemprop="price"]',
    ],
    imageSelectors: ['meta[property="og:image"]', 'meta[name="twitter:image"]', "img[src]"],
  },
  currys: {
    match: (h) => /(^|\.)currys\.co\.uk$/i.test(h),
    titleSelectors: ['meta[property="og:title"]', "h1"],
    priceSelectors: [
      '[data-testid*="price"]',
      '[class*="price"]',
      '[itemprop="price"]',
    ],
    imageSelectors: ['meta[property="og:image"]', 'meta[name="twitter:image"]', "img[src]"],
  },
  ebay: {
    match: (h) => /(^|\.)ebay\./i.test(h),
    titleSelectors: [
      '[data-testid="x-item-title"]',
      "h1.x-item-title__mainTitle",
      'meta[property="og:title"]',
      "h1",
    ],
    priceSelectors: [
      '[itemprop="price"]',
      '[data-testid="x-price-primary"]',
      ".display-price",
    ],
    imageSelectors: [
      '[data-testid="ux-image-carousel-item"] img',
      'meta[property="og:image"]',
    ],
  },
  etsy: {
    match: (h) => /(^|\.)etsy\.com$/i.test(h),
    titleSelectors: ['meta[property="og:title"]', "h1"],
    priceSelectors: [
      '[data-selector="price-only"]',
      '[data-buy-box-region="price"]',
      '[itemprop="price"]',
    ],
    imageSelectors: ['meta[property="og:image"]', "img[data-src]"],
  },
  argos: {
    match: (h) => /(^|\.)argos\.co\.uk$/i.test(h),
    titleSelectors: ['meta[property="og:title"]', "h1"],
    priceSelectors: [
      '[data-test="product-price-primary"]',
      '[data-testid*="price"]',
      '[itemprop="price"]',
    ],
    imageSelectors: ['meta[property="og:image"]', "img[src]"],
  },
  asos: {
    match: (h) => /(^|\.)asos\.com$/i.test(h),
    titleSelectors: ['meta[property="og:title"]', "h1"],
    priceSelectors: [
      '[data-testid*="price"]',
      '[class*="price"]',
      '[itemprop="price"]',
    ],
    imageSelectors: ['meta[property="og:image"]', "img[src]"],
  },
  generic: {
    match: () => true,
    titleSelectors: [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'meta[name="title"]',
      "h1",
      "title",
    ],
    priceSelectors: [
      '[itemprop="price"]',
      '[data-testid*="price"]',
      '[data-price]',
      '[class*="price"]',
      '[id*="price"]',
    ],
    imageSelectors: [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'link[rel="image_src"]',
      "img[src]",
    ],
  },
};

const PRICE_REGEX =
  /(?:A\$|NZ\$|C\$|£|\$|€|R)\s?\d[\d,]*(?:\.\d{1,2})?|\d[\d,]*(?:\.\d{1,2})?\s?(?:GBP|USD|EUR|AUD|NZD|CAD|ZAR)/gi;

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureHttpUrl(raw = "") {
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function makeAbsolute(url = "", base = "") {
  if (!url) return "";
  try {
    return new URL(url, base).toString();
  } catch {
    return "";
  }
}

function hostname(url = "") {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function getRule(host = "") {
  const entries = Object.entries(RETAILER_RULES);
  for (const [key, rule] of entries) {
    if (key === "generic") continue;
    if (rule.match(host)) return { key, rule };
  }
  return { key: "generic", rule: RETAILER_RULES.generic };
}

function getMeta($, selectors = []) {
  for (const sel of selectors) {
    const val = cleanText($(sel).attr("content") || "");
    if (val) return val;
  }
  return "";
}

function getText($, selectors = []) {
  for (const sel of selectors) {
    const val = cleanText($(sel).first().text() || "");
    if (val) return val;
  }
  return "";
}

function getAttrValue($, selectors = [], attr = "content") {
  for (const sel of selectors) {
    const val = String($(sel).first().attr(attr) || "").trim();
    if (val) return val;
  }
  return "";
}

function getImageAttr($, selectors = [], base = "") {
  for (const sel of selectors) {
    const el = $(sel).first();
    if (!el.length) continue;
    const attrs = [
      el.attr("content"),
      el.attr("src"),
      el.attr("data-src"),
      el.attr("data-old-hires"),
      el.attr("href"),
    ].filter(Boolean);
    for (const attr of attrs) {
      const abs = makeAbsolute(attr, base);
      if (abs) return abs;
    }
  }
  return "";
}

function detectCurrency(val = "") {
  if (!val) return null;
  if (val.includes("£")) return "GBP";
  if (val.includes("A$")) return "AUD";
  if (val.includes("NZ$")) return "NZD";
  if (val.includes("C$")) return "CAD";
  if (val.includes("$")) return "USD";
  if (val.includes("€")) return "EUR";
  if (/\bR\s?\d/i.test(val) || /\bZAR\b/i.test(val)) return "ZAR";
  return null;
}

function currencySymbol(code = "") {
  const map = { GBP: "£", USD: "$", EUR: "€", AUD: "A$", NZD: "NZ$", CAD: "C$", ZAR: "R" };
  return map[String(code).toUpperCase()] || "";
}

function formatPrice(amount = "", currency = "") {
  const num = parseFloat(String(amount).replace(/,/g, ""));
  if (!Number.isFinite(num) || num <= 0) return "";
  const symbol = currencySymbol(currency);
  const formatted = num % 1 === 0 ? String(num) : num.toFixed(2);
  return symbol ? `${symbol}${formatted}` : formatted;
}

function extractNumericPrice(val = "") {
  const cleaned = String(val).replace(/,/g, "");
  const match =
    cleaned.match(/(?:A\$|NZ\$|C\$|£|\$|€|R)\s?(\d+(?:\.\d{1,2})?)/) ||
    cleaned.match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) return null;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : null;
}

// ---------------------------------------------------------------------------
// JSON-LD extraction
// ---------------------------------------------------------------------------

function extractJsonLd($, base = "") {
  const result = { title: "", brand: "", priceText: "", images: [] };

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      walk(parsed);
    } catch {}
  });

  function walk(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(walk); return; }

    const type = [].concat(node["@type"] || []).join(" ").toLowerCase();

    if (!result.title && (type.includes("product") || type.includes("offer"))) {
      result.title = cleanText(node.name || "");
    }

    if (!result.brand && node.brand) {
      result.brand = cleanText(
        typeof node.brand === "string" ? node.brand : node.brand.name || ""
      );
    }

    if (!result.priceText && node.offers) {
      const offers = [].concat(node.offers);
      for (const offer of offers) {
        const price = offer.price || offer.lowPrice || offer.priceSpecification?.price;
        const currency = offer.priceCurrency || offer.priceSpecification?.priceCurrency || "";
        const formatted = formatPrice(price, currency);
        if (formatted) { result.priceText = formatted; break; }
      }
    }

    if (node.image) {
      const images = [].concat(node.image).map((img) =>
        makeAbsolute(typeof img === "string" ? img : img.url || "", base)
      ).filter(Boolean);
      result.images.push(...images);
    }

    if (node["@graph"]) walk(node["@graph"]);
    Object.values(node).forEach((child) => {
      if (child && typeof child === "object") walk(child);
    });
  }

  result.images = [...new Set(result.images)];
  return result;
}

// ---------------------------------------------------------------------------
// Price extraction
// ---------------------------------------------------------------------------

function extractMetaPrice($) {
  const amount = getMeta($, [
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
    'meta[name="twitter:data1"]',
  ]);
  const currency = getMeta($, [
    'meta[property="product:price:currency"]',
    'meta[property="og:price:currency"]',
  ]);
  if (!amount) return "";
  return formatPrice(amount, currency || detectCurrency(amount) || "");
}

function extractDomPrice($, selectors = []) {
  for (const sel of selectors) {
    const el = $(sel).first();
    if (!el.length) continue;
    const val =
      cleanText(el.attr("content") || "") ||
      cleanText(el.attr("value") || "") ||
      cleanText(el.text() || "");
    if (!val) continue;
    const match = val.match(PRICE_REGEX);
    if (match?.[0]) return cleanText(match[0]);
  }
  return "";
}

function pickBestPrice({ domPrice, jsonLdPrice, metaPrice }, preferredCurrency = "GBP") {
  const candidates = [
    { value: domPrice, priority: 3 },
    { value: jsonLdPrice, priority: 2 },
    { value: metaPrice, priority: 1 },
  ].filter((c) => c.value);

  if (!candidates.length) return { priceText: "", currency: null };

  const preferred = candidates.filter((c) => detectCurrency(c.value) === preferredCurrency);
  const pool = preferred.length ? preferred : candidates;

  pool.sort((a, b) => b.priority - a.priority);
  const winner = pool[0];
  return { priceText: winner.value, currency: detectCurrency(winner.value) };
}

// ---------------------------------------------------------------------------
// Image extraction
// ---------------------------------------------------------------------------

const BAD_IMAGE_PATTERN = /logo|sprite|icon|favicon|avatar|placeholder|spacer|loading|1x1|blank|transparent|trustpilot|star-rating/i;

function scoreImage(url = "", source = "") {
  if (!url || BAD_IMAGE_PATTERN.test(url)) return -100;
  let score = 0;
  if (/\b(product|products|pdp)\b/i.test(url)) score += 20;
  if (/\bhero|primary|main|large\b/i.test(url)) score += 15;
  if (/\.(jpg|jpeg|png|webp|avif)(\?|$)/i.test(url)) score += 10;
  if (/1500|1200|1024|960/.test(url)) score += 8;
  if (/data:image\//.test(url)) score -= 100;
  if (source === "host") score += 30;
  if (source === "jsonld") score += 25;
  if (source === "og") score += 18;
  if (source === "dom") score += 5;
  return score;
}

function improveAmazonImage(url = "") {
  return String(url)
    .replace(/\._AC_[A-Z0-9,]+_\./i, "._AC_SL1500_.")
    .replace(/\._SL\d+_\./i, "._SL1500_.")
    .replace(/\._SX\d+_\./i, "._SL1500_.")
    .replace(/\._SY\d+_\./i, "._SL1500_.");
}

function pickBestImage({ hostImage, jsonLdImages, $, base, isAmazon }) {
  const candidates = [];
  const seen = new Set();

  function add(url, source) {
    const abs = makeAbsolute(url, base);
    const final = isAmazon ? improveAmazonImage(abs) : abs;
    if (!final || seen.has(final)) return;
    seen.add(final);
    candidates.push({ url: final, score: scoreImage(final, source) });
  }

  if (hostImage) add(hostImage, "host");
  jsonLdImages.forEach((u) => add(u, "jsonld"));

  [
    getMeta($, ['meta[property="og:image"]', 'meta[property="og:image:url"]', 'meta[name="twitter:image"]']),
    getAttrValue($, ['link[rel="image_src"]'], "href"),
  ].filter(Boolean).forEach((u) => add(u, "og"));

  $("img").each((_, el) => {
    const attrs = [
      $(el).attr("src"),
      $(el).attr("data-src"),
      $(el).attr("data-old-hires"),
      $(el).attr("data-lazy-src"),
    ].filter(Boolean);
    attrs.forEach((u) => add(u, "dom"));
  });

  return candidates.sort((a, b) => b.score - a.score).filter((c) => c.score > -20)[0]?.url || "";
}

// ---------------------------------------------------------------------------
// Fetch with timeout and header rotation
// ---------------------------------------------------------------------------

async function fetchHtml(inputUrl) {
  const errors = [];

  for (const headers of HEADER_PROFILES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(inputUrl, {
        method: "GET",
        headers,
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        errors.push(`HTTP ${res.status}`);
        continue;
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        throw new Error("URL did not return an HTML page.");
      }

      const html = await res.text();
      if (!html?.trim()) throw new Error("Empty response from page.");

      return { html, finalUrl: res.url || inputUrl };
    } catch (err) {
      clearTimeout(timer);
      errors.push(err?.name === "AbortError" ? "Timed out" : err?.message || "Fetch failed");
    }
  }

  const err = new Error("Could not fetch the page after multiple attempts.");
  err.details = errors;
  throw err;
}

// ---------------------------------------------------------------------------
// Main scraper
// ---------------------------------------------------------------------------

async function scrapeUrl(inputUrl, preferredCurrency = "GBP") {
  const { html, finalUrl } = await fetchHtml(inputUrl);
  const $ = cheerio.load(html);

  // Canonical URL
  let canonicalUrl =
    getAttrValue($, ['link[rel="canonical"]'], "href") ||
    getMeta($, ['meta[property="og:url"]']);
  canonicalUrl = makeAbsolute(canonicalUrl, finalUrl) || finalUrl;

  const host = hostname(canonicalUrl);
  const { key, rule } = getRule(host);
  const isAmazon = key === "amazon";

  // Strip Amazon tracking params
  if (isAmazon) {
    try {
      const u = new URL(canonicalUrl);
      canonicalUrl = `${u.origin}${u.pathname}`;
    } catch {}
  }

  // JSON-LD
  const jsonLd = extractJsonLd($, finalUrl);

  // Title
  let title =
    getText($, rule.titleSelectors) ||
    jsonLd.title ||
    getMeta($, ['meta[property="og:title"]', 'meta[name="twitter:title"]']) ||
    getText($, ["h1", "title"]) ||
    "";

  if (isAmazon && title) title = (rule.cleanTitle || ((t) => t))(title);
  title = cleanText(title);

  // Description
  const description =
    getMeta($, [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]) ||
    getText($, ["main p", "article p"]) ||
    "";

  // Site name
  const siteName =
    getMeta($, ['meta[property="og:site_name"]', 'meta[name="application-name"]']) ||
    host;

  // Price
  const domPrice = extractDomPrice($, rule.priceSelectors);
  const jsonLdPrice = jsonLd.priceText;
  const metaPrice = extractMetaPrice($);
  const { priceText, currency: detectedCurrency } = pickBestPrice(
    { domPrice, jsonLdPrice, metaPrice },
    preferredCurrency
  );

  // Image
  const hostImage = getImageAttr($, rule.imageSelectors, finalUrl);
  const image = pickBestImage({
    hostImage,
    jsonLdImages: jsonLd.images,
    $,
    base: finalUrl,
    isAmazon,
  });

  // Confidence
  const confidence =
    title && image && priceText ? "high" : title && (image || priceText) ? "medium" : "low";

  return {
    url: canonicalUrl,
    title: title || "",
    description: cleanText(description) || "",
    siteName,
    image,
    priceText,
    numericPrice: extractNumericPrice(priceText),
    detectedCurrency,
    brand: jsonLd.brand || "",
    confidence,
    // needsReview drives the empty card fallback in the UI
    needsReview: confidence !== "high",
    source: "scraper",
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const inputUrl = ensureHttpUrl(body?.url || "");
    const preferredCurrency = String(body?.currency || "GBP").toUpperCase();

    if (!inputUrl) {
      return NextResponse.json({ error: "Please provide a valid URL." }, { status: 400 });
    }

    try {
      const result = await scrapeUrl(inputUrl, preferredCurrency);
      return NextResponse.json(result, { status: 200 });
    } catch (scrapeError) {
      // Return a clean fallback — UI should show an empty card for manual fill
      const host = (() => { try { return new URL(inputUrl).hostname.replace(/^www\./i, ""); } catch { return ""; } })();
      return NextResponse.json({
        url: inputUrl,
        title: "",
        description: "",
        siteName: host,
        image: "",
        priceText: "",
        numericPrice: null,
        detectedCurrency: null,
        brand: "",
        confidence: "low",
        needsReview: true,
        source: "fallback",
        error: scrapeError?.message || "Could not fetch page details.",
      }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}
