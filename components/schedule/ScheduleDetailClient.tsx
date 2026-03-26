"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BookOpen, Printer } from "lucide-react";
import { LeiningsAssignment } from "@/components/schedule/LeiningsAssignment";
import { useLang } from "@/components/providers/LanguageProvider";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

interface Leining {
  id: string;
  aliyah: string;
  scheduleId?: string;
  memberId: string | null;
  member: Member | null;
}

interface Kibbud {
  id: string;
  type: string;
  aliyahNumber: string | null;
  occasion: string | null;
  memberId: string;
  member: Member | null;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
}

interface ScheduleDetailClientProps {
  scheduleId: string;
  parsha: string | null;
  hebrewDateStr: string;
  gregDate: string;
  notes: string | null;
  leinings: Leining[];
  kibbudim: Kibbud[];
  announcements: Announcement[];
  members: Member[];
}

const KIBBUD_TYPE_KEYS: Record<string, keyof ReturnType<typeof useLang>["t"]["kibbudim"]> = {
  ALIYAH: "aliyah",
  PETICHAH: "petichah",
  GELILAH: "gelilah",
  HAGBAH: "hagbah",
  ARON: "aron",
  HAFTORAH: "haftorah",
  LEINING: "leining",
  OTHER: "other",
};

export function ScheduleDetailClient({
  scheduleId,
  parsha,
  hebrewDateStr,
  gregDate,
  notes,
  leinings,
  kibbudim,
  announcements,
  members,
}: ScheduleDetailClientProps) {
  const { t, isRTL } = useLang();

  function getKibbudLabel(type: string): string {
    const key = KIBBUD_TYPE_KEYS[type];
    if (key) return t.kibbudim[key] as string;
    return type;
  }

  return (
    <div className="space-y-6 max-w-3xl" dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/gabbai/schedule"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          {t.schedule.back}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{parsha ?? gregDate}</span>
      </div>

      {/* Header card */}
      <Card className="bg-navy-900 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-gold-400" />
                <span className="text-gold-400 text-sm font-medium">
                  {t.schedule.shabbosSchedule}
                </span>
              </div>
              {parsha && <h1 className="text-2xl font-bold">{parsha}</h1>}
              <p className="text-navy-300 mt-1">{gregDate}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
              <p
                className="text-xl text-gold-300"
                dir="rtl"
                lang="he"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
              >
                {hebrewDateStr}
              </p>
              <Link href={`/gabbai/schedule/${scheduleId}/print`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10"
                >
                  <Printer className="h-4 w-4 me-1.5" />
                  {t.schedule.printSheet}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leining Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.schedule.leiningAssignments}</CardTitle>
        </CardHeader>
        <CardContent>
          <LeiningsAssignment
            scheduleId={scheduleId}
            initialLeinings={leinings}
            members={members}
          />
        </CardContent>
      </Card>

      {/* Kibbud assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t.schedule.kibbudim} ({kibbudim.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kibbudim.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t.schedule.noKibbudimAssigned}{" "}
              <Link href="/gabbai/kibbudim" className="text-navy-600 hover:underline">
                {t.schedule.logKibbud}
              </Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {kibbudim.map((k) => (
                <li
                  key={k.id}
                  className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getKibbudLabel(k.type)}
                      {k.aliyahNumber ? ` #${k.aliyahNumber}` : ""}
                    </Badge>
                    {k.member && (
                      <Link
                        href={`/gabbai/members/${k.memberId}`}
                        className="hover:underline text-navy-700"
                      >
                        {k.member.firstName} {k.member.lastName}
                      </Link>
                    )}
                  </div>
                  {k.occasion && (
                    <span className="text-muted-foreground text-xs">{k.occasion}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.schedule.announcements}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.schedule.notes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
