"use client";

import { useState } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/components/providers/LanguageProvider";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { t, isRTL } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    getProviders().then((providers) => {
      setGoogleEnabled(!!providers?.google);
    });
  }, []);

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

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    await signIn("google", { callbackUrl: "/" });
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
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/8 mb-3">
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
          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/40 rounded px-3 py-2">
              {error}
            </p>
          )}

          {/* Google button — only shown when configured */}
          {googleEnabled && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full h-9 rounded border border-white/15 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <GoogleIcon />
                {googleLoading ? "..." : t.auth.continueWithGoogle}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-navy-500">{t.auth.orSignInWith}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="bg-white border-white/20 text-navy-950 placeholder:text-navy-400 focus-visible:ring-white/20 h-9 text-sm"
                autoComplete="email"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-navy-300 text-xs">
                {t.auth.password}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-white border-white/20 text-navy-950 placeholder:text-navy-400 focus-visible:ring-white/20 h-9 text-sm pr-9"
                  autoComplete="current-password"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-2.5 text-navy-500 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
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
