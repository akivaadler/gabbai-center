"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/components/providers/LanguageProvider";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

export default function LoginPage() {
  const router = useRouter();
  const { t, isRTL } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError(t.auth.invalidCredentials);
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-navy-950 px-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="fixed top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-sm space-y-8">
        {/* Wordmark */}
        <div className="text-center space-y-1">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/8 mb-3"
          >
            <span
              className="text-base text-white/60"
              style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
            >
              ✡
            </span>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            {t.auth.gabbaiCenter}
          </h1>
          <p className="text-sm text-navy-500">
            {process.env.NEXT_PUBLIC_SHUL_NAME ?? t.auth.tagline}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/40 rounded px-3 py-2">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-navy-300 text-xs">
                {t.auth.email}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="gabbai@shul.local"
                className="bg-white/8 border-white/12 text-white placeholder:text-navy-600 focus-visible:ring-white/20 h-9 text-sm"
                autoComplete="email"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-navy-300 text-xs">
                {t.auth.password}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-white/8 border-white/12 text-white placeholder:text-navy-600 focus-visible:ring-white/20 h-9 text-sm"
                autoComplete="current-password"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded bg-white text-navy-950 text-sm font-medium hover:bg-navy-100 transition-colors disabled:opacity-50"
            >
              {loading ? t.auth.signingIn : t.auth.signIn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
