"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/providers/LanguageProvider";
import { Plus, Pencil, Trash2, CheckCircle, X } from "lucide-react";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  ILS: "₪",
  EUR: "€",
  GBP: "£",
};

interface MemberBrief {
  id: string;
  firstName: string;
  lastName: string;
}

interface Pledge {
  id: string;
  memberId: string;
  member: MemberBrief;
  amount: number;
  currency: string;
  frequency: string;
  occasion: string | null;
  startDate: string | Date;
  endDate: string | Date | null;
  isActive: boolean;
  notes: string | null;
}

interface PledgesClientProps {
  initialPledges: Pledge[];
  members: MemberBrief[];
}

const EMPTY_FORM = {
  memberId: "",
  amount: "",
  currency: "USD",
  frequency: "ANNUAL",
  occasion: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  notes: "",
};

export function PledgesClient({ initialPledges, members }: PledgesClientProps) {
  const { t } = useLang();
  const [pledges, setPledges] = useState<Pledge[]>(initialPledges);
  const [showForm, setShowForm] = useState(false);
  const [editPledge, setEditPledge] = useState<Pledge | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [memberSearch, setMemberSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openAdd() {
    setEditPledge(null);
    setForm(EMPTY_FORM);
    setMemberSearch("");
    setShowForm(true);
    setError("");
  }

  function openEdit(pledge: Pledge) {
    setEditPledge(pledge);
    setForm({
      memberId: pledge.memberId,
      amount: pledge.amount.toString(),
      currency: pledge.currency,
      frequency: pledge.frequency,
      occasion: pledge.occasion ?? "",
      startDate: typeof pledge.startDate === "string" ? pledge.startDate.split("T")[0] : pledge.startDate.toISOString().split("T")[0],
      endDate: pledge.endDate ? (typeof pledge.endDate === "string" ? pledge.endDate.split("T")[0] : pledge.endDate.toISOString().split("T")[0]) : "",
      notes: pledge.notes ?? "",
    });
    setMemberSearch(`${pledge.member.firstName} ${pledge.member.lastName}`);
    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditPledge(null);
    setMemberSearch("");
    setError("");
  }

  const filteredMembers = members.filter((m) => {
    if (!memberSearch) return false;
    const name = `${m.firstName} ${m.lastName}`.toLowerCase();
    return name.includes(memberSearch.toLowerCase());
  });

  const selectedMember = members.find((m) => m.id === form.memberId);

  async function handleSave() {
    if (!form.memberId || !form.amount || !form.startDate) {
      setError("Member, amount, and start date are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editPledge) {
        const res = await fetch(`/api/pledges/${editPledge.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed");
        const updated = await res.json();
        setPledges((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const res = await fetch("/api/pledges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed");
        const created = await res.json();
        setPledges((prev) => [created, ...prev]);
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
    const res = await fetch(`/api/pledges/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPledges((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function handleFulfill(pledge: Pledge) {
    if (!confirm(`Create a donation of ${CURRENCY_SYMBOLS[pledge.currency] ?? ""}${pledge.amount} for this pledge?`)) return;
    const res = await fetch(`/api/pledges/${pledge.id}/fulfill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: new Date().toISOString().split("T")[0] }),
    });
    if (res.ok) {
      alert("Donation created successfully.");
    }
  }

  async function handleToggleActive(pledge: Pledge) {
    const res = await fetch(`/api/pledges/${pledge.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !pledge.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPledges((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  }

  const activePledges = pledges.filter((p) => p.isActive);
  const totalActive = activePledges.reduce((sum, p) => {
    if (p.currency === "USD") return sum + p.amount;
    return sum;
  }, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.pledges.title}</h1>
          <p className="text-sm text-muted-foreground">
            {activePledges.length} active • ${totalActive.toLocaleString()} USD/year
          </p>
        </div>
        <Button onClick={openAdd} className="bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4 mr-2" />
          {t.pledges.add}
        </Button>
      </div>

      {showForm && (
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {editPledge ? t.pledges.editPledge : t.pledges.add}
              </CardTitle>
              <button onClick={closeForm} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Member selector */}
            <div className="space-y-1">
              <Label>{t.pledges.member} *</Label>
              {selectedMember ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline"
                    onClick={() => { setForm((f) => ({ ...f, memberId: "" })); setMemberSearch(""); }}
                  >
                    {t.form.change}
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Input
                    placeholder={t.members.search}
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                  {memberSearch && (
                    <div className="border rounded-md max-h-40 overflow-y-auto bg-background shadow-sm">
                      {filteredMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-2">{t.members.noMembers}</p>
                      ) : (
                        filteredMembers.slice(0, 10).map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => { setForm((f) => ({ ...f, memberId: m.id })); setMemberSearch(`${m.firstName} ${m.lastName}`); }}
                          >
                            {m.firstName} {m.lastName}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>{t.pledges.amount} *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label>{t.pledges.currency}</Label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="USD">USD ($)</option>
                  <option value="ILS">ILS (₪)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>{t.pledges.frequency}</Label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="ANNUAL">{t.pledges.annual}</option>
                  <option value="MONTHLY">{t.pledges.monthly}</option>
                  <option value="ONE_TIME">{t.pledges.oneTime}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t.pledges.startDate} *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>{t.pledges.endDate}</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>{t.pledges.occasion}</Label>
              <Input
                value={form.occasion}
                onChange={(e) => setForm((f) => ({ ...f, occasion: e.target.value }))}
                placeholder="e.g. Kol Nidre, Yahrtzeit"
              />
            </div>

            <div className="space-y-1">
              <Label>{t.pledges.notes}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
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

      {pledges.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t.pledges.noPledges}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t.pledges.member}</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t.pledges.amount}</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t.pledges.frequency}</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t.pledges.occasion}</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pledges.map((pledge) => (
                <tr key={pledge.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">
                    {pledge.member.firstName} {pledge.member.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {CURRENCY_SYMBOLS[pledge.currency] ?? ""}{pledge.amount.toLocaleString()} {pledge.currency}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {pledge.frequency === "ANNUAL" ? t.pledges.annual :
                     pledge.frequency === "MONTHLY" ? t.pledges.monthly : t.pledges.oneTime}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{pledge.occasion ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(pledge)}>
                      <Badge
                        variant="outline"
                        className={pledge.isActive ? "text-green-700 border-green-200 bg-green-50" : "text-muted-foreground"}
                      >
                        {pledge.isActive ? t.pledges.active : t.pledges.inactive}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleFulfill(pledge)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-green-600"
                        title={t.pledges.fulfill}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(pledge)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pledge.id)}
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
