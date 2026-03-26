"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";

interface ShabbosSchedule {
  parsha: string | null;
}

interface Kibbud {
  id: string;
  type: string;
  aliyahNumber: string | null;
  occasion: string | null;
  date: string;
  shabbosSchedule: ShabbosSchedule | null;
}

interface MemberKibbudimClientProps {
  kibbudim: Kibbud[];
  noProfile: boolean;
}

const KIBBUD_COLORS: Record<string, string> = {
  ALIYAH: "bg-navy-100 text-navy-800",
  PETICHAH: "bg-gold-100 text-gold-800",
  GELILAH: "bg-green-100 text-green-800",
  HAGBAH: "bg-blue-100 text-blue-800",
  ARON: "bg-orange-100 text-orange-800",
  HAFTORAH: "bg-purple-100 text-purple-800",
  LEINING: "bg-teal-100 text-teal-800",
  OTHER: "bg-gray-100 text-gray-800",
};

export function MemberKibbudimClient({
  kibbudim,
  noProfile,
}: MemberKibbudimClientProps) {
  const { t, lang, isRTL } = useLang();

  const locale = lang === "he" ? "he-IL" : "en-US";

  const KIBBUD_LABELS: Record<string, string> = {
    ALIYAH: t.kibbudim.aliyah,
    PETICHAH: t.kibbudim.petichah,
    GELILAH: t.kibbudim.gelilah,
    HAGBAH: t.kibbudim.hagbah,
    ARON: t.kibbudim.aron,
    HAFTORAH: t.kibbudim.haftorah,
    LEINING: t.kibbudim.leining,
    OTHER: t.kibbudim.other,
  };

  if (noProfile) {
    return (
      <div className="text-center py-12 text-muted-foreground" dir={isRTL ? "rtl" : "ltr"}>
        <Star className="h-8 w-8 mx-auto mb-3 text-navy-300" />
        <p>{t.portal.noProfileLinked}</p>
      </div>
    );
  }

  const aliyahCount = kibbudim.filter((k) => k.type === "ALIYAH").length;
  const lastAliyah = kibbudim.find((k) => k.type === "ALIYAH");

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
          <Star className="h-6 w-6" />
          {t.kibbudim.myKibbudim}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {kibbudim.length} {t.kibbudim.totalRecorded}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-navy-800">{kibbudim.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.kibbudim.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-navy-800">{aliyahCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.kibbudim.aliyos}</p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-1 col-span-2">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-sm font-medium text-navy-800">
              {lastAliyah
                ? new Date(lastAliyah.date).toLocaleDateString(locale, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : t.common.never}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t.kibbudim.lastAliyah}</p>
          </CardContent>
        </Card>
      </div>

      {/* Kibbud list */}
      {kibbudim.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Star className="h-8 w-8 mx-auto mb-3 text-navy-300" />
            <p>{t.kibbudim.noKibbudimYet}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.kibbudim.history}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {kibbudim.map((k) => (
                <li
                  key={k.id}
                  className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
                >
                  <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${KIBBUD_COLORS[k.type] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {KIBBUD_LABELS[k.type] ?? k.type}
                      {k.aliyahNumber ? ` #${k.aliyahNumber}` : ""}
                    </span>
                    {k.occasion && (
                      <span className="text-sm text-muted-foreground">{k.occasion}</span>
                    )}
                    {k.shabbosSchedule?.parsha && (
                      <Badge variant="outline" className="text-xs">
                        {k.shabbosSchedule.parsha}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(k.date).toLocaleDateString(locale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
