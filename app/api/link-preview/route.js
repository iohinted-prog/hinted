import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const FORWARDED_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  DNT: "1",
};

const FAST_TIMEOUT_MS = 2200;
const ENRICH_TIMEOUT_MS = 20000;
const TASK_TTL_MS = 10 * 60 * 1000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const POLL_RETRY_AFTER_SECONDS = 2;

const PRICE_REGEX =
  /(?:A\$|NZ\$|C\$|US\$|CA\$|AU\$|£|\$|€)\s?\d[\d,]*(?:\.\d{1,2})?|\b\d[\d,]*(?:\.\d{1,2})?\s?(?:GBP|USD|EUR|AUD|NZD|CAD)\b/gi;

const BLOCK_WORDS = [
  "access denied",
  "blocked",
  "captcha",
  "robot check",
  "verify you are human",
  "security check",
  "service unavailable",
  "unusual traffic",
  "automated access",
  "enable cookies",
  "cloudflare",
  "amazon captcha",
  "disable any ad blocker",
  "please enable js",
  "you don't have permission",
  "errors.edgesuite.net",
  "geo.captcha-delivery.com",
];

const PRIORITY_RETAILER_PATTERNS = [
  /(^|\.)amazon\./i,
  /(^|\.)ebay\./i,
  /(^|\.)etsy\.com$/i,
  /(^|\.)next\./i,
  /(^|\.)asos\.com$/i,
  /(^|\.)boohoo\./i,
  /(^|\.)prettylittlething\./i,
  /(^|\.)laredoute\./i,
  /(^|\.)johnlewis\.com$/i,
  /(^|\.)currys\.co\.uk$/i,
  /(^|\.)argos\.co\.uk$/i,
];

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

  etsy: {
    match: (h) => /(^|\.)etsy\.com$/i.test(h),
    titleSelectors: ['meta[property="og:title"]', "h1"],
    priceSelectors: [
      '[data-selector="price-only"]',
      '[data-buy-box-region="price"]',
      '[itemprop="price"]',
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
      'meta[name="twitter:data1"]',
    ],
    imageSelectors: [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      "img[data-src]",
      "img[src]",
    ],
  },

  next: {
    match: (h) => /(^|\.)next\./i.test(h),
    titleSelectors: ['meta[property="og:title"]', "h1", "title"],
    priceSelectors: [
      '[itemprop="price"]',
      '[data-testid*="price"]',
      '[class*="price"]',
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
    ],
    imageSelectors: ['meta[property="og:image"]', 'meta[name="twitter:image"]', "img[src]"],
  },

  currys: {
    match: (h) => /(^|\.)currys\.co\.uk$/i.test(h),
    titleSelectors: ['meta[property="og:title"]', "h1"],
    priceSelectors: ['[data-testid*="price"]', '[class*="price"]', '[itemprop="price"]'],
    imageSelectors: ['meta[property="og:image"]', 'meta[name="twitter:image"]', "img[src]"],
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

const globalState = globalThis.__hintedPreviewState || {
  cache: new Map(),
  tasks: new Map(),
};

globalThis.__hintedPreviewState = globalState;

function cleanupState() {
  const now = Date.now();

  for (const [key, entry] of globalState.cache.entries()) {
    if (!entry || entry.expiresAt <= now) {
      globalState.cache.delete(key);
    }
  }

  for (const [key, task] of globalState.tasks.entries()) {
    if (!task || task.expiresAt <= now) {
      globalState.tasks.delete(key);
    }
  }
}

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

function cleanCanonicalUrl(inputUrl = "") {
  try {
    const url = new URL(inputUrl);
    const keep = new Set(["sku", "pid", "dp", "variant", "v", "colour", "color", "size"]);
    [...url.searchParams.keys()].forEach((key) => {
      if (!keep.has(key.toLowerCase())) url.searchParams.delete(key);
    });
    url.hash = "";
    return url.toString();
  } catch {
    return inputUrl;
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

function getCountryCodeForHost(host = "") {
  const h = String(host).toLowerCase();
  if (h.endsWith(".co.uk")) return "gb";
  if (h.endsWith(".ie")) return "ie";
  if (h.endsWith(".de")) return "de";
  if (h.endsWith(".fr")) return "fr";
  if (h.endsWith(".es")) return "es";
  if (h.endsWith(".it")) return "it";
  if (h.endsWith(".nl")) return "nl";
  if (h.endsWith(".be")) return "be";
  if (h.endsWith(".com.au")) return "au";
  if (h.endsWith(".co.nz")) return "nz";
  if (h.endsWith(".ca")) return "ca";
  if (h.endsWith(".co.za")) return "za";
  if (h.endsWith(".com")) return "us";
  return "";
}

function getRule(host = "") {
  for (const [key, rule] of Object.entries(RETAILER_RULES)) {
    if (key === "generic") continue;
    if (rule.match(host)) return { key, rule };
  }
  return { key: "generic", rule: RETAILER_RULES.generic };
}

function isPriorityRetailerHost(host = "") {
  return PRIORITY_RETAILER_PATTERNS.some((pattern) => pattern.test(host));
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
  if (val.includes("A$") || val.includes("AU$")) return "AUD";
  if (val.includes("NZ$")) return "NZD";
  if (val.includes("C$") || val.includes("CA$")) return "CAD";
  if (val.includes("US$")) return "USD";
  if (val.includes("$")) return "USD";
  if (val.includes("€")) return "EUR";
  return null;
}

function currencySymbol(code = "") {
  const map = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    AUD: "A$",
    NZD: "NZ$",
    CAD: "C$",
  };
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
    cleaned.match(/(?:A\$|NZ\$|C\$|US\$|CA\$|AU\$|£|\$|€)\s?(\d+(?:\.\d{1,2})?)/) ||
    cleaned.match(/(\d+(?:\.\d{1,2})?)/);

  if (!match) return null;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : null;
}

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

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

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
        const currency =
          offer.priceCurrency || offer.priceSpecification?.priceCurrency || "";
        const formatted = formatPrice(price, currency);
        if (formatted) {
          result.priceText = formatted;
          break;
        }
      }
    }

    if (node.image) {
      const images = []
        .concat(node.image)
        .map((img) => makeAbsolute(typeof img === "string" ? img : img.url || "", base))
        .filter(Boolean);

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

  const exactCurrency = candidates.filter(
    (c) => detectCurrency(c.value) === preferredCurrency
  );

  const explicitCurrency = candidates.filter((c) => detectCurrency(c.value));
  const pool = exactCurrency.length
    ? exactCurrency
    : explicitCurrency.length
      ? explicitCurrency
      : candidates;

  pool.sort((a, b) => b.priority - a.priority);

  const winner = pool[0];
  return {
    priceText: winner.value,
    currency: detectCurrency(winner.value),
  };
}

