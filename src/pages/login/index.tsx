import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, AlertCircle, KeyRound, Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginAdminAction } from "@/features/auth/login/login.action";
import { clearAuthError } from "@/features/auth/auth.slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleFillTestCredentials = () => {
    setEmail("admin@zenmonk.com");
    setPassword("Password@123");
    dispatch(clearAuthError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    try {
      await dispatch(loginAdminAction({ email: email.trim(), password })).unwrap();
      navigate("/dashboard");
    } catch {
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            ZenMonk Cloud Console
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Internal Operations & Multi-Tenant Super Admin
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Authentication Failed</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <Input
              label="Operator Email"
              type="email"
              placeholder="admin@zenmonk.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
              autoFocus
            />

            <Input
              label="Secret Key / Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold shadow-sm"
              isLoading={isLoading}
            >
              <KeyRound className="h-4 w-4 mr-1.5" />
              Authorize & Enter Console
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Dev / Demo Credentials</p>
                  <p className="text-[11px] text-muted-foreground font-mono">admin@zenmonk.com</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillTestCredentials}
                className="rounded-lg bg-primary/10 hover:bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary border border-primary/20 transition-colors cursor-pointer"
              >
                1-Click Fill
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Authorized personnel only. All access attempts are logged and audited.
        </p>
      </div>
    </div>
  );
};
