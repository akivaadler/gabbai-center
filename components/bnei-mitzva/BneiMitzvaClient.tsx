"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "@/components/providers/LanguageProvider";
import { Award, Calendar } from "lucide-react";
import Link from "next/link";

const HEBREW_MONTHS: Record<number, string> = {
  1: "Nisan",
  2: "Iyar",
  3: "Sivan",
  4: "Tammuz",
  5: "Av",
  6: "Elul",
  7: "Tishrei",
  8: "Cheshvan",
  9: "Kislev",
  10: "Tevet",
  11: "Shevat",
  12: "Adar",
  13: "Adar II",
};

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  hebrewName: string | null;
}

interface Event {
  id: string;
  memberId: string;
  member: Member;
  type: string;
  label: string | null;
  hebrewDay: number;
  hebrewMonth: number;
  hebrewYear: number | null;
  gregorianDate: string | null;
  notes: string | null;
  linkedMemberName: string | null;
}

interface BneiMitzvaClientProps {
  events: Event[];
}

export function BneiMitzvaClient({ events }: BneiMitzvaClientProps) {
  const { t } = useLang();
  const [showAll, setShowAll] = useState(false);

  const now = new Date();
  const upcomingEvents = events.filter((e) => {
    if (!e.gregorianDate) return false;
    const d = new Date(e.gregorianDate);
    const diff = d.getTime() - now.getTime();
    return diff > -7 * 24 * 60 * 60 * 1000 && diff < 365 * 24 * 60 * 60 * 1000;
  });

  const displayEvents = showAll ? events : upcomingEvents;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.bneiMitzva.title}</h1>
          <p className="text-sm text-muted-foreground">
            {upcomingEvents.length} upcoming this year
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? t.bneiMitzva.upcoming : t.bneiMitzva.all}
        </Button>
      </div>

      {displayEvents.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-12 text-center">
            <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{t.bneiMitzva.noEvents}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Member</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Hebrew Name</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t.bneiMitzva.hebrewDate}</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t.bneiMitzva.gregorianDate}</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t.bneiMitzva.notes}</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayEvents.map((event) => {
                const hebrewMonthName = HEBREW_MONTHS[event.hebrewMonth] ?? `Month ${event.hebrewMonth}`;
                const hebrewDateStr = `${event.hebrewDay} ${hebrewMonthName}${event.hebrewYear ? ` ${event.hebrewYear}` : ""}`;
                const gregorianStr = event.gregorianDate
                  ? new Date(event.gregorianDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";

                const isUpcoming = event.gregorianDate
                  ? (() => {
                      const d = new Date(event.gregorianDate);
                      const diff = d.getTime() - now.getTime();
                      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
                    })()
                  : false;

                return (
                  <tr key={event.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {event.member.firstName} {event.member.lastName}
                        </span>
                        {isUpcoming && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                            Soon
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      dir="rtl"
                      lang="he"
                      style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                    >
                      {event.member.hebrewName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{hebrewDateStr}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {gregorianStr}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{event.notes ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/gabbai/members/${event.memberId}`}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        View Member
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
