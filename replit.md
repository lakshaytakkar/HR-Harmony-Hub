# TeamSync - Multi-Vertical Team Portal

## Overview
TeamSync is a multi-vertical team portal with exceptional UI/UX inspired by the Dropship.io design system. It supports 7 branded products — LegalNations (HR), USDrop AI (Sales), GoyoTours (Events), Event Hub (Networking), LBM Lifestyle (Admin), Developer (Internal), EazyToSell (Retail Franchise) — with a config-driven navigation system. Each vertical has its own dashboard, pages, brand logo, and workflows. Built with React, TypeScript, Tailwind CSS, and Shadcn UI.

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
3. **GoyoTours** (id: `events`, color: #E91E63) — China Tour & Travel Business — Routes: `/events/*`
4. **Event Hub** (id: `eventhub`, color: #7C3AED) — Networking Events & Engagement Platform — Routes: `/hub/*`
   - Dashboard (4 KPI cards: upcoming events, total attendees, active vendors, budget utilized; upcoming events grid, this week countdown, vendor status sidebar, organizers section, recently completed with check-in bars)
   - Events: All Events (DataTable with 10 events, status/type/city filters, Create Event dialog), Event Detail (5 tabs: Overview, Attendees, Vendors, Budget, Tasks checklist)
   - Attendees: All Attendees (DataTable 35 records across events, multi-filter), Live Check-in (event selector, stats, search, quick check-in input, per-attendee toggle, Check In All button)
   - Venues (card grid of 6 venues with status dot, capacity, rating, amenities, hover contact reveal, city/type/status filters)
   - Vendors (DataTable 8 vendors with star ratings, event counts, category badges, Copy Email action)
   - Operations: Budget Tracker (30 budget items, category progress bars, planned vs actual, over-budget highlighting), Analytics (type distribution bars, attendee source mix, event performance table, top vendors, budget by category)
5. **LBM Lifestyle** (id: `admin`, color: #673AB7) — Team, Settings, Reports — Routes: `/admin/*`
6. **Developer** (id: `dev`, color: #10B981) — Internal Developer Hub — Routes: `/dev/*`
   - Dashboard (quick links to all sections, My Tasks list, Project Progress bars, recent prompts, credential status)
   - Design System (Style Guide, Components, Icons)
   - Prompts (AI prompt library — categorized by agent/frontend/backend/database/debug, model tracking)
   - Resources (Dev processes, learnings, playbooks, workflow docs)
   - **Projects** (project cards with progress, kanban board per project with 5 columns, list view toggle, sprint/assignee/priority filters, add task dialog)
     - **Project Board** has a collapsible "Links & Credentials" section per project (above filters/kanban): horizontal chip row with SI logos for GitHub/Replit/Supabase/Vercel/Figma/Notion links + inline-editable credentials mini-table (click URL or Notes to edit inline; API key hint stays read-only)
   - **Tasks** (all tasks DataTable across all projects, filters by project/status/priority/type/assignee, click opens TaskDetailDialog sheet with subtasks/comments/sidebar)
   - **Toolkit** — 3 tabs:
     - *Apps & Credentials*: scope filter (All / Universal / Per-Project); Universal shows global credentials DataTable; Per-Project shows credentials grouped by project with color dot + key badge header; inline editing on Notes cells; real SI logos throughout
     - *Important Links*: Pinned section + all links grid — cards are NOT wrapped in `<a>` to enable inline editing; click description to edit inline, click URL (shown in mono under the card) to edit inline; explicit ExternalLink icon opens URL; category badge visible
     - *Quick Tools*: staging area for dev utilities before deploying to target verticals
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
- `client/src/components/brand/eventhub-logo.tsx` — Network nodes/connection graph icon (violet)

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
│   ├── projects.tsx           # All Projects (route: /dev/projects)
│   ├── project-board.tsx      # Project Kanban/List Board (route: /dev/projects/:id)
│   ├── tasks.tsx              # All Tasks DataTable (route: /dev/tasks)
│   └── toolkit.tsx            # Apps, Credentials, Links & Quick Tools (route: /dev/toolkit)
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
│   ├── dashboard.tsx      # GoyoTours Dashboard (route: /events)
│   ├── events-list.tsx    # All Events (route: /events/list)
│   ├── venues.tsx         # Venue Directory (route: /events/venues)
│   └── checkin.tsx        # Event Check-in (route: /events/checkin)
├── eventhub/
│   ├── dashboard.tsx      # Event Hub Dashboard (route: /hub)
│   ├── events-list.tsx    # All Events DataTable (route: /hub/events)
│   ├── event-detail.tsx   # Event Detail 5-tab view (route: /hub/events/:id)
│   ├── attendees.tsx      # All Attendees DataTable (route: /hub/attendees)
│   ├── checkin.tsx        # Live Check-in (route: /hub/checkin)
│   ├── venues.tsx         # Venue Card Grid (route: /hub/venues)
│   ├── vendors.tsx        # Vendor Directory (route: /hub/vendors)
│   ├── budget.tsx         # Budget Tracker (route: /hub/budget)
│   └── analytics.tsx      # Analytics Overview (route: /hub/analytics)
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
- `client/src/lib/mock-data-dev.ts` — Developer vertical entities:
  - `DevProject` (6 projects: TeamSync, LegalNations, USDrop AI, GoyoTours, EazyToSell, Internal Tools)
  - `DevTask` + `DevSprint` — Kanban tasks with subtasks/comments/attachments, sprint grouping
  - `AppCredential` (10 universal credentials, tagged with `scope: "universal"`) — global API keys with real SI icon names
  - `ProjectLink` (19 entries, 2-4 per project) — per-project GitHub/Replit/Supabase/Vercel/Figma/Notion links
  - `ProjectCredential` (12 entries, 1-3 per project) — project-specific API keys (Supabase anon, Stripe live, Razorpay, etc.)
  - `ImportantLink` (15 entries) — global developer bookmarks (pinned + all)
  - `QuickTool` (7 tools) — utility tools with ready/wip/planned status
  - `DevPrompt` (12 prompts) — AI prompt library with model tracking
  - `DevResource` (8 resources) — dev process docs and playbooks
- `client/src/components/dev/task-detail-dialog.tsx` — Task detail Sheet panel with subtask toggles, comments, right sidebar for status/priority/type editing
- `client/src/lib/mock-data-events.ts` — GoyoTours (events, venues, attendees)
- `client/src/lib/mock-data-eventhub.ts` — Event Hub entities: NetworkingEvent (10 events across Delhi/Mumbai/Bengaluru/Pune/Chennai, varied types: Seminar/Workshop/Conference/Investor Meet/Launch Event/Roundtable), EventAttendee (35 attendees across events with ticket types VIP/Standard/Speaker/Sponsor), EventVendor (8 vendors across 7 categories with ratings), EventVenue (6 premium venues), BudgetItem (30 items with on-track/over-budget/under-budget/pending status)
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
- Plus Jakarta Sans (Google Fonts), DiceBear (avatars), lucide-react (icons), react-icons/si (company logos), Zod (validation)
