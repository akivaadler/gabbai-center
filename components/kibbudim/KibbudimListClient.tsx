"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";
import { KibbudimPageClient } from "./KibbudimPageClient";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

interface KibbudItem {
  id: string;
  type: string;
  aliyahNumber: string | null;
  occasion: string | null;
  date: string;
  member: Member | null;
  shabbosSchedule: { parsha: string | null; shabbosDate: string } | null;
}

interface KibbudimListClientProps {
  members: Member[];
  kibbudim: KibbudItem[];
}

export function KibbudimListClient({ members, kibbudim }: KibbudimListClientProps) {
  const { t, lang } = useLang();

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

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{t.kibbudim.title}</h1>
          <p className="text-muted-foreground">
            {lang === 'he'
              ? 'עקוב אחר עליות, פסיחה, הגבהה וכיבודים אחרים'
              : 'Track aliyos, pesicha, hagbah, and other honors'}
          </p>
        </div>
        <KibbudimPageClient members={members} />
      </div>

      {kibbudim.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.kibbudim.noKibbudimYet}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t.kibbudim.logFirst}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {kibbudim.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between gap-4 px-4 py-3 bg-white rounded-lg border hover:border-navy-300 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                <Badge variant="secondary" className="text-xs shrink-0">
                  {KIBBUD_LABELS[k.type] ?? k.type}
                  {k.aliyahNumber ? ` #${k.aliyahNumber}` : ""}
                </Badge>
                {k.member && (
                  <Link
                    href={`/gabbai/members/${k.member.id}`}
                    className="text-sm font-medium text-navy-800 hover:underline"
                  >
                    {k.member.firstName} {k.member.lastName}
                  </Link>
                )}
                {k.shabbosSchedule?.parsha && (
                  <span className="text-xs text-muted-foreground">
                    {k.shabbosSchedule.parsha}
                  </span>
                )}
                {k.occasion && (
                  <span className="text-xs text-muted-foreground">
                    — {k.occasion}
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground shrink-0">
                {new Date(k.date).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
