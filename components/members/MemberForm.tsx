"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

type MemberFormData = {
  firstName: string;
  lastName: string;
  hebrewName: string;
  hebrewMotherName: string;
  email: string;
  phone: string;
  address: string;
  memberSince: string;
  isActive: boolean;
  notes: string;
};

interface MemberFormProps {
  initialData?: Partial<MemberFormData>;
  memberId?: string;
  mode: "create" | "edit";
  /** If true, hide gabbai-only fields (notes, isActive) */
  memberView?: boolean;
}

export function MemberForm({ initialData, memberId, mode, memberView = false }: MemberFormProps) {
  const router = useRouter();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<MemberFormData>({
    firstName: initialData?.firstName ?? "",
    lastName: initialData?.lastName ?? "",
    hebrewName: initialData?.hebrewName ?? "",
    hebrewMotherName: initialData?.hebrewMotherName ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    address: initialData?.address ?? "",
    memberSince: initialData?.memberSince ?? "",
    isActive: initialData?.isActive ?? true,
    notes: initialData?.notes ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "create" ? "/api/members" : `/api/members/${memberId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const body = {
        ...formData,
        memberSince: formData.memberSince ? new Date(formData.memberSince).toISOString() : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save member");
      }

      const saved = await res.json();
      if (memberView) {
        router.push(`/member/portal/profile`);
      } else {
        router.push(`/gabbai/members/${saved.id}`);
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!memberId) return;
    if (!confirm(t.form.confirm)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete member");
      router.push("/gabbai/members");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t.form.firstName} *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            placeholder={t.form.firstName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t.form.lastName} *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            placeholder={t.form.lastName}
          />
        </div>
      </div>

      {/* Hebrew Names */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hebrewName">{t.form.hebrewName} (Father)</Label>
          <p className="text-xs text-muted-foreground">e.g. ראובן בן יעקב</p>
          <Input
            id="hebrewName"
            name="hebrewName"
            value={formData.hebrewName}
            onChange={handleChange}
            dir="rtl"
            lang="he"
            placeholder="ראובן בן יעקב"
            className="font-frank text-right"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hebrewMotherName">{t.members.hebrewMotherName}</Label>
          <p className="text-xs text-muted-foreground">e.g. שרה בת רבקה</p>
          <Input
            id="hebrewMotherName"
            name="hebrewMotherName"
            value={formData.hebrewMotherName}
            onChange={handleChange}
            dir="rtl"
            lang="he"
            placeholder="שרה בת רבקה"
            className="font-frank text-right"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">{t.form.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="member@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t.form.phone}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(718) 555-1234"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">{t.form.address}</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main St, Brooklyn, NY 11201"
        />
      </div>

      {!memberView && (
        <div className="space-y-2">
          <Label htmlFor="memberSince">{t.members.memberSince}</Label>
          <Input
            id="memberSince"
            name="memberSince"
            type="date"
            value={formData.memberSince}
            onChange={handleChange}
          />
        </div>
      )}

      {!memberView && (
        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isActive">{t.members.active}</Label>
        </div>
      )}

      {/* Gabbai Notes — only shown to gabbai */}
      {!memberView && (
        <div className="space-y-2">
          <Label htmlFor="notes">{t.members.notes}</Label>
          <p className="text-xs text-muted-foreground">
            These notes are only visible to Gabbaim.
          </p>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Internal notes about this member..."
            rows={4}
          />
        </div>
      )}

      {/* Actions */}
      <div className={cn("flex gap-3", mode === "edit" && !memberView && "justify-between")}>
        {mode === "edit" && !memberView && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {t.form.delete}
          </Button>
        )}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            {t.form.cancel}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t.form.saving : mode === "create" ? t.form.add : t.form.save}
          </Button>
        </div>
      </div>
    </form>
  );
}
