"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  MessageSquare,
  Calendar,
  Clock,
  BarChart3,
  FileSignature,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";

// ─── Shared card wrapper ───────────────────────────────────────────────────

function BentoCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2, ease: "easeOut" } }}
      className={`group relative overflow-hidden rounded-2xl border border-border/40 bg-background/40 p-6 transition-shadow duration-300 hover:border-primary/20 hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.15)] ${className}`}
    >
      {/* Subtle corner gradient glow on hover */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
      </div>
      {children}
    </motion.div>
  );
}

// ─── 1. Dashboard ──────────────────────────────────────────────────────────

function DashboardCard() {
  const stats = useMemo(
    () => [
      { value: "1,247", label: "Leads" },
      { value: "38", label: "Active" },
      { value: "$84.2k", label: "Revenue" },
    ],
    [],
  );

  return (
    <BentoCard className="lg:col-span-2">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <motion.div
          className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live
        </motion.div>
      </div>
      <h3 className="font-semibold text-sm mb-1">Dashboard</h3>
      <p className="text-xs text-muted-foreground/80 leading-relaxed mb-5 max-w-[40ch]">
        Real-time overview of your workspace activity at a glance.
      </p>
      <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/30 bg-background/30 p-3.5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="flex flex-col items-center gap-0.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
          >
            <motion.span
              className="text-lg font-bold tabular-nums tracking-tight text-foreground"
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            >
              {s.value}
            </motion.span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </BentoCard>
  );
}

// ─── 2. Leads ──────────────────────────────────────────────────────────────

