"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/components/providers/LanguageProvider";
import { Bell, AlertTriangle, Info, RefreshCw, Settings2, Save } from "lucide-react";
import type { ReminderAlert } from "@/lib/reminders";

const TYPE_ICONS: Record<string, string> = {
  NO_ALIYAH_IN_X_DAYS: "🕍",
  YAHRTZEIT_UPCOMING: "🕯",
  BIRTHDAY_UPCOMING: "🎂",
  ANNIVERSARY_UPCOMING: "💍",
  BIG_DONOR: "⭐",
};

const SEVERITY_VARIANTS: Record<string, "destructive" | "warning" | "secondary"> = {
  urgent: "destructive",
  warning: "warning",
  info: "secondary",
};

const TYPE_KEYS = [
  "NO_ALIYAH_IN_X_DAYS",
  "YAHRTZEIT_UPCOMING",
  "BIRTHDAY_UPCOMING",
  "ANNIVERSARY_UPCOMING",
];

interface Settings {
  no_aliyah_threshold_days: string;
  yahrtzeit_window_days: string;
  birthday_window_days: string;
  anniversary_window_days: string;
  bigDonorThreshold: string;
  gabbaiEmail: string;
}

const DEFAULT_SETTINGS: Settings = {
  no_aliyah_threshold_days: "365",
  yahrtzeit_window_days: "14",
  birthday_window_days: "14",
  anniversary_window_days: "14",
  bigDonorThreshold: "1000",
  gabbaiEmail: "",
};

export default function RemindersPage() {
  const { t, isRTL } = useLang();
  const [alerts, setAlerts] = useState<ReminderAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/reminders");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      setSettings((prev) => ({ ...prev, ...data }));
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchSettings();
  }, [fetchAlerts, fetchSettings]);

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
      // Re-run reminders with new settings
      await fetchAlerts();
    } finally {
      setSettingsSaving(false);
    }
  };

  // Group alerts by type
  const grouped: Record<string, ReminderAlert[]> = {};
  for (const a of alerts) {
    if (!grouped[a.type]) grouped[a.type] = [];
    grouped[a.type].push(a);
  }

  const urgentCount = alerts.filter((a) => a.severity === "urgent").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            {t.reminders.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? t.common.loading : `${alerts.length} active alert${alerts.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings((v) => !v)}
          >
            <Settings2 className="h-4 w-4 mr-1" />
            Thresholds
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlerts}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Urgent</span>
            </div>
            <p className="text-2xl font-bold text-red-700 mt-1">{urgentCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Warning</span>
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-1">{warningCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Info</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {alerts.length - urgentCount - warningCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <Card className="border-gold-200">
          <CardHeader>
            <CardTitle className="text-base">Reminder Thresholds</CardTitle>
            <CardDescription>Configure when alerts are triggered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Days without aliyah</Label>
                <Input
                  type="number"
                  min="1"
                  value={settings.no_aliyah_threshold_days}
                  onChange={(e) => setSettings((s) => ({ ...s, no_aliyah_threshold_days: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Yahrtzeit window (days before)</Label>
                <Input
                  type="number"
                  min="1"
                  value={settings.yahrtzeit_window_days}
                  onChange={(e) => setSettings((s) => ({ ...s, yahrtzeit_window_days: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Birthday window (days before)</Label>
                <Input
                  type="number"
                  min="1"
                  value={settings.birthday_window_days}
                  onChange={(e) => setSettings((s) => ({ ...s, birthday_window_days: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Anniversary window (days before)</Label>
                <Input
                  type="number"
                  min="1"
                  value={settings.anniversary_window_days}
                  onChange={(e) => setSettings((s) => ({ ...s, anniversary_window_days: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Big donor threshold ($)</Label>
                <Input
                  type="number"
                  min="1"
                  value={settings.bigDonorThreshold}
                  onChange={(e) => setSettings((s) => ({ ...s, bigDonorThreshold: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Gabbai email for digest</Label>
                <Input
                  type="email"
                  value={settings.gabbaiEmail}
                  onChange={(e) => setSettings((s) => ({ ...s, gabbaiEmail: e.target.value }))}
                  placeholder="gabbai@shul.org"
                />
              </div>
            </div>
            <Button onClick={handleSaveSettings} disabled={settingsSaving} size="sm">
              <Save className="h-4 w-4 mr-1" />
              {settingsSaving ? "Saving..." : settingsSaved ? "Saved!" : "Save Thresholds"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alerts grouped by type */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t.common.loading}</div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-3 text-green-500" />
            <p className="font-medium text-green-700">{t.reminders.noReminders}</p>
            <p className="text-sm mt-1">All members are up to date!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
          {Object.entries(grouped).map(([type, typeAlerts]) => (
            <Card key={type}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>{TYPE_ICONS[type] ?? "🔔"}</span>
                  {type === "NO_ALIYAH_IN_X_DAYS" && t.reminders.noAliyah}
                  {type === "YAHRTZEIT_UPCOMING" && t.reminders.yahrtzeit}
                  {type === "BIRTHDAY_UPCOMING" && t.reminders.birthday}
                  {type === "ANNIVERSARY_UPCOMING" && t.reminders.anniversary}
                  {type === "BIG_DONOR" && t.reminders.bigDonor}
                  {!TYPE_KEYS.includes(type) && type !== "BIG_DONOR" && type}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {typeAlerts.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {typeAlerts.map((alert) => (
                    <li
                      key={alert.id}
                      className="flex items-start justify-between gap-3 py-2 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={SEVERITY_VARIANTS[alert.severity]} className="text-xs">
                            {alert.severity}
                          </Badge>
                          <Link
                            href={`/members/${alert.memberId}`}
                            className="font-medium text-navy-800 hover:underline text-sm"
                          >
                            {alert.memberName}
                          </Link>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        <p
                          className="text-xs text-muted-foreground mt-0.5"
                          dir="rtl"
                          lang="he"
                          style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                        >
                          {alert.messageHe}
                        </p>
                        {alert.date && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(alert.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