const BAD_IMAGE_PATTERN =
  /logo|sprite|icon|favicon|avatar|placeholder|spacer|loading|1x1|blank|transparent|trustpilot|star-rating/i;

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

function extractAmazonDynamicImage(raw = "", base = "") {
  const val = String(raw || "").trim();
  if (!val) return "";

  if (val.startsWith("{")) {
    try {
      const parsed = JSON.parse(val);
      const first = Object.keys(parsed)[0];
      if (first) return improveAmazonImage(makeAbsolute(first, base));
    } catch {}
  }

  return improveAmazonImage(makeAbsolute(val, base));
}

function getAmazonPrimaryImage($, base = "") {
  const landing = $("#landingImage").first();

  if (landing.length) {
    const direct =
      landing.attr("data-old-hires") ||
      landing.attr("data-a-dynamic-image") ||
      landing.attr("src") ||
      "";

    const parsed = extractAmazonDynamicImage(direct, base);
    if (parsed) return parsed;
  }

  const front = $("#imgBlkFront").first();
  if (front.length) {
    const direct =
      front.attr("data-old-hires") ||
      front.attr("data-a-dynamic-image") ||
      front.attr("src") ||
      "";

    const parsed = extractAmazonDynamicImage(direct, base);
    if (parsed) return parsed;
  }

  const og = $('meta[property="og:image"]').attr("content") || "";
  if (og) return improveAmazonImage(makeAbsolute(og, base));

  return "";
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
    getMeta($, [
      'meta[property="og:image"]',
      'meta[property="og:image:url"]',
      'meta[name="twitter:image"]',
    ]),
    getAttrValue($, ['link[rel="image_src"]'], "href"),
  ]
    .filter(Boolean)
    .forEach((u) => add(u, "og"));

  $("img").each((_, el) => {
    const attrs = [
      $(el).attr("src"),
      $(el).attr("data-src"),
      $(el).attr("data-old-hires"),
      $(el).attr("data-lazy-src"),
      $(el).attr("data-a-dynamic-image"),
    ].filter(Boolean);

    attrs.forEach((u) => {
      if (isAmazon && String(u).trim().startsWith("{")) {
        const parsed = extractAmazonDynamicImage(u, base);
        if (parsed) add(parsed, "dom");
      } else {
        add(u, "dom");
      }
    });
  });

  return (
    candidates
      .sort((a, b) => b.score - a.score)
      .filter((c) => c.score > -20)[0]?.url || ""
  );
}

