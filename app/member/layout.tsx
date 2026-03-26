"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLang } from "@/components/providers/LanguageProvider";
import { HebrewCalendarDisplay } from "@/components/hebrew/HebrewCalendarDisplay";
import { Button } from "@/components/ui/button";
import { LogOut, User, Calendar, Megaphone, Star, DollarSign, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLang();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t.common.loading}</p>
      </div>
    );
  }

  if (!session?.user) return null;

  const navItems = [
    { href: "/member/portal/profile", label: t.nav.profile, icon: User },
    { href: "/member/portal/schedule", label: t.nav.mySchedule, icon: Calendar },
    { href: "/member/portal/announcements", label: t.nav.announcements2, icon: Megaphone },
    { href: "/member/portal/kibbudim", label: t.nav.kibbudim, icon: Star },
    { href: "/member/portal/donations", label: t.nav.donations, icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-navy-900 text-white sticky top-0 z-20 shadow-md">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo / title */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
              <span className="text-xs text-navy-900" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>✡</span>
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">Member Portal</p>
              <p className="text-xs text-navy-400 leading-tight hidden sm:block">{session.user.email}</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-navy-700 text-white"
                      : "text-navy-300 hover:bg-navy-800 hover:text-white"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <HebrewCalendarDisplay className="text-navy-300 text-xs" />
            </div>
            <LanguageToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-navy-300 hover:text-white hover:bg-navy-800 hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-1" />
              {t.common.logout}
            </Button>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-navy-800"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-navy-700 px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-navy-700 text-white"
                      : "text-navy-300 hover:bg-navy-800 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-navy-300 hover:text-white w-full justify-start px-3"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t.common.logout}
            </Button>
          </nav>
        )}
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
