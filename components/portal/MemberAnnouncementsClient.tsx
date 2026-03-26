"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";

interface Announcement {
  id: string;
  title: string;
  body: string;
  publishDate: string;
  expiresDate: string | null;
}

interface MemberAnnouncementsClientProps {
  announcements: Announcement[];
}

export function MemberAnnouncementsClient({
  announcements,
}: MemberAnnouncementsClientProps) {
  const { t, lang, isRTL } = useLang();

  const locale = lang === "he" ? "he-IL" : "en-US";

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
          <Megaphone className="h-6 w-6" />
          {t.announcements.title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {announcements.length}{" "}
          {announcements.length === 1
            ? t.announcements.announcementCount
            : t.announcements.announcementCountPlural}
        </p>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Megaphone className="h-8 w-8 mx-auto mb-3 text-navy-300" />
            <p>{t.announcements.noActiveAnnouncements}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
                  <span>{a.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {t.announcements.publicBadge}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-normal">
                      {new Date(a.publishDate).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {a.body}
                </p>
                {a.expiresDate && (
                  <p className="text-xs text-muted-foreground mt-3 border-t pt-2">
                    {t.announcements.expires}:{" "}
                    {new Date(a.expiresDate).toLocaleDateString(locale, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
