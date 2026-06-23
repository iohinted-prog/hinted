import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const merchant = searchParams.get("merchant");
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";

  if (!merchant) {
    return NextResponse.json(
      { error: "Missing merchant" },
      { status: 400 }
    );
  }

  const products = getProducts({ merchant, query, category });

  return NextResponse.json({
    merchant,
    query,
    category,
    count: products.length,
    products,
  });
}
