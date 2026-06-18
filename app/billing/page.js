import BillingClient from "./BillingClient";

export const metadata = {
  title: "Billing | Hinted.io",
  description: "Manage saved cards and payment preferences for pots and shop.",
};

export default function BillingPage() {
  return <BillingClient />;
}
