"use client";

import { useMemo } from "react";
import { usePreferences } from "../providers/PreferencesProvider";

const currencyLocales = {
  GBP: "en-GB",
  EUR: "en-IE",
  USD: "en-US",
  AUD: "en-AU",
  CAD: "en-CA",
};

export function useCurrencyFormatter() {
  const { currency } = usePreferences();

  const formatter = useMemo(() => {
    const locale = currencyLocales[currency] || "en-GB";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }, [currency]);

  function formatCurrency(amount) {
    const numericAmount = Number(amount || 0);
    return formatter.format(numericAmount);
  }

  return {
    currency,
    formatCurrency,
  };
}
