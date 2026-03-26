"use client";

import { signOut } from "next-auth/react";
import { HebrewCalendarDisplay } from "@/components/hebrew/HebrewCalendarDisplay";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLang } from "@/components/providers/LanguageProvider";
import { LogOut } from "lucide-react";

interface GabbaiHeaderProps {
  user: { email?: string | null; name?: string | null };
}

export function GabbaiHeader({ user }: GabbaiHeaderProps) {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-border px-6 py-2.5 md:ps-6 ps-14">
      <div className="hidden md:block">
        <HebrewCalendarDisplay showGregorian={true} />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <LanguageToggle />
        <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t.common.logout}
        </button>
      </div>
    </header>
  );
}
