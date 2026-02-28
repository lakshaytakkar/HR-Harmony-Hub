# TeamSync - Multi-Vertical Team Portal

## Overview
TeamSync is a multi-vertical team portal with exceptional UI/UX inspired by the Dropship.io design system. It supports 6 branded products — LegalNations (HR), USDrop AI (Sales), GoyoTours (Events), LBM Lifestyle (Admin), Developer (Internal), EazyToSell (Retail Franchise) — with a config-driven navigation system. Each vertical has its own dashboard, pages, brand logo, and workflows. Built with React, TypeScript, Tailwind CSS, and Shadcn UI.

## User Preferences
- Single font: Plus Jakarta Sans only (Inter fully removed)
- No custom hover color classes on Shadcn Button components
- Use Shadcn Avatar instead of raw img for profile images
- All interactive elements need data-testid attributes
- Frontend-first with mock data (no database yet)

## System Architecture

### Multi-Vertical Architecture
The portal supports multiple business verticals, each with its own navigation, brand logo, and pages:
- **Verticals Config** (`client/src/lib/verticals-config.ts`): Defines all verticals with their navigation categories and brand logos
- **Vertical Store** (`client/src/lib/vertical-store.ts`): React context for current vertical state, persisted to localStorage
- **Vertical Switcher** (`client/src/components/layout/vertical-switcher.tsx`): Dropdown in topbar to switch between verticals, shows brand logos

