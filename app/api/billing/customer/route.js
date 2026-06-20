import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let stripeInstance = null;

function getStripe() {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || typeof secretKey !== "string" || !secretKey.trim()) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripeInstance = new Stripe(secretKey.trim(), {
    apiVersion: "2024-09-30.acacia",
  });

  return stripeInstance;
}

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json(
        { error: userError.message || "Failed to load user." },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message || "Failed to load profile." },
        { status: 500 }
      );
    }

    if (profile?.stripe_customer_id) {
      return NextResponse.json({ customerId: profile.stripe_customer_id });
    }

    const stripe = getStripe();

    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: profile?.full_name || undefined,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Failed to save Stripe customer." },
        { status: 500 }
      );
    }

    return NextResponse.json({ customerId: customer.id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create Stripe customer.",
      },
      { status: 500 }
    );
  }
}
