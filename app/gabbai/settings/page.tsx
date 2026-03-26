"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/components/providers/LanguageProvider";
import { Settings, Save, Mail, Bell, Building, Link2, MessageCircle, QrCode } from "lucide-react";

interface AllSettings {
  // Shul info
  shulName: string;
  shulAddress: string;
  shulEIN: string;
  // SMTP
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM: string;
  // Reminders
  no_aliyah_threshold_days: string;
  yahrtzeit_window_days: string;
  birthday_window_days: string;
  anniversary_window_days: string;
  bigDonorThreshold: string;
  gabbaiEmail: string;
  // Payment
  BIT_PHONE_NUMBER: string;
  PAYBOX_USER_ID: string;
  // WhatsApp
  TWILIO_WHATSAPP_ENABLED: string;
}

const DEFAULTS: AllSettings = {
  shulName: "",
  shulAddress: "",
  shulEIN: "",
  SMTP_HOST: "",
  SMTP_PORT: "587",
  SMTP_USER: "",
  SMTP_PASS: "",
  SMTP_FROM: "",
  no_aliyah_threshold_days: "365",
  yahrtzeit_window_days: "14",
  birthday_window_days: "14",
  anniversary_window_days: "14",
  bigDonorThreshold: "1000",
  gabbaiEmail: "",
  BIT_PHONE_NUMBER: "",
  PAYBOX_USER_ID: "",
  TWILIO_WHATSAPP_ENABLED: "false",
};

