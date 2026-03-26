"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

// Minimal Dialog component since shadcn/ui dialog may not be installed
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
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-background rounded-lg shadow-xl p-6 w-full max-w-md mx-4 z-10">
        {children}
      </div>
    </div>
  );
}

export function CreateScheduleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get next Saturday as default
  const getNextSaturday = () => {
    const now = new Date();
    const day = now.getDay();
    const daysUntilSat = day === 6 ? 7 : 6 - day;
    const sat = new Date(now);
    sat.setDate(now.getDate() + daysUntilSat);
    return sat.toISOString().slice(0, 10);
  };

  const handleOpen = () => {
    setDate(getNextSaturday());
    setError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const selected = new Date(date + "T12:00:00");
      if (selected.getDay() !== 6) {
        throw new Error("Please select a Saturday");
      }

      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shabbosDate: selected.toISOString() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create schedule");
      }

      const schedule = await res.json();
      setOpen(false);
      router.push(`/gabbai/schedule/${schedule.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen}>
        <Plus className="h-4 w-4 mr-2" />
        New Shabbos
      </Button>

      <SimpleModal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">Create Shabbos Schedule</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="shabbosDate">Shabbos Date (Saturday) *</Label>
            <Input
              id="shabbosDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Must be a Saturday. Parsha will be auto-detected.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </SimpleModal>
    </>
  );
}
