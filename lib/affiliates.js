
export function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildAffiliateLink({ network, merchant, destinationUrl }) {
  return {
    network: network || null,
    merchant: merchant || null,
    finalUrl: destinationUrl,
    affiliateReady: false,
  };
}
