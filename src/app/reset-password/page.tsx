"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);
  const [resetError, setResetError] = useState("");

  // Strip token from URL immediately to prevent leakage via browser history
  useEffect(() => {
    if (token && typeof window !== "undefined") {
      window.history.replaceState({}, document.title, "/reset-password");
    }
  }, [token]);

  // Verify the token on mount
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset link. Please request a new password reset.");
      setVerifying(false);
      return;
    }

    fetch(`/api/auth/verify-reset-token?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setEmail(data.email);
          setValid(true);
        } else {
          setError(data.error || "This reset link is invalid or has expired.");
        }
        setVerifying(false);
      })
      .catch(() => {
        setError("Failed to verify reset link. Please try again.");
        setVerifying(false);
      });
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (!password || password.length < 8) {
      setResetError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setResetError("Passwords do not match");
      return;
    }

    setResetting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || "Failed to reset password");
        return;
      }
      setDone(true);
    } catch {
      setResetError("Something went wrong. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  // ── No token ──────────────────────────────────────────────────
  if (!verifying && !valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-7 w-7 text-destructive" />
              </div>
            </div>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Link href="/login">
              <Button>Back to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Verifying ──────────────────────────────────────────────────
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="space-y-4 p-6 w-full max-w-md">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
            </div>
            <CardTitle>Password Changed</CardTitle>
            <CardDescription>
              Your password has been reset successfully. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Reset form ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Choose a new password for <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {resetError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {resetError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={resetting}>
              {resetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="space-y-4 p-6 w-full max-w-md">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
