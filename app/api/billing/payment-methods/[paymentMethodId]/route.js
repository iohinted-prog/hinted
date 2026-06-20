import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secretKey);
}

async function getAuthedCustomer() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { error: profileError.message, status: 500 };
  }

  if (!profile?.stripe_customer_id) {
    return { error: "No Stripe customer found for this user.", status: 400 };
  }

  return { stripeCustomerId: profile.stripe_customer_id };
}

export async function PATCH(request, { params }) {
  try {
    const stripe = getStripe();
    const auth = await getAuthedCustomer();

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { paymentMethodId } = await params;
    const body = await request.json().catch(() => ({}));
    const { makeDefault } = body;

    if (!makeDefault) {
      return NextResponse.json(
        { error: "No supported update action was provided." },
        { status: 400 }
      );
    }

    await stripe.customers.update(auth.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({
      success: true,
      defaultPaymentMethodId: paymentMethodId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update payment method." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const stripe = getStripe();
    const auth = await getAuthedCustomer();

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { paymentMethodId } = await params;

    const customer = await stripe.customers.retrieve(auth.stripeCustomerId);
    const defaultPaymentMethodId =
      customer && !("deleted" in customer)
        ? customer.invoice_settings?.default_payment_method || null
        : null;

    if (defaultPaymentMethodId === paymentMethodId) {
      await stripe.customers.update(auth.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: null,
        },
      });
    }

    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete payment method." },
      { status: 500 }
    );
  }
}
