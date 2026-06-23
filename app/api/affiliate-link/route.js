import { NextResponse } from "next/server";
import { createAffiliateLink } from "@/lib/affiliates";
import { errorToMessage } from "@/lib/products";

export async function POST(request) {
  try {
    const body = await request.json();

    const destinationUrl = String(body?.destinationUrl || "").trim();
    const network = body?.network || "impact";
    const campaignId = body?.campaignId || null;
    const product = body?.product || null;

    if (!destinationUrl) {
      return NextResponse.json(
        { error: "destinationUrl is required." },
        { status: 400 }
      );
    }

    const result = await createAffiliateLink({
      network,
      destinationUrl,
      campaignId,
      product,
    });

    return NextResponse.json({
      url: result?.url || destinationUrl,
      network: result?.network || network,
      raw: result?.raw || null,
      warning: result?.warning || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: errorToMessage(error) },
      { status: 500 }
    );
  }
}
