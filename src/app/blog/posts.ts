export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  sections: { heading: string; body: string }[];
}

export const posts: BlogPost[] = [
  {
    slug: "how-to-run-crm-on-free-tiers-firebase-vercel",
    title: "How to Run a CRM on Free Tiers: Firebase + Vercel",
    description:
      "Step-by-step guide to deploying a production CRM using only free tiers — Firebase Spark, Vercel Hobby, Cloudinary Free, Resend Free, and Google APIs. Zero monthly cost.",
    publishedAt: "2026-06-10",
    author: "LeadFlow Team",
    tags: ["free-tier", "firebase", "vercel", "self-hosting", "devops"],
    sections: [
      {
        heading: "The $0 CRM Is Real",
        body: "Most people assume a production-ready CRM costs at least $50/month per user. HubSpot starts there. Salesforce starts much higher. Even open-source CRMs like Twenty require a PostgreSQL server ($15-50/month) and Docker infrastructure. But with the right architecture, you can run a full-featured CRM for exactly $0/month.",
      },
      {
        heading: "What You Get for Free",
        body: "LeadFlow runs on six free tiers: Firebase Spark (50k reads/day, 20k writes/day, 1GB storage), Vercel Hobby (100GB bandwidth, 100k function invocations/month), Cloudinary Free (25GB storage, 25GB bandwidth), Resend Free (3,000 emails/month), Google APIs (free within quota), and Sentry Free (5k errors/month). For a solo freelancer or small team, none of these limits are hit in normal use.",
      },
      {
        heading: "Firebase: The Backbone",
        body: "Firebase Auth handles login (Email, Google, GitHub). Firestore provides real-time sync across devices. Firebase Storage serves as file fallback. The Spark plan is genuinely free — no credit card required. The 50k reads/day limit translates to roughly 3,500 active lead views per day, which is more than enough for teams under 20 people.",
      },
      {
        heading: "Vercel: Zero-Ops Deployment",
        body: "Every push to GitHub triggers an automatic deploy. Preview URLs for every branch. Edge functions for API routes. The Hobby plan includes 100GB bandwidth and 100k function invocations — enough for thousands of daily requests. Custom domains, SSL, and CDN are included.",
      },
      {
        heading: "The Other Services",
        body: "Cloudinary handles document uploads with built-in optimization. Resend sends transactional emails with open/click tracking. Google Calendar OAuth enables meeting scheduling and Google Meet creation. Sentry catches errors before your users do. Each has a generous free tier that covers normal usage.",
      },
      {
        heading: "When to Upgrade",
        body: "If you hit Firebase's 50k daily reads, you're likely serving 50+ active users. At that point, the Flame plan ($25/month) or Blaze (pay-as-you-go) is trivial compared to Salesforce ($1,500+/month for the same team size). Vercel's Pro plan ($20/month) adds 1TB bandwidth and 1M function invocations. Every service scales incrementally — no surprise bills.",
      },
    ],
  },
  {
    slug: "open-source-crm-without-docker",
    title: "Open-Source CRM Without Docker: Why LeadFlow Ditched Containers",
    description:
      "Most open-source CRMs require Docker. LeadFlow runs on plain Node.js + Firebase. Here's why that matters for freelancers and small teams who just want their CRM to work.",
    publishedAt: "2026-06-10",
    author: "LeadFlow Team",
    tags: ["docker", "self-hosting", "architecture", "comparison"],
    sections: [
      {
        heading: "The Docker Tax on Small Teams",
        body: "Docker is great for large-scale deployments. But for a freelancer or 5-person agency, spinning up Docker Compose, managing PostgreSQL containers, and troubleshooting volume mounts is overhead you don't need. Every open-source CRM in the top 10 — Twenty, EspoCRM, SuiteCRM, OroCRM — requires Docker or a LAMP stack with multiple services to run.",
      },
      {
        heading: "Node.js + Firebase Changes the Game",
        body: "LeadFlow uses Firebase as its backend (Auth, Firestore, Storage). This means zero infrastructure to manage. No database server. No container orchestration. No connection pooling. Just `npm install && npm run build && npm start` on any Node.js server, or click a button on Vercel. The entire application runs as a single process.",
      },
      {
        heading: "What You Lose Without Docker",
        body: "You lose horizontal scaling without containers. If you need to serve 10,000+ concurrent users, you'd want Docker + Kubernetes. But for teams under 50 people, Firebase handles scale automatically. Firestore's real-time sync works at any size. Vercel's edge functions scale to zero. The architecture is serverless by design.",
      },
      {
        heading: "What You Gain",
        body: "Setup time drops from 30+ minutes to under 10. No Docker knowledge required. Updates are `git pull && npm run build && npm start`. Rollbacks are `git revert`. The entire stack is 3 commands from clone to running. For a small team, this is the difference between 'I'll set it up next week' and 'it's already running'.",
      },
      {
        heading: "The Hidden Cost of Docker",
        body: "Running Docker in production means you need a server (minimum $5-15/month), you need to manage Docker updates, handle container restarts, monitor disk space, and set up backups. These aren't hard, but they're time. LeadFlow's Firebase backend handles all of that. Backups are automatic. Scaling is automatic. Security patching is Google's problem.",
      },
    ],
  },
  {
    slug: "leadflow-vs-twenty-crm-comparison",
    title: "LeadFlow vs Twenty CRM: MIT vs AGPL, No Docker Required",
    description:
      "A detailed comparison of LeadFlow and Twenty CRM across license, deployment, features, and total cost of ownership for small teams. Both are open-source — but they're not the same.",
    publishedAt: "2026-06-10",
    author: "LeadFlow Team",
    tags: ["twenty", "comparison", "open-source", "MIT", "AGPL"],
    sections: [
      {
        heading: "Two Open-Source CRMs, Two Philosophies",
        body: "Twenty CRM is the most popular open-source CRM on GitHub (44K+ stars). It's backed by Y Combinator, built in TypeScript, and aims to be the open-source Salesforce. LeadFlow is younger but takes a different approach: MIT license instead of AGPL-3.0, Firebase backend instead of PostgreSQL + Docker, and an all-in-one product that includes invoicing, time tracking, and client portal out of the box.",
      },
      {
        heading: "License: MIT vs AGPL-3.0",
        body: "This is the biggest difference. Twenty uses AGPL-3.0, which requires that any modified version distributed to users must also be AGPL. If you fork Twenty and add proprietary features, you must release those changes. LeadFlow uses MIT — you can fork, modify, add proprietary features, sell it, do anything. No copyleft obligations. For startups and agencies building on top of the code, MIT is significantly more permissive.",
      },
      {
        heading: "Deployment: Node.js vs Docker Compose",
        body: "Twenty requires Docker Compose with PostgreSQL. You need a server with at least 2GB RAM, Docker installed, and PostgreSQL configured. LeadFlow runs on Node.js + Firebase — no Docker, no database server. Deploy on Vercel in 2 clicks or on any Node.js VPS in 10 minutes. The Firebase backend means zero database management.",
      },
      {
        heading: "Built-in Features",
        body: "LeadFlow includes invoicing, time tracking, and a client portal as core modules — not plugins or extensions. Twenty focuses on pipeline and contact management and requires plugins or custom development for invoicing and client portals. Both have Kanban pipelines, but LeadFlow adds built-in time tracking (start/stop timer, billable hours) and a full invoice management system with line items, tax, and payment tracking.",
      },
      {
        heading: "Cost of Ownership",
        body: "Twenty self-hosted: Docker server ($15-50/month) + PostgreSQL + domain. LeadFlow self-hosted: $0 (Firebase Spark + Vercel Hobby + Cloudinary Free + Resend Free). Twenty Cloud (hosted by Twenty): starts at $9/user/month. LeadFlow has no hosted tier — it's self-hosted only, so your cost is exactly $0 for the infrastructure. The trade-off: Twenty Cloud gives you managed hosting. LeadFlow gives you zero cost.",
      },
      {
        heading: "Which Should You Choose?",
        body: "Choose LeadFlow if: you want MIT licensing, need invoicing/time tracking/client portal built in, don't want to manage Docker/PostgreSQL, or want a $0 infrastructure cost. Choose Twenty if: you need a highly customizable data model (Twenty's 'Notion-like' approach), you already run Docker/PostgreSQL, or you want the larger community (44K GitHub stars). Both are great open-source projects — they just optimize for different trade-offs.",
      },
    ],
  },
];

export const featuredPosts = posts.slice(0, 3);
