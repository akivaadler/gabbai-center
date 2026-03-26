"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";

interface ScheduleItem {
  id: string;
  parsha: string | null;
  hebrewDateStr: string;
  isPast: boolean;
  gregDate: string;
  leiningsCount: number;
  kibbudimCount: number;
}

interface ScheduleListClientProps {
  schedules: ScheduleItem[];
}

export function ScheduleListClient({ schedules }: ScheduleListClientProps) {
  const { t } = useLang();

  if (schedules.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t.schedule.noScheduleYet}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t.schedule.createFirst}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <Link key={schedule.id} href={`/gabbai/schedule/${schedule.id}`}>
          <Card className={`hover:shadow-md transition-shadow cursor-pointer ${schedule.isPast ? "opacity-70" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {!schedule.isPast && (
                      <Badge className="bg-gold-500 text-white text-xs">{t.schedule.upcoming}</Badge>
                    )}
                    {schedule.parsha && (
                      <span className="font-semibold text-navy-900">
                        {schedule.parsha}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{schedule.gregDate}</p>
                  <p
                    className="text-sm text-navy-700 mt-0.5"
                    dir="rtl"
                    lang="he"
                    style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                  >
                    {schedule.hebrewDateStr}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-xl font-bold text-navy-800">
                      {schedule.leiningsCount}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.schedule.leinings}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gold-700">
                      {schedule.kibbudimCount}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.schedule.kibbudim}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
