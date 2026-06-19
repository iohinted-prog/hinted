import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const REQUEST_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; HintedLinkPreviewBot/1.0; +https://hinted.io)",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-GB,en;q=0.9",
};

function decodeHtml(value = "") {
  return String(value)
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#47;/gi, "/")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanText(value = "") {
  return decodeHtml(stripTags(String(value))).trim();
}

function ensureHttpUrl(rawUrl = "") {
  const trimmed = String(rawUrl).trim();
  if (!trimmed) return "";

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function makeAbsoluteUrl(value = "", base = "") {
  if (!value) return "";
  try {
    return new URL(value, base).toString();
  } catch {
    return "";
  }
}

function getHostnameLabel(url = "") {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function stripAmazonParams(url = "") {
  try {
    const parsed = new URL(url);
    return new URL(`${parsed.origin}${parsed.pathname}`).toString();
  } catch {
    return url;
  }
}

function getMeta($, selectors = []) {
  for (const selector of selectors) {
    const value = $(selector).attr("content");
    const cleaned = cleanText(value || "");
    if (cleaned) return cleaned;
  }
  return "";
}

function getAttr($, selectors = [], attr = "content") {
  for (const selector of selectors) {
    const value = $(selector).attr(attr);
    const cleaned = String(value || "").trim();
    if (cleaned) return cleaned;
  }
  return "";
}

function getText($, selectors = []) {
  for (const selector of selectors) {
    const value = $(selector).first().text();
    const cleaned = cleanText(value || "");
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
  return String(title)
    .replace(/\s*:\s*Amazon\.[A-Za-z.]+.*$/i, "")
    .replace(/\s*\|\s*Amazon\.[A-Za-z.]+.*$/i, "")
    .replace(/\s*-\s*Amazon\.[A-Za-z.]+.*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractTitle($, canonicalUrl) {
  const hostname = getHostnameLabel(canonicalUrl);

  let title =
    getText($, ["#productTitle", "h1"]) ||
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

  return title || hostname || "Shared item";
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
    getText($, ["#feature-bullets", "#bookDescription_feature_div", "#productDescription", "main p"]) ||
    "";

  if (hostname.includes("amazon.") && /^amazon$/i.test(description)) {
    description = "";
  }

  return description;
}

function improveAmazonImage(url = "") {
  return String(url)
    .replace(/\._AC_[A-Z0-9,]+_\./i, "._AC_SL1500_.")
    .replace(/\._SL\d+_\./i, "._SL1500_.")
    .replace(/\._SX\d+_\./i, "._SL1500_.")
    .replace(/\._SY\d+_\./i, "._SL1500_.");
}

function looksLikeBadImage(url = "") {
  return /logo|sprite|icon|favicon|avatar|placeholder|spacer/i.test(url);
}

function extractImage($, baseUrl, canonicalUrl) {
  const hostname = getHostnameLabel(canonicalUrl);

  let image =
    getAttr($, ["#landingImage", "#imgBlkFront", "#ebooksImgBlkFront"], "src") ||
    getMeta($, [
      'meta[property="og:image"]',
      'meta[property="og:image:url"]',
      'meta[name="og:image"]',
      'meta[name="twitter:image"]',
      'meta[name="twitter:image:src"]',
    ]) ||
    getAttr($, ['link[rel="image_src"]'], "href") ||
    getAttr($, ["img"], "src") ||
    "";

  image = makeAbsoluteUrl(image, baseUrl);

  if (hostname.includes("amazon.")) {
    image = improveAmazonImage(image);
  }

  if (looksLikeBadImage(image)) {
    return "";
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
  const upper = String(code).toUpperCase();
  if (upper === "GBP") return "£";
  if (upper === "USD") return "$";
  if (upper === "EUR") return "€";
  if (upper === "AUD") return "A$";
  if (upper === "NZD") return "NZ$";
  if (upper === "CAD") return "C$";
  if (upper === "ZAR") return "R";
  return "";
}

function normalisePriceNumber(value = "") {
  const cleaned = String(value).replace(/,/g, "").trim();
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  return parsed % 1 === 0 ? String(parsed) : parsed.toFixed(2).replace(/\.00$/, "");
}

function formatPrice(value = "", currency = "") {
  const amount = normalisePriceNumber(value);
  if (!amount) return "";

  const symbol = currencySymbolFromCode(currency);
  return symbol ? `${symbol}${amount}` : amount;
}

function extractPriceFromMeta($) {
  const directPrice =
    getMeta($, [
      'meta[property="product:price:amount"]',
      'meta[name="product:price:amount"]',
      'meta[property="og:price:amount"]',
      'meta[name="og:price:amount"]',
      'meta[property="twitter:data1"]',
      'meta[name="twitter:data1"]',
    ]) || "";

  const currency =
    getMeta($, [
      'meta[property="product:price:currency"]',
      'meta[name="product:price:currency"]',
      'meta[property="og:price:currency"]',
      'meta[name="og:price:currency"]',
    ]) || "GBP";

  if (!directPrice) return "";
  return formatPrice(directPrice, currency);
}

function safeJsonParse(value = "") {
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

  if (node.price) {
    const direct = formatPrice(node.price, node.priceCurrency);
    if (direct) return direct;
  }

  for (const value of Object.values(node)) {
    if (typeof value === "object" && value !== null) {
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

