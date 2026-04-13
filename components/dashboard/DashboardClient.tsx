"use client";

import { useLang } from "@/components/providers/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HebrewCalendarDisplay } from "@/components/hebrew/HebrewCalendarDisplay";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Calendar,
  Star,
  DollarSign,
  Bell,
  BookOpen,
  Clock,
  AlertTriangle,
  CalendarDays,
  Megaphone,
  Sunrise,
  Sun,
  Sunset,
  ExternalLink,
  Moon,
} from "lucide-react";

interface UpcomingEvent {
  id: string;
  memberId: string;
  memberName: string;
  type: string;
  label: string | null;
  gregorianDate: string;
  daysAway: number;
  hebrewMonth: number;
}

interface RecentDonation {
  id: string;
  amount: number;
  method: string;
  member: { id: string; firstName: string; lastName: string };
}

interface ActiveAnnouncement {
  id: string;
  title: string;
  body: string;
  expiresDate: string | null;
}

interface MemberNeedingAliyah {
  id: string;
  firstName: string;
  lastName: string;
  lastAliyahDate: string | null;
}

interface ShabbosMinyanTime {
  id: string;
  name: string;
  time: string;
}

interface NextShabbosSchedule {
  id: string;
  leiningsCount: number;
  kibbudimCount: number;
}

interface DashboardClientProps {
  userEmail: string | null | undefined;
  shabbosDateStr: string;
  shabbosHebrew: string;
  parsha: string | null;
  zmanim: { neitz: string | null; chatzot: string | null; shkia: string | null } | null;
  isShabbosHaMevarchim: boolean;
  moladText: string | null;
  memberCount: number;
  activeCount: number;
  kibbudimThisMonth: number;
  totalThisYear: number;
  totalThisMonth: number;
  donationCount: number;
  currentYear: number;
  recentDonations: RecentDonation[];
  activeAnnouncements: ActiveAnnouncement[];
  nextShabbosSchedule: NextShabbosSchedule | null;
  shabbosMinyanTimes: ShabbosMinyanTime[];
  membersNeedingAliyah: MemberNeedingAliyah[];
  thresholdDays: number;
  upcoming14Days: UpcomingEvent[];
}

const EVENT_TYPE_LABELS_EN: Record<string, string> = {
  BIRTHDAY: "Birthday",
  ANNIVERSARY: "Anniversary",
  BAR_MITZVAH: "Bar/Bat Mitzvah",
  YAHRTZEIT: "Yahrtzeit",
  OTHER: "Other",
};

const EVENT_TYPE_LABELS_HE: Record<string, string> = {
  BIRTHDAY: "יום הולדת",
  ANNIVERSARY: "יום נישואין",
  BAR_MITZVAH: "בר/בת מצווה",
  YAHRTZEIT: "יארצייט",
  OTHER: "אחר",
};

const METHOD_LABELS_EN: Record<string, string> = {
  CASH: "Cash",
  CHECK: "Check",
  CREDIT_CARD: "Credit Card",
  ONLINE: "Online",
  OTHER: "Other",
};

const METHOD_LABELS_HE: Record<string, string> = {
  CASH: "מזומן",
  CHECK: "צ׳ק",
  CREDIT_CARD: "כרטיס אשראי",
  ONLINE: "אינטרנט",
  OTHER: "אחר",
};

