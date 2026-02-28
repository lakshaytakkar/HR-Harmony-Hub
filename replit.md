# TeamSync - Multi-Vertical Team Portal

## Overview
TeamSync is a multi-vertical team portal with exceptional UI/UX inspired by the Dropship.io design system. It supports 7 branded business products — LegalNations (HR), USDrop AI (Sales), GoyoTours (Events), Event Hub (Networking), LBM Lifestyle (Admin), Developer (Internal), EazyToSell (Retail Franchise) — PLUS 2 cross-business departments: **HRMS** (People & Culture, `/hrms`) and **ATS** (Recruitment, `/ats`). The vertical switcher shows two labeled groups: "Business Products" and "Departments". Each vertical/department has its own dashboard, pages, brand logo, and workflows. Built with React, TypeScript, Tailwind CSS, and Shadcn UI.

## Department Pages

### HRMS (`/hrms/*`) — sky-blue #0EA5E9
- **Dashboard** `/hrms` — welcome banner, stats (employees/active/leave/positions), dept headcount bars, recent joiners, birthday reminders, pending leave approvals
- **Employees** `/hrms/employees` — searchable DataTable with dept/status/type filters, Add Employee dialog
- **Employee Detail** `/hrms/employees/:id` — profile header, WhatsApp+Email actions, 5-tab layout (Overview/Attendance/Leaves/Payroll/Performance)
- **Onboarding** `/hrms/onboarding` — new joiners with 6-step checklist progress bars
- **Org Chart** `/hrms/org` — recursive CSS flexbox tree with expand/collapse, dept color stripes
- **Departments** `/hrms/departments` — card grid with member expansion
- **Attendance** `/hrms/attendance` — table + calendar grid toggle, present/absent/wfh/half-day stats
- **Leaves** `/hrms/leaves` — approve/reject actions, type/status filters, Request Leave dialog
- **Holidays** `/hrms/holidays` — national/optional/company holiday lists
- **Payroll** `/hrms/payroll` — salary DataTable, Run Payroll confirmation dialog
- **Payslips** `/hrms/payslips` — processed slips with breakdown dialog (earnings/deductions/net)
- **Performance** `/hrms/performance` — review DataTable with star ratings, Start Review Cycle dialog
- **Goals** `/hrms/goals` — OKR card grid with progress bars, status badges
- **Policies** `/hrms/policies` — category filter pills, view dialog with download

### ATS (`/ats/*`) — violet #8B5CF6
- **Dashboard** `/ats` — funnel visualization, stats, active jobs list, latest candidates
- **Jobs** `/ats/jobs` — DataTable with status/priority/type filters, Create Job Opening dialog
- **Job Detail** `/ats/jobs/:id` — two-column (description+stats left, applicants right), pause/share actions
- **Candidates** `/ats/candidates` — kanban board (6 stages) + table toggle, Add Candidate dialog
- **Candidate Detail** `/ats/candidates/:id` — 4-tab layout (Profile/Applications/Interviews/Evaluations), WhatsApp+Email, activity timeline
- **Talent Pool** `/ats/pool` — passive candidates with card grid, experience level filters
- **Applications** `/ats/applications` — full DataTable with job/stage/interviewer filters, WhatsApp+Email+Schedule actions
- **Interviews** `/ats/interviews` — stats (today/week/completed/cancelled), Schedule Interview dialog, meet links
- **Evaluations** `/ats/evaluations` — completed/pending tabs, scorecard detail dialog with criteria table
- **Offers** `/ats/offers` — offer management with preview dialog (formatted offer letter), send/accept/decline actions
- **Analytics** `/ats/analytics` — funnel, source mix bars, time-to-hire by dept, top jobs, interviewer load

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

### Universal Sections (Cross-Vertical)
4 universal pages exist under `client/src/pages/universal/` and are shared by all 7 verticals. Each page detects its vertical via `detectVerticalFromUrl(useLocation())` and filters mock data from `client/src/lib/mock-data-shared.ts` by `verticalId`.

**Nav order (standardized for all verticals):** Dashboard → Chat → Team → Resources → Tasks → [vertical-specific sections]

