"use client";

import React from "react";
import { formatHebrewDate, getHebrewDateForToday } from "@/lib/hebrew";
import { cn } from "@/lib/utils";

interface HebrewCalendarDisplayProps {
  className?: string;
  showGregorian?: boolean;
}

export function HebrewCalendarDisplay({
  className,
  showGregorian = true,
}: HebrewCalendarDisplayProps) {
  const today = new Date();
  const hdate = getHebrewDateForToday();
  const hebrewStr = formatHebrewDate(hdate);

  const gregorianStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={cn("flex flex-col", className)}>
      {showGregorian && (
        <span className="text-sm text-muted-foreground">{gregorianStr}</span>
      )}
      <span
        dir="rtl"
        lang="he"
        className="text-lg font-semibold"
        style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
      >
        {hebrewStr}
      </span>
    </div>
  );
}
