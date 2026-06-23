"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

const PreferencesContext = createContext(null);

const EURO_REGIONS = [
  "-IE", "-DE", "-FR", "-ES", "-IT", "-NL", "-BE", "-AT", "-PT",
  "-FI", "-LU", "-GR", "-SI", "-SK", "-LV", "-LT", "-EE", "-CY", "-MT",
];

function mapLocaleToCurrency(locale = "en-GB") {
  const normalized = String(locale).toUpperCase();

  if (normalized.includes("-GB")) return "GBP";
  if (normalized.includes("-US")) return "USD";
  if (normalized.includes("-AU")) return "AUD";
  if (normalized.includes("-CA")) return "CAD";
  if (EURO_REGIONS.some((region) => normalized.includes(region))) return "EUR";

  return "GBP";
}

export function PreferencesProvider({ children }) {
  const supabase = createClient();

  const [currency, setCurrency] = useState("GBP");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPreferences() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) setLoaded(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", user.id)
        .maybeSingle();

      const storedCurrency = profile?.currency;

      if (storedCurrency) {
        if (active) {
          setCurrency(storedCurrency);
          setLoaded(true);
        }
        return;
      }

      const authLocale =
        user.user_metadata?.locale ||
        user.user_metadata?.language ||
        user.user_metadata?.region ||
        "";

      const browserLocale =
        typeof navigator !== "undefined" ? navigator.language : "en-GB";

      const inferredCurrency = mapLocaleToCurrency(authLocale || browserLocale);

      const { error } = await supabase
        .from("profiles")
        .update({ currency: inferredCurrency })
        .eq("id", user.id);

      if (!error && active) {
        setCurrency(inferredCurrency);
      }

      if (active) {
        setLoaded(true);
      }
    }

    loadPreferences();

    return () => {
      active = false;
    };
  }, [supabase]);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      loaded,
    }),
    [currency, loaded]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}

export { mapLocaleToCurrency };
