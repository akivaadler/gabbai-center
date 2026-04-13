"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Star,
  DollarSign,
  Settings,
  BookOpen,
  Clock,
  Megaphone,
  Bell,
  X,
  Menu,
  Home,
  Award,
  MessageSquare,
  Upload,
  GraduationCap,
  HandCoins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/providers/LanguageProvider";

function NavItems({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { t } = useLang();

  const navItems = [
    { href: "/gabbai/dashboard",          label: t.nav.dashboard,     icon: LayoutDashboard },
    { href: "/gabbai/members",            label: t.nav.members,       icon: Users },
    { href: "/gabbai/families",           label: t.nav.families,      icon: Home },
    { href: "/gabbai/schedule",           label: t.nav.schedule,      icon: Calendar },
    { href: "/gabbai/minyan",             label: t.nav.minyan,        icon: Clock },
    { href: "/gabbai/kibbudim",           label: t.nav.kibbudim,      icon: Star },
    { href: "/gabbai/dashboard/calendar", label: t.nav.calendar,      icon: BookOpen },
    { href: "/gabbai/shiurim",            label: t.nav.shiurim,       icon: GraduationCap },
    { href: "/gabbai/bnei-mitzva",        label: t.nav.bneiMitzva,    icon: Award },
    { href: "/gabbai/donations",          label: t.nav.donations,     icon: DollarSign },
    { href: "/gabbai/pledges",            label: t.pledges.title,     icon: HandCoins },
    { href: "/gabbai/announcements",      label: t.nav.announcements, icon: Megaphone },
    { href: "/gabbai/reminders",          label: t.nav.reminders,     icon: Bell },
    { href: "/gabbai/sms",               label: t.nav.sms,           icon: MessageSquare },
    { href: "/gabbai/members/import",     label: t.nav.import,        icon: Upload },
    { href: "/gabbai/settings",           label: t.nav.settings,      icon: Settings },
  ];

  return (
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/gabbai/dashboard"
            ? pathname === "/gabbai/dashboard"
            : item.href === "/gabbai/dashboard/calendar"
            ? pathname.startsWith("/gabbai/dashboard/calendar")
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors min-h-[40px]",
              isActive
                ? "bg-white/10 text-white font-medium"
                : "text-navy-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <>
      <div className="px-4 py-4 border-b border-white/8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center shrink-0">
              <span
                className="text-xs text-white/80"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
              >
                ✡
              </span>
            </div>
            <div>
              <p className="font-medium text-sm text-white leading-tight">Gabbai Center</p>
              <p className="text-xs text-navy-400 leading-tight">
                {process.env.NEXT_PUBLIC_SHUL_NAME ?? "Beth Israel"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 text-navy-400 hover:text-white md:hidden"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <NavItems onClose={onClose} />

      <div className="px-4 py-3 border-t border-white/8">
        <p className="text-xs text-navy-600">v1.0</p>
      </div>
    </>
  );
}

export function GabbaiSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 p-2 rounded bg-navy-900 text-white shadow"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-navy-900 text-white flex flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </div>

      <aside className="hidden md:flex w-56 flex-col bg-navy-900 text-white shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
