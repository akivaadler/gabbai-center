"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/providers/LanguageProvider";
import { Plus, Pencil, Trash2, BookOpen, X } from "lucide-react";

interface Shiur {
  id: string;
  title: string;
  titleHe: string | null;
  description: string | null;
  teacher: string | null;
  dayOfWeek: string | null;
  time: string | null;
  location: string | null;
  isActive: boolean;
  notes: string | null;
}

const DAY_LABELS: Record<string, string> = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "SHABBOS": "Shabbos",
  "DAILY": "Daily",
};

interface ShiurimClientProps {
  initialShiurim: Shiur[];
}

const EMPTY_FORM = {
  title: "",
  titleHe: "",
  description: "",
  teacher: "",
  dayOfWeek: "",
  time: "",
  location: "",
  isActive: true,
  notes: "",
};

export function ShiurimClient({ initialShiurim }: ShiurimClientProps) {
  const { t, isRTL } = useLang();
  const [shiurim, setShiurim] = useState<Shiur[]>(initialShiurim);
  const [showForm, setShowForm] = useState(false);
  const [editShiur, setEditShiur] = useState<Shiur | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openAdd() {
    setEditShiur(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  function openEdit(shiur: Shiur) {
    setEditShiur(shiur);
    setForm({
      title: shiur.title,
      titleHe: shiur.titleHe ?? "",
      description: shiur.description ?? "",
      teacher: shiur.teacher ?? "",
      dayOfWeek: shiur.dayOfWeek ?? "",
      time: shiur.time ?? "",
      location: shiur.location ?? "",
      isActive: shiur.isActive,
      notes: shiur.notes ?? "",
    });
    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditShiur(null);
    setError("");
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editShiur) {
        const res = await fetch(`/api/shiurim/${editShiur.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed");
        const updated = await res.json();
        setShiurim((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const res = await fetch("/api/shiurim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed");
        const created = await res.json();
        setShiurim((prev) => [...prev, created]);
      }
      closeForm();
    } catch {
      setError(t.common.error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.form.confirm)) return;
    const res = await fetch(`/api/shiurim/${id}`, { method: "DELETE" });
    if (res.ok) {
      setShiurim((prev) => prev.filter((s) => s.id !== id));
    }
  }

  async function handleToggle(shiur: Shiur) {
    const res = await fetch(`/api/shiurim/${shiur.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !shiur.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setShiurim((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.shiurim.title}</h1>
          <p className="text-sm text-muted-foreground">{shiurim.length} shiurim</p>
        </div>
        <Button onClick={openAdd} className="bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4 mr-2" />
          {t.shiurim.addShiur}
        </Button>
      </div>

      {showForm && (
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {editShiur ? t.shiurim.editShiur : t.shiurim.addShiur}
              </CardTitle>
              <button onClick={closeForm} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t.shiurim.title} *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Torah class title"
                />
              </div>
              <div className="space-y-1">
                <Label>{t.shiurim.titleHe}</Label>
                <Input
                  value={form.titleHe}
                  onChange={(e) => setForm((f) => ({ ...f, titleHe: e.target.value }))}
                  dir="rtl"
                  placeholder="כותרת בעברית"
                  style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>{t.shiurim.teacher}</Label>
                <Input
                  value={form.teacher}
                  onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
                  placeholder="Rabbi Name"
                />
              </div>
              <div className="space-y-1">
                <Label>{t.shiurim.day}</Label>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">— Select day —</option>
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="SHABBOS">Shabbos</option>
                  <option value="DAILY">Daily</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>{t.shiurim.time}</Label>
                <Input
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  placeholder="e.g. 8:00 PM"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t.shiurim.location}</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Beis Medrash"
                />
              </div>
              <div className="space-y-1">
                <Label>{t.shiurim.description}</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>{t.shiurim.notes}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="shiur-active"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="shiur-active">{t.shiurim.isActive}</Label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeForm}>{t.form.cancel}</Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {saving ? t.form.saving : t.form.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {shiurim.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{t.shiurim.noShiurim}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t.shiurim.teacher}</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t.shiurim.day}</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t.shiurim.time}</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t.shiurim.location}</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shiurim.map((shiur) => (
                <tr key={shiur.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{shiur.title}</div>
                    {shiur.titleHe && (
                      <div
                        className="text-xs text-muted-foreground mt-0.5"
                        dir="rtl"
                        style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                      >
                        {shiur.titleHe}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{shiur.teacher ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {shiur.dayOfWeek ? DAY_LABELS[shiur.dayOfWeek] ?? shiur.dayOfWeek : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{shiur.time ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{shiur.location ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(shiur)}>
                      <Badge
                        variant="outline"
                        className={shiur.isActive ? "text-green-700 border-green-200 bg-green-50" : "text-muted-foreground"}
                      >
                        {shiur.isActive ? t.shiurim.isActive : t.shiurim.inactive}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(shiur)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(shiur.id)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
