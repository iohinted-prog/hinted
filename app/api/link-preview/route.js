import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#47;/gi, "/")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanText(value = "") {
  return decodeHtml(stripTags(String(value))).trim();
}

function makeAbsoluteUrl(value, base) {
  if (!value) return "";
  try {
    return new URL(value, base).toString();
  } catch {
    return "";
  }
}

function getHostnameLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function ensureHttpUrl(rawUrl = "") {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

function stripAmazonParams(url) {
  try {
    const parsed = new URL(url);
    const keep = new URL(parsed.origin + parsed.pathname);
    return keep.toString();
  } catch {
    return url;
  }
}

function getMeta($, selectors = []) {
  for (const selector of selectors) {
    const value = $(selector).attr("content");
    if (value) {
      const cleaned = cleanText(value);
      if (cleaned) return cleaned;
    }
  }
  return "";
}

function getAttr($, selectors = [], attr = "content") {
  for (const selector of selectors) {
    const value = $(selector).attr(attr);
    if (value) {
      const cleaned = String(value).trim();
      if (cleaned) return cleaned;
    }
  }
  return "";
}

function getText($, selectors = []) {
  for (const selector of selectors) {
    const value = $(selector).first().text();
    const cleaned = cleanText(value);
    if (cleaned) return cleaned;
  }
  return "";
}

function extractCanonical($, fallbackUrl) {
  const canonical =
    getAttr($, ['link[rel="canonical"]'], "href") ||
    getMeta($, ['meta[property="og:url"]', 'meta[name="og:url"]']);

  return makeAbsoluteUrl(canonical, fallbackUrl) || fallbackUrl;
}

function cleanAmazonTitle(title = "") {
  return title
    .replace(/\s*:\s*Amazon\.[A-Za-z.]+.*$/i, "")
    .replace(/\s*\|\s*Amazon\.[A-Za-z.]+.*$/i, "")
    .replace(/\s+-\s+Amazon\.[A-Za-z.]+.*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractTitle($, canonicalUrl) {
  const hostname = getHostnameLabel(canonicalUrl);

  let title =
    getText($, ["#productTitle"]) ||
    getMeta($, [
      'meta[property="og:title"]',
      'meta[name="og:title"]',
      'meta[name="twitter:title"]',
      'meta[name="title"]',
    ]) ||
    getText($, ["title"]) ||
    hostname;

  if (hostname.includes("amazon.")) {
    title = cleanAmazonTitle(title);
  }

  return title || hostname;
}

function extractDescription($, canonicalUrl) {
  const hostname = getHostnameLabel(canonicalUrl);

  let description =
    getMeta($, [
      'meta[property="og:description"]',
      'meta[name="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]) ||
    getText($, ["#feature-bullets", "#bookDescription_feature_div", "#productDescription"]) ||
    "";

  if (hostname.includes("amazon.") && /^amazon$/i.test(description)) {
    description = "";
  }

  return description;
}

function improveAmazonImage(url = "") {
  if (!url) return "";
  return url
    .replace(/\._AC_[A-Z0-9,]+_\./i, "._AC_SL1500_.")
    .replace(/\._SL\d+_\./i, "._SL1500_.")
    .replace(/\._SX\d+_\./i, "._SL1500_.")
    .replace(/\._SY\d+_\./i, "._SL1500_.");
}

function extractImage($, baseUrl, canonicalUrl) {
  const hostname = getHostnameLabel(canonicalUrl);

  let image =
    getAttr($, ["#landingImage"], "src") ||
    getAttr($, ["#imgBlkFront"], "src") ||
    getAttr($, ["#ebooksImgBlkFront"], "src") ||
    getMeta($, [
      'meta[property="og:image"]',
      'meta[property="og:image:url"]',
      'meta[name="og:image"]',
      'meta[name="twitter:image"]',
      'meta[name="twitter:image:src"]',
    ]) ||
    "";

  image = makeAbsoluteUrl(image, baseUrl);

  if (hostname.includes("amazon.")) {
    image = improveAmazonImage(image);
    if (image && /logo|nav|icon/i.test(image)) {
      image = "";
    }
  }

  return image;
}

function extractSiteName($, canonicalUrl) {
  return (
    getMeta($, [
      'meta[property="og:site_name"]',
      'meta[name="og:site_name"]',
      'meta[name="twitter:site"]',
      'meta[name="application-name"]',
    ]) || getHostnameLabel(canonicalUrl)
  );
}

function currencySymbolFromCode(code = "") {
  const upper = code.toUpperCase();
  if (upper === "GBP") return "£";
  if (upper === "USD") return "$";
  if (upper === "EUR") return "€";
  return upper ? `${upper} ` : "";
}

function formatPrice(value, currency = "") {
  const cleaned = String(value || "").replace(/,/g, "").trim();
  if (!cleaned) return "";
  const symbol = currencySymbolFromCode(currency);
  if (symbol && !cleaned.startsWith(symbol)) return `${symbol}${cleaned}`;
  return cleaned;
}

function extractPriceFromMeta($) {
  const directPrice =
    getMeta($, [
      'meta[property="product:price:amount"]',
      'meta[name="product:price:amount"]',
      'meta[property="og:price:amount"]',
      'meta[name="og:price:amount"]',
      'meta[property="twitter:data1"]',
    ]) || "";

  const currency =
    getMeta($, [
      'meta[property="product:price:currency"]',
      'meta[name="product:price:currency"]',
      'meta[property="og:price:currency"]',
      'meta[name="og:price:currency"]',
    ]) || "GBP";

  if (directPrice) return formatPrice(directPrice, currency);
  return "";
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function pickPriceFromOffer(offer) {
  if (!offer || typeof offer !== "object") return "";

  if (offer.price) return formatPrice(offer.price, offer.priceCurrency);

  if (offer.priceSpecification && typeof offer.priceSpecification === "object") {
    const spec = offer.priceSpecification;
    if (spec.price) return formatPrice(spec.price, spec.priceCurrency || offer.priceCurrency);
    if (spec.minPrice) return formatPrice(spec.minPrice, spec.priceCurrency || offer.priceCurrency);
  }

  if (offer.lowPrice) return formatPrice(offer.lowPrice, offer.priceCurrency);

  return "";
}

function findPriceInJsonLdNode(node) {
  if (!node) return "";
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findPriceInJsonLdNode(item);
      if (found) return found;
    }
    return "";
  }

  if (typeof node !== "object") return "";

  if (node.offers) {
    const offers = Array.isArray(node.offers) ? node.offers : [node.offers];
    for (const offer of offers) {
      const found = pickPriceFromOffer(offer);
      if (found) return found;
    }
  }

  if (node["@graph"]) {
    const found = findPriceInJsonLdNode(node["@graph"]);
    if (found) return found;
  }

  if (node.price) return formatPrice(node.price, node.priceCurrency);

  for (const value of Object.values(node)) {
    if (typeof value === "object") {
      const found = findPriceInJsonLdNode(value);
      if (found) return found;
    }
  }

  return "";
}

function extractPriceFromJsonLd($) {
  const scripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < scripts.length; i += 1) {
    const raw = $(scripts[i]).contents().text();
    if (!raw) continue;
    const parsed = safeJsonParse(raw);
    if (!parsed) continue;
    const found = findPriceInJsonLdNode(parsed);
    if (found) return found;
  }

  return "";
}

function extractPriceFromHtml($, html, canonicalUrl) {
  const amazonPrice =
    getText($, [
      ".a-price .a-offscreen",
      "#corePrice_feature_div .a-offscreen",
      "#price_inside_buybox",
      "#kindle-price",
    ]) || "";

  if (amazonPrice) return amazonPrice;

  const patterns = [
    /£\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/i,
    /\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/i,
    /€\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[0]) return match[0].replace(/\s+/g, "");
  }

  return "";
}

function extractPrice($, html, canonicalUrl) {
  return extractPriceFromMeta($) || extractPriceFromJsonLd($) || extractPriceFromHtml($, html, canonicalUrl) || "";
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawUrl = body?.url || "";
    const targetUrl = ensureHttpUrl(rawUrl);

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    let parsedTarget;
    try {
      parsedTarget = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const response = await fetch(parsedTarget.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HintedLinkPreviewBot/1.0; +https://hinted.io)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Could not fetch that URL" }, { status: 400 });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json({ error: "That URL did not return an HTML page" }, { status: 400 });
    }

    const finalUrl = response.url || parsedTarget.toString();
    const html = await response.text();
    const $ = cheerio.load(html);

    let canonical = extractCanonical($, finalUrl);
    if (getHostnameLabel(canonical).includes("amazon.")) {
      canonical = stripAmazonParams(canonical);
    }

    const title = extractTitle($, canonical);
    const description = extractDescription($, canonical);
    const image = extractImage($, canonical, canonical);
    const siteName = extractSiteName($, canonical);
    const price = extractPrice($, html, canonical);

    return NextResponse.json({
      url: canonical,
      title,
      description,
      siteName,
      image,
      price,
    });
  } catch {
    return NextResponse.json({ error: "Unable to build preview" }, { status: 500 });
  }
}
