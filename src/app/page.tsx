"use client";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  ExternalLink,
  FileSignature,
  FileText,
  FolderKanban,
  Github,
  Globe,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
  Lock,
  Palette,
  Cloud,
  MoreHorizontal,
  Plus,
  Search,
  Bell,
  Filter,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Timer,
  Send,
  Paperclip,
  Smile,
  Play,
  Pause,
  Square,
  Download,
  Eye,
  PenLine,
  Trash2,
  GripVertical,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  FileCheck,
} from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

// ─── Animation Variants ────────────────────────────────────────────────────

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 } as const,
  },
};

const fadeUpHeavy: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 18 } as const,
  },
};

const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 18 } as const,
  },
};

// ─── Section Header ────────────────────────────────────────────────────────

function SectionHeader({ badge, title, description }: { badge: string; title: string; description: string }) {
  return (
    <motion.div
      className="text-center mb-12"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs text-zinc-400 mb-4">
        <div className="h-2 w-2 rounded-full bg-primary" />
        {badge}
      </div>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 text-zinc-400 max-w-xl mx-auto">{description}</p>
    </motion.div>
  );
}

// ─── FAQ Data ──────────────────────────────────────────────────────────────

interface FAQItem { q: string; a: string; }

const FAQ_ITEMS: FAQItem[] = [
  {
    q: "What is an open-source CRM?",
    a: "An open-source CRM is customer relationship management software whose source code is publicly available. You can view, modify, and self-host it on your own infrastructure. Unlike proprietary CRMs like Salesforce or HubSpot, there are no per-seat licensing fees, no vendor lock-in, and you retain full ownership of your data.",
  },
  {
    q: "How is LeadFlow different from other open-source CRMs like Twenty or SuiteCRM?",
    a: "LeadFlow combines project tracking, invoicing, time tracking, messaging, and a client portal in one platform. Unlike Twenty (AGPL-3.0), LeadFlow is MIT licensed. We also offer built-in time tracking and a dedicated client portal, which most open-source CRMs lack.",
  },
  {
    q: "Can I self-host LeadFlow on my own server?",
    a: "Yes. LeadFlow is designed for self-hosting. Clone the repo, run npm install && npm run build && npm start on any Node.js server, or deploy instantly on Vercel. Your data never leaves your infrastructure.",
  },
  {
    q: "Is LeadFlow really free?",
    a: "Yes. LeadFlow is 100% free and open source under the MIT license. There are no paid tiers, no feature gates, no hidden costs. You can use every module without paying a cent.",
  },
  {
    q: "Does LeadFlow have a client portal?",
    a: "Yes. LeadFlow includes a dedicated client portal where your clients can view their projects, invoices, documents, and time entries. Each client gets a personalized dashboard with role-based access.",
  },
  {
    q: "What tech stack does LeadFlow use?",
    a: "LeadFlow is built with Next.js 16 and React 19 on the frontend, Firebase for authentication and data, and Vercel for deployment. The spreadsheet module uses UniverJS.",
  },
];

// ─── FAQ Accordion ─────────────────────────────────────────────────────────

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
      {FAQ_ITEMS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <motion.div key={faq.q} variants={fadeUp} layout className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-white/[0.04]" aria-expanded={isOpen}>
              <h3 className="font-semibold text-sm leading-snug pr-2">{faq.q}</h3>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} className="shrink-0 rounded-full bg-primary/10 p-1 text-primary">
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div key="answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="overflow-hidden">
                  <div className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed">{faq.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── Mock UI Helpers ──────────────────────────────────────────────────────

function MockBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>{children}</span>;
}

