"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";

interface Leining {
  id: string;
  aliyah: string;
  memberName: string | null;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  isPublic: boolean;
}

interface Schedule {
  id: string;
  parsha: string | null;
  hebrewDate: string;
  gregDate: string;
  notes: string | null;
  leinings: Leining[];
  announcements: Announcement[];
}

interface MinyanTime {
  id: string;
  name: string;
  time: string;
  dayOfWeek: string;
}

interface MemberScheduleClientProps {
  schedules: Schedule[];
  shabbosMinyanTimes: MinyanTime[];
}

const ALIYAH_LABELS_EN: Record<string, string> = {
  "1": "1st",
  "2": "2nd",
  "3": "3rd",
  "4": "4th",
  "5": "5th",
  "6": "6th",
  "7": "7th",
  MAFTIR: "Maftir",
  HAFTORAH: "Haftorah",
  SPECIAL: "Special",
};

const ALIYAH_LABELS_HE: Record<string, string> = {
  "1": "ראשון",
  "2": "שני",
  "3": "שלישי",
  "4": "רביעי",
  "5": "חמישי",
  "6": "שישי",
  "7": "שביעי",
  MAFTIR: "מפטיר",
  HAFTORAH: "הפטרה",
  SPECIAL: "מיוחד",
};

export function MemberScheduleClient({
  schedules,
  shabbosMinyanTimes,
}: MemberScheduleClientProps) {
  const { t, lang, isRTL } = useLang();

  const ALIYAH_LABELS = lang === "he" ? ALIYAH_LABELS_HE : ALIYAH_LABELS_EN;

  return (
    <div className="space-y-6 max-w-3xl" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{t.portal.schedule}</h1>
        <p className="text-muted-foreground">{t.portal.upcomingShabbos}</p>
      </div>

      {/* Shabbos Minyan Times */}
      {shabbosMinyanTimes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-navy-700">
              <Clock className="h-4 w-4" />
              {t.portal.shabbosMinyanTimes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {shabbosMinyanTimes.map((mt) => (
                <div key={mt.id} className="text-sm">
                  <span className="font-medium text-navy-800">{mt.name}</span>
                  <span className="text-muted-foreground ms-1">{mt.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule List */}
      {schedules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.portal.noUpcomingSchedules}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((s) => {
            const hasLeinings = s.leinings.length > 0;
            const aliyos = s.leinings.filter(
              (l) => !["MAFTIR", "HAFTORAH", "SPECIAL"].includes(l.aliyah)
            );
            const special = s.leinings.filter((l) =>
              ["MAFTIR", "HAFTORAH", "SPECIAL"].includes(l.aliyah)
            );

            return (
              <Card key={s.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-lg font-bold text-navy-900">
                        {s.parsha ?? t.schedule.shabbosSchedule}
                      </h2>
                      <p className="text-sm text-muted-foreground">{s.gregDate}</p>
                      <p className="text-sm text-navy-700 font-medium">{s.hebrewDate}</p>
                    </div>
                    <Badge className="bg-gold-100 text-gold-800 border-gold-200">
                      {t.schedule.upcoming}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Aliyos */}
                  {hasLeinings && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        {t.portal.aliyos}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {aliyos.map((l) => (
                          <div
                            key={l.id}
                            className="flex items-center gap-2 text-sm py-1"
                          >
                            <span className="text-xs font-medium text-navy-600 w-16 shrink-0">
                              {ALIYAH_LABELS[l.aliyah] ?? l.aliyah}
                            </span>
                            <span
                              className={
                                l.memberName
                                  ? "text-navy-900 font-medium"
                                  : "text-muted-foreground italic"
                              }
                            >
                              {l.memberName ?? t.portal.unassigned}
                            </span>
                          </div>
                        ))}
                        {special.map((l) => (
                          <div
                            key={l.id}
                            className="flex items-center gap-2 text-sm py-1"
                          >
                            <span className="text-xs font-medium text-navy-600 w-16 shrink-0">
                              {ALIYAH_LABELS[l.aliyah] ?? l.aliyah}
                            </span>
                            <span
                              className={
                                l.memberName
                                  ? "text-navy-900 font-medium"
                                  : "text-muted-foreground italic"
                              }
                            >
                              {l.memberName ?? t.portal.unassigned}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {s.notes && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        {t.schedule.notes}
                      </h3>
                      <p className="text-sm text-muted-foreground">{s.notes}</p>
                    </div>
                  )}

                  {/* Announcements */}
                  {s.announcements.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        {t.schedule.announcements}
                      </h3>
                      <div className="space-y-2">
                        {s.announcements.map((a) => (
                          <div
                            key={a.id}
                            className="bg-gold-50 border border-gold-100 rounded-md p-3"
                          >
                            <p className="text-sm font-semibold text-navy-900">
                              {a.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {a.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
