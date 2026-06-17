import { NextResponse } from "next/server";

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

function extractMeta(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtml(stripTags(match[1]));
    }
  }
  return "";
}

function extractFirstImage(html, baseUrl) {
  const image = extractMeta(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image:src["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image:src["'][^>]*>/i,
  ]);

  return makeAbsoluteUrl(image, baseUrl);
}

function extractCanonical(html, baseUrl) {
  const canonical = extractMeta(html, [
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i,
    /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["'][^>]*>/i,
    /<meta[^>]+name=["']og:url["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']og:url["'][^>]*>/i,
  ]);

  return makeAbsoluteUrl(canonical, baseUrl) || baseUrl;
}

function extractTitle(html, baseUrl) {
  return (
    extractMeta(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i,
      /<meta[^>]+name=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']og:title["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["'][^>]*>/i,
      /<title[^>]*>([\s\S]*?)<\/title>/i,
    ]) || getHostnameLabel(baseUrl)
  );
}

function extractDescription(html) {
  return extractMeta(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["'][^>]*>/i,
    /<meta[^>]+name=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']og:description["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:description["'][^>]*>/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i,
  ]);
}

function extractSiteName(html, canonicalUrl) {
  return (
    extractMeta(html, [
      /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["'][^>]*>/i,
      /<meta[^>]+name=["']og:site_name["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']og:site_name["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:site["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:site["'][^>]*>/i,
      /<meta[^>]+name=["']application-name["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']application-name["'][^>]*>/i,
    ]) || getHostnameLabel(canonicalUrl)
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawUrl = body?.url?.trim();

    if (!rawUrl) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const targetUrl =
      rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `https://${rawUrl}`;

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
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Could not fetch that URL" }, { status: 400 });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        {
          error: "That URL did not return an HTML page",
        },
        { status: 400 }
      );
    }

    const finalUrl = response.url || parsedTarget.toString();
    const html = await response.text();

    const canonical = extractCanonical(html, finalUrl);
    const title = extractTitle(html, canonical);
    const description = extractDescription(html);
    const image = extractFirstImage(html, canonical);
    const siteName = extractSiteName(html, canonical);

    return NextResponse.json({
      url: canonical,
      title,
      description,
      siteName,
      image,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to build preview",
      },
      { status: 500 }
    );
  }
}
