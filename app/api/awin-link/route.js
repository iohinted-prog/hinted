import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { publisherId, advertiserId, destinationUrl } = body;

    const token = process.env.AWIN_OAUTH_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Missing AWIN_OAUTH_TOKEN" },
        { status: 500 }
      );
    }

    if (!publisherId || !advertiserId) {
      return NextResponse.json(
        { error: "publisherId and advertiserId are required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      tokenLoaded: true,
      publisherId,
      advertiserId,
      destinationUrl: destinationUrl || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
