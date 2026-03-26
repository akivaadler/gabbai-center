"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonationForm } from "./DonationForm";
import { DonationPaymentButton } from "./DonationPaymentButton";
import { PaymentQRCodes } from "./PaymentQRCodes";
import { DollarSign, Plus, Trash2, Pencil, FileText, X, CreditCard } from "lucide-react";
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
  member: Member;
}

interface DonationsClientProps {
  members: Member[];
  currentYear: number;
}

const METHOD_COLORS: Record<string, string> = {
  CASH: "bg-green-100 text-green-800",
  CHECK: "bg-blue-100 text-blue-800",
  CREDIT_CARD: "bg-purple-100 text-purple-800",
  ONLINE: "bg-indigo-100 text-indigo-800",
  OTHER: "bg-gray-100 text-gray-800",
};

export function DonationsClient({ members, currentYear }: DonationsClientProps) {
  const { t, lang } = useLang();
  const locale = lang === "he" ? "he-IL" : "en-US";
  const METHOD_LABELS: Record<string, string> = {
    CASH: t.donations.cash,
    CHECK: t.donations.check,
    CREDIT_CARD: t.donations.creditCard,
    ONLINE: t.donations.online,
    OTHER: t.kibbudim.other,
  };
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDonation, setEditDonation] = useState<Donation | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [taxYearFilter, setTaxYearFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null);
  const [showPayPanel, setShowPayPanel] = useState(false);
  const [payMemberId, setPayMemberId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payOccasion, setPayOccasion] = useState("");
  const [payCurrency, setPayCurrency] = useState("ILS");

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (taxYearFilter) params.set("taxYear", taxYearFilter);
      if (methodFilter) params.set("method", methodFilter);
      const res = await fetch(`/api/donations?${params.toString()}`);
      const data = await res.json();
      setDonations(Array.isArray(data) ? data : []);
    } catch {
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [taxYearFilter, methodFilter]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const filteredDonations = donations.filter((d) => {
    if (!memberSearch) return true;
    const fullName = `${d.member.firstName} ${d.member.lastName}`.toLowerCase();
    return fullName.includes(memberSearch.toLowerCase());
  });

  // Summary stats
  const yearDonations = donations.filter(
    (d) => d.taxYear === currentYear
  );
  const totalThisYear = yearDonations.reduce((sum, d) => sum + d.amount, 0);
  const countThisYear = yearDonations.length;
  const uniqueDonorsThisYear = new Set(yearDonations.map((d) => d.memberId)).size;

  async function handleDelete(id: string) {
    if (!confirm("Delete this donation? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/donations/${id}`, { method: "DELETE" });
      fetchDonations();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReceipt(id: string) {
    setReceiptLoadingId(id);
    try {
      const res = await fetch(`/api/donations/${id}/receipt`);
      if (!res.ok) {
        alert("Failed to generate receipt.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${id.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      // Refresh to show receiptSent = true
      fetchDonations();
    } finally {
      setReceiptLoadingId(null);
    }
  }

  // Tax year options
  const taxYears = Array.from(
    new Set(donations.map((d) => d.taxYear))
  ).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* Payment QR Codes */}
      <PaymentQRCodes />

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t.donations.totalDonated} {currentYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-navy-900">
              ${totalThisYear.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t.donations.donationsLabel} {currentYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-navy-900">{countThisYear}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t.donations.uniqueDonors} {currentYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-navy-900">{uniqueDonorsThisYear}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder={t.donations.filterByMember}
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            className="w-48"
          />
          <select
            value={taxYearFilter}
            onChange={(e) => setTaxYearFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="">{t.donations.allYears}</option>
            {taxYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="">{t.donations.allMethods}</option>
            {Object.entries(METHOD_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          {(memberSearch || taxYearFilter || methodFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMemberSearch("");
                setTaxYearFilter("");
                setMethodFilter("");
              }}
            >
              <X className="h-4 w-4 me-1" />
              {t.donations.clear}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPayPanel((v) => !v)}
          >
            <CreditCard className="h-4 w-4 me-2" />
            {lang === "he" ? "תשלום מקוון" : "Collect Online Payment"}
          </Button>
          <Button
            onClick={() => {
              setEditDonation(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 me-2" />
            {t.donations.log}
          </Button>
        </div>
      </div>

      {/* Online Payment Panel */}
      {showPayPanel && (
        <div className="border rounded-lg p-4 bg-muted/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {lang === "he" ? "גביית תשלום מקוון (PayPlus)" : "Collect Online Payment via PayPlus"}
            </h3>
            <button
              onClick={() => setShowPayPanel(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {lang === "he" ? "חבר" : "Member"}
              </label>
              <select
                value={payMemberId}
                onChange={(e) => setPayMemberId(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm bg-background"
              >
                <option value="">{lang === "he" ? "בחר חבר..." : "Select member…"}</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {lang === "he" ? "סכום" : "Amount"}
              </label>
              <div className="flex gap-1">
                <select
                  value={payCurrency}
                  onChange={(e) => setPayCurrency(e.target.value)}
                  className="border rounded px-2 py-1.5 text-sm bg-background w-20"
                >
                  <option value="ILS">₪ ILS</option>
                  <option value="USD">$ USD</option>
                </select>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="border rounded px-2 py-1.5 text-sm bg-background flex-1 w-full"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {lang === "he" ? "אירוע (אופציונלי)" : "Occasion (optional)"}
              </label>
              <input
                type="text"
                placeholder={lang === "he" ? "למשל: יארצייט" : "e.g. Yahrtzeit"}
                value={payOccasion}
                onChange={(e) => setPayOccasion(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground opacity-0 select-none">action</label>
              <DonationPaymentButton
                memberId={payMemberId}
                amount={payAmount ? parseFloat(payAmount) : undefined}
                occasion={payOccasion || undefined}
                currency={payCurrency}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editDonation ? t.donations.editDonation : t.donations.log}
              </h2>
              <DonationForm
                members={members}
                donation={editDonation}
                onSuccess={() => {
                  setShowForm(false);
                  setEditDonation(null);
                  fetchDonations();
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditDonation(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Donations Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-navy-700">{t.donations.date}</th>
              <th className="text-left px-4 py-3 font-medium text-navy-700">{t.kibbudim.member}</th>
              <th className="text-right px-4 py-3 font-medium text-navy-700">{t.donations.amount}</th>
              <th className="text-left px-4 py-3 font-medium text-navy-700">{t.donations.method}</th>
              <th className="text-left px-4 py-3 font-medium text-navy-700 hidden md:table-cell">{t.donations.occasion}</th>
              <th className="text-center px-4 py-3 font-medium text-navy-700 hidden lg:table-cell">{t.donations.taxYear}</th>
              <th className="text-center px-4 py-3 font-medium text-navy-700 hidden lg:table-cell">{t.donations.receiptSent}</th>
              <th className="text-right px-4 py-3 font-medium text-navy-700">{t.members.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  {t.donations.loading}
                </td>
              </tr>
            ) : filteredDonations.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  {t.donations.noFound}
                </td>
              </tr>
            ) : (
              filteredDonations.map((donation) => (
                <tr key={donation.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {new Date(donation.date).toLocaleDateString(locale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {donation.member.firstName} {donation.member.lastName}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-green-700">
                    ${donation.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${METHOD_COLORS[donation.method] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {METHOD_LABELS[donation.method] ?? donation.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {donation.occasion ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    {donation.taxYear}
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    {donation.receiptSent ? (
                      <Badge variant="secondary" className="text-xs">{t.donations.sent}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Generate Receipt"
                        disabled={receiptLoadingId === donation.id}
                        onClick={() => handleReceipt(donation.id)}
                        className="h-8 w-8 p-0"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Edit"
                        onClick={() => {
                          setEditDonation(donation);
                          setShowForm(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        disabled={deletingId === donation.id}
                        onClick={() => handleDelete(donation.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredDonations.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t.donations.showing} {filteredDonations.length} {t.donations.donationsLabel}
        </p>
      )}
    </div>
  );
}
