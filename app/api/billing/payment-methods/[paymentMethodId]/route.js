import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../../../lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const paymentMethodId = params?.paymentMethodId;

    if (!paymentMethodId) {
      return NextResponse.json({ error: "Missing payment method ID" }, { status: 400 });
    }

    const paymentMethods = await stripe.customers.listPaymentMethods(
      profile.stripe_customer_id,
      {
        type: "card",
        limit: 100,
      }
    );

    const belongsToCustomer = paymentMethods.data.some(
      (pm) => pm.id === paymentMethodId
    );

    if (!belongsToCustomer) {
      return NextResponse.json(
        { error: "Payment method does not belong to this customer" },
        { status: 403 }
      );
    }

    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete payment method" },
      { status: 500 }
    );
  }
}
