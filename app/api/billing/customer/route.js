import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../../lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (profile?.stripe_customer_id) {
      return NextResponse.json({ customerId: profile.stripe_customer_id });
    }

    const customer = await stripe.customers.create({
      email: user.email || profile?.email || undefined,
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
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ customerId: customer.id });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe customer." },
      { status: 500 }
    );
  }
}
