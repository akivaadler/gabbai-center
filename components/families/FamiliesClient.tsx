"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLang } from "@/components/providers/LanguageProvider";
import { Plus, Pencil, Trash2, Users, X } from "lucide-react";

interface MemberBrief {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

interface Family {
  id: string;
  name: string;
  members: MemberBrief[];
}

interface AllMember {
  id: string;
  firstName: string;
  lastName: string;
  familyId: string | null;
}

interface FamiliesClientProps {
  initialFamilies: Family[];
  allMembers: AllMember[];
}

export function FamiliesClient({ initialFamilies, allMembers }: FamiliesClientProps) {
  const { t } = useLang();
  const [families, setFamilies] = useState<Family[]>(initialFamilies);
  const [showForm, setShowForm] = useState(false);
  const [editFamily, setEditFamily] = useState<Family | null>(null);
  const [formName, setFormName] = useState("");
  const [formMemberIds, setFormMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openAdd() {
    setEditFamily(null);
    setFormName("");
    setFormMemberIds([]);
    setShowForm(true);
    setError("");
  }

  function openEdit(family: Family) {
    setEditFamily(family);
    setFormName(family.name);
    setFormMemberIds(family.members.map((m) => m.id));
    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditFamily(null);
    setError("");
  }

  async function handleSave() {
    if (!formName.trim()) {
      setError("Family name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editFamily) {
        const res = await fetch(`/api/families/${editFamily.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName, memberIds: formMemberIds }),
        });
        if (!res.ok) throw new Error("Failed to update");
        const updated = await res.json();
        setFamilies((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      } else {
        const res = await fetch("/api/families", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName }),
        });
        if (!res.ok) throw new Error("Failed to create");
        const created = await res.json();
        // Assign members to new family
        if (formMemberIds.length > 0) {
          await fetch(`/api/families/${created.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberIds: formMemberIds }),
          });
        }
        setFamilies((prev) => [...prev, { ...created, members: allMembers.filter((m) => formMemberIds.includes(m.id)) }]);
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
    const res = await fetch(`/api/families/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFamilies((prev) => prev.filter((f) => f.id !== id));
    }
  }

  function toggleMember(memberId: string) {
    setFormMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.families.title}</h1>
          <p className="text-sm text-muted-foreground">{families.length} {t.families.memberCount}</p>
        </div>
        <Button onClick={openAdd} className="bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4 mr-2" />
          {t.families.addFamily}
        </Button>
      </div>

      {showForm && (
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {editFamily ? t.families.editFamily : t.families.addFamily}
              </CardTitle>
              <button onClick={closeForm} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="family-name">{t.families.familyName} *</Label>
              <Input
                id="family-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Cohen Family"
              />
            </div>

            <div className="space-y-2">
              <Label>{t.families.assignMembers}</Label>
              <div className="border rounded-md max-h-48 overflow-y-auto divide-y divide-border">
                {allMembers.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={formMemberIds.includes(m.id)}
                      onChange={() => toggleMember(m.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                    {m.firstName} {m.lastName}
                    {m.familyId && m.familyId !== editFamily?.id && (
                      <span className="text-xs text-muted-foreground ml-auto">(assigned)</span>
                    )}
                  </label>
                ))}
                {allMembers.length === 0 && (
                  <p className="p-3 text-sm text-muted-foreground">{t.members.noMembers}</p>
                )}
              </div>
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

      {families.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-12 text-center">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{t.families.noFamilies}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {families.map((family) => (
            <Card key={family.id} className="border border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">{family.name}</CardTitle>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(family)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(family.id)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">
                  {family.members.length} {t.families.memberCount}
                </p>
                {family.members.length > 0 ? (
                  <ul className="space-y-1">
                    {family.members.map((m) => (
                      <li key={m.id} className="text-sm">
                        {m.firstName} {m.lastName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.families.noMembers}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