function includesBlockedText(value = "") {
  const text = String(value).toLowerCase();
  return BLOCK_WORDS.some((word) => text.includes(word));
}

function hasProductSignals({ title, priceText, image, jsonLdTitle, jsonLdPrice, bodyText }) {
  const hasStrongPrice = Boolean(priceText || jsonLdPrice);
  const hasStrongTitle = Boolean(title || jsonLdTitle);
  const hasStrongImage = Boolean(image);

  const body = String(bodyText).toLowerCase();
  const bodyHints =
    body.includes("add to basket") ||
    body.includes("add to cart") ||
    body.includes("buy now") ||
    body.includes("in stock") ||
    body.includes("out of stock");

  return (hasStrongTitle && hasStrongPrice) || (hasStrongImage && hasStrongPrice) || bodyHints;
}

function detectBlockedPage({
  status,
  titleTag,
  h1,
  bodyText,
  priceText,
  image,
  jsonLdTitle,
  jsonLdPrice,
}) {
  const blockedByStatus = status === 403 || status === 429 || status === 500 || status === 503;

  const blockedByText =
    includesBlockedText(titleTag) ||
    includesBlockedText(h1) ||
    includesBlockedText(bodyText);

  const productSignals = hasProductSignals({
    title: titleTag,
    priceText,
    image,
    jsonLdTitle,
    jsonLdPrice,
    bodyText,
  });

  if ((blockedByStatus || blockedByText) && !productSignals) {
    return {
      blocked: true,
      blockReason: blockedByStatus ? `http-${status}` : "blocked-text",
      blockMessage: "Retailer returned a blocked or challenge page.",
    };
  }

  return { blocked: false, blockReason: null, blockMessage: "" };
}

function scoreResult(result) {
  if (!result) return -1;
  if (result.blocked) return 0;

  let score = 1;
  if (result.title && result.title !== "Shared item") score += 2;
  if (result.priceText) score += 3;
  if (result.image) score += 2;
  if (result.debug?.jsonLdTitle) score += 1;
  if (result.debug?.jsonLdPrice) score += 1;
  if (result.confidence === "high") score += 2;
  if (result.confidence === "medium") score += 1;

  return score;
}

function isGoodEnoughFastResult(result) {
  if (!result || result.blocked) return false;
  const hasTitle = Boolean(result.title && result.title !== "Shared item");
  const hasImage = Boolean(result.image);
  return hasTitle && hasImage;
}

function shouldCacheResult(result) {
  if (!result || result.blocked) return false;
  return Boolean(result.title || result.image || result.priceText);
}

