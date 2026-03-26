"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/components/providers/LanguageProvider";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

interface Donation {
  id: string;
  memberId: string;
  amount: number;
  currency: string;
  date: string;
  method: string;
  occasion: string | null;
  notes: string | null;
  receiptSent: boolean;
  taxYear: number;
}

interface DonationFormProps {
  members: Member[];
  donation?: Donation | null;
  defaultMemberId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const METHOD_VALUES = ["CASH", "CHECK", "CREDIT_CARD", "ONLINE", "OTHER"];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  ILS: "₪",
  EUR: "€",
  GBP: "£",
};

const CURRENCIES = ["USD", "ILS", "EUR", "GBP"];

export function DonationForm({
  members,
  donation,
  defaultMemberId,
  onSuccess,
  onCancel,
}: DonationFormProps) {
  const { t } = useLang();
  const today = new Date().toISOString().split("T")[0];

  const METHODS = [
    { value: "CASH", label: t.donations.cash },
    { value: "CHECK", label: t.donations.check },
    { value: "CREDIT_CARD", label: t.donations.creditCard },
    { value: "ONLINE", label: t.donations.online },
    { value: "OTHER", label: t.kibbudim.other },
  ];

  const [memberId, setMemberId] = useState(
    donation?.memberId ?? defaultMemberId ?? ""
  );
  const [currency, setCurrency] = useState(donation?.currency ?? "USD");
  const [amount, setAmount] = useState(donation?.amount?.toString() ?? "");
  const [date, setDate] = useState(
    donation?.date ? donation.date.split("T")[0] : today
  );
  const [method, setMethod] = useState(donation?.method ?? "CASH");
  const [occasion, setOccasion] = useState(donation?.occasion ?? "");
  const [notes, setNotes] = useState(donation?.notes ?? "");
  const [receiptSent, setReceiptSent] = useState(donation?.receiptSent ?? false);
  const [memberSearch, setMemberSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredMembers = members.filter((m) => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    return fullName.includes(memberSearch.toLowerCase());
  });

  const selectedMember = members.find((m) => m.id === memberId);

  const taxYear = date ? new Date(date).getFullYear() : new Date().getFullYear();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!memberId || !amount || !date || !method) {
      setError(t.common.error);
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t.common.error);
      return;
    }

    setLoading(true);
    try {
      const url = donation
        ? `/api/donations/${donation.id}`
        : "/api/donations";
      const res = await fetch(url, {
        method: donation ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          amount: parsedAmount,
          currency,
          date,
          method,
          occasion: occasion.trim() || null,
          notes: notes.trim() || null,
          receiptSent,
          taxYear,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t.common.error);
        return;
      }

      onSuccess();
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Member Select */}
      <div className="space-y-1">
        <Label htmlFor="member-search">
          {t.kibbudim.member} <span className="text-red-500">*</span>
        </Label>
        {selectedMember ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedMember.firstName} {selectedMember.lastName}
            </span>
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={() => {
                setMemberId("");
                setMemberSearch("");
              }}
            >
              {t.form.change}
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <Input
              id="member-search"
              placeholder={t.members.search}
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
            {memberSearch && (
              <div className="border rounded-md max-h-40 overflow-y-auto bg-white shadow-sm">
                {filteredMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    {t.members.noMembers}
                  </p>
                ) : (
                  filteredMembers.slice(0, 10).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-navy-50 transition-colors"
                      onClick={() => {
                        setMemberId(m.id);
                        setMemberSearch("");
                      }}
                    >
                      {m.firstName} {m.lastName}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Amount + Currency + Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="amount">
            {t.form.amount} <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-24 border rounded-md px-2 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring shrink-0"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c} {CURRENCY_SYMBOLS[c]}</option>
              ))}
            </select>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1">
          <Label htmlFor="date">
            {t.form.date} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Method */}
      <div className="space-y-1">
        <Label htmlFor="method">
          {t.donations.paymentMethod} <span className="text-red-500">*</span>
        </Label>
        <select
          id="method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy-500"
          required
        >
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Occasion */}
      <div className="space-y-1">
        <Label htmlFor="occasion">{t.donations.occasionPurpose}</Label>
        <Input
          id="occasion"
          placeholder="e.g. Kol Nidre, Yahrtzeit, General"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
        />
      </div>

      {/* Tax Year (auto-computed) */}
      <div className="text-xs text-muted-foreground">
        {t.donations.taxYearAuto}: <strong>{taxYear}</strong> {t.donations.autoFilledFromDate}
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <Label htmlFor="notes">{t.form.notes}</Label>
        <Textarea
          id="notes"
          placeholder={t.donations.internalNotes}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      {/* Receipt Sent */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="receiptSent"
          checked={receiptSent}
          onChange={(e) => setReceiptSent(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="receiptSent">{t.donations.receiptAlreadySent}</Label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t.form.cancel}
        </Button>
        <Button type="submit" disabled={loading} className="bg-navy-800 hover:bg-navy-700">
          {loading ? t.form.saving : donation ? t.donations.updateDonation : t.donations.log}
        </Button>
      </div>
    </form>
  );
}
