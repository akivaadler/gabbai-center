"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/providers/LanguageProvider";
import { BookOpen, Clock, MapPin, User } from "lucide-react";

interface Shiur {
  id: string;
  title: string;
  titleHe: string | null;
  description: string | null;
  teacher: string | null;
  dayOfWeek: string | null;
  time: string | null;
  location: string | null;
  isActive: boolean;
  notes: string | null;
}

const DAY_LABELS: Record<string, string> = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "SHABBOS": "Shabbos",
  "DAILY": "Daily",
};

interface ShiurimPortalClientProps {
  shiurim: Shiur[];
}

export function ShiurimPortalClient({ shiurim }: ShiurimPortalClientProps) {
  const { t } = useLang();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.shiurim.title}</h1>
        <p className="text-sm text-muted-foreground">{shiurim.length} active shiurim</p>
      </div>

      {shiurim.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{t.shiurim.noShiurim}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {shiurim.map((shiur) => (
            <Card key={shiur.id} className="border border-border">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-foreground">{shiur.title}</h3>
                    {shiur.titleHe && (
                      <p
                        className="text-sm text-muted-foreground"
                        dir="rtl"
                        lang="he"
                        style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                      >
                        {shiur.titleHe}
                      </p>
                    )}
                  </div>
                  {shiur.dayOfWeek && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      {DAY_LABELS[shiur.dayOfWeek] ?? shiur.dayOfWeek}
                    </Badge>
                  )}
                </div>

                {shiur.description && (
                  <p className="text-sm text-muted-foreground">{shiur.description}</p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {shiur.teacher && (
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {shiur.teacher}
                    </span>
                  )}
                  {shiur.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {shiur.time}
                    </span>
                  )}
                  {shiur.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {shiur.location}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
