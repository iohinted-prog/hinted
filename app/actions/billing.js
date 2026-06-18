"use server";

import { createClient } from "../../lib/supabase/server";

export async function saveBilling(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const billing = {
    billing_email: formData.billing_email || null,
    billing_country: formData.billing_country || "GB",
  };

  const { error } = await supabase.from("profiles").update(billing).eq("id", user.id);

  if (error) {
    throw error;
  }

  return { success: true };
}
