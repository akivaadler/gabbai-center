"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, ShieldCheck } from "lucide-react";

interface StaffUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  member: { firstName: string; lastName: string } | null;
}

export default function StaffPage() {
  const [staff, setStaff]       = useState<StaffUser[]>([]);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState<"GABBAI" | "MEMBER">("GABBAI");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const loadStaff = useCallback(async () => {
    const res = await fetch("/api/staff");
    if (res.ok) setStaff(await res.json());
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setSuccess(`Account created for ${email}`);
    setEmail(""); setPassword("");
    loadStaff();
  };

  const handleDelete = async (id: string, userEmail: string) => {
    if (!confirm(`Remove account for ${userEmail}?`)) return;
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    loadStaff();
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      {/* Existing accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4" />
            Staff Accounts
          </CardTitle>
          <CardDescription>
            Gabbai accounts have full access. Member accounts can only view their own data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <p className="text-sm text-muted-foreground">No staff accounts found.</p>
          ) : (
            <ul className="divide-y">
              {staff.map((u) => (
                <li key={u.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{u.email}</p>
                    {u.member && (
                      <p className="text-xs text-muted-foreground">
                        {u.member.firstName} {u.member.lastName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === "GABBAI" ? "default" : "secondary"} className="text-xs">
                      {u.role}
                    </Badge>
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
                      className="text-muted-foreground hover:text-red-600 transition-colors p-1"
                      aria-label="Remove account"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Add new account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4" />
            Add Staff Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{success}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)} required placeholder="gabbai@shul.org" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw" className="text-xs">Temporary Password</Label>
                <Input id="pw" type="text" value={password}
                  onChange={e => setPassword(e.target.value)} required placeholder="min 8 characters" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs">Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={e => setRole(e.target.value as "GABBAI" | "MEMBER")}
                  className="w-full h-9 rounded border border-input bg-background px-3 text-sm"
                >
                  <option value="GABBAI">Gabbai (full access)</option>
                  <option value="MEMBER">Member (limited access)</option>
                </select>
              </div>
            </div>

            <Button type="submit" disabled={loading} size="sm">
              {loading ? "Creating…" : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
