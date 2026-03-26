"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X, Megaphone } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";

interface ShabbosSchedule {
  id: string;
  parsha: string | null;
  shabbosDate: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  publishDate: string;
  expiresDate: string | null;
  isPublic: boolean;
  shabbosScheduleId: string | null;
  shabbosSchedule: ShabbosSchedule | null;
}

interface AnnouncementsClientProps {
  schedules: ShabbosSchedule[];
}

function AnnouncementForm({
  announcement,
  schedules,
  defaultShabbosId,
  onSuccess,
  onCancel,
}: {
  announcement?: Announcement | null;
  schedules: ShabbosSchedule[];
  defaultShabbosId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState(announcement?.title ?? "");
  const [body, setBody] = useState(announcement?.body ?? "");
  const [publishDate, setPublishDate] = useState(
    announcement?.publishDate ? announcement.publishDate.split("T")[0] : today
  );
  const [expiresDate, setExpiresDate] = useState(
    announcement?.expiresDate ? announcement.expiresDate.split("T")[0] : ""
  );
  const [isPublic, setIsPublic] = useState(announcement?.isPublic ?? true);
  const [shabbosScheduleId, setShabbosScheduleId] = useState(
    announcement?.shabbosScheduleId ?? defaultShabbosId ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t, lang } = useLang();
  const locale = lang === "he" ? "he-IL" : "en-US";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !body.trim() || !publishDate) {
      setError(t.announcements.titleBodyRequired);
      return;
    }

    setLoading(true);
    try {
      const url = announcement
        ? `/api/announcements/${announcement.id}`
        : "/api/announcements";
      const res = await fetch(url, {
        method: announcement ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          publishDate,
          expiresDate: expiresDate || null,
          isPublic,
          shabbosScheduleId: shabbosScheduleId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t.common.error);
        return;
      }

      onSuccess();
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">
          {t.announcements.title_field} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.announcements.titlePlaceholder}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="body">
          {t.announcements.body} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t.announcements.bodyPlaceholder}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="publishDate">
            {t.announcements.publishDate} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="publishDate"
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="expiresDate">{t.announcements.expiresDate}</Label>
          <Input
            id="expiresDate"
            type="date"
            value={expiresDate}
            onChange={(e) => setExpiresDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="shabbos">{t.announcements.linkedShabbos}</Label>
        <select
          id="shabbos"
          value={shabbosScheduleId}
          onChange={(e) => setShabbosScheduleId(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="">— {t.common.none} —</option>
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>
              {s.parsha ?? t.schedule.shabbosSchedule} —{" "}
              {new Date(s.shabbosDate).toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="isPublic">{t.announcements.isPublic}</Label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t.form.cancel}
        </Button>
        <Button type="submit" disabled={loading} className="bg-navy-800 hover:bg-navy-700">
          {loading ? t.announcements.loading : announcement ? t.announcements.update : t.announcements.addAnnouncement}
        </Button>
      </div>
    </form>
  );
}

export function AnnouncementsClient({ schedules }: AnnouncementsClientProps) {
  const { t, lang } = useLang();
  const locale = lang === "he" ? "he-IL" : "en-US";
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function isExpired(a: Announcement) {
    if (!a.expiresDate) return false;
    return new Date(a.expiresDate) < today;
  }

  function isActive(a: Announcement) {
    const pub = new Date(a.publishDate);
    pub.setHours(0, 0, 0, 0);
    return pub <= today && !isExpired(a);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      fetchAnnouncements();
    } finally {
      setDeletingId(null);
    }
  }

  const active = announcements.filter(isActive);
  const expired = announcements.filter(isExpired);
  const upcoming = announcements.filter(
    (a) => new Date(a.publishDate) > today && !isExpired(a)
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-green-700">{active.length} {t.announcements.active}</span>
          <span>|</span>
          <span>{upcoming.length} {t.announcements.upcoming}</span>
          <span>|</span>
          <span className="text-muted-foreground">{expired.length} {t.announcements.expired}</span>
        </div>
        <Button
          onClick={() => {
            setEditAnnouncement(null);
            setShowForm(true);
          }}
          className="bg-navy-800 hover:bg-navy-700"
        >
          <Plus className="h-4 w-4 me-2" />
          {t.announcements.add}
        </Button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editAnnouncement ? t.announcements.editAnnouncement : t.announcements.addAnnouncement}
              </h2>
              <AnnouncementForm
                announcement={editAnnouncement}
                schedules={schedules}
                onSuccess={() => {
                  setShowForm(false);
                  setEditAnnouncement(null);
                  fetchAnnouncements();
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditAnnouncement(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      {loading ? (
        <p className="text-muted-foreground py-8 text-center">{t.announcements.loading}</p>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t.announcements.noAnnouncements}</p>
          <Button
            className="mt-4 bg-navy-800 hover:bg-navy-700"
            onClick={() => {
              setEditAnnouncement(null);
              setShowForm(true);
            }}
          >
            {t.announcements.addFirst}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const expired = isExpired(a);
            const active = isActive(a);
            return (
              <div
                key={a.id}
                className={`border rounded-lg p-4 ${expired ? "opacity-60 bg-gray-50" : "bg-white"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-navy-900">{a.title}</h3>
                      {active && (
                        <Badge className="bg-green-100 text-green-800 text-xs">{t.announcements.active}</Badge>
                      )}
                      {expired && (
                        <Badge variant="secondary" className="text-xs">{t.announcements.expired}</Badge>
                      )}
                      {!active && !expired && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">{t.announcements.upcoming}</Badge>
                      )}
                      <Badge variant={a.isPublic ? "outline" : "secondary"} className="text-xs">
                        {a.isPublic ? t.announcements.publicBadge : t.announcements.privateBadge}
                      </Badge>
                      {a.shabbosSchedule && (
                        <Badge variant="outline" className="text-xs">
                          {a.shabbosSchedule.parsha ?? "Shabbos"} —{" "}
                          {new Date(a.shabbosSchedule.shabbosDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{a.body}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        {t.announcements.publish}:{" "}
                        {new Date(a.publishDate).toLocaleDateString(locale, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {a.expiresDate && (
                        <span>
                          {t.announcements.expires}:{" "}
                          {new Date(a.expiresDate).toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditAnnouncement(a);
                        setShowForm(true);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === a.id}
                      onClick={() => handleDelete(a.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