export default function SettingsPage() {
  const { t } = useLang();
  const [settings, setSettings] = useState<AllSettings>(DEFAULTS);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      setSettings((prev) => ({ ...prev, ...data }));
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const save = async (section: string, keys: (keyof AllSettings)[]) => {
    setSaving(section);
    const payload: Record<string, string> = {};
    for (const k of keys) {
      payload[k] = settings[k];
    }
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(null);
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  };

  const handleChange = (key: keyof AllSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((s) => ({ ...s, [key]: e.target.value }));
  };

  const generateInvite = async () => {
    setGeneratingInvite(true);
    setInviteLink(null);
    try {
      const res = await fetch("/api/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (res.ok) setInviteLink(data.url);
    } catch {
      // noop
    } finally {
      setGeneratingInvite(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendTestEmail = async () => {
    setTestEmailStatus("Sending...");
    try {
      // Just save current settings first
      await save("smtp", ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "gabbaiEmail"]);
      setTestEmailStatus("Settings saved. Email sending requires SMTP config — check server logs.");
    } catch {
      setTestEmailStatus("Error saving settings.");
    }
    setTimeout(() => setTestEmailStatus(null), 4000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
          <Settings className="h-6 w-6" />
          {t.nav.settings}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Configure shul information, email, and reminder thresholds</p>
      </div>

      {/* Shul Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4" />
            Shul Information
          </CardTitle>
          <CardDescription>Name, address, and EIN for receipts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Shul Name</Label>
            <Input value={settings.shulName} onChange={handleChange("shulName")} placeholder="Beth Israel" />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={settings.shulAddress} onChange={handleChange("shulAddress")} placeholder="123 Main St, Brooklyn, NY 11201" />
          </div>
          <div className="space-y-2">
            <Label>EIN / Tax ID</Label>
            <Input value={settings.shulEIN} onChange={handleChange("shulEIN")} placeholder="12-3456789" />
          </div>
          <Button
            size="sm"
            onClick={() => save("shul", ["shulName", "shulAddress", "shulEIN"])}
            disabled={saving === "shul"}
          >
            <Save className="h-4 w-4 mr-1" />
            {saving === "shul" ? "Saving..." : saved === "shul" ? "Saved!" : "Save"}
          </Button>
        </CardContent>
      </Card>

      {/* SMTP Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Settings (SMTP)
          </CardTitle>
          <CardDescription>Configure outgoing email for receipts and digests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input value={settings.SMTP_HOST} onChange={handleChange("SMTP_HOST")} placeholder="smtp.gmail.com" />
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input type="number" value={settings.SMTP_PORT} onChange={handleChange("SMTP_PORT")} placeholder="587" />
            </div>
            <div className="space-y-2">
              <Label>SMTP Username</Label>
              <Input value={settings.SMTP_USER} onChange={handleChange("SMTP_USER")} placeholder="gabbai@shul.org" />
            </div>
            <div className="space-y-2">
              <Label>SMTP Password</Label>
              <Input type="password" value={settings.SMTP_PASS} onChange={handleChange("SMTP_PASS")} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>From Address</Label>
              <Input value={settings.SMTP_FROM} onChange={handleChange("SMTP_FROM")} placeholder="Gabbai Center &lt;noreply@shul.org&gt;" />
            </div>
            <div className="space-y-2">
              <Label>Gabbai Email (digest recipient)</Label>
              <Input type="email" value={settings.gabbaiEmail} onChange={handleChange("gabbaiEmail")} placeholder="gabbai@shul.org" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={() => save("smtp", ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "gabbaiEmail"])}
              disabled={saving === "smtp"}
            >
              <Save className="h-4 w-4 mr-1" />
              {saving === "smtp" ? "Saving..." : saved === "smtp" ? "Saved!" : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={sendTestEmail}>
              Send Test Email
            </Button>
          </div>
          {testEmailStatus && (
            <p className="text-sm text-muted-foreground">{testEmailStatus}</p>
          )}
        </CardContent>
      </Card>

      {/* Reminder Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Reminder Thresholds
          </CardTitle>
          <CardDescription>Configure when reminder alerts are triggered</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Days without aliyah (alert threshold)</Label>
              <Input
                type="number"
                min="1"
                value={settings.no_aliyah_threshold_days}
                onChange={handleChange("no_aliyah_threshold_days")}
              />
            </div>
            <div className="space-y-2">
              <Label>Yahrtzeit window (days before)</Label>
              <Input
                type="number"
                min="1"
                value={settings.yahrtzeit_window_days}
                onChange={handleChange("yahrtzeit_window_days")}
              />
            </div>
            <div className="space-y-2">
              <Label>Birthday window (days before)</Label>
              <Input
                type="number"
                min="1"
                value={settings.birthday_window_days}
                onChange={handleChange("birthday_window_days")}
              />
            </div>
            <div className="space-y-2">
              <Label>Anniversary window (days before)</Label>
              <Input
                type="number"
                min="1"
                value={settings.anniversary_window_days}
                onChange={handleChange("anniversary_window_days")}
              />
            </div>
            <div className="space-y-2">
              <Label>Big donor threshold ($)</Label>
              <Input
                type="number"
                min="1"
                value={settings.bigDonorThreshold}
                onChange={handleChange("bigDonorThreshold")}
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() =>
              save("reminders", [
                "no_aliyah_threshold_days",
                "yahrtzeit_window_days",
                "birthday_window_days",
                "anniversary_window_days",
                "bigDonorThreshold",
              ])
            }
            disabled={saving === "reminders"}
          >
            <Save className="h-4 w-4 mr-1" />
            {saving === "reminders" ? "Saving..." : saved === "reminders" ? "Saved!" : "Save Thresholds"}
          </Button>
        </CardContent>
      </Card>

      {/* Invite Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Member Invite Link
          </CardTitle>
          <CardDescription>Generate a 7-day invite link for members to self-register</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Members can use this link to create their own account. Each link expires after 7 days and can only be used once.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={generateInvite}
              disabled={generatingInvite}
            >
              <Link2 className="h-4 w-4 mr-1" />
              {generatingInvite ? "Generating..." : "Generate Invite Link"}
            </Button>
            {inviteLink && (
              <Button size="sm" variant="outline" onClick={copyInviteLink}>
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            )}
          </div>
          {inviteLink && (
            <div className="p-3 bg-muted rounded-md text-xs font-mono break-all">
              {inviteLink}
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp Integration
          </CardTitle>
          <CardDescription>
            Send Shabbos sheets and messages via Twilio WhatsApp. Requires a WhatsApp-enabled Twilio number.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="whatsapp-enabled"
              checked={settings.TWILIO_WHATSAPP_ENABLED === "true"}
              onChange={(e) =>
                setSettings((s) => ({ ...s, TWILIO_WHATSAPP_ENABLED: e.target.checked ? "true" : "false" }))
              }
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="whatsapp-enabled">Enable WhatsApp sending</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in your .env.local file.
            The from number must be WhatsApp-enabled in your Twilio account.
          </p>
          <Button
            size="sm"
            onClick={() => save("whatsapp", ["TWILIO_WHATSAPP_ENABLED"])}
            disabled={saving === "whatsapp"}
          >
            <Save className="h-4 w-4 mr-1" />
            {saving === "whatsapp" ? "Saving..." : saved === "whatsapp" ? "Saved!" : "Save"}
          </Button>
        </CardContent>
      </Card>

      {/* Bit / Paybox */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Bit & Paybox QR Codes
          </CardTitle>
          <CardDescription>Configure Israeli payment apps for QR code generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bit Phone Number</Label>
              <Input
                value={settings.BIT_PHONE_NUMBER}
                onChange={handleChange("BIT_PHONE_NUMBER")}
                placeholder="+972501234567"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">The phone number linked to your Bit account</p>
            </div>
            <div className="space-y-2">
              <Label>Paybox User ID</Label>
              <Input
                value={settings.PAYBOX_USER_ID}
                onChange={handleChange("PAYBOX_USER_ID")}
                placeholder="123456"
              />
              <p className="text-xs text-muted-foreground">Your Paybox user/merchant ID</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => save("payment", ["BIT_PHONE_NUMBER", "PAYBOX_USER_ID"])}
            disabled={saving === "payment"}
          >
            <Save className="h-4 w-4 mr-1" />
            {saving === "payment" ? "Saving..." : saved === "payment" ? "Saved!" : "Save"}
          </Button>
        </CardContent>
      </Card>
      {/* Staff accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Staff &amp; Access
          </CardTitle>
          <CardDescription>Manage gabbai accounts and change your password</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <a
            href="/gabbai/settings/staff"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            Manage Staff Accounts →
          </a>
          <a
            href="/gabbai/settings/change-password"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            Change My Password →
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
