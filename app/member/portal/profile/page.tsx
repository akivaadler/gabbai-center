"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/components/providers/LanguageProvider";
import { HebrewNameDisplay } from "@/components/hebrew/HebrewNameDisplay";
import { LifeEventsSection } from "@/components/members/LifeEventsSection";
import { User, Save } from "lucide-react";

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  hebrewName: string | null;
  hebrewMotherName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  memberSince: string | null;
  preferences: string | null;
  lifeEvents: Array<{
    id: string;
    type: string;
    label: string | null;
    hebrewDay: number;
    hebrewMonth: number;
    hebrewYear: number | null;
    recurs: boolean;
    notifyGabbai: boolean;
    linkedMemberName: string | null;
    notes: string | null;
  }>;
}

export default function MemberProfilePage() {
  const { data: session } = useSession();
  const { t } = useLang();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    hebrewName: "",
    hebrewMotherName: "",
    email: "",
    phone: "",
    address: "",
  });

  const fetchMember = useCallback(async () => {
    if (!session?.user?.memberId) return;
    const res = await fetch(`/api/members/${session.user.memberId}`);
    if (res.ok) {
      const data: MemberData = await res.json();
      setMember(data);
      setForm({
        firstName: data.firstName,
        lastName: data.lastName,
        hebrewName: data.hebrewName ?? "",
        hebrewMotherName: data.hebrewMotherName ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
      });
    }
    setLoading(false);
  }, [session?.user?.memberId]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((s) => ({ ...s, [key]: e.target.value }));
  };

  const handleSave = async () => {
    if (!member) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">{t.common.loading}</div>;
  }

  if (!member) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No member profile linked to this account.</p>
        <p className="text-sm mt-2">Contact the gabbai to link your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
          <User className="h-6 w-6" />
          {t.nav.profile}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t.common.welcome},{" "}
          <span className="font-medium">
            {member.firstName} {member.lastName}
          </span>
          {member.hebrewName && (
            <span className="ml-2">
              (<HebrewNameDisplay hebrewName={member.hebrewName} />)
            </span>
          )}
        </p>
      </div>

      {/* Personal Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.members.personalInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.form.firstName} *</Label>
              <Input value={form.firstName} onChange={handleChange("firstName")} required />
            </div>
            <div className="space-y-2">
              <Label>{t.form.lastName} *</Label>
              <Input value={form.lastName} onChange={handleChange("lastName")} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.form.hebrewName} (Father)</Label>
              <p className="text-xs text-muted-foreground">e.g. ראובן בן יעקב</p>
              <Input
                value={form.hebrewName}
                onChange={handleChange("hebrewName")}
                dir="rtl"
                lang="he"
                placeholder="ראובן בן יעקב"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.members.hebrewMotherName}</Label>
              <p className="text-xs text-muted-foreground">e.g. שרה בת רבקה</p>
              <Input
                value={form.hebrewMotherName}
                onChange={handleChange("hebrewMotherName")}
                dir="rtl"
                lang="he"
                placeholder="שרה בת רבקה"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                className="text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.form.email}</Label>
              <Input type="email" value={form.email} onChange={handleChange("email")} />
            </div>
            <div className="space-y-2">
              <Label>{t.form.phone}</Label>
              <Input type="tel" value={form.phone} onChange={handleChange("phone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.form.address}</Label>
            <Input value={form.address} onChange={handleChange("address")} />
          </div>

          {member.memberSince && (
            <p className="text-sm text-muted-foreground">
              {t.members.memberSince}:{" "}
              {new Date(member.memberSince).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}

          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-1" />
            {saving ? t.form.saving : saved ? t.common.success : t.form.save}
          </Button>
        </CardContent>
      </Card>

      {/* Life Events */}
      <LifeEventsSection
        memberId={member.id}
        initialEvents={member.lifeEvents}
        memberView={true}
      />
    </div>
  );
}