export function DashboardClient({
  userEmail,
  shabbosDateStr,
  shabbosHebrew,
  parsha,
  zmanim,
  isShabbosHaMevarchim,
  moladText,
  memberCount,
  activeCount,
  kibbudimThisMonth,
  totalThisYear,
  totalThisMonth,
  donationCount,
  currentYear,
  recentDonations,
  activeAnnouncements,
  nextShabbosSchedule,
  shabbosMinyanTimes,
  membersNeedingAliyah,
  thresholdDays,
  upcoming14Days,
}: DashboardClientProps) {
  const { t, isRTL, lang } = useLang();

  const EVENT_TYPE_LABELS = lang === 'he' ? EVENT_TYPE_LABELS_HE : EVENT_TYPE_LABELS_EN;
  const METHOD_LABELS = lang === 'he' ? METHOD_LABELS_HE : METHOD_LABELS_EN;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{t.dashboard.title}</h1>
        <p className="text-muted-foreground">
          {t.common.welcome}, {userEmail}
        </p>
      </div>

      {/* Hebrew date + Shabbos card */}
      <Card className="bg-navy-900 text-white border-0">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <p className="text-navy-300 text-sm">{t.dashboard.today}</p>
              <HebrewCalendarDisplay className="mt-1" />
              {/* Zmanim */}
              {zmanim && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {zmanim.neitz && (
                    <span className="flex items-center gap-1 text-xs text-navy-300">
                      <Sunrise className="h-3 w-3 text-gold-400" />
                      {lang === "he" ? "נץ" : "Neitz"}: <span className="text-white">{zmanim.neitz}</span>
                    </span>
                  )}
                  {zmanim.chatzot && (
                    <span className="flex items-center gap-1 text-xs text-navy-300">
                      <Sun className="h-3 w-3 text-gold-400" />
                      {lang === "he" ? "חצות" : "Chatzot"}: <span className="text-white">{zmanim.chatzot}</span>
                    </span>
                  )}
                  {zmanim.shkia && (
                    <span className="flex items-center gap-1 text-xs text-navy-300">
                      <Sunset className="h-3 w-3 text-gold-400" />
                      {lang === "he" ? "שקיעה" : "Shkia"}: <span className="text-white">{zmanim.shkia}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className={isRTL ? "text-left" : "text-right"}>
              <p className="text-navy-300 text-sm">{t.dashboard.upcomingShabbos}</p>
              <p className="text-white font-medium">{shabbosDateStr}</p>
              <p
                className="text-gold-400 text-sm"
                dir="rtl"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
              >
                {shabbosHebrew}
              </p>
              {parsha && (
                <p className="text-navy-300 text-sm mt-0.5">{parsha}</p>
              )}
              <a
                href="https://www.ou.org/holidays/shabbat/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-navy-400 hover:text-navy-200 mt-1 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {lang === "he" ? "לוח OU" : "OU Calendar"}
              </a>
            </div>
          </div>

          {/* Shabbos Mevarchim banner */}
          {isShabbosHaMevarchim && (
            <div className="border-t border-white/10 pt-3 flex items-start gap-2">
              <Moon className="h-4 w-4 text-gold-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">
                  {lang === "he" ? "שבת מברכים" : "Shabbat Mevarchim"}
                </p>
                {moladText && (
                  <p className="text-xs text-navy-300 mt-0.5">{moladText}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions — high up so they're immediately accessible */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">{t.dashboard.quickActions}</h2>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/gabbai/members/new">
              <UserPlus className="h-4 w-4 me-1.5" />
              {t.dashboard.addMember}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/gabbai/members">
              <Users className="h-4 w-4 me-1.5" />
              {t.dashboard.viewDirectory}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/gabbai/schedule">
              <Calendar className="h-4 w-4 me-1.5" />
              {t.dashboard.schedule}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/gabbai/kibbudim">
              <Star className="h-4 w-4 me-1.5" />
              {t.dashboard.logKibbud}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/gabbai/minyan">
              <Clock className="h-4 w-4 me-1.5" />
              {t.dashboard.minyanTimes}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/gabbai/donations">
              <DollarSign className="h-4 w-4 me-1.5" />
              {t.donations.title}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/gabbai/announcements">
              <Megaphone className="h-4 w-4 me-1.5" />
              {t.announcements.title}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t.dashboard.totalMembers}
            </CardDescription>
            <CardTitle className="text-3xl">{memberCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              {t.dashboard.activeMembers}
            </CardDescription>
            <CardTitle className="text-3xl text-green-700">{activeCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Star className="h-4 w-4 text-gold-600" />
              {t.kibbudim.title} {t.dashboard.thisMonth}
            </CardDescription>
            <CardTitle className="text-3xl text-gold-700">{kibbudimThisMonth}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-navy-600" />
              {t.donations.title} {t.dashboard.ytd}
            </CardDescription>
            <CardTitle className="text-2xl text-navy-800">
              ${totalThisYear.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Donation Summary + Announcements row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-navy-600" />
              {t.donations.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.dashboard.thisMonth}</span>
              <span className="font-medium text-green-700">
                ${totalThisMonth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.dashboard.ytd} ({currentYear})</span>
              <span className="font-medium text-green-700">
                ${totalThisYear.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.donations.title} {currentYear}</span>
              <span className="font-medium">{donationCount}</span>
            </div>

            {recentDonations.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">{t.dashboard.recentDonations}</p>
                <div className="space-y-1.5">
                  {recentDonations.map((d) => (
                    <div key={d.id} className="flex justify-between items-center text-sm">
                      <div>
                        <Link
                          href={`/gabbai/members/${d.member.id}`}
                          className="hover:underline text-navy-800 font-medium"
                        >
                          {d.member.firstName} {d.member.lastName}
                        </Link>
                        <span className="text-xs text-muted-foreground ms-2">
                          {METHOD_LABELS[d.method] ?? d.method}
                        </span>
                      </div>
                      <span className="font-mono text-green-700">
                        ${d.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button asChild size="sm" variant="outline" className="w-full mt-2">
              <Link href="/gabbai/donations">{t.dashboard.viewAllDonations}</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Active Announcements Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-navy-600" />
              {t.dashboard.announcements}
              {activeAnnouncements.length > 0 && (
                <Badge className="ml-auto bg-navy-100 text-navy-800 text-xs">
                  {activeAnnouncements.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.dashboard.noActiveAnnouncements}</p>
            ) : (
              <div className="space-y-2">
                {activeAnnouncements.map((a) => (
                  <div key={a.id} className="text-sm py-1.5 border-b last:border-0">
                    <p className="font-medium text-navy-800">{a.title}</p>
                    <p className="text-muted-foreground text-xs line-clamp-1">{a.body}</p>
                    {a.expiresDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.dashboard.expires}:{" "}
                        {new Date(a.expiresDate).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/gabbai/announcements">{t.dashboard.manageAnnouncements}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Shabbos card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-navy-600" />
              {t.dashboard.thisShabbos}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-navy-800">
                {parsha ?? shabbosDateStr}
              </p>
              <p className="text-xs text-muted-foreground">{shabbosDateStr}</p>
            </div>

            {nextShabbosSchedule ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    <strong>{nextShabbosSchedule.leiningsCount}</strong> {t.dashboard.leinings}
                  </span>
                  <span>
                    <strong>{nextShabbosSchedule.kibbudimCount}</strong> {t.dashboard.kibbudim}
                  </span>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/gabbai/schedule/${nextShabbosSchedule.id}`}>
                    {t.dashboard.viewSchedule}
                  </Link>
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.dashboard.noScheduleYet}
                </p>
                <Button asChild size="sm" className="mt-2">
                  <Link href="/gabbai/schedule">{t.dashboard.createSchedule}</Link>
                </Button>
              </div>
            )}

            {shabbosMinyanTimes.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {t.dashboard.shabbosMinyanTimes}
                </p>
                <div className="space-y-1">
                  {shabbosMinyanTimes.map((mt) => (
                    <div key={mt.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{mt.name}</span>
                      <span className="font-medium tabular-nums">{mt.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-navy-600" />
              {t.dashboard.alerts}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {membersNeedingAliyah.length > 0 ? (
              <div>
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      {membersNeedingAliyah.length}{" "}
                      {membersNeedingAliyah.length !== 1
                        ? t.dashboard.membersWithoutAliyahPlural
                        : t.dashboard.membersWithoutAliyah}{" "}
                      {thresholdDays} {t.dashboard.days}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {membersNeedingAliyah.slice(0, 5).map((m) => (
                    <Link
                      key={m.id}
                      href={`/gabbai/members/${m.id}`}
                      className="flex items-center justify-between text-sm py-0.5 hover:text-navy-700"
                    >
                      <span>
                        {m.firstName} {m.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {m.lastAliyahDate
                          ? `${t.dashboard.last}: ${new Date(m.lastAliyahDate).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { month: "short", year: "numeric" })}`
                          : t.dashboard.never}
                      </span>
                    </Link>
                  ))}
                  {membersNeedingAliyah.length > 5 && (
                    <p className="text-xs text-muted-foreground pt-1">
                      +{membersNeedingAliyah.length - 5} {lang === 'he' ? 'נוספים' : 'more'}
                    </p>
                  )}
                </div>
                <Button asChild size="sm" variant="outline" className="mt-2">
                  <Link href="/gabbai/kibbudim">{t.dashboard.viewKibbudim}</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-green-500" />
                {t.dashboard.allMembersRecent}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming life events (14 days) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-navy-600" />
            {t.dashboard.upcomingEvents} (14 {t.dashboard.days})
          </CardTitle>
          <Button asChild size="sm" variant="ghost">
            <Link href="/gabbai/dashboard/calendar">{t.dashboard.viewAll30Days}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcoming14Days.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t.dashboard.noLifeEvents}
            </p>
          ) : (
            <ul className="space-y-2">
              {upcoming14Days.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">
                      {event.daysAway === 0
                        ? t.calendar.today
                        : event.daysAway === 1
                        ? t.calendar.tomorrow
                        : `${t.calendar.in} ${event.daysAway}${t.calendar.days}`}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {EVENT_TYPE_LABELS[event.type] ?? event.type}
                    </Badge>
                    <Link
                      href={`/gabbai/members/${event.memberId}`}
                      className="font-medium text-navy-800 hover:underline"
                    >
                      {event.memberName}
                    </Link>
                    {event.label && (
                      <span className="text-muted-foreground">{event.label}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(event.gregorianDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
