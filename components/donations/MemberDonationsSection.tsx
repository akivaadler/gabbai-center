"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DonationForm } from "./DonationForm";
import { DollarSign, Plus, Pencil, Trash2, FileText } from "lucide-react";
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
  member?: Member;
}

interface MemberDonationsSectionProps {
  memberId: string;
  memberFirstName: string;
  memberLastName: string;
  initialDonations: Donation[];
  allMembers: Member[];
}

export function MemberDonationsSection({
  memberId,
  memberFirstName,
  memberLastName,
  initialDonations,
  allMembers,
}: MemberDonationsSectionProps) {
  const { t, lang } = useLang();
  const locale = lang === "he" ? "he-IL" : "en-US";
  const METHOD_LABELS: Record<string, string> = {
    CASH: t.donations.cash,
    CHECK: t.donations.check,
    CREDIT_CARD: t.donations.creditCard,
    ONLINE: t.donations.online,
    OTHER: t.kibbudim.other,
  };
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [showForm, setShowForm] = useState(false);
  const [editDonation, setEditDonation] = useState<Donation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null);

  const fetchDonations = useCallback(async () => {
    try {
      const res = await fetch(`/api/members/${memberId}/donations`);
      const data = await res.json();
      setDonations(Array.isArray(data) ? data : []);
    } catch {
      // keep existing
    }
  }, [memberId]);

  // Group donations by tax year for summary
  const byYear: Record<number, number> = {};
  for (const d of donations) {
    byYear[d.taxYear] = (byYear[d.taxYear] ?? 0) + d.amount;
  }
  const sortedYears = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  async function handleDelete(id: string) {
    if (!confirm("Delete this donation?")) return;
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
      fetchDonations();
    } finally {
      setReceiptLoadingId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-navy-600" />
          {t.members.donationHistory}
        </CardTitle>
        <Button
          size="sm"
          className="bg-navy-800 hover:bg-navy-700"
          onClick={() => {
            setEditDonation(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 me-1" />
          {t.donations.log}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Year summaries */}
        {sortedYears.length > 0 && (
          <div className="flex flex-wrap gap-3 pb-3 border-b">
            {sortedYears.map((year) => (
              <div key={year} className="text-sm">
                <span className="font-medium text-navy-700">{year}:</span>{" "}
                <span className="text-green-700 font-mono">
                  ${byYear[year].toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Modal form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {editDonation ? t.donations.editDonation : `${t.donations.logDonationFor} ${memberFirstName} ${memberLastName}`}
                </h2>
                <DonationForm
                  members={allMembers}
                  donation={editDonation}
                  defaultMemberId={memberId}
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

        {/* Donations list */}
        {donations.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.donations.noDonations}</p>
        ) : (
          <div className="space-y-2">
            {donations.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between text-sm py-2 border-b last:border-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-xs w-24">
                    {new Date(d.date).toLocaleDateString(locale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {METHOD_LABELS[d.method] ?? d.method}
                  </Badge>
                  <span>{d.occasion ?? t.donations.generalDonation}</span>
                  {d.receiptSent && (
                    <Badge variant="secondary" className="text-xs">{t.donations.receiptSentBadge}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-green-700">
                    ${d.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Generate Receipt"
                      disabled={receiptLoadingId === d.id}
                      onClick={() => handleReceipt(d.id)}
                      className="h-7 w-7 p-0"
                    >
                      <FileText className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Edit"
                      onClick={() => {
                        setEditDonation(d);
                        setShowForm(true);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete"
                      disabled={deletingId === d.id}
                      onClick={() => handleDelete(d.id)}
                      className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