function parsePage({
  html,
  finalUrl,
  status,
  provider,
  fetchProfile,
  preferredCurrency,
}) {
  const $ = cheerio.load(html);

  let canonicalUrl =
    makeAbsolute(getAttrValue($, ['link[rel="canonical"]'], "href") || "", finalUrl) ||
    finalUrl;

  canonicalUrl = cleanCanonicalUrl(canonicalUrl);

  const host = hostname(canonicalUrl);
  const { key, rule } = getRule(host);
  const isAmazon = key === "amazon";

  if (isAmazon) {
    try {
      const u = new URL(canonicalUrl);
      canonicalUrl = `${u.origin}${u.pathname}`;
    } catch {}
  }

  const bodyText = cleanText($("body").text());
  const titleTag = cleanText($("title").first().text());
  const h1 = cleanText($("h1").first().text());

  const jsonLd = extractJsonLd($, finalUrl);

  let title =
    getText($, rule.titleSelectors) ||
    jsonLd.title ||
    getMeta($, ['meta[property="og:title"]', 'meta[name="twitter:title"]']) ||
    getText($, ["h1", "title"]) ||
    "";

  if (isAmazon && title && rule.cleanTitle) {
    title = rule.cleanTitle(title);
  }

  title = cleanText(title);

  const domPrice = extractDomPrice($, rule.priceSelectors);
  const jsonLdPrice = jsonLd.priceText;
  const metaPrice = extractMetaPrice($);

  const { priceText, currency: detectedCurrency } = pickBestPrice(
    { domPrice, jsonLdPrice, metaPrice },
    preferredCurrency
  );

  const hostImage = getImageAttr($, rule.imageSelectors, finalUrl);
  const amazonPrimary = isAmazon ? getAmazonPrimaryImage($, finalUrl) : "";

  const image =
    amazonPrimary ||
    pickBestImage({
      hostImage,
      jsonLdImages: jsonLd.images,
      $,
      base: finalUrl,
      isAmazon,
    });

  const blockInfo = detectBlockedPage({
    status,
    titleTag,
    h1,
    bodyText,
    priceText,
    image,
    jsonLdTitle: jsonLd.title,
    jsonLdPrice,
  });

  const hasTitle = Boolean(title);
  const hasPrice = Boolean(priceText);
  const hasImage = Boolean(image);

  const confidence =
    hasTitle && hasPrice && hasImage
      ? "high"
      : hasTitle && (hasPrice || hasImage)
        ? "medium"
        : "low";

  return {
    url: canonicalUrl,
    title: blockInfo.blocked ? "Needs review" : title || "Shared item",
    titleShort: blockInfo.blocked ? "Needs review" : title || "Shared item",
    description: blockInfo.blocked ? blockInfo.blockMessage : "",
    siteName: host,
    image: blockInfo.blocked ? "" : image,
    selectedImage: blockInfo.blocked ? "" : image,
    imageCandidates: !blockInfo.blocked && image ? [image] : [],
    priceText: blockInfo.blocked ? "" : priceText,
    numericPrice: blockInfo.blocked ? null : extractNumericPrice(priceText),
    detectedCurrency: blockInfo.blocked ? null : detectedCurrency,
    brand: blockInfo.blocked ? "" : jsonLd.brand || "",
    confidence: blockInfo.blocked ? "low" : confidence,
    needsReview: blockInfo.blocked ? true : confidence !== "high",
    blocked: blockInfo.blocked,
    blockReason: blockInfo.blockReason,
    blockMessage: blockInfo.blockMessage,
    source: provider,
    debug: {
      fetchProfile,
      status,
      finalUrl,
      canonicalUrl,
      hostname: host,
      hostRule: key,
      titleTag,
      h1,
      bodySnippet: bodyText.slice(0, 1200),
      htmlLength: html.length,
      jsonLdTitle: jsonLd.title || "",
      jsonLdPrice,
      metaPrice,
      domPrice,
      extractedTitle: title || "",
      amazonPrimaryImage: amazonPrimary || null,
      topImageCandidate: image || null,
      productSignals: {
        hasTitle,
        hasPrice,
        hasImage,
      },
      blockSignals: {
        titleBlocked: includesBlockedText(titleTag),
        h1Blocked: includesBlockedText(h1),
        bodyBlocked: includesBlockedText(bodyText),
      },
    },
  };
}

