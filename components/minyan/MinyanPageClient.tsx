"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { MinyanManager } from "./MinyanManager";
import { useLang } from "@/components/providers/LanguageProvider";

interface MinyanTimeItem {
  id: string;
  name: string;
  dayOfWeek: string;
  time: string;
  isActive: boolean;
}

interface DayGroup {
  dayKey: string;
  times: MinyanTimeItem[];
}

interface MinyanPageClientProps {
  orderedGroups: DayGroup[];
  hasAnyTimes: boolean;
}

export function MinyanPageClient({ orderedGroups, hasAnyTimes }: MinyanPageClientProps) {
  const { t } = useLang();

  const DAY_NAMES: Record<string, string> = {
    "0": t.minyan.sunday,
    "1": t.minyan.monday,
    "2": t.minyan.tuesday,
    "3": t.minyan.wednesday,
    "4": t.minyan.thursday,
    "5": t.minyan.friday,
    "6": t.minyan.saturdayErev,
    SHABBOS: t.minyan.shabbos,
    YOM_TOV: t.minyan.yomTov,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{t.minyan.title}</h1>
          <p className="text-muted-foreground">{t.minyan.manageDavening}</p>
        </div>
        <MinyanManager mode="add" />
      </div>

      {!hasAnyTimes ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.minyan.noMinyanYet}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t.minyan.addFirst}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orderedGroups.map(({ dayKey, times }) => (
            <Card key={dayKey}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-navy-800">
                  {DAY_NAMES[dayKey] ?? dayKey}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {times.map((time) => (
                    <div
                      key={time.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-20 text-right tabular-nums text-navy-800">
                          {time.time}
                        </span>
                        <span className="text-sm">{time.name}</span>
                        {!time.isActive && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            {t.minyan.inactive}
                          </Badge>
                        )}
                      </div>
                      <MinyanManager mode="edit" initialData={time} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