function MockAvatar({ letter, color = "bg-zinc-700" }: { letter: string; color?: string }) {
  return <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${color} text-[11px] font-bold text-white`}>{letter}</div>;
}

// ─── Dashboard Preview Section ─────────────────────────────────────────────

function DashboardPreview() {
  return (
    <section id="dashboard" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16">
      <SectionHeader badge="Command Center" title="Dashboard" description="Drag-and-drop reorderable cards for every module. Real-time overview of your entire workspace." />
      <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
        {/* Mock top bar */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-800" />
            <div><div className="h-3 w-24 rounded bg-zinc-800" /><div className="h-2 w-16 rounded bg-zinc-800/50 mt-1" /></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-zinc-800" />
            <div className="h-8 w-8 rounded-full bg-primary/20" />
          </div>
        </div>
        {/* Grid of mock cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: "My Tasks", value: "12 active", color: "text-emerald-400", bars: [40, 80, 30, 60, 90, 20, 70] },
            { title: "Projects", value: "8 active", color: "text-blue-400", bars: [60, 30, 80, 40, 50, 70, 90] },
            { title: "Invoices", value: "$24.5k", color: "text-amber-400", bars: [90, 60, 40, 70, 30, 80, 50] },
            { title: "Messages", value: "4 new", color: "text-violet-400", bars: [50, 80, 30, 60, 70, 40, 90] },
            { title: "Meetings", value: "3 today", color: "text-rose-400", bars: [70, 40, 90, 50, 60, 80, 30] },
            { title: "Time", value: "6.5h logged", color: "text-cyan-400", bars: [80, 50, 70, 40, 90, 60, 30] },
          ].map((card, i) => (
            <div key={card.title} className="rounded-lg border border-white/5 bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{card.title}</span>
                <GripVertical className="h-3 w-3 text-zinc-600" />
              </div>
              <span className={`text-xl font-bold ${card.color}`}>{card.value}</span>
              <div className="flex items-end gap-1 h-10">
                {card.bars.map((h, j) => <div key={j} className="flex-1 rounded-t bg-zinc-800" style={{ height: `${h / 100 * 40}px` }} />)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ─── Leads Preview Section ──────────────────────────────────────────────────

function LeadsPreview() {
  const columns = ["Name", "Email", "Company", "Stage", "Value"];
  const rows = [
    ["Emma Richards", "emma@techcorp.com", "TechCorp", "Qualified", "$12,500"],
    ["David Kim", "david@startup.io", "Startup.io", "Proposal", "$8,200"],
    ["Lisa Wang", "lisa@acme.org", "Acme Inc", "Negotiation", "$24,000"],
    ["James Cole", "james@devlabs.co", "DevLabs", "New", "$3,400"],
  ];
  return (
    <section id="leads" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16 border-t border-white/5">
      <SectionHeader badge="Lead Management" title="Leads & Spreadsheet" description="Spreadsheet-powered lead management with custom fields, filters, CSV import, and real-time sync." />
      <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b border-white/5">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-400"><Search className="h-3 w-3" /> Search leads...</div>
            <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-2 py-1.5 text-xs text-zinc-400"><Filter className="h-3 w-3" /></div>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-primary/20 text-primary px-3 py-1.5 text-xs font-medium"><Plus className="h-3 w-3" /> Add Lead</div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="p-3 w-8"><div className="h-3 w-3 rounded border border-white/10" /></th>
                {columns.map((c) => <th key={c} className="p-3 font-medium text-zinc-500">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-3"><div className="h-3 w-3 rounded border border-white/10" /></td>
                  {row.map((cell, j) => (
                    <td key={j} className={`p-3 ${j === 0 ? "font-medium text-zinc-200" : "text-zinc-400"}`}>
                      {j === 3 ? (
                        <MockBadge className="bg-blue-500/10 text-blue-400">{cell}</MockBadge>
                      ) : j === 4 ? (
                        <span className="text-emerald-400">{cell}</span>
                      ) : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t border-white/5 text-xs text-zinc-500">
          <span>1-4 of 248 leads</span>
          <div className="flex gap-1"><div className="px-2 py-1 rounded border border-white/10">Prev</div><div className="px-2 py-1 rounded bg-white/[0.04]">1</div><div className="px-2 py-1 rounded border border-white/10">2</div><div className="px-2 py-1 rounded border border-white/10">Next</div></div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Projects Preview ─────────────────────────────────────────────────────

function ProjectsPreview() {
  const projects = [
    { name: "Website Redesign", progress: 75, budget: "$15,000", deadline: "In 14 days", color: "bg-blue-500" },
    { name: "Mobile App v2", progress: 45, budget: "$28,500", deadline: "In 30 days", color: "bg-purple-500" },
    { name: "API Integration", progress: 90, budget: "$9,200", deadline: "In 3 days", color: "bg-emerald-500" },
  ];
  return (
    <section id="projects" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16 border-t border-white/5">
      <SectionHeader badge="Project Management" title="Projects" description="Kanban boards, milestones, deliverables, and team collaboration — all in one place." />
      <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400"><Filter className="h-3 w-3" /> All Projects</div>
          <div className="flex items-center gap-1.5 rounded-md bg-primary/20 text-primary px-3 py-1.5 text-xs font-medium"><Plus className="h-3 w-3" /> New Project</div>
        </div>
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.name} className="rounded-lg border border-white/5 bg-white/[0.02] p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-lg ${p.color} opacity-80`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-zinc-500">{p.deadline}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
                    <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-[11px] text-zinc-500">{p.progress}%</span>
                  <span className="text-[11px] text-emerald-400 ml-2">{p.budget}</span>
                </div>
              </div>
              <MoreHorizontal className="h-4 w-4 text-zinc-600" />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ─── Invoices Preview ─────────────────────────────────────────────────────

function InvoicesPreview() {
  const invoices = [
    { id: "INV-2026-001", client: "TechCorp Inc", amount: "$16,500", status: "Paid", color: "bg-emerald-500/10 text-emerald-400" },
    { id: "INV-2026-002", client: "Startup.io", amount: "$2,450", status: "Sent", color: "bg-blue-500/10 text-blue-400" },
    { id: "INV-2026-003", client: "Acme Inc", amount: "$13,200", status: "Draft", color: "bg-zinc-500/10 text-zinc-400" },
    { id: "INV-2026-004", client: "DevLabs", amount: "$8,900", status: "Overdue", color: "bg-red-500/10 text-red-400" },
  ];
  return (
    <section id="invoices" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16 border-t border-white/5">
      <SectionHeader badge="Billing & Payments" title="Invoices" description="Create, send, and track invoices with line items, tax calculation, and payment status." />
      <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex gap-2 text-xs"><span className="px-3 py-1 rounded-full bg-white/[0.04] text-zinc-200">All</span><span className="px-3 py-1 rounded-full text-zinc-500">Paid</span><span className="px-3 py-1 rounded-full text-zinc-500">Pending</span><span className="px-3 py-1 rounded-full text-zinc-500">Overdue</span></div>
          <div className="flex items-center gap-1.5 rounded-md bg-primary/20 text-primary px-3 py-1.5 text-xs font-medium"><Plus className="h-3 w-3" /> New Invoice</div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2"><span className="text-sm font-medium">{inv.client}</span><MockBadge className={inv.color}>{inv.status}</MockBadge></div>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">{inv.id}</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{inv.amount}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ─── Messages Preview ─────────────────────────────────────────────────────

function MessagesPreview() {
  return (
    <section id="messages" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16 border-t border-white/5">
      <SectionHeader badge="Team Communication" title="Messages" description="Real-time team messaging with read receipts, reply threading, file sharing, and reactions." />
      <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
        <div className="flex h-[320px]">
          {/* Sidebar */}
          <div className="w-56 border-r border-white/5 p-3 space-y-1">
            <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-2 py-1.5 text-xs text-zinc-400 mb-3"><Search className="h-3 w-3" /> Search</div>
            {[
              { name: "Sarah Chen", msg: "Great, sending the contract...", time: "2m", unread: 2, color: "bg-violet-500" },
              { name: "Marcus Johnson", msg: "Updated the proposal", time: "1h", unread: 0, color: "bg-amber-500" },
              { name: "Emily Rodriguez", msg: "Pipeline report is ready", time: "3h", unread: 1, color: "bg-emerald-500" },
              { name: "TechSphere Client", msg: "Onboarding docs complete", time: "5h", unread: 0, color: "bg-blue-500" },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-white/[0.04] cursor-pointer">
                <MockAvatar letter={c.name.split(" ").map(w => w[0]).join("")} color={c.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><span className="text-xs font-medium truncate">{c.name}</span><span className="text-[10px] text-zinc-500">{c.time}</span></div>
                  <p className="text-[11px] text-zinc-500 truncate">{c.msg}</p>
                </div>
                {c.unread > 0 && <span className="shrink-0 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center">{c.unread}</span>}
              </div>
            ))}
          </div>
          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 p-3 border-b border-white/5"><MockAvatar letter="SC" color="bg-violet-500" /><span className="text-sm font-medium">Sarah Chen</span></div>
            <div className="flex-1 p-4 space-y-3 overflow-hidden">
              <div className="flex gap-2">
                <MockAvatar letter="S" color="bg-violet-500" />
                <div className="rounded-lg bg-white/[0.04] px-3 py-2 text-xs max-w-[65%]"><p>Hey! The website redesign is looking great. I left a few comments on the Figma file.</p><span className="text-[10px] text-zinc-500 mt-1 block">10:32 AM</span></div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="rounded-lg bg-primary/20 px-3 py-2 text-xs max-w-[65%]"><p>Thanks Sarah! I'll take a look right now. Are we still on for the 2pm call?</p><span className="text-[10px] text-zinc-500 mt-1 block">10:35 AM</span></div>
                <MockAvatar letter="M" color="bg-primary" />
              </div>
            </div>
            <div className="p-3 border-t border-white/5 flex items-center gap-2">
              <div className="flex-1 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-500">Type a message...</div>
              <div className="flex items-center gap-1"><Paperclip className="h-4 w-4 text-zinc-600" /><Smile className="h-4 w-4 text-zinc-600" /><Send className="h-4 w-4 text-primary" /></div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Meetings Preview ─────────────────────────────────────────────────────

function MeetingsPreview() {
  return (
    <section id="meetings" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16 border-t border-white/5">
      <SectionHeader badge="Scheduling" title="Meetings & Calendar" description="Public booking pages, Google Meet integration, timezone-aware scheduling, and conflict detection." />
      <motion.div className="grid gap-4 lg:grid-cols-3" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
        {/* Calendar mock */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><span className="text-sm font-medium">June 2026</span><ChevronDown className="h-3 w-3 text-zinc-500" /></div>
            <div className="flex gap-1"><div className="px-2 py-1 rounded border border-white/10 text-xs">Today</div></div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <div key={d} className="text-zinc-600 py-1">{d}</div>)}
            {Array.from({ length: 30 }, (_, i) => {
              const highlights = [15, 16, 17, 23].includes(i + 1);
              const today = i + 1 === 16;
              return (
                <div key={i} className={`py-1.5 rounded ${today ? "bg-primary/20 text-primary font-bold" : highlights ? "text-zinc-200" : "text-zinc-600"} ${i < 5 ? "col-start-" + (i + 5) : ""}`}>
                  {i + 1}
                  {today && <div className="h-0.5 w-4 mx-auto mt-0.5 rounded-full bg-primary" />}
                </div>
              );
            })}
          </div>
          <div className="mt-4 space-y-2">
            {[
              { time: "10:00 AM", title: "Client Discovery Call", color: "bg-blue-500" },
              { time: "2:00 PM", title: "Design Review - Website", color: "bg-purple-500" },
              { time: "4:30 PM", title: "Sprint Planning", color: "bg-amber-500" },
            ].map((ev) => (
              <div key={ev.title} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-white/[0.04]">
                <div className={`h-2 w-2 rounded-full ${ev.color}`} />
                <span className="text-zinc-500 w-16">{ev.time}</span>
                <span className="text-zinc-200">{ev.title}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Booking page mock */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col items-center text-center">
          <MockAvatar letter="SC" color="bg-violet-500" />
          <h4 className="text-sm font-semibold mt-2">Sarah Chen</h4>
          <p className="text-[11px] text-zinc-400">30 Minute Meeting</p>
          <div className="w-full mt-3 space-y-1">
            {["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "2:00 PM"].map((t) => (
              <div key={t} className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-zinc-200 text-left hover:border-primary/50 hover:bg-primary/5 cursor-pointer">{t}</div>
            ))}
          </div>
          <p className="text-[10px] text-zinc-500 mt-3">Timezone: UTC+5 (auto-detected)</p>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Time Tracking Preview ─────────────────────────────────────────────────

function TimeTrackingPreview() {
  return (
    <section id="time-tracking" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16 border-t border-white/5">
      <SectionHeader badge="Productivity" title="Time Tracking" description="Live stopwatch, manual entries, per-project billable tracking, and daily grouped views." />
      <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
        {/* Timer */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-mono font-bold text-emerald-400 tabular-nums">04:32:18</div>
            <div className="flex gap-1.5">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Play className="h-4 w-4" /></div>
              <div className="h-8 w-8 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center"><Square className="h-3 w-3" /></div>
            </div>
          </div>
          <div className="text-xs text-zinc-500">Project: Website Redesign</div>
        </div>
        {/* Today's entries */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide">Today</span>
          {[
            { project: "Website Redesign", task: "Header component", time: "2:15:00", billable: true },
            { project: "Mobile App", task: "API integration", time: "1:45:00", billable: true },
            { project: "DevLabs", task: "Bug fixes", time: "0:32:00", billable: false },
          ].map((e) => (
            <div key={e.task} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-white/[0.04]">
              <Clock className="h-3.5 w-3.5 text-zinc-600" />
              <div className="flex-1 min-w-0">
                <span className="text-xs">{e.task}</span>
                <span className="text-[10px] text-zinc-500 ml-2">{e.project}</span>
              </div>
              <span className="text-xs font-mono text-zinc-400">{e.time}</span>
              {e.billable && <MockBadge className="bg-emerald-500/10 text-emerald-400">Billable</MockBadge>}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ─── Contracts Preview ─────────────────────────────────────────────────────

function ContractsPreview() {
  return (
    <section id="contracts" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16 border-t border-white/5">
      <SectionHeader badge="Agreements" title="Contracts & Proposals" description="Create proposals, contracts, and agreements with e-signature workflows and activity tracking." />
      <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
          {[
            { title: "Website Redesign Proposal", client: "TechCorp", status: "Signed", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { title: "Social Media Management", client: "Startup.io", status: "Sent", color: "text-blue-400", bg: "bg-blue-500/10" },
            { title: "Service Agreement Draft", client: "Acme Inc", status: "Draft", color: "text-zinc-400", bg: "bg-zinc-500/10" },
          ].map((c) => (
            <div key={c.title} className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-3"><FileSignature className="h-4 w-4 text-zinc-600" /><span className="text-[10px] text-zinc-500 uppercase tracking-wide">Proposal</span></div>
              <h4 className="text-sm font-medium leading-snug">{c.title}</h4>
              <p className="text-[11px] text-zinc-500 mt-1">{c.client}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <MockBadge className={c.bg + " " + c.color}>{c.status}</MockBadge>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-zinc-600" />
                  <PenLine className="h-3.5 w-3.5 text-zinc-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ─── Analytics Preview ─────────────────────────────────────────────────────

function AnalyticsPreview() {
  return (
    <section id="analytics" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16 border-t border-white/5">
      <SectionHeader badge="Insights" title="Analytics & Reports" description="Revenue charts, conversion funnels, time reports, KPI cards, and exportable PDF reports." />
      <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Revenue", value: "$128.5k", change: "+12.3%", color: "text-emerald-400" },
            { label: "Active Leads", value: "1,248", change: "+8.1%", color: "text-blue-400" },
            { label: "Conversion", value: "24.6%", change: "+3.2%", color: "text-violet-400" },
            { label: "Hours Logged", value: "342h", change: "+18.5%", color: "text-amber-400" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <span className="text-[11px] text-zinc-500">{kpi.label}</span>
              <div className="flex items-end gap-1.5 mt-1">
                <span className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</span>
                <span className="text-[10px] text-emerald-400">{kpi.change}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Chart area */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-zinc-400">Revenue Over Time</span><span className="text-[10px] text-zinc-500">Last 6 months</span></div>
          <div className="flex items-end gap-2 h-32">
            {[30, 45, 35, 60, 50, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-zinc-500">${h}k</span>
                <div className="w-full rounded-t bg-primary/30 hover:bg-primary/50 transition-colors" style={{ height: `${h / 80 * 100}%` }} />
                <span className="text-[10px] text-zinc-600">{["Jan","Feb","Mar","Apr","May","Jun"][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Button variant="outline" size="sm" className="text-xs gap-1.5"><Download className="h-3 w-3" /> Export PDF</Button>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5"><Download className="h-3 w-3" /> Export CSV</Button>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Client Portal Preview ─────────────────────────────────────────────────

function ClientPortalPreview() {
  const clientModules = [
    { icon: FolderKanban, title: "Projects", desc: "View assigned projects with progress tracking" },
    { icon: FileText, title: "Invoices", desc: "View and pay invoices with status tracking" },
    { icon: FileSignature, title: "Contracts", desc: "View and sign contracts and proposals" },
    { icon: Calendar, title: "Meetings", desc: "View upcoming meetings and join calls" },
    { icon: MessageSquare, title: "Messages", desc: "Chat with your team in real-time" },
  ];
  return (
    <section id="client-portal" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16 border-t border-white/5">
      <SectionHeader badge="Client Experience" title="Client Portal" description="Dedicated dashboard for your clients — projects, invoices, contracts, and messages, all role-gated." />
      <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
        <div className="p-5">
          {/* Client header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
            <MockAvatar letter="TC" color="bg-blue-500" />
            <div><span className="text-sm font-medium">TechCorp Inc</span><p className="text-[11px] text-zinc-500">Client · Joined Jan 2026</p></div>
          </div>
          {/* Welcome card */}
          <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4 mb-5">
            <h4 className="text-sm font-semibold">Welcome back, TechCorp!</h4>
            <p className="text-xs text-zinc-400 mt-1">Your website redesign project is 75% complete. Next milestone: Design Review on June 18th.</p>
          </div>
          {/* Module grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {clientModules.map((m) => (
              <div key={m.title} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2"><m.icon className="h-4 w-4" /></div>
                <span className="text-xs font-medium block">{m.title}</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Features Grid ─────────────────────────────────────────────────────────

function FeaturesGrid() {
  const features = [
    { icon: Globe, title: "Self-Hosted", desc: "Deploy on Vercel, any Node.js server, or your own infrastructure." },
    { icon: Lock, title: "Role-Based Access", desc: "Owner, Admin, Member, Viewer, Client — granular permissions." },
    { icon: ShieldCheck, title: "Audit Trail", desc: "Every mutation logged. Know who did what and when." },
    { icon: Palette, title: "Custom Themes", desc: "18 accent colors, dark/light mode, fully customizable UI." },
    { icon: Cloud, title: "Free Tier Ready", desc: "Run on Firebase Spark, Vercel Hobby, Cloudinary Free." },
    { icon: Zap, title: "Real-Time Sync", desc: "Firestore real-time listeners keep every client in sync." },
  ];
  return (
    <section id="features" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16 border-t border-white/5">
      <SectionHeader badge="Platform" title="Built for scale" description="Enterprise-grade features without the enterprise price tag." />
      <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
        {features.map((f) => (
          <motion.div key={f.title} variants={fadeUp} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:border-primary/30 transition-all duration-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><f.icon className="h-4 w-4" /></div>
            <h4 className="mt-3 font-semibold text-sm">{f.title}</h4>
            <p className="mt-0.5 text-xs text-zinc-400">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────

interface Testimonial { quote: string; name: string; role: string; company: string; initials: string; gradient: string; glow: string; stars: number; }
const TESTIMONIALS: Testimonial[] = [
  { quote: "We replaced spreadsheets and two SaaS tools with LeadFlow. Invoices, time tracking, and messaging in one place.", name: "Ariana Holt", role: "Growth Lead", company: "Fieldstack", initials: "AH", gradient: "from-violet-500 to-purple-600", glow: "rgba(139, 92, 246, 0.15)", stars: 5 },
  { quote: "Open source means we own our data. Self-hosted in 10 minutes, no vendor lock-in, no per-seat pricing surprises.", name: "Marcus Lee", role: "RevOps Manager", company: "Harbor", initials: "ML", gradient: "from-emerald-500 to-teal-600", glow: "rgba(16, 185, 129, 0.15)", stars: 5 },
  { quote: "The modules actually cover our workflow - leads through invoices. Clients see their own portal. It just works.", name: "Priya Das", role: "Founder", company: "Sunpath Studio", initials: "PD", gradient: "from-amber-500 to-orange-600", glow: "rgba(245, 158, 11, 0.15)", stars: 5 },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-16 border-t border-white/5">
      <SectionHeader badge="Social Proof" title="Teams switching to LeadFlow" description="Join freelancers, agencies, and startups who moved from spreadsheets and SaaS tools." />
      <motion.div className="grid gap-5 md:grid-cols-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
        {TESTIMONIALS.map((t) => (
          <motion.div key={t.name} variants={fadeUp} className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300"
            whileHover={{ y: -6, transition: { type: "spring", stiffness: 200, damping: 15 } }}>
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `radial-gradient(600px circle at 50% 0%, ${t.glow}, transparent 70%)` }} />
            <div className="relative mb-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-[11px] font-bold text-white shadow-lg`} style={{ boxShadow: `0 4px 12px ${t.glow}` }}>{t.initials}</div>
              <div className="flex gap-0.5">{Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
            </div>
            <p className="relative text-sm text-zinc-400 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-5 flex items-center gap-2.5 border-t border-white/5 pt-4">
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{t.name}</p><p className="text-xs text-zinc-500 truncate">{t.role}</p></div>
              <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-zinc-500 uppercase">{t.company}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ─── Stats Strip ───────────────────────────────────────────────────────────

const STATS = [
  { label: "Deploy method", value: "Vercel" },
  { label: "Setup time", value: "<10 min" },
  { label: "Free & open source", value: "MIT" },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { router.replace("/dashboard"); return; }
      setReady(true);
    });
    return () => unsubscribe();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-zinc-800 animate-pulse" />
            <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 left-[-10%] h-96 w-96 rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Nav */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-base font-bold tracking-tight">LeadFlow</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
            <a href="#dashboard" className="hover:text-white transition-colors">Dashboard</a>
            <a href="#leads" className="hover:text-white transition-colors">Leads</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <a href="https://github.com/Tabish5858/Leadflow-CRM" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Github className="h-4 w-4" /> GitHub
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="gap-1.5" onClick={() => { localStorage.setItem("leadflow_demo_mode", "true"); window.location.href = "/dashboard"; }}>
              <Zap className="h-3.5 w-3.5" /> Try Demo
            </Button>
            <Button asChild variant="ghost" size="sm"><Link href="/login">Sign in</Link></Button>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16 md:pt-24">
          <motion.div className="mx-auto max-w-3xl text-center" variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs text-zinc-400 mb-6">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Open-source CRM for modern teams
              </div>
            </motion.div>
            <motion.h1 variants={fadeUpHeavy} className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              The CRM your team<br />
              <span className="bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">will actually use</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 text-base text-zinc-400 sm:text-lg max-w-2xl mx-auto">
              Open-source. Self-hosted. All your modules — dashboard, leads, projects, invoices,
              meetings, messages, time tracking, contracts, and a client portal — in one platform.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="gap-2 text-base h-12 px-6" onClick={() => { localStorage.setItem("leadflow_demo_mode", "true"); window.location.href = "/dashboard"; }}>
                <Zap className="h-5 w-5" /> Try Live Demo
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 text-base h-12 px-6">
                <a href="https://github.com/Tabish5858/Leadflow-CRM" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" /> GitHub <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg" className="gap-2 text-base h-12 px-6">
                <Link href="/docs"><BookOpen className="h-5 w-5" /> Docs</Link>
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-zinc-500">
              <div className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-500" /> No account needed</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-500" /> No credit card</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> Self-host available</div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-12">
          <motion.div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:grid-cols-3"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Module Previews */}
        <DashboardPreview />
        <LeadsPreview />
        <ProjectsPreview />
        <InvoicesPreview />
        <MessagesPreview />
        <MeetingsPreview />
        <TimeTrackingPreview />
        <ContractsPreview />
        <AnalyticsPreview />
        <ClientPortalPreview />
        <FeaturesGrid />
        <TestimonialsSection />

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 mx-auto w-full max-w-4xl px-6 py-16 border-t border-white/5">
          <SectionHeader badge="Questions" title="Frequently asked" description="Everything about open-source CRM and self-hosting." />
          <FAQAccordion />
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center sm:p-12"
            variants={scaleFade} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Try it now. No signup needed.</h2>
            <p className="mt-3 text-zinc-400 max-w-lg mx-auto">One click into a fully-loaded workspace with real demo data. Invoices, projects, documents — all pre-configured.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="gap-2 text-base h-12 px-6" onClick={() => { localStorage.setItem("leadflow_demo_mode", "true"); window.location.href = "/dashboard"; }}>
                <Zap className="h-5 w-5" /> Launch Demo
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 text-base h-12 px-6">
                <a href="https://github.com/Tabish5858/Leadflow-CRM" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" /> Star on GitHub
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg" className="gap-2 text-base h-12 px-6">
                <Link href="/docs"><BookOpen className="h-5 w-5" /> Read the Docs</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-zinc-500">No account. No credit card. Just click and explore.</p>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <motion.footer className="border-t border-white/10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <Logo /><span className="font-semibold">LeadFlow</span><span className="text-zinc-500">·</span><span className="text-zinc-500">Open-source CRM</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-zinc-500">
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <a href="https://github.com/Tabish5858/Leadflow-CRM" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors"><Github className="h-4 w-4" /> GitHub</a>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:contact@tabishbinishfaq.dev" className="hover:text-white transition-colors">Contact</a>
            <span className="text-zinc-600">MIT License</span>
          </div>
        </div>
      </motion.footer>

      {/* Schema */}
      <Script id="schema-faq" strategy="afterInteractive" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
        }),
      }} />
    </div>
  );
}
