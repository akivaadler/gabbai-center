"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";

interface UpcomingEvent {
  id: string;
  memberId: string;
  memberName: string;
  type: string;
  colorClass: string;
  label: string | null;
  linkedMemberName: string | null;
  hebrewDay: number;
  hebrewMonth: number;
  hebrewMonthNameHe: string;
  gregorianDate: string;
  daysAway: number;
}

interface CalendarPageClientProps {
  upcoming: UpcomingEvent[];
}

const EVENT_TYPE_KEYS_EN: Record<string, string> = {
  BIRTHDAY: "Birthday",
  ANNIVERSARY: "Anniversary",
  BAR_MITZVAH: "Bar/Bat Mitzvah",
  YAHRTZEIT: "Yahrtzeit",
  OTHER: "Other",
};

const EVENT_TYPE_KEYS_HE: Record<string, string> = {
  BIRTHDAY: "יום הולדת",
  ANNIVERSARY: "יום נישואין",
  BAR_MITZVAH: "בר/בת מצווה",
  YAHRTZEIT: "יארצייט",
  OTHER: "אחר",
};

export function CalendarPageClient({ upcoming }: CalendarPageClientProps) {
  const { t, lang } = useLang();

  const EVENT_TYPE_LABELS = lang === 'he' ? EVENT_TYPE_KEYS_HE : EVENT_TYPE_KEYS_EN;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link
          href="/gabbai/dashboard"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          ← {t.calendar.dashboard}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{t.calendar.title}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-navy-900">{t.calendar.upcoming}</h1>
        <p className="text-muted-foreground">
          {t.calendar.lifeEventsIn30} ({upcoming.length} {lang === 'he' ? 'נמצאו' : 'found'})
        </p>
      </div>

      {upcoming.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.calendar.noEventsIn30}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t.calendar.addLifeEvents}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {upcoming.map((event) => {
            const gregDateStr = new Date(event.gregorianDate).toLocaleDateString(
              lang === 'he' ? 'he-IL' : 'en-US',
              {
                weekday: "long",
                month: "long",
                day: "numeric",
              }
            );

            return (
              <Card key={event.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.colorClass}`}>
                          {EVENT_TYPE_LABELS[event.type] ?? event.type}
                        </span>
                        <Link
                          href={`/gabbai/members/${event.memberId}`}
                          className="text-sm font-semibold text-navy-800 hover:underline"
                        >
                          {event.memberName}
                        </Link>
                        {event.linkedMemberName && (
                          <span className="text-xs text-muted-foreground">
                            — {event.linkedMemberName}
                          </span>
                        )}
                      </div>
                      {event.label && (
                        <p className="text-sm text-muted-foreground">{event.label}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-navy-700">{gregDateStr}</span>
                        <span className="text-xs text-muted-foreground">
                          {event.hebrewDay} {event.hebrewMonthNameHe}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {event.daysAway === 0 ? (
                        <Badge className="bg-gold-500 text-white">{t.calendar.today}</Badge>
                      ) : event.daysAway === 1 ? (
                        <Badge className="bg-orange-500 text-white">{t.calendar.tomorrow}</Badge>
                      ) : (
                        <Badge variant="outline">{t.calendar.in} {event.daysAway}{t.calendar.days}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
