"use client";

import { useState } from "react";
import { useLang } from "@/components/providers/LanguageProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface JudaicaItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  borrowerName: string | null;
  borrowedDate: string | null;
  dueDate: string | null;
  repairShop: string | null;
  notes: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  LENT_OUT: "bg-blue-100 text-blue-800",
  IN_REPAIR: "bg-amber-100 text-amber-800",
  LOST: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  LENT_OUT: "Lent Out",
  IN_REPAIR: "In Repair",
  LOST: "Lost",
};

const CATEGORY_LABELS: Record<string, string> = {
  SEFER_TORAH: "Sefer Torah",
  SILVER: "Silver / Keilim",
  TEXTILES: "Textiles / Parochet",
  BOOKS: "Books / Sefarim",
  OTHER: "Other",
};

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "OTHER",
  status: "AVAILABLE",
  borrowerName: "",
  borrowedDate: "",
  dueDate: "",
  repairShop: "",
  notes: "",
};

export function JudaicaClient({ initialItems }: { initialItems: JudaicaItem[] }) {
  const { isRTL } = useLang();
  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? items : items.filter((i) => i.status === filter);

  function startEdit(item: JudaicaItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      category: item.category,
      status: item.status,
      borrowerName: item.borrowerName ?? "",
      borrowedDate: item.borrowedDate ? item.borrowedDate.split("T")[0] : "",
      dueDate: item.dueDate ? item.dueDate.split("T")[0] : "",
      repairShop: item.repairShop ?? "",
      notes: item.notes ?? "",
    });
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      ...form,
      borrowedDate: form.borrowedDate || null,
      dueDate: form.dueDate || null,
      borrowerName: form.borrowerName || null,
      repairShop: form.repairShop || null,
      description: form.description || null,
      notes: form.notes || null,
    };
    try {
      if (editingId) {
        const res = await fetch(`/api/judaica/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
      } else {
        const res = await fetch("/api/judaica", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        setItems((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/judaica/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Judaica Inventory</h1>
        <Button onClick={startNew} size="sm">
          <Plus className="h-4 w-4 me-1.5" />
          Add Item
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "AVAILABLE", "LENT_OUT", "IN_REPAIR", "LOST"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === s
                ? "bg-navy-900 text-white"
                : "bg-navy-100 text-navy-700 hover:bg-navy-200"
            }`}
          >
            {s === "ALL" ? "All" : STATUS_LABELS[s]}
            <span className="ml-1 text-xs opacity-70">
              ({s === "ALL" ? items.length : items.filter((i) => i.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="border rounded-lg p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy-900">{editingId ? "Edit Item" : "New Item"}</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Silver Kiddush Cup" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>

            {form.status === "LENT_OUT" && (
              <>
                <div className="space-y-1.5">
                  <Label>Borrower Name</Label>
                  <Input value={form.borrowerName} onChange={(e) => setForm((f) => ({ ...f, borrowerName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Date Borrowed</Label>
                  <Input type="date" value={form.borrowedDate} onChange={(e) => setForm((f) => ({ ...f, borrowedDate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Due Back</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </>
            )}

            {form.status === "IN_REPAIR" && (
              <div className="space-y-1.5">
                <Label>Repair Shop</Label>
                <Input value={form.repairShop} onChange={(e) => setForm((f) => ({ ...f, repairShop: e.target.value }))} />
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving || !form.name}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Items list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No items found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 border rounded-lg p-4 bg-white hover:bg-navy-50/30 transition-colors">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-navy-900">{item.name}</span>
                  <Badge className={`text-xs ${STATUS_COLORS[item.status]}`}>{STATUS_LABELS[item.status]}</Badge>
                  <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[item.category]}</span>
                </div>
                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                {item.status === "LENT_OUT" && item.borrowerName && (
                  <p className="text-xs text-muted-foreground">
                    Borrowed by: <strong>{item.borrowerName}</strong>
                    {item.borrowedDate && ` on ${new Date(item.borrowedDate).toLocaleDateString()}`}
                    {item.dueDate && ` · Due: ${new Date(item.dueDate).toLocaleDateString()}`}
                  </p>
                )}
                {item.status === "IN_REPAIR" && item.repairShop && (
                  <p className="text-xs text-muted-foreground">Repair shop: <strong>{item.repairShop}</strong></p>
                )}
                {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(item)} className="p-1.5 rounded hover:bg-navy-100 text-muted-foreground hover:text-navy-800 transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
