"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";


interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

interface Leining {
  id: string;
  aliyah: string;
  scheduleId?: string;
  memberId: string | null;
  notes?: string | null;
  member: Member | null;
}

interface LeiningsAssignmentProps {
  scheduleId: string;
  initialLeinings: Leining[];
  members: Member[];
}

export function LeiningsAssignment({
  scheduleId,
  initialLeinings,
  members,
}: LeiningsAssignmentProps) {
  const { t } = useLang();
  const ALIYAH_SLOTS = [
    { value: "1", label: `1 ${t.schedule.aliyah}` },
    { value: "2", label: `2 ${t.schedule.aliyah}` },
    { value: "3", label: `3 ${t.schedule.aliyah}` },
    { value: "4", label: `4 ${t.schedule.aliyah}` },
    { value: "5", label: `5 ${t.schedule.aliyah}` },
    { value: "6", label: `6 ${t.schedule.aliyah}` },
    { value: "7", label: `7 ${t.schedule.aliyah}` },
    { value: "MAFTIR", label: t.schedule.maftir },
    { value: "HAFTORAH", label: t.schedule.haftorah },
  ];
  const [leinings, setLeinings] = useState<Leining[]>(initialLeinings);
  const [saving, setSaving] = useState<string | null>(null);
  const [editSlot, setEditSlot] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>("");

  const getLeiningForSlot = (aliyah: string) =>
    leinings.find((l) => l.aliyah === aliyah);

  const startEdit = (aliyah: string) => {
    const current = getLeiningForSlot(aliyah);
    setSelectedMember(current?.memberId ?? "");
    setEditSlot(aliyah);
  };

  const cancelEdit = () => {
    setEditSlot(null);
    setSelectedMember("");
  };

  const saveAssignment = async (aliyah: string) => {
    setSaving(aliyah);
    try {
      const res = await fetch("/api/leinings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shabbosScheduleId: scheduleId,
          aliyah,
          memberId: selectedMember || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const saved: Leining = await res.json();

      setLeinings((prev) => {
        const filtered = prev.filter((l) => l.aliyah !== aliyah);
        return [...filtered, saved];
      });

      setEditSlot(null);
      setSelectedMember("");
    } catch {
      alert("Failed to save assignment");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-2">
      {ALIYAH_SLOTS.map((slot) => {
        const leining = getLeiningForSlot(slot.value);
        const isEditing = editSlot === slot.value;
        const isSaving = saving === slot.value;

        return (
          <div
            key={slot.value}
            className="flex items-center gap-3 py-2 border-b last:border-0"
          >
            <div className="w-28 shrink-0">
              <span className="text-sm font-medium text-navy-800">
                {slot.label}
              </span>
            </div>

            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <select
                  className="flex-1 border border-input rounded-md h-8 px-2 text-sm bg-background"
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  autoFocus
                >
                  <option value="">— {t.schedule.unassigned} —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => saveAssignment(slot.value)}
                  disabled={isSaving}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={cancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 flex-1 cursor-pointer group"
                onClick={() => startEdit(slot.value)}
              >
                {leining?.member ? (
                  <span className="text-sm font-medium">
                    {leining.member.firstName} {leining.member.lastName}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    {t.schedule.clickToAssign}
                  </span>
                )}
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ms-auto">
                  {t.form.edit}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
