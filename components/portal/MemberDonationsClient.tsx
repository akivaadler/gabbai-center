"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";

interface Donation {
  id: string;
  amount: number;
  date: string;
  method: string;
  occasion: string | null;
  taxYear: number;
  receiptSent: boolean;
}

interface MemberDonationsClientProps {
  donations: Donation[];
  ytdTotal: number;
  ytdCount: number;
  allTimeTotal: number;
  currentYear: number;
  byYear: Record<number, number>;
  noProfile: boolean;
}

export function MemberDonationsClient({
  donations,
  ytdTotal,
  ytdCount,
  allTimeTotal,
  currentYear,
  byYear,
  noProfile,
}: MemberDonationsClientProps) {
  const { t, lang, isRTL } = useLang();

  const locale = lang === "he" ? "he-IL" : "en-US";

  const METHOD_LABELS: Record<string, string> = {
    CASH: t.donations.cash,
    CHECK: t.donations.check,
    CREDIT_CARD: t.donations.creditCard,
    ONLINE: t.donations.online,
    OTHER: t.kibbudim.other,
  };

  if (noProfile) {
    return (
      <div className="text-center py-12 text-muted-foreground" dir={isRTL ? "rtl" : "ltr"}>
        <DollarSign className="h-8 w-8 mx-auto mb-3 text-navy-300" />
        <p>{t.portal.noProfileLinked}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          {t.donations.myDonations}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {donations.length} {t.donations.donationsLabel} {t.donations.onRecord}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-green-700">
              ${ytdTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t.donations.ytd} ({currentYear}) — {ytdCount}{" "}
              {t.donations.donationsLabel}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-navy-800">
              ${allTimeTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t.donations.allTimeTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-navy-800">{donations.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.donations.totalDonations}</p>
          </CardContent>
        </Card>
      </div>

      {/* By Tax Year */}
      {Object.keys(byYear).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.donations.byTaxYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(byYear)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([year, total]) => (
                  <div key={year} className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">{year}</span>
                    <span className="font-medium text-green-700">
                      ${(total as number).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donation history */}
      {donations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <DollarSign className="h-8 w-8 mx-auto mb-3 text-navy-300" />
            <p>{t.donations.noDonations}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.members.donationHistory}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {donations.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
                >
                  <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                    <span className="font-mono text-green-700 font-medium">
                      ${d.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {METHOD_LABELS[d.method] ?? d.method}
                    </Badge>
                    {d.occasion && (
                      <span className="text-xs text-muted-foreground">{d.occasion}</span>
                    )}
                    {d.receiptSent && (
                      <Badge
                        variant="outline"
                        className="text-xs text-green-700 border-green-300"
                      >
                        {t.donations.receiptSentBadge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(d.date).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.donations.taxYearLabel} {d.taxYear}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
