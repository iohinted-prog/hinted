import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secretKey);
}

export async function POST() {
  try {
    const stripe = getStripe();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    let customerId = profile?.stripe_customer_id || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: profile?.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
      metadata: {
        supabase_user_id: user.id,
      },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to create setup intent." },
      { status: 500 }
    );
  }
}
