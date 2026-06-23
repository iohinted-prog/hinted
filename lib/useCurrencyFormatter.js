"use client";

import { useEffect, useMemo, useState } from "react";
import { usePreferences } from "../providers/PreferencesProvider";

const currencyLocales = {
  GBP: "en-GB",
  EUR: "en-IE",
  USD: "en-US",
  AUD: "en-AU",
  CAD: "en-CA",
};

const SUPPORTED_CURRENCIES = ["GBP", "EUR", "USD", "AUD", "CAD"];
const BASE_CURRENCY = "GBP";

export function useCurrencyFormatter() {
  const { currency } = usePreferences();
  const [rates, setRates] = useState({ GBP: 1 });
  const [ratesLoaded, setRatesLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRates() {
      try {
        const response = await fetch(
          "https://api.frankfurter.app/latest?from=GBP&to=EUR,USD,AUD,CAD",
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load exchange rates.");
        }

        if (!active) return;

        setRates({
          GBP: 1,
          EUR: data?.rates?.EUR ?? 1,
          USD: data?.rates?.USD ?? 1,
          AUD: data?.rates?.AUD ?? 1,
          CAD: data?.rates?.CAD ?? 1,
        });
        setRatesLoaded(true);
      } catch {
        if (!active) return;
        setRates({ GBP: 1 });
        setRatesLoaded(true);
      }
    }

    loadRates();

    return () => {
      active = false;
    };
  }, []);

  const formatter = useMemo(() => {
    const safeCurrency = SUPPORTED_CURRENCIES.includes(currency) ? currency : BASE_CURRENCY;
    const locale = currencyLocales[safeCurrency] || "en-GB";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }, [currency]);

  function convertAmount(amount, fromCurrency = BASE_CURRENCY, toCurrency = currency) {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) return null;
    if (fromCurrency === toCurrency) return numericAmount;

    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];

    if (!fromRate || !toRate) return numericAmount;

    const amountInBase = fromCurrency === BASE_CURRENCY
      ? numericAmount
      : numericAmount / fromRate;

    if (toCurrency === BASE_CURRENCY) return amountInBase;

    return amountInBase * toRate;
  }

  function formatCurrency(amount, fromCurrency = BASE_CURRENCY) {
    const converted = convertAmount(amount, fromCurrency, currency);
    const numericAmount = Number(converted ?? 0);
    return formatter.format(numericAmount);
  }

  return {
    currency,
    rates,
    ratesLoaded,
    convertAmount,
    formatCurrency,
  };
}
