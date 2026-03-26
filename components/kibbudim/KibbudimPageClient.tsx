"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Check } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";

type KibbudType = "ALIYAH" | "PETICHAH" | "GELILAH" | "HAGBAH" | "ARON" | "HAFTORAH" | "LEINING" | "OTHER";

const ALIYAH_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "MAFTIR"];

interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

interface KibbudimPageClientProps {
  members: Member[];
}

function SimpleModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 z-10">
        {children}
      </div>
    </div>
  );
}

export function KibbudimPageClient({ members }: KibbudimPageClientProps) {
  const router = useRouter();
  const { t } = useLang();
  const KIBBUD_LABELS: Record<KibbudType, string> = {
    ALIYAH: t.kibbudim.aliyah,
    PETICHAH: t.kibbudim.petichah,
    GELILAH: t.kibbudim.gelilah,
    HAGBAH: t.kibbudim.hagbah,
    ARON: t.kibbudim.aron,
    HAFTORAH: t.kibbudim.haftorah,
    LEINING: t.kibbudim.leining,
    OTHER: t.kibbudim.other,
  };
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    memberId: "",
    type: "ALIYAH" as KibbudType,
    aliyahNumber: "",
    occasion: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.memberId) {
      setError(t.common.error);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/kibbudim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: form.memberId,
          type: form.type,
          aliyahNumber: form.type === "ALIYAH" ? form.aliyahNumber || null : null,
          occasion: form.occasion || null,
          date: new Date(form.date).toISOString(),
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      setOpen(false);
      setForm({
        memberId: "",
        type: "ALIYAH",
        aliyahNumber: "",
        occasion: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 me-2" />
        {t.kibbudim.log}
      </Button>

      <SimpleModal open={open} onClose={() => setOpen(false)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t.kibbudim.log}</h2>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>{t.kibbudim.member} *</Label>
            <select
              className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background"
              value={form.memberId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, memberId: e.target.value }))
              }
              required
            >
              <option value="">— {t.kibbudim.member} —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.form.type} *</Label>
              <select
                className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background"
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value as KibbudType }))
                }
              >
                {Object.entries(KIBBUD_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {form.type === "ALIYAH" && (
              <div className="space-y-2">
                <Label>{t.kibbudim.aliyahHash}</Label>
                <select
                  className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background"
                  value={form.aliyahNumber}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, aliyahNumber: e.target.value }))
                  }
                >
                  <option value="">— {t.form.optional} —</option>
                  {ALIYAH_NUMBERS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.form.date} *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t.form.occasion}</Label>
              <Input
                value={form.occasion}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, occasion: e.target.value }))
                }
                placeholder="e.g. Shabbos Nachamu"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.form.notes}</Label>
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={2}
              placeholder={t.form.optional}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {t.form.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              <Check className="h-4 w-4 me-1" />
              {loading ? t.form.saving : t.kibbudim.log}
            </Button>
          </div>
        </form>
      </SimpleModal>
    </>
  );
}
