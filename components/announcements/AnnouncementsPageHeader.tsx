"use client";

import { useLang } from "@/components/providers/LanguageProvider";

export function AnnouncementsPageHeader() {
  const { t } = useLang();
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">{t.announcements.title}</h1>
      <p className="text-muted-foreground">{t.announcements.manageAnnouncements}</p>
    </div>
  );
}
