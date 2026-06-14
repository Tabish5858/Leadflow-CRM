import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In | LeadFlow CRM",
  description:
    "Sign in to your LeadFlow CRM account. Manage leads, projects, invoices, time tracking, and client portal — all open source. Or try the demo with no signup required.",
  alternates: {
    canonical: "/login",
  },
};

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm shadow-sm">
          LF
        </div>
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-muted animate-pulse" />
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
