"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import {
  BarChart3,
  Check,
  Clock,
  KanbanSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const features = [
  {
    title: "Pipeline clarity",
    description:
      "Track every lead stage with ownership, next steps, and clean handoffs.",
    icon: KanbanSquare,
  },
  {
    title: "Time and revenue focus",
    description:
      "Capture billable work and link effort to pipeline value without extra tools.",
    icon: Clock,
  },
  {
    title: "Actionable reporting",
    description:
      "See win rates, cycle time, and forecast signals at a glance.",
    icon: BarChart3,
  },
];

const benefits = [
  "Role based access and workspace controls",
  "Audit friendly activity history",
  "Fast onboarding with templates",
];

const metrics = [
  { label: "Uptime target", value: "99.9%" },
  { label: "Setup time", value: "10 min" },
  { label: "Time to first lead", value: "1 day" },
];

export default function LandingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
        return;
      }
      setReady(true);
    });
    return () => unsubscribe();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm">
            LF
          </div>
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-60" />
      </div>

      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm">
              LF
            </div>
            <span className="text-lg font-semibold tracking-tight">LeadFlow</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a className="hover:text-foreground" href="#features">
              Features
            </a>
            <a className="hover:text-foreground" href="#security">
              Security
            </a>
            <a className="hover:text-foreground" href="#cta">
              Get started
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Log in
            </Link>
            <Button asChild size="sm">
              <Link href="/register">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Built for modern sales teams
              </div>
              <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                LeadFlow keeps your pipeline clean, fast, and revenue focused.
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                A simple CRM for teams that need clarity on every lead. Track
                outreach, manage time, and forecast confidently without bloat.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/register">Create account</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Open app</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Secure workspace access
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  No credit card required
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl shadow-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Pipeline snapshot</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
                <div className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground">
                  Updated live
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { label: "New inbound", value: "34", trend: "+12%" },
                  { label: "Qualified", value: "18", trend: "+6%" },
                  { label: "Closing", value: "7", trend: "+3%" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.label}</p>
                      <p className="text-xs text-muted-foreground">Leads in stage</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">{row.value}</p>
                      <p className="text-xs text-primary">{row.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                  >
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-sm font-semibold text-foreground">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-16"
        >
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Built for focus
              </p>
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                Enterprise polish without the enterprise overhead.
              </h2>
              <p className="text-sm text-muted-foreground">
                LeadFlow keeps your team aligned with a clean pipeline, real time
                collaboration, and reporting that stays readable at scale.
              </p>
              <div className="mt-6 space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border/60 bg-card/80 p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {feature.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="security"
          className="scroll-mt-24 border-t border-border/60 bg-background/70"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Security and control
                </p>
                <h3 className="font-display text-2xl font-semibold tracking-tight">
                  Keep data protected with clear permissions and audit trails.
                </h3>
                <p className="text-sm text-muted-foreground">
                  LeadFlow is built around workspaces, role based access, and
                  activity history so teams can stay accountable.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Workspace roles",
                  "Activity history",
                  "Secure auth",
                  "Data export",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 px-4 py-3 text-sm"
                  >
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="cta"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-16"
        >
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/15 via-background to-background px-8 py-10">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="space-y-2">
                <h4 className="font-display text-2xl font-semibold tracking-tight">
                  Ready to run a faster pipeline?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Get started in minutes and keep your team aligned from day one.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/register">Start free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">View dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>LeadFlow</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <a
              href="mailto:contact@tabishbinishfaq.dev"
              className="hover:text-foreground"
            >
              contact@tabishbinishfaq.dev
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
