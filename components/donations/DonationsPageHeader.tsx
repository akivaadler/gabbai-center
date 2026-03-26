"use client";

import { useLang } from "@/components/providers/LanguageProvider";

export function DonationsPageHeader() {
  const { t, lang } = useLang();
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">{t.donations.title}</h1>
      <p className="text-muted-foreground">
        {lang === 'he'
          ? 'עקוב ונהל את כל תרומות החברים'
          : 'Track and manage all member donations'}
      </p>
    </div>
  );
}
