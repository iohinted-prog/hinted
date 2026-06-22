import { NextResponse } from "next/server";

export async function POST(request) {
  return NextResponse.json({ ok: true, message: "Awin route is live." });
}
