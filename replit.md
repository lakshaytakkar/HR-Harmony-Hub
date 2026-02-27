# TeamSync - Multi-Vertical Team Portal

## Overview
TeamSync is a multi-vertical team portal with exceptional UI/UX inspired by the Dropship.io design system. It supports 4 branded products — LegalNations (HR), USDrop AI (Sales), GoyoTours (Events), LBM Lifestyle (Admin) — with a config-driven navigation system. Each vertical has its own dashboard, pages, brand logo, and workflows. Built with React, TypeScript, Tailwind CSS, and Shadcn UI.

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
1. **LegalNations** (id: `hr`, color: #225AEA) — People, Recruitment, Operations, Finance, Projects — Routes: `/hr/*`
2. **USDrop AI** (id: `sales`, color: #F34147) — D2C Dropshipping SaaS Backoffice — Routes: `/sales/*`
   - Dashboard, Products & Catalog (Products, Categories, Suppliers, Winning Products)
   - Users & Subscriptions (Users, Leads, Plans, Subscriptions)
   - Operations (Shopify Stores, Fulfillment, Competitor Stores)
   - Support & Learning (Support Tickets, Courses, Help Center)
   - Analytics (Revenue Analytics, User Analytics, Product Performance)
3. **GoyoTours** (id: `events`, color: #E91E63) — Events, Venues, Check-in — Routes: `/events/*`
4. **LBM Lifestyle** (id: `admin`, color: #673AB7) — Team, Settings, Reports — Routes: `/admin/*`

### Brand Logo Components
Each vertical has a unique SVG logo in hexagonal mascot style:
- `client/src/components/brand/legalnations-logo.tsx` — Scales/balance icon
- `client/src/components/brand/usdrop-ai-logo.tsx` — Box+arrow/dropship icon
- `client/src/components/brand/goyotours-logo.tsx` — Compass icon
- `client/src/components/brand/lbm-lifestyle-logo.tsx` — Heart-star/lifestyle icon

### Frontend Technology
React with TypeScript, Tailwind CSS, Shadcn UI, Wouter routing, motion/react animations.

### Routing
- All verticals use consistent `/vertical/*` URL namespacing
- Root `/` redirects to `/hr` (default vertical)
- Deep links auto-detect the correct vertical via `detectVerticalFromUrl`
- Dev routes remain at `/dev/*` (style-guide, components, icons)

### Navigation
- **Two-Level Horizontal Top Navigation**: Dynamic based on active vertical
- **Vertical Switcher**: Shows brand logo, allows switching between products (navigates to target vertical's dashboard)
- **Level 1**: Category tabs (change per vertical)
- **Level 2**: Sub-page navigation within active category — styled with primary blue background for visual separation

### Page Organization
```
client/src/pages/
├── dashboard.tsx          # HR Dashboard (route: /hr)
├── employees.tsx          # HR (route: /hr/employees)
├── candidates.tsx         # HR (route: /hr/candidates)
├── departments.tsx        # HR (route: /hr/departments)
├── job-postings.tsx       # HR (route: /hr/job-postings)
├── leave-management.tsx   # HR (route: /hr/leave)
├── attendance.tsx         # HR (route: /hr/attendance)
├── documents.tsx          # HR (route: /hr/documents)
├── payroll.tsx            # HR (route: /hr/payroll)
├── projects.tsx           # HR (route: /hr/projects)
├── project-detail.tsx     # HR (route: /hr/projects/:id)
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
├── style-guide.tsx        # Dev: Style Guide
├── components-guide.tsx   # Dev: Components
├── icons-guide.tsx        # Dev: Icons
└── not-found.tsx          # 404
```

### Mock Data Files
- `client/src/lib/mock-data.ts` — HR entities (employees, candidates, departments, etc.)
- `client/src/lib/mock-data-sales.ts` — USDrop AI entities (products, categories, suppliers, users, leads, subscriptions, stores, fulfillment, tickets, courses, plans, revenue metrics, help center articles)
- `client/src/lib/mock-data-events.ts` — Events (events, venues, attendees)
- `client/src/lib/mock-data-admin.ts` — Admin (team members, activity logs, reports)

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
