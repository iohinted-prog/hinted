import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const HEADER_PROFILE = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-GB,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  DNT: "1",
};

const PRICE_REGEX =
  /(?:A\$|NZ\$|C\$|£|\$|€|R)\s?\d[\d,]*(?:\.\d{1,2})?|\d[\d,]*(?:\.\d{1,2})?\s?(?:GBP|USD|EUR|AUD|NZD|CAD|ZAR)/gi;

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
    const 
