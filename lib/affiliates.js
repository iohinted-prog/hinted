import { createImpactAffiliateLink } from "./impact";

export async function createAffiliateLink({
  network,
  destinationUrl,
  campaignId = null,
  product = null,
}) {
  const chosenNetwork = network || product?.network || "impact";

  if (chosenNetwork === "impact") {
    return createImpactAffiliateLink({
      destinationUrl,
      campaignId: campaignId || product?.campaign_id || null,
    });
  }

  return {
    url: destinationUrl,
    network: chosenNetwork,
    raw: null,
  };
}
