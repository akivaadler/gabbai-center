import React from "react";
import { cn } from "@/lib/utils";

interface HebrewNameDisplayProps {
  hebrewName: string | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl font-bold",
};

export function HebrewNameDisplay({
  hebrewName,
  className,
  size = "md",
}: HebrewNameDisplayProps) {
  if (!hebrewName) return null;

  return (
    <span
      dir="rtl"
      lang="he"
      className={cn(
        "font-frank inline-block",
        sizeClasses[size],
        className
      )}
      style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
    >
      {hebrewName}
    </span>
  );
}