async function fetchHtmlDirect(inputUrl, timeout = FAST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(inputUrl, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
      headers: FORWARDED_HEADERS,
    });

    const contentType = res.headers.get("content-type") || "";
    const html = await res.text();

    return {
      ok: res.ok,
      status: res.status,
      contentType,
      html: html || "",
      finalUrl: res.url || inputUrl,
      provider: "direct",
      fetchProfile: {
        method: "direct",
        timeout,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchViaScrapingBee(inputUrl, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout || ENRICH_TIMEOUT_MS);

  try {
    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) throw new Error("Missing SCRAPINGBEE_API_KEY");

    const apiUrl = new URL("https://app.scrapingbee.com/api/v1");
    apiUrl.searchParams.set("api_key", apiKey);
    apiUrl.searchParams.set("url", inputUrl);
    apiUrl.searchParams.set("transparent_status_code", "true");
    apiUrl.searchParams.set("forward_headers", "true");
    apiUrl.searchParams.set("render_js", options.renderJs ? "true" : "false");

    if (options.premiumProxy) {
      apiUrl.searchParams.set("premium_proxy", "true");
    }

    if (options.stealthProxy) {
      apiUrl.searchParams.set("stealth_proxy", "true");
      apiUrl.searchParams.set("render_js", "true");
    }

    if (options.countryCode) {
      apiUrl.searchParams.set("country_code", options.countryCode);
    }

    if (options.renderJs || options.stealthProxy) {
      apiUrl.searchParams.set("block_resources", "false");
      apiUrl.searchParams.set("wait_browser", options.waitBrowser || "networkidle0");
      apiUrl.searchParams.set("wait", String(options.wait || 2500));
    }

    const res = await fetch(apiUrl.toString(), {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Spb-User-Agent": FORWARDED_HEADERS["User-Agent"],
        "Spb-Accept": FORWARDED_HEADERS.Accept,
        "Spb-Accept-Language": FORWARDED_HEADERS["Accept-Language"],
        "Spb-Cache-Control": FORWARDED_HEADERS["Cache-Control"],
        "Spb-Pragma": FORWARDED_HEADERS.Pragma,
        "Spb-DNT": FORWARDED_HEADERS.DNT,
      },
    });

    const contentType = res.headers.get("content-type") || "text/html";
    const html = await res.text();

    return {
      ok: res.ok,
      status: res.status,
      contentType,
      html: html || "",
      finalUrl: inputUrl,
      provider: "scrapingbee",
      fetchProfile: {
        method: "scrapingbee",
        render_js: Boolean(options.renderJs || options.stealthProxy),
        premium_proxy: Boolean(options.premiumProxy),
        stealth_proxy: Boolean(options.stealthProxy),
        country_code: options.countryCode || null,
        wait: options.renderJs || options.stealthProxy ? options.wait || 2500 : 0,
        wait_browser:
          options.renderJs || options.stealthProxy
            ? options.waitBrowser || "networkidle0"
            : "",
        timeout: options.timeout || ENRICH_TIMEOUT_MS,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

async function tryFetchAndParseWithFetcher(fetcher, inputUrl, preferredCurrency, options = {}) {
  const fetched = await fetcher(inputUrl, options);

  if (!String(fetched.contentType || "").includes("text/html")) {
    return {
      fatal: true,
      error: "URL did not return an HTML page.",
      fetched,
    };
  }

  if (!String(fetched.html || "").trim()) {
    return {
      fatal: true,
      error: "Empty response from page.",
      fetched,
    };
  }

  const result = parsePage({
    html: fetched.html,
    finalUrl: fetched.finalUrl,
    status: fetched.status,
    provider: fetched.provider,
    fetchProfile: fetched.fetchProfile,
    preferredCurrency,
  });

  return { fatal: false, result, fetched };
}

function makeCacheKey(inputUrl, preferredCurrency = "GBP") {
  const normalized = cleanCanonicalUrl(ensureHttpUrl(inputUrl));
  return `${normalized}::${String(preferredCurrency || "GBP").toUpperCase()}`;
}

function getCachedPreview(cacheKey) {
  cleanupState();
  const entry = globalState.cache.get(cacheKey);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    globalState.cache.delete(cacheKey);
    return null;
  }
  return entry.value;
}

function setCachedPreview(cacheKey, value) {
  globalState.cache.set(cacheKey, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function createTask({ inputUrl, preferredCurrency, cacheKey }) {
  const taskId = crypto.randomUUID();
  const now = Date.now();

  const task = {
    id: taskId,
    inputUrl,
    preferredCurrency,
    cacheKey,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    expiresAt: now + TASK_TTL_MS,
    result: null,
    error: null,
  };

  globalState.tasks.set(taskId, task);
  return task;
}

function getTask(taskId) {
  cleanupState();
  const task = globalState.tasks.get(taskId);
  if (!task) return null;
  if (task.expiresAt <= Date.now()) {
    globalState.tasks.delete(taskId);
    return null;
  }
  return task;
}

function findActiveTaskByCacheKey(cacheKey) {
  cleanupState();
  for (const task of globalState.tasks.values()) {
    if (task.cacheKey === cacheKey && (task.status === "pending" || task.status === "processing")) {
      return task;
    }
  }
  return null;
}

function updateTask(taskId, patch) {
  const current = globalState.tasks.get(taskId);
  if (!current) return null;

  const next = {
    ...current,
    ...patch,
    updatedAt: Date.now(),
    expiresAt: Date.now() + TASK_TTL_MS,
  };

  globalState.tasks.set(taskId, next);
  return next;
}

function publicTask(task) {
  return {
    taskId: task.id,
    status: task.status,
    result: task.result,
    error: task.error,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function makePendingBody(task, preview = null) {
  return {
    taskId: task.id,
    status: task.status,
    preview,
  };
}

function makeStatusUrl(request, taskId) {
  const url = new URL(request.url);
  url.search = "";
  url.searchParams.set("taskId", taskId);
  return url.toString();
}

async function enrichPreviewInBackground(taskId) {
  const task = getTask(taskId);
  if (!task) return;

  updateTask(taskId, { status: "processing", error: null });

  try {
    const host = hostname(task.inputUrl);
    const countryCode = getCountryCodeForHost(host);
    const isPriorityRetailer = isPriorityRetailerHost(host);
    const isEtsy = /(^|\.)etsy\.com$/i.test(host);

    const attempts = [];

    if (isEtsy) {
      attempts.push({
        name: "premium",
        fetcher: fetchViaScrapingBee,
        options: {
          renderJs: false,
          premiumProxy: true,
          countryCode,
          timeout: 15000,
        },
      });
    } else {
      attempts.push({
        name: "premium",
        fetcher: fetchViaScrapingBee,
        options: {
          renderJs: false,
          premiumProxy: true,
          countryCode,
          timeout: 15000,
        },
      });

      if (isPriorityRetailer) {
        attempts.push({
          name: "js-premium",
          fetcher: fetchViaScrapingBee,
          options: {
            renderJs: true,
            premiumProxy: true,
            countryCode,
            wait: 2000,
            waitBrowser: "networkidle0",
            timeout: 18000,
          },
        });
      }

      if (isPriorityRetailer && /(^|\.)amazon\./i.test(host)) {
        attempts.push({
          name: "stealth",
          fetcher: fetchViaScrapingBee,
          options: {
            stealthProxy: true,
            countryCode: countryCode || "us",
            wait: 2500,
            waitBrowser: "networkidle0",
            timeout: 20000,
          },
        });
      }
    }

    let bestResult = null;
    const attemptsDebug = [];

    for (const attempt of attempts) {
      try {
        const outcome = await tryFetchAndParseWithFetcher(
          attempt.fetcher,
          task.inputUrl,
          task.preferredCurrency,
          attempt.options
        );

        if (outcome.fatal) {
          attemptsDebug.push({
            name: attempt.name,
            fatal: true,
            error: outcome.error,
          });
          continue;
        }

        const result = outcome.result;

        attemptsDebug.push({
          name: attempt.name,
          fatal: false,
          blocked: result.blocked,
          confidence: result.confidence,
          title: result.title,
          priceText: result.priceText,
          image: Boolean(result.image),
        });

        if (!bestResult || scoreResult(result) > scoreResult(bestResult)) {
          bestResult = result;
        }

        if (result.confidence === "high") break;
      } catch (err) {
        attemptsDebug.push({
          name: attempt.name,
          fatal: true,
          error: err?.message || "Fetch error",
        });
      }
    }

    if (!bestResult) {
      throw new Error("Could not enrich preview.");
    }

    bestResult.debug = {
      ...(bestResult.debug || {}),
      attempts: attemptsDebug,
      mode: "background-enrich",
    };

    if (shouldCacheResult(bestResult)) {
      setCachedPreview(task.cacheKey, bestResult);
    }

    updateTask(taskId, {
      status: "completed",
      result: bestResult,
      error: null,
    });
  } catch (err) {
    updateTask(taskId, {
      status: "failed",
      error: err?.message || "Preview enrichment failed.",
    });
  }
}

function fallbackResult(inputUrl, message = "Could not fetch page details.") {
  const host = (() => {
    try {
      return new URL(inputUrl).hostname.replace(/^www\./i, "");
    } catch {
      return "";
    }
  })();

  return {
    url: inputUrl,
    title: "Needs review",
    titleShort: "Needs review",
    description: message,
    siteName: host,
    image: "",
    selectedImage: "",
    imageCandidates: [],
    priceText: "",
    numericPrice: null,
    detectedCurrency: null,
    brand: "",
    confidence: "low",
    needsReview: true,
    blocked: false,
    blockReason: null,
    blockMessage: "",
    source: "fallback",
    debug: {
      error: message,
    },
  };
}

export async function POST(request) {
  cleanupState();

  try {
    const body = await request.json().catch(() => null);
    const inputUrl = ensureHttpUrl(body?.url || "");
    const preferredCurrency = String(body?.currency || "GBP").toUpperCase();

    if (!inputUrl) {
      return NextResponse.json({ error: "Please provide a valid URL." }, { status: 400 });
    }

    const cacheKey = makeCacheKey(inputUrl, preferredCurrency);
    const cached = getCachedPreview(cacheKey);

    if (cached) {
      return NextResponse.json(
        {
          status: "completed",
          source: "cache",
          result: cached,
        },
        { status: 200 }
      );
    }

    try {
      const fastOutcome = await tryFetchAndParseWithFetcher(
        (url, options) => fetchHtmlDirect(url, options.timeout || FAST_TIMEOUT_MS),
        inputUrl,
        preferredCurrency,
        { timeout: FAST_TIMEOUT_MS }
      );

      if (!fastOutcome.fatal) {
        const fastResult = fastOutcome.result;

        if (shouldCacheResult(fastResult)) {
          setCachedPreview(cacheKey, fastResult);
        }

        if (isGoodEnoughFastResult(fastResult)) {
          return NextResponse.json(
            {
              status: "completed",
              source: "fast",
              result: fastResult,
            },
            { status: 200 }
          );
        }

        const existingTask = findActiveTaskByCacheKey(cacheKey);
        const task =
          existingTask ||
          createTask({
            inputUrl,
            preferredCurrency,
            cacheKey,
          });

        if (!existingTask) {
          void enrichPreviewInBackground(task.id);
        }

        const response = NextResponse.json(makePendingBody(task, fastResult), {
          status: 202,
        });

        response.headers.set("Location", makeStatusUrl(request, task.id));
        response.headers.set("Retry-After", String(POLL_RETRY_AFTER_SECONDS));
        return response;
      }
    } catch {}

    const existingTask = findActiveTaskByCacheKey(cacheKey);
    const task =
      existingTask ||
      createTask({
        inputUrl,
        preferredCurrency,
        cacheKey,
      });

    if (!existingTask) {
      void enrichPreviewInBackground(task.id);
    }

    const response = NextResponse.json(makePendingBody(task, fallbackResult(inputUrl, "Fetching preview...")), {
      status: 202,
    });

    response.headers.set("Location", makeStatusUrl(request, task.id));
    response.headers.set("Retry-After", String(POLL_RETRY_AFTER_SECONDS));
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  cleanupState();

  const taskId = request.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "Missing taskId." }, { status: 400 });
  }

  const task = getTask(taskId);

  if (!task) {
    return NextResponse.json({ error: "Task not found or expired." }, { status: 404 });
  }

  if (task.status === "completed") {
    return NextResponse.json(publicTask(task), { status: 200 });
  }

  if (task.status === "failed") {
    return NextResponse.json(publicTask(task), { status: 200 });
  }

  const response = NextResponse.json(publicTask(task), { status: 202 });
  response.headers.set("Retry-After", String(POLL_RETRY_AFTER_SECONDS));
  return response;
}
