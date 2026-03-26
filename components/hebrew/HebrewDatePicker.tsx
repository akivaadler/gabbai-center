"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { HEBREW_MONTHS, daysInHebrewMonth, getCurrentHebrewYear, isHebrewLeapYear } from "@/lib/hebrew";

export type HebrewDateValue = {
  hebrewDay: number;
  hebrewMonth: number;
  hebrewYear?: number;
};

interface HebrewDatePickerProps {
  value?: HebrewDateValue;
  onChange: (value: HebrewDateValue) => void;
  showYear?: boolean;
  label?: string;
  className?: string;
}

export function HebrewDatePicker({
  value,
  onChange,
  showYear = false,
  label,
  className,
}: HebrewDatePickerProps) {
  const currentYear = getCurrentHebrewYear();
  const [day, setDay] = useState<number>(value?.hebrewDay ?? 1);
  const [month, setMonth] = useState<number>(value?.hebrewMonth ?? 7); // default Tishrei
  const [year, setYear] = useState<number>(value?.hebrewYear ?? currentYear);

  const isLeap = isHebrewLeapYear(year);

  // Filter Adar II if not a leap year (only show when year is set and it's not a leap year)
  const availableMonths = HEBREW_MONTHS.filter((m) => {
    if (m.num === 13 && !isLeap) return false;
    return true;
  });

  // Max days in selected month
  const maxDays = daysInHebrewMonth(month, year);

  // Clamp day if it exceeds max days for the month
  useEffect(() => {
    if (day > maxDays) {
      setDay(maxDays);
    }
  }, [month, year, day, maxDays]);

  const handleDayChange = (val: string) => {
    const d = parseInt(val, 10);
    setDay(d);
    onChange({ hebrewDay: d, hebrewMonth: month, hebrewYear: showYear ? year : undefined });
  };

  const handleMonthChange = (val: string) => {
    const m = parseInt(val, 10);
    setMonth(m);
    const newMaxDays = daysInHebrewMonth(m, year);
    const clampedDay = Math.min(day, newMaxDays);
    setDay(clampedDay);
    onChange({ hebrewDay: clampedDay, hebrewMonth: m, hebrewYear: showYear ? year : undefined });
  };

  const handleYearChange = (val: string) => {
    const y = parseInt(val, 10);
    setYear(y);
    onChange({ hebrewDay: day, hebrewMonth: month, hebrewYear: y });
  };

  const dayOptions = Array.from({ length: maxDays }, (_, i) => i + 1);
  const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      <div className="flex gap-2 flex-wrap">
        {/* Day */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Day</Label>
          <Select value={String(day)} onValueChange={handleDayChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dayOptions.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Month</Label>
          <Select value={String(month)} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((m) => (
                <SelectItem key={m.num} value={String(m.num)}>
                  <span className="flex items-center gap-2">
                    <span>{m.nameEn}</span>
                    <span
                      dir="rtl"
                      lang="he"
                      className="text-muted-foreground text-xs"
                      style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                    >
                      {m.nameHe}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year (optional) */}
        {showYear && (
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Year</Label>
            <Select value={String(year)} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Adar note when year not specified */}
      {!showYear && month === 12 && (
        <p className="text-xs text-muted-foreground mt-1">
          Adar — in a leap year, this will be treated as Adar I
        </p>
      )}
    </div>
  );
}
