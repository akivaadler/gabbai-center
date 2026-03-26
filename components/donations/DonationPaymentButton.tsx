"use client";

import { useState } from "react";
import { useLang } from "@/components/providers/LanguageProvider";

// ============================================================
// PayPlus Payment Integration
// ============================================================
// This component creates a PayPlus payment link and redirects
// the user to the PayPlus hosted payment page.
//
// To activate:
//   1. Register at https://payplus.co.il
//   2. Add to .env.local:
//        PAYPLUS_API_KEY=...
//        PAYPLUS_SECRET_KEY=...
//        PAYPLUS_PAGE_UID=...
//   3. Set NEXT_PUBLIC_PAYPLUS_ENABLED=true in .env.local
//   4. Configure your PayPlus dashboard webhook URL:
//        https://your-domain/api/payplus/callback
// ============================================================

const PAYPLUS_ENABLED = process.env.NEXT_PUBLIC_PAYPLUS_ENABLED === "true";

export function DonationPaymentButton({
  memberId,
  amount,
  occasion,
  currency = "ILS",
}: {
  memberId: string;
  amount?: number;
  occasion?: string;
  currency?: string;
}) {
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!amount || amount <= 0) {
      setError(lang === "he" ? "נא להזין סכום" : "Please enter an amount");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payplus/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, amount, occasion, currency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create payment link");
      window.location.href = data.redirectUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  if (!PAYPLUS_ENABLED) {
    return (
      <div className="space-y-1">
        <button
          disabled
          className="h-9 px-4 rounded bg-navy-100 text-navy-400 text-sm cursor-not-allowed border border-border"
        >
          {lang === "he" ? "תשלום מקוון — בקרוב" : "Online Payment — Coming Soon"}
        </button>
        <p className="text-xs text-muted-foreground">
          {lang === "he"
            ? "יש להגדיר את PayPlus כדי לאפשר תשלום מקוון."
            : "Configure PayPlus credentials to enable online payments."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handlePay}
        disabled={loading}
        className="h-9 px-4 rounded bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading
          ? (lang === "he" ? "מעבד..." : "Processing…")
          : (lang === "he" ? "תשלום מקוון (PayPlus)" : "Pay Online (PayPlus)")}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {lang === "he"
          ? "מאובטח על ידי PayPlus — תומך ב-bit, כרטיסי אשראי ו-Apple Pay"
          : "Secured by PayPlus — supports bit, credit cards & Apple Pay"}
      </p>
    </div>
  );
}
