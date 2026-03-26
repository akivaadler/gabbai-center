"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/components/providers/LanguageProvider";
import { Plus, Trash2, X, Check } from "lucide-react";

type KibbudType = "ALIYAH" | "PETICHAH" | "GELILAH" | "HAGBAH" | "ARON" | "HAFTORAH" | "LEINING" | "OTHER";

interface Kibbud {
  id: string;
  type: string;
  aliyahNumber: string | null;
  occasion: string | null;
  date: string | Date;
  notes: string | null;
  shabbosSchedule?: { parsha: string | null; shabbosDate: string | Date } | null;
}

interface KibbudimSectionProps {
  memberId: string;
  initialKibbudim: Kibbud[];
  /** If true, read-only (member portal) */
  readOnly?: boolean;
}

const KIBBUD_COLORS: Record<string, string> = {
  ALIYAH: "bg-navy-100 text-navy-800",
  PETICHAH: "bg-gold-100 text-gold-800",
  GELILAH: "bg-green-100 text-green-800",
  HAGBAH: "bg-blue-100 text-blue-800",
  ARON: "bg-orange-100 text-orange-800",
  HAFTORAH: "bg-purple-100 text-purple-800",
  LEINING: "bg-teal-100 text-teal-800",
  OTHER: "bg-gray-100 text-gray-800",
};

const ALIYAH_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "MAFTIR"];

const defaultForm = {
  type: "ALIYAH" as KibbudType,
  aliyahNumber: "",
  occasion: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

export function KibbudimSection({ memberId, initialKibbudim, readOnly = false }: KibbudimSectionProps) {
  const [kibbudim, setKibbudim] = useState<Kibbud[]>(initialKibbudim);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const { t } = useLang();

  const KIBBUD_LABELS: Record<string, string> = {
    ALIYAH: t.kibbudim.aliyah,
    PETICHAH: t.kibbudim.petichah,
    GELILAH: t.kibbudim.gelilah,
    HAGBAH: t.kibbudim.hagbah,
    ARON: t.kibbudim.aron,
    HAFTORAH: t.kibbudim.haftorah,
    LEINING: t.kibbudim.leining,
    OTHER: t.kibbudim.other,
  };

  const resetForm = () => {
    setForm(defaultForm);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/kibbudim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          type: form.type,
          aliyahNumber: form.type === "ALIYAH" ? form.aliyahNumber : null,
          occasion: form.occasion || null,
          date: new Date(form.date).toISOString(),
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      const saved: Kibbud = await res.json();
      setKibbudim((prev) => [saved, ...prev]);
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.form.confirm)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/kibbudim/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setKibbudim((prev) => prev.filter((k) => k.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">{t.kibbudim.title}</CardTitle>
        {!showForm && !readOnly && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {t.kibbudim.log}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && !readOnly && (
          <form
            onSubmit={handleSubmit}
            className="border rounded-lg p-4 bg-muted/30 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">{t.kibbudim.log}</h3>
              <Button type="button" size="sm" variant="ghost" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label>{t.kibbudim.aliyahNumber}</Label>
                  <select
                    className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background"
                    value={form.aliyahNumber}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, aliyahNumber: e.target.value }))
                    }
                  >
                    <option value="">— Select —</option>
                    {ALIYAH_NUMBERS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="e.g. Bar Mitzvah, Shabbos Nachamu"
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
                placeholder="Optional notes..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={loading}>
                <Check className="h-4 w-4 mr-1" />
                {loading ? t.form.saving : t.kibbudim.log}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                {t.form.cancel}
              </Button>
            </div>
          </form>
        )}

        {kibbudim.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.kibbudim.noKibbudim}</p>
        ) : (
          <ul className="space-y-2">
            {kibbudim.slice(0, 20).map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
              >
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${KIBBUD_COLORS[k.type]}`}
                  >
                    {KIBBUD_LABELS[k.type] ?? k.type}
                    {k.aliyahNumber ? ` #${k.aliyahNumber}` : ""}
                  </span>
                  <span className="text-sm">
                    {k.occasion || KIBBUD_LABELS[k.type] || k.type}
                  </span>
                  {k.shabbosSchedule?.parsha && (
                    <span className="text-xs text-muted-foreground">
                      — {k.shabbosSchedule.parsha}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {new Date(k.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {!readOnly && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(k.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
            {kibbudim.length > 20 && (
              <p className="text-xs text-muted-foreground pt-1">
                {`Showing 20 of ${kibbudim.length} records.`}
              </p>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
