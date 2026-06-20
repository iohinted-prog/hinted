import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

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

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const inputUrl = ensureHttpUrl(body?.url || "");

    if (!inputUrl) {
      return NextResponse.json(
        { error: "Please provide a valid URL." },
        { status: 400 }
      );
    }

    const response = await fetch(inputUrl, {
      method: "GET",
      headers: HEADERS,
      redirect: "follow",
      cache: "no-store",
    });

    const finalUrl = response.url || inputUrl;
    const contentType = response.headers.get("content-type") || "";
    const html = await response.text();
    const $ = cheerio.load(html);

    return NextResponse.json({
      debugVersion: "link-preview-debug-1",
      ok: response.ok,
      status: response.status,
      inputUrl,
      finalUrl,
      contentType,
      htmlLength: html.length,
      titleTag: cleanText($("title").first().text()),
      h1: cleanText($("h1").first().text()),
      canonical: cleanText($('link[rel="canonical"]').attr("href") || ""),
      ogTitle: cleanText($('meta[property="og:title"]').attr("content") || ""),
      ogImage: cleanText($('meta[property="og:image"]').attr("content") || ""),
      bodySnippet: cleanText($("body").text()).slice(0, 2000),
    });
  } catch (error) {
    return NextResponse.json(
      {
        debugVersion: "link-preview-debug-1",
        error: error?.message || "Debug fetch failed.",
      },
      { status: 500 }
    );
  }
}
