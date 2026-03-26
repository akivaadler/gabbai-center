"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/providers/LanguageProvider";
import { KeyRound, CheckCircle2 } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isRTL } = useLang();
  const [current, setCurrent]   = useState("");
  const [next, setNext]         = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next !== confirm) { setError("New passwords do not match"); return; }
    if (next.length < 8)  { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
    setSuccess(true);
    setTimeout(() => router.push("/gabbai/settings"), 2000);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your gabbai account password. Use a strong password of at least 8 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Password updated successfully. Redirecting…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="current" className="text-xs">Current Password</Label>
                <Input id="current" type="password" value={current}
                  onChange={e => setCurrent(e.target.value)} required autoComplete="current-password" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="next" className="text-xs">New Password</Label>
                <Input id="next" type="password" value={next}
                  onChange={e => setNext(e.target.value)} required autoComplete="new-password" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-xs">Confirm New Password</Label>
                <Input id="confirm" type="password" value={confirm}
                  onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={loading} size="sm">
                  {loading ? "Updating…" : "Update Password"}
                </Button>
                <Button type="button" variant="outline" size="sm"
                  onClick={() => router.push("/gabbai/settings")}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