- **Chat** (`/[prefix]/chat`) — Two-panel layout: 380px sidebar (Channels/DMs tabs with unread badges) + full-width message area (message bubbles, phone/video icons, send input bar)
- **Team** (`/[prefix]/team`) — Card grid of vertical team members with avatar, status dot, role, contact info, hover action row (Message/Call). "Invite Member" FormDialog header CTA. Search + department + status filters.
- **Resources** (`/[prefix]/resources`) — File card grid with pinned strip, category filter pills, grid/list toggle. Type-colored file icons (pdf=red, excel=green, ppt=orange, doc=blue, link=violet). Detail dialog with metadata + Open Resource button. "Add Resource" FormDialog.
- **Tasks** (`/[prefix]/tasks`) — Kanban board (5 columns: Backlog/Todo/In Progress/Review/Done) with task cards (priority badge, tags, due date, assignee avatar), List view, My Tasks tab. Task create dialog + Task detail dialog (subtask checklist, status select, comments). Stats row (Total/In Progress/Overdue/Done).

**Shared mock data** (`client/src/lib/mock-data-shared.ts`): TypeScript interfaces + mock data for all 7 verticals:
- `VerticalMember[]` — 4 members per vertical, with status (online/away/offline), skills, location
- `ChatChannel[]` — channels + DMs per vertical, with unread counts, isPinned, lastMessage
- `ChatMessage[]` — messages per channel, with isMe boolean for sender styling
- `SharedResource[]` — 5-6 resources per vertical, categories: Brochure/Script/Spreadsheet/Link/Presentation/Document/Template
- `SharedTask[]` — 8-9 tasks per vertical, across all 5 statuses and 4 priorities, with subtask arrays

**Route renames** (3 existing routes moved to avoid conflicts with universal `/tasks` and `/resources`):
- `/hr/tasks` (LegalNations Task Board) → `/hr/task-board`
- `/dev/tasks` (Developer ClickUp-style board) → `/dev/board`
- `/dev/resources` (Developer Knowledge Base) → `/dev/knowledge-base`