function LeadsCard() {
  const stages = useMemo(
    () => [
      { label: "New", width: 60, color: "bg-blue-500/60" },
      { label: "Contacted", width: 80, color: "bg-violet-500/60" },
      { label: "Qualified", width: 45, color: "bg-emerald-500/60" },
    ],
    [],
  );

  return (
    <BentoCard>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
        <Users className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-sm mb-1">Leads</h3>
      <p className="text-xs text-muted-foreground/80 leading-relaxed mb-4">
        Capture, qualify, and nurture leads.
      </p>
      <div className="space-y-2.5">
        {stages.map((stage, i) => (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground/70">{stage.label}</span>
              <span className="font-medium tabular-nums text-muted-foreground/90">
                {stage.width}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/40">
              <motion.div
                className={`h-full rounded-full ${stage.color}`}
                animate={{ width: [stage.width * 0.7, stage.width, stage.width * 0.7] }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.8,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

// ─── 3. Projects ────────────────────────────────────────────────────────────

function ProjectsCard() {
  const projects = useMemo(
    () => [
      { name: "Rebrand Q3", progress: 72, color: "bg-primary" },
      { name: "API Integration", progress: 34, color: "bg-blue-500" },
    ],
    [],
  );

  return (
    <BentoCard>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
        <FolderKanban className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-sm mb-1">Projects</h3>
      <p className="text-xs text-muted-foreground/80 leading-relaxed mb-4">
        Manage client projects with progress tracking, budgets, and deadlines.
      </p>
      <div className="mt-auto space-y-4">
        {projects.map((p, i) => (
          <div key={p.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground/80">{p.name}</span>
              <motion.span
                className="font-medium tabular-nums"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              >
                {p.progress}%
              </motion.span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border/40">
              <motion.div
                className={`h-full rounded-full ${p.color}`}
                animate={{
                  width: [
                    `${Math.max(20, p.progress - 10)}%`,
                    `${Math.min(95, p.progress + 10)}%`,
                    `${Math.max(20, p.progress - 10)}%`,
                  ],
                }}
                transition={{
                  duration: 5 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5,
                }}
              />
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/20 p-2.5">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[11px] text-muted-foreground/60">2 active sprints</span>
        </div>
      </div>
    </BentoCard>
  );
}

// ─── 4. Invoices ────────────────────────────────────────────────────────────

const INVOICE_STATUSES = [
  { label: "Draft", color: "text-amber-400", bg: "bg-amber-500/10" },
  { label: "Sent", color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Paid", color: "text-emerald-400", bg: "bg-emerald-500/10" },
] as const;

function InvoicesCard() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % INVOICE_STATUSES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const status = INVOICE_STATUSES[statusIndex];

  return (
    <BentoCard>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
        <FileText className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-sm mb-1">Invoices</h3>
      <p className="text-xs text-muted-foreground/80 leading-relaxed mb-4">
        Create, send, and track invoices.
      </p>
      <div className="flex items-center justify-between rounded-xl border border-border/30 bg-background/20 p-3">
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50">
            Latest
          </p>
          <p className="text-xs font-medium">INV-2024-089</p>
        </div>
        <motion.div
          key={status.label}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.bg} ${status.color}`}
        >
          {status.label}
        </motion.div>
      </div>
      <motion.p
        className="mt-3 text-[11px] text-muted-foreground/50"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        $3,240 pending
      </motion.p>
    </BentoCard>
  );
}

// ─── 5. Messages ───────────────────────────────────────────────────────────

function MessagesCard() {
  const conversations = useMemo(
    () => [
      { name: "Ariana Holt", msg: "Sounds good, let's move forward", active: true, time: "2m ago" },
      { name: "Marcus Lee", msg: "Can we reschedule?", active: false, time: "18m ago" },
      { name: "Priya Das", msg: "Invoice received, thanks!", active: false, time: "1h ago" },
      { name: "Jordan Cruz", msg: "Demo went well — they're ready", active: true, time: "3h ago" },
    ],
    [],
  );

  return (
    <BentoCard className="lg:row-span-2 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MessageSquare className="h-5 w-5" />
        </div>
        <motion.div
          className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          4 unread
        </motion.div>
      </div>
      <h3 className="font-semibold text-sm mb-1">Messages</h3>
      <p className="text-xs text-muted-foreground/80 leading-relaxed mb-4">
        Team inbox with read receipts and search.
      </p>
      <div className="flex-1 space-y-1.5">
        {conversations.map((c) => (
          <motion.div
            key={c.name}
            initial={false}
            className="flex items-center gap-2.5 rounded-lg border border-border/30 bg-background/20 px-3 py-2.5 transition-colors hover:border-primary/20"
            whileHover={{ x: 3, transition: { duration: 0.12 } }}
          >
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-medium text-primary">
              {c.name.split(" ").map((n) => n[0]).join("")}
              {c.active && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-medium text-foreground/90">
                  {c.name}
                </span>
                <span className="shrink-0 text-[9px] text-muted-foreground/40">{c.time}</span>
              </div>
              <p className="truncate text-[11px] text-muted-foreground/70">
                {c.msg}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Typing indicator */}
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/20 bg-background/15 px-3 py-2">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/40">Someone is typing...</span>
      </div>
    </BentoCard>
  );
}

// ─── 6. Meetings ────────────────────────────────────────────────────────────

function MeetingsCard() {
  return (
    <BentoCard>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
        <Calendar className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-sm mb-1">Meetings</h3>
      <p className="text-xs text-muted-foreground/80 leading-relaxed mb-4">
        Schedule and manage meetings.
      </p>
      <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/20 p-3">
        <motion.div
          className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-border/40 bg-background/40"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Jun
          </span>
          <motion.span
            className="-mt-0.5 text-lg font-bold leading-none tabular-nums"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            18
          </motion.span>
        </motion.div>
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium text-foreground/90">Sprint Review</p>
          <p className="text-[10px] text-muted-foreground/50">3 attendees</p>
          <div className="flex -space-x-1">
            {["A", "M", "P"].map((init, i) => (
              <div
                key={init}
                className="flex h-4 w-4 items-center justify-center rounded-full border border-background bg-primary/20 text-[8px] font-medium text-primary"
                style={{ zIndex: 3 - i }}
              >
                {init}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

// ─── 7. Time Tracking ──────────────────────────────────────────────────────

function TimeTrackingCard() {
  const [time, setTime] = useState("00:00");

  useEffect(() => {
    let seconds = 0;
    const timer = setInterval(() => {
      seconds += 1;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      setTime(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <BentoCard>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
        <Clock className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-sm mb-1">Time Tracking</h3>
      <p className="text-xs text-muted-foreground/80 leading-relaxed mb-4">
        Track billable hours per lead and project.
      </p>
      <div className="flex items-center justify-center rounded-xl border border-border/30 bg-background/20 p-3">
        <div className="text-center">
          <motion.div
            key={time}
            initial={{ opacity: 0.6, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="font-mono text-xl font-bold tracking-wider tabular-nums text-foreground"
          >
            {time}
          </motion.div>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[10px] text-muted-foreground/50">Tracking now</span>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

// ─── 8. Analytics ──────────────────────────────────────────────────────────

function AnalyticsCard() {
  const bars = useMemo(() => [32, 58, 44, 72, 38, 61], []);

  return (
    <BentoCard>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
        <BarChart3 className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-sm mb-1">Analytics</h3>
      <p className="text-xs text-muted-foreground/80 leading-relaxed mb-4">
        Revenue, conversion, and time reports.
      </p>
      <div className="flex items-end justify-between gap-1 rounded-xl border border-border/30 bg-background/20 p-3 h-28">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              background: `hsl(var(--primary) / ${0.3 + i * 0.07})`,
              height: 48,
            }}
            animate={{
              height: [h - 10, h + 10, h - 10],
            }}
            transition={{
              duration: 3 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between px-0.5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <span key={d} className="text-[9px] text-muted-foreground/40">
            {d}
          </span>
        ))}
      </div>
    </BentoCard>
  );
}

// ─── 9. Contracts ─────────────────────────────────────────────────────────

const CONTRACT_TYPES = ["Proposal", "Contract", "SOW"] as const;

function ContractsCard() {
  const [typeIndex, setTypeIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTypeIndex((prev) => (prev + 1) % CONTRACT_TYPES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const currentType = CONTRACT_TYPES[typeIndex];

  return (
    <BentoCard className="lg:col-span-2">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileSignature className="h-5 w-5" />
        </div>
        <motion.div
          key={currentType}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
        >
          {currentType}
        </motion.div>
      </div>
      <h3 className="font-semibold text-sm mb-1">Contracts</h3>
      <p className="text-xs text-muted-foreground/80 leading-relaxed mb-4 max-w-[50ch]">
        Create proposals, contracts, and agreements with e-signature workflows.
      </p>
      <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/20 p-3">
        {/* Signature line animation */}
        <div className="relative flex-1">
          <div className="h-0.5 w-full rounded-full bg-border/30" />
          <motion.div
            className="absolute inset-0 h-0.5 rounded-full bg-primary/60"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        <motion.span
          className="shrink-0 font-serif text-sm italic text-muted-foreground/40"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          Sign
        </motion.span>
      </div>
      <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground/40">
        <span>Draft: 2</span>
        <span>Sent: 5</span>
        <span>Signed: 8</span>
      </div>
    </BentoCard>
  );
}

// ─── Bento Grid ────────────────────────────────────────────────────────────

export function BentoSection() {
  return (
    <section id="modules" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 pb-20">
      {/* Section header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/60 px-3.5 py-1 text-xs text-muted-foreground mb-4"
        >
          <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
          Everything your team needs
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Nine modules. One workspace.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="mt-3 text-muted-foreground max-w-xl mx-auto"
        >
          From lead capture to invoicing, every workflow lives in a single, shared workspace.
        </motion.p>
      </div>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
        {/* Row 1 */}
        <DashboardCard />
        <LeadsCard />

        {/* Row 2-3 */}
        <ProjectsCard />
        <InvoicesCard />
        <MessagesCard />

        {/* Row 3 (cont.) */}
        <MeetingsCard />
        <TimeTrackingCard />

        {/* Row 4 */}
        <AnalyticsCard />
        <ContractsCard />
      </div>
    </section>
  );
}
