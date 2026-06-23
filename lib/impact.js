import { errorToMessage } from "./products";

const IMPACT_BASE_URL = process.env.IMPACT_BASE_URL || "https://api.impact.com";

function getImpactCredentials() {
  const accountSid = process.env.IMPACT_ACCOUNT_SID;
  const authToken = process.env.IMPACT_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Missing Impact credentials.");
  }

  return { accountSid, authToken };
}

function getImpactAuthHeader() {
  const { accountSid, authToken } = getImpactCredentials();
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function impactFetch(path, options = {}) {
  const response = await fetch(`${IMPACT_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: getImpactAuthHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data?.message || data?.error || `Impact request failed (${response.status})`
    );
  }

  return data;
}

export function normalizeImpactProduct(item) {
  const numericPrice =
    typeof item?.Price === "number"
      ? item.Price
      : typeof item?.CurrentPrice === "number"
      ? item.CurrentPrice
      : null;

  return {
    id: String(item?.Id || item?.ProductId || item?.id || crypto.randomUUID()),
    title: item?.Name || item?.Title || item?.ProductName || "Gift idea",
    retailer: item?.Brand || item?.AdvertiserName || item?.Merchant || "",
    description: item?.Description || "",
    short_note: "",
    price_text: item?.PriceText || item?.FormattedPrice || "",
    numeric_price: numericPrice,
    currency: item?.Currency || "GBP",
    image_url: item?.ImageUrl || item?.ImageURL || item?.image_url || "",
    product_url: item?.Url || item?.ProductUrl || "",
    affiliate_url: item?.TrackingUrl || "",
    interest_tags: [],
    occasion_tags: [],
    is_active: true,
    network: "impact",
    advertiser_id: item?.AdvertiserId ? String(item.AdvertiserId) : null,
    campaign_id: item?.CampaignId ? String(item.CampaignId) : null,
    catalog_id: item?.CatalogId ? String(item.CatalogId) : null,
    raw_payload: item,
  };
}

export async function createImpactAffiliateLink({ destinationUrl, campaignId = null }) {
  if (!destinationUrl) {
    throw new Error("destinationUrl is required.");
  }

  const { accountSid } = getImpactCredentials();
  const programId = campaignId || process.env.IMPACT_CAMPAIGN_ID;

  if (!programId) {
    return {
      url: destinationUrl,
      network: "impact",
      raw: null,
    };
  }

  const path = `/Mediapartners/${accountSid}/Programs/${programId}/TrackingLinks`;

  try {
    const data = await impactFetch(path, {
      method: "POST",
      body: JSON.stringify({
        DestinationURL: destinationUrl,
      }),
    });

    return {
      url:
        data?.TrackingLink ||
        data?.trackingLink ||
        data?.Uri ||
        data?.url ||
        destinationUrl,
      network: "impact",
      raw: data,
    };
  } catch (error) {
    return {
      url: destinationUrl,
      network: "impact",
      raw: null,
      warning: errorToMessage(error),
    };
  }
}

export async function fetchImpactProducts() {
  throw new Error(
    "fetchImpactProducts is not implemented yet. Add your Impact catalog endpoint here when ready."
  );
}