### Active Verticals (Branded Products)
1. **LegalNations** (id: `hr`, color: #225AEA) — US Company Formation & Compliance Operations — Routes: `/hr/*`
   - Dashboard (operations overview: active formations, stuck/delayed, avg time, team load)
   - Clients (All Clients, Client Detail with stage progression, Client Intake, Stage Overview)
   - Operations (Formation Pipeline kanban, Task Board, Escalations)
   - Documents (Document Vault, Templates)
   - Compliance (Compliance Tracker, Annual Reports)
   - Analytics (Formation Analytics, Team Performance)
   - 7-stage workflow: Lead Converted → Intake → Formation Filed → EIN → BOI Filing → Bank/Stripe → Completion
2. **USDrop AI** (id: `sales`, color: #F34147) — D2C Dropshipping SaaS Backoffice — Routes: `/sales/*`
   - Dashboard, Products & Catalog (Products, Categories, Suppliers, Winning Products)
   - Users & Subscriptions (Users, Leads, Plans, Subscriptions)
   - Operations (Shopify Stores, Fulfillment, Competitor Stores)
   - Support & Learning (Support Tickets, Courses, Help Center)
   - Analytics (Revenue Analytics, User Analytics, Product Performance)
3. **GoyoTours** (id: `events`, color: #E91E63) — Events, Venues, Check-in — Routes: `/events/*`
4. **LBM Lifestyle** (id: `admin`, color: #673AB7) — Team, Settings, Reports — Routes: `/admin/*`
5. **Developer** (id: `dev`, color: #10B981) — Internal Developer Hub — Routes: `/dev/*`
   - Dashboard (quick links, recent prompts, credential status, pinned links)
   - Design System (Style Guide, Components, Icons)
   - Prompts (AI prompt library — categorized by agent/frontend/backend/database/debug, model tracking)
   - Resources (Dev processes, learnings, playbooks, workflow docs)
   - Toolkit (Apps & Credentials tracker, Important Links — Replit, Supabase, GitHub, etc.)
6. **EazyToSell** (id: `ets`, color: #F97316) — China-to-India Value Retail Franchise Ops — Routes: `/ets/*`
   - Dashboard (pipeline snapshot, revenue tracker, active orders with ETA bars, alerts for stuck items)
   - Clients: Pipeline (kanban + table toggle, 8 stages: New Lead → Qualified → Token Paid → Store Design → Inventory Ordered → In Transit → Launched → Reordering), Client Detail (profile, financial summary, stage stepper, tabs: payments/checklist/timeline/notes)
   - Catalog: Products (DataTable with price chain, hero SKU toggle, visibility, expandable pricing breakdown), Price Calculator (standalone what-if tool: EXW → FOB → CIF → Duty → IGST → Landed → Markup → MRP band, with templates)
   - Orders: Order Tracker (6-stage: Ordered → Factory Ready → Shipped → Customs → Warehouse → Dispatched, with ETA bars), Payments (collected/pending/overdue tracking)
   - Tools: Proposal Generator (investment breakdown by package tier, category mix sliders, WhatsApp copy export), Templates (WhatsApp message templates with variable placeholders)
   - Settings (pricing defaults: exchange rate, commission, freight, duties, margins; category duty rates; package tier configs)
   - Price engine ported from GitHub repo `lakshaytakkar/Eazy-Sell`: calculateEtsPrices() with MRP bands [29-999]

### Brand Logo Components
Each vertical has a unique SVG logo in hexagonal mascot style:
- `client/src/components/brand/legalnations-logo.tsx` — Scales/balance icon
- `client/src/components/brand/usdrop-ai-logo.tsx` — Box+arrow/dropship icon
- `client/src/components/brand/goyotours-logo.tsx` — Compass icon
- `client/src/components/brand/lbm-lifestyle-logo.tsx` — Heart-star/lifestyle icon
- `client/src/components/brand/developer-logo.tsx` — Terminal/code icon
- `client/src/components/brand/eazytosell-logo.tsx` — Shopping bag/lock/retail icon

### Frontend Technology
React with TypeScript, Tailwind CSS, Shadcn UI, Wouter routing, motion/react animations.

### Routing
- All verticals use consistent `/vertical/*` URL namespacing
- Root `/` redirects to `/hr` (default vertical)
- Deep links auto-detect the correct vertical via `detectVerticalFromUrl`

### Navigation
- **Two-Level Horizontal Top Navigation**: Dynamic based on active vertical
- **Vertical Switcher**: Shows brand logo, allows switching between products (navigates to target vertical's dashboard)
- **Level 1**: Category tabs (change per vertical)
- **Level 2**: Sub-page navigation within active category — styled with primary blue background for visual separation

### Page Organization
```
client/src/pages/
├── dashboard.tsx              # LegalNations Dashboard (route: /hr)
├── clients.tsx                # All Clients (route: /hr/clients)
├── client-detail.tsx          # Client Detail (route: /hr/clients/:id)
├── client-intake.tsx          # Client Intake Queue (route: /hr/intake)
├── stage-overview.tsx         # Stage Overview (route: /hr/stages)
├── formation-pipeline.tsx     # Formation Pipeline Kanban (route: /hr/pipeline)
├── task-board.tsx             # Task Board (route: /hr/tasks)
├── escalations.tsx            # Escalation Flags (route: /hr/escalations)
├── document-vault.tsx         # Document Vault (route: /hr/documents)
├── templates.tsx              # Document Templates (route: /hr/templates)
├── compliance-tracker.tsx     # Compliance Tracker (route: /hr/compliance)
├── annual-reports.tsx         # Annual Reports (route: /hr/annual-reports)
├── formation-analytics.tsx    # Formation Analytics (route: /hr/analytics)
├── team-performance.tsx       # Team Performance (route: /hr/team-performance)
├── dev/
│   ├── dashboard.tsx          # Developer Dashboard (route: /dev)
│   ├── style-guide.tsx        # Style Guide (route: /dev/style-guide)
│   ├── components-guide.tsx   # Components Guide (route: /dev/components)
│   ├── icons-guide.tsx        # Icons Guide (route: /dev/icons)
│   ├── prompts.tsx            # AI Prompt Library (route: /dev/prompts)
│   ├── resources.tsx          # Dev Resources & Processes (route: /dev/resources)
│   └── toolkit.tsx            # Apps, Credentials & Links (route: /dev/toolkit)
├── sales/
│   ├── dashboard.tsx           # USDrop AI Dashboard (route: /sales)
│   ├── products.tsx            # Product Library (route: /sales/products)
│   ├── categories.tsx          # Product Categories (route: /sales/categories)
│   ├── suppliers.tsx           # Supplier Directory (route: /sales/suppliers)
│   ├── winning-products.tsx    # Top Products (route: /sales/winning-products)
│   ├── users.tsx               # External Users (route: /sales/users)
│   ├── leads.tsx               # Lead Management (route: /sales/leads)
│   ├── plans.tsx               # Plan Tiers (route: /sales/plans)
│   ├── subscriptions.tsx       # Subscriptions (route: /sales/subscriptions)
│   ├── stores.tsx              # Shopify Stores (route: /sales/stores)
│   ├── fulfillment.tsx         # Fulfillment Orders (route: /sales/fulfillment)
│   ├── competitors.tsx         # Competitor Stores (route: /sales/competitors)
│   ├── tickets.tsx             # Support Tickets (route: /sales/tickets)
│   ├── courses.tsx             # Learning Hub Courses (route: /sales/courses)
│   ├── help-center.tsx         # Help Center FAQ (route: /sales/help-center)
│   ├── revenue.tsx             # Revenue Analytics (route: /sales/revenue)
│   ├── user-analytics.tsx      # User Analytics (route: /sales/user-analytics)
│   └── product-performance.tsx # Product Performance (route: /sales/product-performance)
├── events/
│   ├── dashboard.tsx      # Events Hub (route: /events)
│   ├── events-list.tsx    # All Events (route: /events/list)
│   ├── venues.tsx         # Venue Directory (route: /events/venues)
│   └── checkin.tsx        # Event Check-in (route: /events/checkin)
├── admin/
│   ├── dashboard.tsx      # System Overview (route: /admin)
│   ├── team.tsx           # Team Management (route: /admin/team)
│   ├── settings.tsx       # System Settings (route: /admin/settings)
│   └── reports.tsx        # Reports & Analytics (route: /admin/reports)
├── ets/
│   ├── dashboard.tsx      # Command Center Dashboard (route: /ets)
│   ├── pipeline.tsx       # Client Pipeline Kanban+Table (route: /ets/pipeline)
│   ├── client-detail.tsx  # Client Detail (route: /ets/clients/:id)
│   ├── products.tsx       # Product Catalog with pricing (route: /ets/products)
│   ├── calculator.tsx     # Price Calculator (route: /ets/calculator)
│   ├── orders.tsx         # Order Tracker (route: /ets/orders)
│   ├── payments.tsx       # Payment Tracking (route: /ets/payments)
│   ├── proposals.tsx      # Proposal Generator (route: /ets/proposals)
│   ├── templates.tsx      # WhatsApp Templates (route: /ets/templates)
│   └── settings.tsx       # Pricing & Config Settings (route: /ets/settings)
└── not-found.tsx          # 404
```

### LegalNations-Specific Components
- **Stage Stepper** (`client/src/components/hr/stage-stepper.tsx`): Reusable 7-step progress indicator with full and mini (dot) variants
- **Data Types** (`shared/schema.ts`): FormationClient, StageChecklist, ClientDocument, ComplianceItem, FormationTask, Escalation, TeamMember, FormationMetric, StageDefinition, DocumentTemplate

### Mock Data Files
- `client/src/lib/mock-data.ts` — LegalNations entities (20 formation clients, 45+ checklist items, 25 documents, 15 compliance items, 25 tasks, 10 escalations, 6 team members, formation metrics, document templates)
- `client/src/lib/mock-data-sales.ts` — USDrop AI entities (products, categories, suppliers, users, leads, subscriptions, stores, fulfillment, tickets, courses, plans, revenue metrics, help center articles)
- `client/src/lib/mock-data-dev.ts` — Developer entities (12 AI prompts, 8 dev resources, 10 app credentials, 15 important links)
- `client/src/lib/mock-data-events.ts` — Events (events, venues, attendees)
- `client/src/lib/mock-data-admin.ts` — Admin (team members, activity logs, reports)
- `client/src/lib/mock-data-ets.ts` — EazyToSell entities (15 franchise clients across 8 pipeline stages, 20 products with pricing, 8 orders, 12 payments, 3 proposal templates Lite/Pro/Elite, 8 WhatsApp templates, price settings, calculator templates) + `calculateEtsPrices()` price engine

### Core UI Components
- **DataTable**: Generic reusable table with search, filters, sorting, pagination, row actions
- **StatsCard**: Stats display with AnimatedNumber, sparklines, hover lift
- **StatusBadge**: Semantic color variants (success, error, warning, info, neutral)
- **AnimatedNumber**: Spring-animated counter using motion/react
- **RadialProgress**: SVG circular progress rings with animated fill
- **FormDialog**: Standardized dialog for create/edit forms
- **EmptyState**: Illustration + message + optional action
- **Loading**: TableSkeleton, StatsCardSkeleton, Skeleton components

### Backend
Express.js (Node.js) serving the Vite frontend on port 5000.

### Image Assets
All 3D icons and illustrations use WebP format (compressed from 1024×1024 PNGs):
- Icons: 128×128 WebP (~3KB each) in `client/public/3d-icons/`
- Illustrations: 256×256 WebP (~5KB each) in `client/src/assets/illustrations/`

## Component Registry References (shadcn-compatible)
- **KokonutUI** (https://kokonutui.com): Install: `npx shadcn@latest add @kokonutui/<name>`
- **Cult-UI** (https://www.cult-ui.com): Install: `npx shadcn@beta add @cult-ui/<name>`
- **Aceternity UI** (https://ui.aceternity.com): Copy-paste from docs
- **Tool-UI** (https://www.tool-ui.com): Install: `npx assistant-ui add tool-ui <name>`
- **AI SDK Elements** (https://elements.ai-sdk.dev): Install: `npx ai-elements@latest add <name>`

## Reference Project
Analysis of Suprans Team Portal saved in `.local/reference-project-analysis.md` — covers their 6 business verticals, team hierarchy, sidebar switcher pattern, and database schema.

## External Dependencies
- React, TypeScript, Tailwind CSS, Shadcn UI, Wouter, motion/react, Express.js
- Plus Jakarta Sans (Google Fonts), DiceBear (avatars), lucide-react (icons), Zod (validation)
