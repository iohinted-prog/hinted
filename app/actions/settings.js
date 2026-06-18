"use server";

import { createClient } from "../../lib/supabase/server";

export async function saveSettings(formData) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const settings = {
    email_reminders: !!formData.email_reminders,
    personalized_offers: !!formData.personalized_offers,
    hint_sale_alerts: !!formData.hint_sale_alerts,
    product_updates: !!formData.product_updates,
    default_reminder_days: Number(formData.default_reminder_days) || 7,
    currency: formData.currency || "GBP",
  };

  const { error } = await supabase
    .from("profiles")
    .update(settings)
    .eq("id", user.id);

  if (error) {
    throw error;
  }

  return { success: true };
}