### Active Verticals (Branded Products)
1. **FaireDesk** (id: `faire`, color: #1A6B45) — Faire B2B Wholesale Marketplace — Routes: `/faire/*`
   - Dashboard (gradient banner, store health strip, urgent actions widget, KPI cards, order state chips, recent orders + top products)
   - **Universal**: Chat, Team, Resources, Tasks
   - Stores (6 brand accounts: Suprans Lifestyle, LBM Home & Living, Gullee Craft Co., Heritage Artisan, Pure Essentials, Nature's Basket; API key dialog; sync buttons)
   - Products & Catalog (Products list with lifecycle/sale-state filters, Product Detail with variant inline editing + reviews, Inventory with low/out-of-stock highlighting, Pricing & Prepacks with margin % auto-calc)
   - Orders (state tabs: NEW/PRE_TRANSIT/IN_TRANSIT/DELIVERED/CLOSED/CANCELLED/BACK_ORDERED, accept/cancel dialogs, Order Detail with timeline stepper + payout breakdown)
   - Fulfillment Queue (card layout oldest-first, ship dialog with carrier + tracking)
   - Shipments (tracking copy/link, in-transit progress bar)
   - Retailers (table with WhatsApp + Email, Retailer Detail with order history)
   - Campaigns (3-per-row card grid, Create Campaign dialog)
   - Disputes (tabs: Open/Escalated/Resolved, respond + escalate actions)
   - Analytics (store tabs, KPI cards, revenue bars, top products, geo table, 6-month trend)
   - **Mock data**: `client/src/lib/mock-data-faire.ts` — all field names match Faire API v2 exactly; 6 stores, 10 products, 16 orders, 6 shipments, 13 retailers, 8 campaigns, 10 disputes
   - **Logo**: `client/src/components/brand/faire-logo.tsx`

2. **LegalNations** (id: `hr`, color: #225AEA) — US Company Formation & Compliance Operations — Routes: `/hr/*`
   - Dashboard (operations overview: active formations, stuck/delayed, avg time, team load)
   - **Universal**: Chat, Team, Resources, Tasks
   - Clients (All Clients, Client Detail with stage progression, Client Intake, Stage Overview)
   - Operations (Formation Pipeline kanban, Task Board at `/hr/task-board`, Escalations)
   - Documents (Document Vault, Templates)
   - Compliance (Compliance Tracker, Annual Reports)
   - Analytics (Formation Analytics, Team Performance)
   - 7-stage workflow: Lead Converted → Intake → Formation Filed → EIN → BOI Filing → Bank/Stripe → Completion
2. **USDrop AI** (id: `sales`, color: #F34147) — D2C Dropshipping SaaS Backoffice — Routes: `/sales/*`
   - Dashboard, **Universal**: Chat, Team, Resources, Tasks
   - Products & Catalog (Products, Categories, Suppliers, Winning Products)
   - Users & Subscriptions (Users, Leads, Plans, Subscriptions)
   - Operations (Shopify Stores, Fulfillment, Competitor Stores)
   - Support & Learning (Support Tickets, Courses, Help Center)
   - Analytics (Revenue Analytics, User Analytics, Product Performance)
3. **GoyoTours** (id: `events`, color: #E91E63) — China Tour & Travel Business — Routes: `/events/*`
   - **Universal**: Chat, Team, Resources, Tasks
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
├── task-board.tsx             # Task Board (route: /hr/task-board)
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
│   ├── resources.tsx          # Dev Knowledge Base (route: /dev/knowledge-base)
│   ├── projects.tsx           # All Projects (route: /dev/projects)
│   ├── project-board.tsx      # Project Kanban/List Board (route: /dev/projects/:id)
│   ├── tasks.tsx              # All Tasks DataTable (route: /dev/board)
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
├── universal/
│   ├── chat.tsx           # Universal Chat (route: /[prefix]/chat for all 7 verticals)
│   ├── team.tsx           # Universal Team Members (route: /[prefix]/team)
│   ├── resources.tsx      # Universal Resources Library (route: /[prefix]/resources)
│   └── tasks.tsx          # Universal Tasks Kanban (route: /[prefix]/tasks)
└── not-found.tsx          # 404
```

### LegalNations-Specific Components
- **Stage Stepper** (`client/src/components/hr/stage-stepper.tsx`): Reusable 7-step progress indicator with full and mini (dot) variants
- **Data Types** (`shared/schema.ts`): FormationClient, StageChecklist, ClientDocument, ComplianceItem, FormationTask, Escalation, TeamMember, FormationMetric, StageDefinition, DocumentTemplate

### Mock Data Files
- `client/src/lib/mock-data-shared.ts` — **Universal sections data** (all 7 verticals): `VerticalMember[]`, `ChatChannel[]`, `ChatMessage[]`, `SharedResource[]`, `SharedTask[]` with full mock data per vertical
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

## UI Rules (Enforced)

These rules apply to every page and must never be violated when adding or editing pages:

### 1. Page Padding Standard
All page root wrappers must use `<div className="px-16 py-6 lg:px-24">`. Never use `p-6`, `px-6`, `px-6 lg:px-12`, or any narrower wrapper as the outermost container of a page.

### 2. Full-Height App Layouts (Tasks, Chat)
For pages with a fixed-height layout (scroll area fills remaining height), do NOT wrap the whole page in `px-16`. Instead:
- Sticky bars (header bar, filter bar, stats strip): apply `px-16 lg:px-24` horizontally on each bar individually
- Scrollable content area (`<ScrollArea>`): apply `px-16 py-6 lg:px-24`
- Stats strip first/last cells: first cell uses `pl-16 lg:pl-24 pr-5`, last cell uses `pl-5 pr-16 lg:pr-24`

### 3. Stats / Metrics Rule
Only show stats cards on dashboards and list pages where the data is a meaningful operational KPI (e.g. active clients, revenue, pipeline count). Do NOT add stats to library or directory pages such as Resources.

### 4. Search Bar Rule
Only include a search bar when there are 6 or more items in a list to filter. Do not add search to small static lists.

### 5. Detail Pages Rule
Every entity with a list page must also have a dedicated detail page or detail dialog. This applies to: clients, leads, products, events, attendees, vendors, etc.

### 6. Contact Actions Rule
Every page that lists or shows details for a person (client, lead, user, attendee, vendor) must include actionable contact buttons:
- **List pages**: WhatsApp and/or Email as inline icon-only ghost buttons in a "Contact" column (not in the dropdown menu)
- **Detail pages**: WhatsApp and Email as outline buttons in the header/profile action bar
- **WhatsApp** link: `https://wa.me/{phone.replace(/\D/g,'')}` — open in `target="_blank"` — icon: `SiWhatsapp` from `react-icons/si`, colored `text-green-600`
- **Email** link: `mailto:{email}` — icon: `Mail` from `lucide-react`
- Add `data-testid="btn-whatsapp-{id}"` and `data-testid="btn-email-{id}"` to every link
- Only add WhatsApp if the entity has a `phone` field in its type; only add Email if it has an `email` field
