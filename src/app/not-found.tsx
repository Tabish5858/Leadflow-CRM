"use client";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFoundPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* ── Background Effects ── */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.04)_0%,transparent_60%)]" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center">
            <Logo />
          </div>
          <span className="text-base font-bold tracking-tight">LeadFlow</span>
        </Link>

        {/* 404 */}
        <h1
          className={`text-[8rem] font-black leading-none tracking-tight sm:text-[10rem] md:text-[12rem] ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          } transition-all duration-700 ease-out`}
        >
          <span className="bg-gradient-to-b from-primary via-primary/70 to-primary/20 bg-clip-text text-transparent">
            404
          </span>
        </h1>

        {/* Icon */}
        <div
          className={`mb-4 mt-2 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          } transition-all delay-200 duration-500 ease-out`}
        >
          <SearchX className="h-10 w-10 text-muted-foreground/40" />
        </div>

        {/* Message */}
        <div
          className={`max-w-md space-y-2 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } transition-all delay-300 duration-500 ease-out`}
        >
          <p className="text-lg font-semibold text-foreground">
            Page not found
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Check the URL or head back home.
          </p>
        </div>

        {/* Actions */}
        <div
          className={`mt-8 flex flex-wrap justify-center gap-3 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } transition-all delay-500 duration-500 ease-out`}
        >
          <Button asChild size="lg" className="gap-2 h-11 px-5">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 h-11 px-5"
          >
            <Link href="/" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Footer text ── */}
      <p
        className={`fixed bottom-6 text-xs text-muted-foreground/50 ${
          mounted ? "opacity-100" : "opacity-0"
        } transition-all delay-700 duration-500`}
      >
        LeadFlow CRM &middot; Open-source
      </p>
    </div>
  );
}
