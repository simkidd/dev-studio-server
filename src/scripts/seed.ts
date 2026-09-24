import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db";
import {
  User,
  Profile,
  Project,
  Experience,
  Skill,
  Post,
  Message,
  Testimonial,
} from "../models";
import { AuthService } from "../services";
import { logger } from "../utils/logger";

async function seed() {
  try {
    logger.info("🌱 Starting comprehensive database seeding...");
    await connectDB();

    // Clear existing collections for a fresh, clean baseline
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Project.deleteMany({}),
      Experience.deleteMany({}),
      Skill.deleteMany({}),
      Post.deleteMany({}),
      Message.deleteMany({}),
      Testimonial.deleteMany({}),
    ]);
    logger.info("🧹 Existing collections cleaned.");

    // 1. Superadmin User
    const hashedPassword = await AuthService.hashPassword("Admin@2026!");
    await User.create({
      email: "admin@portfolio.dev",
      password: hashedPassword,
      role: "superadmin",
    });
    logger.info("✅ Superadmin created: admin@portfolio.dev / Admin@2026!");

    // 2. Developer Profile
    await Profile.create({
      firstName: "Alex",
      lastName: "Morgan",
      headline: "Senior Staff Full-Stack & Distributed Systems Architect",
      subHeadline:
        "Building resilient enterprise microservices, high-throughput data pipelines, and flagship web experiences.",
      bio: "10+ years architecting web platforms handling $50M+ processed ARR, sub-50ms p99 latencies, and 99.99% uptime SLAs. Specializing in TypeScript, Next.js, React, Node.js, distributed caches, and cloud infrastructure.",
      aboutMarkdown:
        "## About Me\n\nI partner with high-growth technology companies and venture-backed startups to untangle distributed bottlenecks, lead engineering teams, and design production systems.",
      location: "San Francisco, CA / London (Remote Available)",
      isAvailableForHire: true,
      availabilityNote:
        "Available for high-impact Staff/Lead roles & select advisory contracts ($10k–$50k)",
      socialLinks: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://x.com",
        email: "alex@morgan.engineering",
        website: "https://morgan.engineering",
      },
      stats: {
        yearsExperience: 10,
        completedProjects: 38,
        happyClients: 22,
        codeCommits: 5400,
      },
    });
    logger.info("✅ Profile created.");

    // 3. Featured Showcase Projects (With Gallery Images on multiple projects)
    await Project.create([
      {
        title: "ApexFlow Distributed Event Stream",
        slug: "apexflow-distributed-event-stream",
        summary:
          "High-throughput event streaming engine processing 120k events/sec with sub-10ms consumer lag and end-to-end telemetry.",
        caseStudy:
          "## Architecture Overview\n\nDesigned with Go, Redis Cluster, Kafka, and Next.js monitoring dashboards to ingest telemetry across 4 global regions.\n\n### Key Technical Milestones\n- Zero-copy buffer processing pipeline\n- Multi-region replication with automatic failover\n- Prometheus metrics exporter with sub-second scrape intervals",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
        galleryImages: [
          {
            url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
          },
        ],
        technologies: [
          "Go",
          "Redis",
          "Kafka",
          "TypeScript",
          "Next.js",
          "Docker",
        ],
        category: "Backend",
        liveUrl: "https://apexflow-demo.dev",
        githubUrl: "https://github.com/example/apexflow",
        isFeatured: true,
        metrics: [
          { label: "Throughput", value: "120k ops/sec" },
          { label: "Latency", value: "< 8.5ms" },
          { label: "Availability", value: "99.999%" },
        ],
        order: 1,
        isPublished: true,
      },
      {
        title: "OmniCanvas Real-Time Multiplayer Suite",
        slug: "omnicanvas-real-time-multiplayer-suite",
        summary:
          "Collaborative infinite canvas with CRDT conflict-free editing, WebGL hardware acceleration, and zero-latency cursors.",
        caseStudy:
          "## Client-Side Engineering\n\nBuilt custom WebGL render pipeline integrated with Yjs CRDTs over WebSockets for 100+ concurrent collaborators per room.\n\n### Rendering Benchmarks\n- 60 FPS constant frame rate across 50,000 active vector nodes\n- Delta compressed state vectors under 250 bytes per client update",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        galleryImages: [
          {
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=1200&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1200&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
          },
        ],
        technologies: [
          "React",
          "TypeScript",
          "WebGL",
          "WebSockets",
          "CRDT",
          "Node.js",
        ],
        category: "Full-Stack",
        liveUrl: "https://omnicanvas-app.dev",
        githubUrl: "https://github.com/example/omnicanvas",
        isFeatured: true,
        metrics: [
          { label: "Active Users", value: "45k DAU" },
          { label: "FPS Stability", value: "60 FPS" },
          { label: "Sync Latency", value: "14ms" },
        ],
        order: 2,
        isPublished: true,
      },
      {
        title: "QuantumPay Multi-Tenant Payment Orchestrator",
        slug: "quantumpay-payment-orchestrator",
        summary:
          "Global payment routing engine with intelligent failover, PCI-DSS compliant tokenization, and $30M+ volume throughput.",
        caseStudy:
          "## Payment Routing & Fault Tolerance\n\nImplemented automated circuit breakers across Stripe, Adyen, and PayPal reducing failed transaction rates by 82%.\n\n### Ledger Design\nDouble-entry cryptographic ledger ensuring mathematical zero-sum verification across all multi-currency transactions.",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        galleryImages: [
          {
            url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
          },
        ],
        technologies: [
          "Node.js",
          "Express",
          "TypeScript",
          "PostgreSQL",
          "Redis",
          "Stripe",
        ],
        category: "Backend",
        liveUrl: "https://quantumpay.dev",
        githubUrl: "https://github.com/example/quantumpay",
        isFeatured: true,
        metrics: [
          { label: "Volume Routed", value: "$30M+ ARR" },
          { label: "Failover Drop", value: "-82%" },
        ],
        order: 3,
        isPublished: true,
      },
      {
        title: "Krypton Design System & Micro-Frontends",
        slug: "krypton-design-system-microfrontends",
        summary:
          "Enterprise design system component library powering 14 distinct product teams with zero-runtime CSS tokens and 100% WCAG AAA accessibility.",
        caseStudy:
          "## Design System Architecture\n\nTokenized design system built with Radix primitives, Tailwind CSS v4, Storybook, and automated visual regression testing in CI/CD.",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        galleryImages: [
          {
            url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1581291518655-9523c93269c4?auto=format&fit=crop&w=1200&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80",
          },
        ],
        technologies: [
          "React",
          "TypeScript",
          "TailwindCSS",
          "Storybook",
          "Radix UI",
        ],
        category: "Frontend",
        liveUrl: "https://krypton-ui.dev",
        githubUrl: "https://github.com/example/krypton-ui",
        isFeatured: true,
        metrics: [
          { label: "Teams Adopted", value: "14 Teams" },
          { label: "Bundle Overhead", value: "< 12KB" },
        ],
        order: 4,
        isPublished: true,
      },
      {
        title: "Aegis AI Code Review & Security Sentinel",
        slug: "aegis-ai-code-security-sentinel",
        summary:
          "Autonomous LLM-driven GitHub action analyzing pull requests for OWASP vulnerabilities, race conditions, and architectural regressions.",
        caseStudy:
          "## LLM Reasoning Pipeline\n\nEngineered semantic AST parsing with localized embedding retrieval to provide actionable security patches directly in GitHub PRs.",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
        galleryImages: [
          {
            url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
          },
        ],
        technologies: [
          "Python",
          "TypeScript",
          "OpenAI",
          "Vector DB",
          "GitHub Actions",
        ],
        category: "AI/ML",
        liveUrl: "https://aegis-sentinel.dev",
        githubUrl: "https://github.com/example/aegis",
        isFeatured: false,
        metrics: [
          { label: "Vulnerabilities Caught", value: "1,200+" },
          { label: "False Positives", value: "< 2%" },
        ],
        order: 5,
        isPublished: true,
      },
      {
        title: "Vortex Multi-Region Kubernetes Mesh",
        slug: "vortex-multi-region-kubernetes-mesh",
        summary:
          "Infrastructure as code automation orchestrating zero-downtime canary deployments across AWS US-East, EU-Central, and AP-East.",
        caseStudy:
          "## Multi-Region Infrastructure\n\nTerraform and Istio service mesh setup with GeoDNS routing and automated failover drills.",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        galleryImages: [
          {
            url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
          },
        ],
        technologies: [
          "Kubernetes",
          "Terraform",
          "Istio",
          "AWS",
          "Prometheus",
          "Grafana",
        ],
        category: "DevOps",
        githubUrl: "https://github.com/example/vortex-mesh",
        isFeatured: false,
        metrics: [
          { label: "Deployment Time", value: "3.5 Mins" },
          { label: "Multi-Region Uptime", value: "100%" },
        ],
        order: 6,
        isPublished: true,
      },
      {
        title: "Synapse Neural Search Engine",
        slug: "synapse-neural-search-engine",
        summary:
          "Sub-20ms hybrid lexical and vector search engine indexing 5M+ technical documents with contextual re-ranking.",
        caseStudy:
          "## Search Performance\n\nEngineered Qdrant vector index with BM25 cross-encoders to deliver precision search across engineering codebases.",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        galleryImages: [],
        technologies: [
          "Python",
          "Rust",
          "Qdrant",
          "FastAPI",
          "React",
          "Next.js",
        ],
        category: "AI/ML",
        isFeatured: false,
        metrics: [
          { label: "Indexed Docs", value: "5M+" },
          { label: "Query p95", value: "18ms" },
        ],
        order: 7,
        isPublished: true,
      },
      {
        title: "Hyperion High-Frequency Market Scanner",
        slug: "hyperion-market-scanner",
        summary:
          "Low-latency websocket orderbook aggregator processing Level-2 market data across 8 major crypto exchanges with sub-millisecond execution alerts.",
        caseStudy:
          "## Ultra-Low Latency Pipelines\n\nZero-allocation buffer management in Go and Node.js C++ bindings for deterministic tick processing.",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80",
        galleryImages: [],
        technologies: [
          "Go",
          "WebSockets",
          "TimescaleDB",
          "Redis",
          "TypeScript",
        ],
        category: "System Design",
        isFeatured: false,
        metrics: [
          { label: "Tick Processing", value: "250k ticks/s" },
          { label: "Execution Delay", value: "420µs" },
        ],
        order: 8,
        isPublished: true,
      },
    ]);
    logger.info("✅ Showcase projects seeded with gallery images (8 items).");

    // 4. Skills Matrix (16 Items across 7 categories)
    await Skill.create([
      {
        name: "TypeScript",
        category: "Languages",
        proficiency: 98,
        level: "Expert",
        isTopSkill: true,
        order: 1,
      },
      {
        name: "JavaScript (ESNext)",
        category: "Languages",
        proficiency: 98,
        level: "Expert",
        isTopSkill: false,
        order: 2,
      },
      {
        name: "Go (Golang)",
        category: "Languages",
        proficiency: 88,
        level: "Advanced",
        isTopSkill: true,
        order: 3,
      },
      {
        name: "Python",
        category: "Languages",
        proficiency: 85,
        level: "Advanced",
        isTopSkill: false,
        order: 4,
      },
      {
        name: "Next.js 15 (App Router)",
        category: "Frontend",
        proficiency: 96,
        level: "Expert",
        isTopSkill: true,
        order: 5,
      },
      {
        name: "React 19 & Hooks",
        category: "Frontend",
        proficiency: 98,
        level: "Expert",
        isTopSkill: true,
        order: 6,
      },
      {
        name: "Tailwind CSS v4",
        category: "Frontend",
        proficiency: 95,
        level: "Expert",
        isTopSkill: false,
        order: 7,
      },
      {
        name: "Node.js & Express v5",
        category: "Backend",
        proficiency: 96,
        level: "Expert",
        isTopSkill: true,
        order: 8,
      },
      {
        name: "GraphQL & REST APIs",
        category: "Backend",
        proficiency: 92,
        level: "Expert",
        isTopSkill: false,
        order: 9,
      },
      {
        name: "PostgreSQL & Prisma",
        category: "Database",
        proficiency: 92,
        level: "Advanced",
        isTopSkill: true,
        order: 10,
      },
      {
        name: "MongoDB & Mongoose",
        category: "Database",
        proficiency: 94,
        level: "Expert",
        isTopSkill: true,
        order: 11,
      },
      {
        name: "Redis (Caching/Queues)",
        category: "Database",
        proficiency: 92,
        level: "Expert",
        isTopSkill: false,
        order: 12,
      },
      {
        name: "Docker & Containerization",
        category: "DevOps/Cloud",
        proficiency: 90,
        level: "Advanced",
        isTopSkill: true,
        order: 13,
      },
      {
        name: "Kubernetes & Helm",
        category: "DevOps/Cloud",
        proficiency: 82,
        level: "Advanced",
        isTopSkill: false,
        order: 14,
      },
      {
        name: "Microservices & Distributed Architecture",
        category: "Architecture",
        proficiency: 95,
        level: "Expert",
        isTopSkill: true,
        order: 15,
      },
      {
        name: "CI/CD & GitHub Actions",
        category: "Tools",
        proficiency: 92,
        level: "Advanced",
        isTopSkill: false,
        order: 16,
      },
    ]);
    logger.info("✅ Tech matrix skills seeded (16 items).");

    // 5. Career Timeline (4 Positions)
    await Experience.create([
      {
        company: "Stripe / FinTech Ecosystem",
        role: "Principal Distributed Systems Architect",
        location: "San Francisco, CA (Remote)",
        employmentType: "full-time",
        isRemote: true,
        startDate: new Date("2023-01-15").toISOString(),
        isCurrent: true,
        summary:
          "Lead architectural governance for global payment orchestration and multi-tenant ledger infrastructure processing $50M+ ARR.",
        technologies: [
          "TypeScript",
          "Go",
          "PostgreSQL",
          "Kafka",
          "Redis",
          "AWS",
        ],
        achievements: [
          "Architected real-time failover pipeline reducing p99 transaction latencies from 380ms to 45ms",
          "Mentored 18 senior engineers across 3 distributed engineering squads",
          "Engineered idempotent transaction ledger achieving zero double-charge anomalies over 24 months",
        ],
        order: 1,
      },
      {
        company: "Vercel Partner Labs",
        role: "Lead Full-Stack Solutions Architect",
        location: "London, UK (Hybrid)",
        employmentType: "full-time",
        isRemote: false,
        startDate: new Date("2021-03-01").toISOString(),
        endDate: new Date("2022-12-31").toISOString(),
        isCurrent: false,
        summary:
          "Guided enterprise Fortune 500 migrations to Next.js App Router and Edge Middleware infrastructure.",
        technologies: [
          "Next.js",
          "React",
          "TypeScript",
          "TailwindCSS",
          "Edge Computing",
        ],
        achievements: [
          "Delivered 4 flagship e-commerce migrations resulting in +140% mobile conversion rates and 99/100 Core Web Vitals",
          "Published canonical architectural guides referenced by 100k+ developers worldwide",
        ],
        order: 2,
      },
      {
        company: "HyperScale Cloud Systems",
        role: "Senior Backend Engineer",
        location: "New York, NY",
        employmentType: "full-time",
        isRemote: true,
        startDate: new Date("2018-06-01").toISOString(),
        endDate: new Date("2021-02-28").toISOString(),
        isCurrent: false,
        summary:
          "Built high-throughput telemetry microservices and distributed caching clusters on Kubernetes.",
        technologies: [
          "Node.js",
          "TypeScript",
          "Docker",
          "Kubernetes",
          "MongoDB",
          "Redis",
        ],
        achievements: [
          "Spearheaded MongoDB sharding strategy cutting database query times by 65%",
          "Maintained 99.99% uptime across 12 consecutive quarters",
        ],
        order: 3,
      },
      {
        company: "Nexus Digital Agency",
        role: "Full-Stack Software Consultant",
        location: "Remote",
        employmentType: "contract",
        isRemote: true,
        startDate: new Date("2016-01-01").toISOString(),
        endDate: new Date("2018-05-30").toISOString(),
        isCurrent: false,
        summary:
          "Delivered bespoke full-stack applications and payment integrations for Series-A funded technology startups.",
        technologies: ["React", "Node.js", "Express", "PostgreSQL", "Stripe"],
        achievements: [
          "Shipped 12 end-to-end commercial web applications on schedule and within budget",
        ],
        order: 4,
      },
    ]);
    logger.info("✅ Career timeline seeded (4 positions).");

    // 6. Technical Blog Articles (5 Posts)
    await Post.create([
      {
        title:
          "Scaling Distributed Caching with Redis & Next.js Server Components",
        slug: "scaling-distributed-caching-redis-nextjs-server-components",
        excerpt:
          "How we eliminated redundant database queries and achieved sub-20ms TTFB on global Next.js deployments.",
        content: `## The Concurrency Problem\n\nWhen scaling distributed web applications to millions of monthly active users, database connections rapidly become the primary choke point.\n\n### Architectural Approach\n\nBy leveraging multi-layered caching with localized Redis replicas and Next.js \`unstable_cache\`, we established an invalidated tag cache pipeline:\n\n\`\`\`typescript\nexport const getCachedUserData = unstable_cache(\n  async (userId: string) => db.users.findById(userId),\n  ['user-cache'],\n  { revalidate: 3600, tags: ['users'] }\n);\n\`\`\`\n\n### Results\n\n- **p99 Latency:** 340ms -> 18ms\n- **Database Load Reduction:** -78%`,
        tags: ["Architecture", "Next.js", "Redis", "Performance"],
        isPublished: true,
        viewsCount: 3420,
        likesCount: 284,
        readingTimeMinutes: 7,
        publishedAt: new Date("2026-02-10").toISOString(),
      },
      {
        title:
          "Building Deterministic CRDTs for Real-Time Collaborative Canvas Apps",
        slug: "building-deterministic-crdts-realtime-collaborative-canvas",
        excerpt:
          "Lessons learned handling 100+ concurrent multi-user editing streams without centralized locks.",
        content: `## Conflict Resolution at Scale\n\nCollaborative editing systems require mathematical guarantees that every client eventually converges on identical state regardless of network reordering or offline latency.\n\n### Implementation Insights\n\nWe utilized Yjs with binary state vector diffs transmitted over WebSockets, keeping payload sizes under 250 bytes per stroke.`,
        tags: ["Distributed Systems", "WebSockets", "TypeScript", "CRDT"],
        isPublished: true,
        viewsCount: 2150,
        likesCount: 198,
        readingTimeMinutes: 9,
        publishedAt: new Date("2026-03-01").toISOString(),
      },
      {
        title: "Zero-Downtime Database Migrations in MongoDB & PostgreSQL",
        slug: "zero-downtime-database-migrations-mongodb-postgresql",
        excerpt:
          "The expand-and-contract pattern for schema evolution across live production environments.",
        content: `## Safe Schema Evolution\n\nNever rename fields or drop columns in a single deployment. By executing phased migration cycles (Expand -> Dual-Write -> Backfill -> Contract), you guarantee zero downtime.`,
        tags: ["Database", "DevOps", "PostgreSQL", "MongoDB"],
        isPublished: true,
        viewsCount: 1870,
        likesCount: 142,
        readingTimeMinutes: 6,
        publishedAt: new Date("2026-03-14").toISOString(),
      },
      {
        title: "Full-Stack Security Checklist for Enterprise Microservices",
        slug: "full-stack-security-checklist-enterprise-microservices",
        excerpt:
          "Defensive coding practices, JWT silent refresh rotation, and strict CSP headers for production apps.",
        content: `## Hardening the Surface\n\nSecurity is not an afterthought. In this guide we detail CSRF prevention, httpOnly cookies, rate limiting, and automated dependency vulnerability scanners in CI pipelines.`,
        tags: ["Security", "Authentication", "TypeScript", "Node.js"],
        isPublished: true,
        viewsCount: 4120,
        likesCount: 320,
        readingTimeMinutes: 8,
        publishedAt: new Date("2026-04-02").toISOString(),
      },
      {
        title:
          "State Management in React 19: Signals, Zustand & Server Actions",
        slug: "state-management-react-19-signals-zustand-server-actions",
        excerpt:
          "Deciding when to use client-side reactive state vs server component cache primitives.",
        content: `## Modern State Architecture\n\nReact 19 brings unified paradigms. Here is how we categorize state into ephemeral UI state (Zustand), server state (React Query), and URL search param state.`,
        tags: ["React", "Frontend", "Zustand", "State Management"],
        isPublished: true,
        viewsCount: 2980,
        likesCount: 245,
        readingTimeMinutes: 5,
        publishedAt: new Date("2026-05-12").toISOString(),
      },
    ]);
    logger.info("✅ Blog articles seeded (5 posts).");

    // 7. Client Testimonials & Social Proof (4 Items)
    await Testimonial.create([
      {
        clientName: "Sarah Jenkins",
        clientRole: "VP of Engineering",
        company: "Fintech Dynamics",
        avatarUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        quote:
          "Alex transformed our core ledger architecture in 3 months. His deep command of distributed caching and Go/Node concurrency dropped our latency by 80% while handling our biggest Black Friday volume ever.",
        rating: 5,
        isFeatured: true,
        isApproved: true,
        order: 1,
      },
      {
        clientName: "David Vance",
        clientRole: "CTO & Co-Founder",
        company: "OmniLabs AI",
        avatarUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        quote:
          "Hiring Alex as our Staff Full-Stack Architect was the best decision we made before our Series A. He wrote immaculate code, established our CI/CD pipelines, and mentored our junior engineers with unmatched clarity.",
        rating: 5,
        isFeatured: true,
        isApproved: true,
        order: 2,
      },
      {
        clientName: "Elena Rostova",
        clientRole: "Head of Product",
        company: "Stratos Cloud",
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        quote:
          "Alex brings a rare combination of rock-solid backend engineering and exquisite design sensibility. The design system and dashboards he created set a new standard for our entire organization.",
        rating: 5,
        isFeatured: true,
        isApproved: true,
        order: 3,
      },
      {
        clientName: "Marcus Sterling",
        clientRole: "Director of Engineering",
        company: "Veloce Payments",
        avatarUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        quote:
          "Incredible technical leadership. He stepped into a messy legacy codebase and systematically untangled our payment pipeline without a single minute of downtime.",
        rating: 5,
        isFeatured: false,
        isApproved: true,
        order: 4,
      },
    ]);
    logger.info("✅ Testimonials seeded (4 items).");

    // 8. Inbound CRM Inquiries & Leads (9 Items)
    await Message.create([
      {
        senderName: "Marcus Vance",
        senderEmail: "marcus@fintechhorizon.io",
        company: "Horizon FinTech Partners",
        subject: "Lead Architect Role - $220k+ Base + Equity",
        budgetRange: "Full-Time ($150k - $250k+ / yr)",
        message:
          "Hi Alex, We are scaling our real-time settlement engine and would love to discuss a Principal Architect role heading our 12-person platform squad. Your work on distributed event streaming aligns perfectly with our roadmap.",
        status: "unread",
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        senderName: "Claire Beauchamp",
        senderEmail: "claire@saasdynamics.com",
        company: "SaaS Dynamics Group",
        subject: "Architectural Audit & Performance Optimization Contract",
        budgetRange: "$10,000 - $25,000",
        message:
          "We are experiencing p99 latency spikes during US market open on our Next.js + MongoDB stack. We need an expert to conduct a 2-week architectural audit and deliver an optimization plan.",
        status: "unread",
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
      {
        senderName: "Julian Hayes",
        senderEmail: "j.hayes@venturecapital.co",
        company: "Venture Scale Capital",
        subject: "Contract Advisory for Portfolio Companies",
        budgetRange: "$25,000 - $50,000+",
        message:
          "We manage 15 high-growth Series A startups that frequently need senior architectural oversight. Looking to engage you on an ongoing advisory retainer.",
        status: "read",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
      {
        senderName: "Jonathan Miller",
        senderEmail: "jmiller@apexlogistics.com",
        company: "Apex Logistics Global",
        subject: "Real-Time Fleet Tracking Dashboard Build",
        budgetRange: "$25,000 - $50,000+",
        message:
          "Looking to build a bespoke real-time WebSocket dashboard for monitoring 2,000+ commercial vehicles globally. Timeline is Q4.",
        status: "replied",
        replyNotes:
          "Scheduled discovery call for Thursday at 2 PM EST. Shared architecture spec sheet.",
        isReplied: true,
        repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      },
      {
        senderName: "Samantha Reed",
        senderEmail: "samantha@cloudscale.io",
        company: "Cloudscale Systems",
        subject: "Kubernetes Migration Sprint",
        budgetRange: "$10,000 - $25,000",
        message:
          "Migrating our monolithic Node.js backend to Docker & Kubernetes on AWS EKS. Looking for a lead consultant to architect the Helm charts and CI/CD pipelines.",
        status: "replied",
        isReplied: true,
        repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
      {
        senderName: "Ethan Cross",
        senderEmail: "ethan@innovatetech.org",
        company: "InnovateTech",
        subject: "Design System & Microfrontends Project",
        budgetRange: "$5,000 - $10,000",
        message:
          "Need an experienced React architect to audit our component library and set up tokenized Tailwind styles across 3 repos.",
        status: "archived",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      },
      {
        senderName: "Rachel Adams",
        senderEmail: "rachel.adams@techrecruiting.io",
        company: "Executive Talent Search",
        subject: "Staff Engineer Opportunity @ Stripe Partner",
        budgetRange: "Full-Time ($150k - $250k+ / yr)",
        message:
          "Hey Alex, I'm working with a high-growth fintech seeking a Staff Engineer to lead their core payments team. Compensation is $200k–$240k + significant equity.",
        status: "unread",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
      {
        senderName: "Liam O'Connor",
        senderEmail: "liam@dublindev.ie",
        company: "Dublin Software Works",
        subject: "Next.js 15 App Router Consulting",
        budgetRange: "$5,000 - $10,000",
        message:
          "We are migrating an enterprise Angular client to Next.js 15 with Server Components. Need 20 hours of consulting.",
        status: "read",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      },
      {
        senderName: "Nathalie Dupont",
        senderEmail: "n.dupont@parisventures.fr",
        company: "Paris Tech Labs",
        subject: "AI Document Search Engine POC",
        budgetRange: "$10,000 - $25,000",
        message:
          "Want to build a RAG pipeline with Qdrant vector database and Next.js UI for enterprise legal search.",
        status: "read",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      },
    ]);
    logger.info("✅ Inquiries & CRM leads seeded (9 items).");

    logger.info(
      "🎉 Complete comprehensive database seeding finished successfully!",
    );
  } catch (error) {
    logger.error("Seeding error:", error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seed();
