"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HebrewDatePicker, HebrewDateValue } from "@/components/hebrew/HebrewDatePicker";
import { HEBREW_MONTHS, getGregorianForCurrentYear } from "@/lib/hebrew";
import { useLang } from "@/components/providers/LanguageProvider";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

type LifeEventType = "BIRTHDAY" | "ANNIVERSARY" | "BAR_MITZVAH" | "YAHRTZEIT" | "OTHER";

interface LifeEvent {
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
}

interface LifeEventsSectionProps {
  memberId: string;
  initialEvents: LifeEvent[];
  /** If true, show only own events, disable notifyGabbai display */
  memberView?: boolean;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  BIRTHDAY: "bg-blue-100 text-blue-800",
  ANNIVERSARY: "bg-pink-100 text-pink-800",
  BAR_MITZVAH: "bg-gold-100 text-gold-800",
  YAHRTZEIT: "bg-gray-100 text-gray-800",
  OTHER: "bg-purple-100 text-purple-800",
};

function formatHebrewDateDisplay(day: number, month: number, year: number | null): string {
  const monthName = HEBREW_MONTHS.find((m) => m.num === month);
  const monthHe = monthName?.nameHe ?? "";
  const monthEn = monthName?.nameEn ?? "";
  if (year) {
    return `${day} ${monthEn} ${year} | ${day} ${monthHe}`;
  }
  return `${day} ${monthEn} | ${day} ${monthHe}`;
}

function getGregorianEquivalent(day: number, month: number): string {
  try {
    const greg = getGregorianForCurrentYear(day, month);
    return greg.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

const defaultForm = {
  type: "BIRTHDAY" as string,
  label: "",
  hebrewDate: { hebrewDay: 1, hebrewMonth: 7 } as HebrewDateValue,
  recurs: true,
  notifyGabbai: true,
  linkedMemberName: "",
  notes: "",
};

export function LifeEventsSection({ memberId, initialEvents, memberView = false }: LifeEventsSectionProps) {
  const [events, setEvents] = useState<LifeEvent[]>(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const { t } = useLang();

  const EVENT_TYPE_LABELS: Record<string, string> = {
    BIRTHDAY: t.lifeEvents.birthday,
    ANNIVERSARY: t.lifeEvents.anniversary,
    BAR_MITZVAH: t.lifeEvents.barMitzvah,
    YAHRTZEIT: t.lifeEvents.yahrtzeit,
    OTHER: t.lifeEvents.other,
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const startEdit = (event: LifeEvent) => {
    setForm({
      type: event.type,
      label: event.label ?? "",
      hebrewDate: {
        hebrewDay: event.hebrewDay,
        hebrewMonth: event.hebrewMonth,
        hebrewYear: event.hebrewYear ?? undefined,
      },
      recurs: event.recurs,
      notifyGabbai: event.notifyGabbai,
      linkedMemberName: event.linkedMemberName ?? "",
      notes: event.notes ?? "",
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      type: form.type,
      label: form.label || null,
      hebrewDay: form.hebrewDate.hebrewDay,
      hebrewMonth: form.hebrewDate.hebrewMonth,
      hebrewYear: form.hebrewDate.hebrewYear ?? null,
      recurs: form.recurs,
      notifyGabbai: form.notifyGabbai,
      linkedMemberName: form.linkedMemberName || null,
      notes: form.notes || null,
    };

    try {
      let res: Response;
      if (editingId) {
        res = await fetch(`/api/life-events/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/members/${memberId}/life-events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      const saved: LifeEvent = await res.json();

      if (editingId) {
        setEvents((prev) => prev.map((e) => (e.id === editingId ? saved : e)));
      } else {
        setEvents((prev) => [saved, ...prev]);
      }

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
      const res = await fetch(`/api/life-events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">{t.lifeEvents.title}</CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {t.lifeEvents.add}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="border rounded-lg p-4 bg-muted/30 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">
                {editingId ? t.form.edit : t.lifeEvents.add}
              </h3>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.form.type} *</Label>
                <select
                  className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background"
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, type: e.target.value as LifeEventType }))
                  }
                >
                  {Object.entries(EVENT_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>{t.form.label}</Label>
                <Input
                  value={form.label}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, label: e.target.value }))
                  }
                  placeholder="e.g. Father's yahrtzeit"
                />
              </div>
            </div>

            <HebrewDatePicker
              label={`${t.lifeEvents.hebrewDate} *`}
              value={form.hebrewDate}
              onChange={(val) => setForm((prev) => ({ ...prev, hebrewDate: val }))}
              showYear={form.type === "BAR_MITZVAH" || form.type === "YAHRTZEIT"}
            />

            {/* Show Gregorian equivalent */}
            {form.hebrewDate.hebrewDay && form.hebrewDate.hebrewMonth && (
              <p className="text-xs text-muted-foreground">
                {t.lifeEvents.gregorianEquiv}:{" "}
                <strong>
                  {getGregorianEquivalent(
                    form.hebrewDate.hebrewDay,
                    form.hebrewDate.hebrewMonth
                  )}
                </strong>
              </p>
            )}

            {(form.type === "YAHRTZEIT" || form.type === "ANNIVERSARY") && (
              <div className="space-y-2">
                <Label>{t.lifeEvents.linkedName}</Label>
                <Input
                  value={form.linkedMemberName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, linkedMemberName: e.target.value }))
                  }
                  placeholder="e.g. Name of niftar"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.recurs}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, recurs: e.target.checked }))
                  }
                  className="h-4 w-4 rounded"
                />
                {t.lifeEvents.recurs}
              </label>
              {!memberView && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifyGabbai}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, notifyGabbai: e.target.checked }))
                    }
                    className="h-4 w-4 rounded"
                  />
                  {t.lifeEvents.notifyGabbai}
                </label>
              )}
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
                {loading ? t.form.saving : editingId ? t.form.save : t.lifeEvents.add}
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

        {/* Event list */}
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No life events recorded yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => {
              const gregEquiv = getGregorianEquivalent(event.hebrewDay, event.hebrewMonth);
              return (
                <li
                  key={event.id}
                  className="flex items-start justify-between gap-3 py-2 border-b last:border-0"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${EVENT_TYPE_COLORS[event.type]}`}
                      >
                        {EVENT_TYPE_LABELS[event.type] ?? event.type}
                      </span>
                      <span className="text-sm font-medium">
                        {event.label || EVENT_TYPE_LABELS[event.type] || event.type}
                      </span>
                      {event.linkedMemberName && (
                        <span className="text-xs text-muted-foreground">
                          — {event.linkedMemberName}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span
                        dir="rtl"
                        lang="he"
                        style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                        className="text-sm text-navy-800"
                      >
                        {formatHebrewDateDisplay(
                          event.hebrewDay,
                          event.hebrewMonth,
                          event.hebrewYear
                        )}
                      </span>
                      {gregEquiv && (
                        <span className="text-muted-foreground">({gregEquiv})</span>
                      )}
                    </div>
                    {event.notes && (
                      <p className="text-xs text-muted-foreground">{event.notes}</p>
                    )}
                    <div className="flex gap-2">
                      {event.recurs && (
                        <Badge variant="outline" className="text-xs py-0">
                          {t.lifeEvents.recurs}
                        </Badge>
                      )}
                      {!memberView && event.notifyGabbai && (
                        <Badge variant="outline" className="text-xs py-0">
                          {t.lifeEvents.notifyGabbai}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => startEdit(event)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(event.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
