"use client";

import { useLang } from "@/components/providers/LanguageProvider";

export function SchedulePageHeader() {
  const { t } = useLang();
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">{t.schedule.title}</h1>
      <p className="text-muted-foreground">{t.schedule.manageAssignments}</p>
    </div>
  );
}
