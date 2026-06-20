import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
    url.hash = "";
    return url.toString();
  } catch {
    return inputUrl;
  }
}

function hostname(url = "") {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function detectCurrency(val = "") {
  if (!val) return null;
  if (val.includes("£")) return "GBP";
  if (val.includes("A$")) return "AUD";
  if (val.includes("NZ$")) return "NZD";
  if (val.includes("C$")) return "CAD";
  if (val.includes("$")) return "USD";
  if (val.includes("€")) return "EUR";
  return null;
}

function extractNumericPrice(val = "") {
  const cleaned = String(val).replace(/,/g, "");
  const match =
    cleaned.match(/(?:A\$|NZ\$|C\$|£|\$|€)\s?(\d+(?:\.\d{1,2})?)/) ||
    cleaned.match(/(\d+(?:\.\d{1,2})?)/);

  if (!match) return null;

  const num = Number(match[1]);
  return Number.isFinite(num) ? num : null;
}

function normalisePriceText(raw = "") {
  const value = String(raw || "").trim();
  if (!value) return "";
  return value;
}

function buildFallbackResponse(inputUrl = "", message = "Could not fetch page details.") {
  const safeUrl = cleanCanonicalUrl(inputUrl);
  const host = hostname(safeUrl);

  return {
    url: safeUrl,
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
    source: "linkpreview",
    debug: {
      error: message,
    },
  };
}

async function fetchLinkPreview(inputUrl) {
  const apiKey = process.env.LINKPREVIEW_API_KEY;

  if (!apiKey) {
    throw new Error("Missing LINKPREVIEW_API_KEY");
  }

  const apiUrl = new URL("https://api.linkpreview.net/preview");
  apiUrl.searchParams.set("url", inputUrl);
  apiUrl.searchParams.set("key", apiKey);

  const res = await fetch(apiUrl.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const raw = await res.text();

  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error("LinkPreview returned invalid JSON.");
  }

  if (!res.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `LinkPreview request failed with status ${res.status}`
    );
  }

  return {
    status: res.status,
    data,
  };
}

function mapLinkPreviewResult(inputUrl, payload, preferredCurrency = "GBP") {
  const finalUrl = cleanCanonicalUrl(payload?.url || inputUrl);
  const siteName = String(payload?.site_name || "").trim() || hostname(finalUrl);

  const title = String(payload?.title || "").trim();
  const description = String(payload?.description || "").trim();
  const image = String(payload?.image || "").trim();

  const rawPrice =
    String(payload?.price || "").trim() ||
    String(payload?.amount || "").trim() ||
    String(payload?.priceText || "").trim();

  const priceText = normalisePriceText(rawPrice);
  const numericPrice = extractNumericPrice(priceText);
  const detectedCurrency = detectCurrency(priceText);

  const hasTitle = Boolean(title);
  const hasImage = Boolean(image);
  const hasPrice = Boolean(priceText);

  const confidence =
    hasTitle && hasImage
      ? "high"
      : hasTitle || hasImage
        ? "medium"
        : "low";

  return {
    url: finalUrl,
    title: title || "Shared item",
    titleShort: title || "Shared item",
    description: description || "",
    siteName,
    image,
    selectedImage: image,
    imageCandidates: image ? [image] : [],
    priceText: detectedCurrency === preferredCurrency ? priceText : "",
    numericPrice: detectedCurrency === preferredCurrency ? numericPrice : null,
    detectedCurrency: detectedCurrency === preferredCurrency ? detectedCurrency : null,
    brand: "",
    confidence,
    needsReview: !(hasTitle && hasImage),
    blocked: false,
    blockReason: null,
    blockMessage: "",
    source: "linkpreview",
    debug: {
      provider: "linkpreview",
      finalUrl,
      hostname: hostname(finalUrl),
      rawPayload: payload,
      productSignals: {
        hasTitle,
        hasImage,
        hasPrice,
      },
    },
  };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const inputUrl = ensureHttpUrl(body?.url || "");
    const preferredCurrency = String(body?.currency || "GBP").toUpperCase();

    if (!inputUrl) {
      return NextResponse.json(
        { error: "Please provide a valid URL." },
        { status: 400 }
      );
    }

    try {
      const preview = await fetchLinkPreview(inputUrl);
      const result = mapLinkPreviewResult(
        inputUrl,
        preview.data,
        preferredCurrency
      );

      console.log(
        JSON.stringify({
          type: "link-preview-debug",
          inputUrl,
          preferredCurrency,
          source: result.source,
          title: result.title,
          image: result.image,
          priceText: result.priceText,
          debug: result.debug,
        })
      );

      return NextResponse.json(result, { status: 200 });
    } catch (previewError) {
      console.log(
        JSON.stringify({
          type: "link-preview-error",
          inputUrl,
          preferredCurrency,
          error: previewError?.message || "Fetch error",
        })
      );

      return NextResponse.json(
        buildFallbackResponse(
          inputUrl,
          previewError?.message || "Could not fetch page details."
        ),
        { status: 200 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}
