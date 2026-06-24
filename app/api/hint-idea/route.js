import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractJson(text = "") {
  const trimmed = String(text || "").trim();

  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {}

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function cleanTitle(value = "", fallback = "Saved hint") {
  const text = String(value || "").trim();
  return text || fallback;
}

function cleanRetailer(value = "") {
  const text = String(value || "").trim();
  return text || "Idea";
}

function cleanImage(value = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.startsWith("http://") || text.startsWith("https://") ? text : "";
}

function parseNumericPrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const text = String(value || "").replace(/,/g, "");
  const match = text.match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPriceText(currency = "GBP", amount = null, fallback = "") {
  if (fallback && String(fallback).trim()) return String(fallback).trim();
  if (amount == null) return "";

  const symbols = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    ZAR: "R",
  };

  const symbol = symbols[currency] || "£";
  return `From ${symbol}${Math.round(amount).toLocaleString("en-GB")}`;
}

function buildImagePrompt(prompt, title) {
  return [
    "Create a warm, tasteful, realistic editorial-style image for a gift idea card.",
    `Gift idea: ${prompt}.`,
    `Display title: ${title}.`,
    "Single subject or clear scene, premium lifestyle photography look, soft natural light, clean composition.",
    "No text, no logos, no watermark, no collage, no split screen.",
  ].join(" ");
}

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const prompt = String(body?.prompt || "").trim();
    const currency = String(body?.currency || "GBP").trim().toUpperCase();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const textResult = await client.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You create gift hint suggestions for a consumer gifting app. " +
                "Return one concise JSON object only, no markdown. " +
                "You must estimate, not pretend to know exact live prices. " +
                "Choose a short gift-card-friendly title. " +
                "Allowed keys: title, retailer, priceText, numericPrice, currency. " +
                "retailer should be a soft label like 'Travel idea', 'Experience idea', 'Home idea', 'Fashion idea', or 'Gift idea'. " +
                "numericPrice must be a single rough estimate number. " +
                "priceText must be a human phrase like 'From £1800' or 'Around £120'.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Prompt: ${prompt}\nCurrency: ${currency}`,
            },
          ],
        },
      ],
    });

    const rawText =
      textResult.output_text ||
      textResult.output?.map((item) => item?.content?.map((c) => c?.text).join(" ")).join(" ") ||
      "";

    const parsed = extractJson(rawText) || {};
    const title = cleanTitle(parsed.title, prompt);
    const retailer = cleanRetailer(parsed.retailer);
    const numericPrice = parseNumericPrice(parsed.numericPrice ?? parsed.priceText);
    const finalCurrency = String(parsed.currency || currency || "GBP").toUpperCase();
    const priceText = formatPriceText(finalCurrency, numericPrice, parsed.priceText);

    let image = "";

    try {
      const imageResult = await client.images.generate({
        model: "gpt-image-1",
        prompt: buildImagePrompt(prompt, title),
        size: "1024x1024",
      });

      image = imageResult?.data?.[0]?.url || "";
    } catch {
      image = "";
    }

    return NextResponse.json({
      title,
      retailer,
      image: cleanImage(image),
      numericPrice,
      priceText,
      currency: finalCurrency,
      source: "ai-idea",
      needsReview: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not generate hint idea.",
      },
      { status: 500 }
    );
  }
}
