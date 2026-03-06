# TeamSync - Multi-Vertical Team Portal

## Overview
TeamSync is a multi-vertical team portal with exceptional UI/UX inspired by the Dropship.io design system. The vertical switcher shows two labeled groups: "Business Products" and "Departments". Each vertical/department has its own dashboard, pages, brand logo, and workflows. Built with React, TypeScript, Tailwind CSS, and Shadcn UI.

**Business Products** (8): Suprans Business Services (`/suprans`), LegalNations (`/hr`), USDrop AI (`/sales`), GoyoTours (`/events`), LBM Lifestyle (`/admin`), EazyToSell (`/ets`), FaireDesk (`/faire`), Vendor Portal (`/vendor`)

**Departments** (8): HRMS (`/hrms`), ATS (`/ats`), Sales CRM (`/crm`), Finance & Accounts (`/finance`), Order & Fulfillment OMS (`/oms`), Event Management (`/hub`), Developer (`/dev`), SMM (`/social`)

## Suprans Business Services (`/suprans/*`) — indigo #3730A3

Primary lead source and routing hub for all business verticals. Leads flow in → validated → enriched → assigned to vertical reps.

### Pages
- **Dashboard** `/suprans` — Command Center: 4 stat cards, vertical breakdown table (all 6 verticals with leads/assigned/converted counts), recent leads feed with quick Validate/Enrich buttons
- **Inbound** `/suprans/inbound` — 8 new unvalidated leads, search, source filter pills (Website/Referral/Instagram/LinkedIn/Google Ads/Walk-in/WhatsApp), Validate dialog with notes
- **Enrichment** `/suprans/enrichment` — 6 validated leads, AI-suggested vertical routing (e.g., "AI suggests: USDrop AI →"), Enrich dialog with vertical select, priority selector, notes
- **Assignments** `/suprans/assignments` — 5 enriched leads ready to assign, vertical+rep dropdowns, follow-up date, recently assigned table with 4 assigned leads

### Mock Data (`client/src/lib/mock-data-suprans.ts`)
- 25 leads across 6 statuses (8 new, 6 validated, 5 enriched, 4 assigned, 2 converted)
- 6 services mapped to verticals (company-formation→hr, tour-booking→events, ecommerce-setup→sales, event-management→eventhub, hr-consulting→hrms, franchise→ets)
- `VERTICAL_REP_MAP` with 3 mock reps per vertical (18 total)
- Report templates: Daily Lead Intake (employee scope) + Weekly Assignment Summary (department scope)

## Design System Architecture (Mar 2026)

### Softr-Style Locked Universal Design System
All 17 verticals and 177 pages follow a single unified design system. Structure, spacing, status display, tables, forms, and detail pages are **defined once and reused everywhere**. Only configuration (columns, statuses, brand color, labels) changes per page or vertical.

#### Component Systems (both canonical, unified via ds.ts)
- **`@/components/layout`**: `PageShell`, `PageHeader`, `HeroBanner`, `StatCard`, `StatGrid`, `SectionCard`, `SectionGrid`, `FilterPill`, `PrimaryAction`, `IndexToolbar`, `DataTableContainer`, `DataTH/TD/TR`, `SortableDataTH`, `DetailSection`, `DetailModal`, `InfoRow`
- **`@/components/hr`**: `DataTable` (column-config), `StatusBadge` (extended variant system), `FormDialog`, `StatsCard`, `EmptyState`, `StageStepper`

#### Master Barrel: `client/src/lib/ds.ts`
Single import for all design primitives — any page can import from `@/lib/ds` instead of multiple sources.

#### Per-Vertical Config Files (`client/src/lib/{vertical}-config.ts`)
One config per vertical, each exporting `VERTICAL_COLOR` + TypeScript status types + status configs:
- `faire-config.ts`, `ats-config.ts`, `crm-config.ts`, `hrms-config.ts`, `ets-config.ts`
- `events-config.ts`, `eventhub-config.ts`, `finance-config.ts`, `oms-config.ts`, `sales-config.ts`
- `social-config.ts`, `suprans-config.ts` (also exports `VENDOR_COLOR`), `dev-config.ts`, `admin-config.ts`

#### Rules
- **NO** inline `const statusColors: Record<string, string>` — use `<StatusBadge status={x} />` 
- **NO** inline `const BRAND = "#..."` — import `VERTICAL_COLOR` from per-vertical config
- **StatusBadge** auto-resolves all status strings across all verticals via extended `variantMap`

#### Faire Gold Standard (orders.tsx) — Applied to All Faire Pages (Mar 2026)
All Faire index pages follow orders.tsx pattern:
- **Wrapper**: `PageShell` → `Fade` sections
- **Header**: `PageHeader` with `text-2xl font-bold`, subtitle, action buttons
- **Toolbar**: `IndexToolbar` with `w-80` search, `FilterPill` row, `FAIRE_COLOR` brand color
- **Table**: `DataTableContainer` → `DataTH`/`SortableDataTH` → `DataTR` + `DataTD`
- **Pagination**: `PAGE_SIZE=25`, "Showing X-Y of Z", page buttons with FAIRE_COLOR active state
- **Row actions**: Inline icon buttons (`ghost`/`outline`, `h-8 w-8 p-0`)
- **Detail pages**: `text-2xl font-bold` title, `InfoRow` for key-value pairs, `DetailSection` for grouped blocks

Pages standardized: applications, stores, shipments, pricing, quotations, vendors, inventory, bank-transactions, ledger, analytics, retailer-detail, product-detail, quotation-detail, order-detail, application-detail

## Core Supabase Infrastructure (Mar 2026)

Supabase project: `ngvrnwjisntjmqrtnume` (ap-southeast-1). All core tables are in the `public` schema and FK into each other. Faire-specific tables remain in the `faire` schema via RPC.

### Core Tables (9 tables — shared across all 16 portals)

| Table | Rows | Description |
|-------|------|-------------|
| `verticals` | 16 | Registry of all 16 portals (id = short name like `dev`, `faire`, `hr`) |
| `users` | 20 | Internal team members (EMP-001–EMP-020) |
| `user_verticals` | 34 | Many-to-many: user ↔ vertical membership with role |
| `tasks` | 15+ | Cross-portal tasks (T074+ for DB-created; T001–T073 reserved for mock) |
| `task_subtasks` | 0+ | Checklist items per task (cascade-deletes with parent) |
| `channels` | 0+ | Chat channels per vertical (type: channel/dm/announcement) |
| `channel_messages` | 0+ | Messages per channel |
| `resources` | 0+ | Shared documents/links per vertical |
| `contacts` | 0+ | Important contacts, supports multi-vertical via `vertical_ids TEXT[]` |
| `notifications` | 0+ | System alerts; `user_id NULL` = broadcast to all |

### FK Graph
```
verticals ←── tasks.vertical_id
verticals ←── channels.vertical_id
verticals ←── resources.vertical_id
verticals ←── notifications.vertical_id
verticals ←── user_verticals.vertical_id
users     ←── tasks.assignee_id / created_by
users     ←── channel_messages.sender_id
users     ←── resources.added_by_id
users     ←── contacts.added_by_id
users     ←── user_verticals.user_id
users     ←── notifications.user_id (nullable = broadcast)
tasks     ←── task_subtasks.task_id (ON DELETE CASCADE)
channels  ←── channel_messages.channel_id (ON DELETE CASCADE)
```

### task_code Sequence
- DB trigger `trg_assign_task_code` auto-assigns `T074+` on new task INSERT
- Mock data uses `T001–T073` (hard-coded in `sharedTaskCodeMap` in mock-data-shared.ts)

### `/api/core/*` Routes (registered in server/routes.ts)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/core/verticals` | List all 16 verticals |
| GET | `/api/core/verticals/:id` | Single vertical |
| GET | `/api/core/users?verticalId=` | All users (or filtered by vertical) |
| GET | `/api/core/users/:id` | Single user |
| GET | `/api/core/tasks?verticalId=` | Tasks (all or by vertical) |
| GET/PATCH/DELETE | `/api/core/tasks/:id` | Single task CRUD |
| GET/POST | `/api/core/tasks/:id/subtasks` | Subtask list + create |
| PATCH/DELETE | `/api/core/tasks/:id/subtasks/:sid` | Toggle/update/delete subtask |
| GET | `/api/core/channels?verticalId=` | Channels for vertical |
| GET | `/api/core/channels/:id/messages` | Messages (limit param) |
| POST | `/api/core/channels/:id/messages` | Send message |
| GET/POST | `/api/core/resources?verticalId=` | Resources CRUD |
| DELETE | `/api/core/resources/:id` | Delete resource |
| GET/POST | `/api/core/contacts?verticalId=` | Contacts CRUD |
| PATCH/DELETE | `/api/core/contacts/:id` | Update/delete contact |
| GET | `/api/core/notifications?verticalId=&userId=` | Notifications |
| POST | `/api/core/notifications/:id/read` | Mark one read |
| POST | `/api/core/notifications/read-all?verticalId=` | Mark all read |

### Tasks Page Live DB Wiring
`client/src/pages/universal/tasks.tsx` now uses:
- `useQuery(['/api/core/tasks?verticalId=X'])` — loads tasks from Supabase
- Mock data fallback when DB returns 0 tasks for a vertical
- `useMutation → POST /api/core/tasks` for task creation (persisted to DB)
- `useMutation → PATCH /api/core/tasks/:id` + optimistic cache update for status/priority/assignee/dueDate
- Subtask state remains in-memory (local `subtaskMap` state) — future phase will wire to DB

### Seeded Data
- 16 verticals (matching `verticals-config.ts` — id, name, color, tagline, description)
- 20 users (EMP-001–EMP-020) with full profile data
- 34 user-vertical memberships (cross-assigned per department)
- 15 tasks across 7 verticals (dev, faire, hr, sales, finance, admin, hrms) — task codes T074–T088

### Phase 2 — Portal-Specific Tables (Planned, Not Yet Created)
- **HRMS**: `employees`, `departments`, `attendance`, `leaves`, `payroll`, `performance_reviews`
- **ATS**: `jobs`, `candidates`, `applications`, `interviews`, `offers`
- **CRM**: `crm_contacts`, `crm_companies`, `crm_deals`, `crm_activities`
- **Events/GoyoTours**: `tour_packages`, `bookings`, `hotels`
- **Finance**: `journal_entries`, `payment_records`
- **OMS**: `oms_orders`, `oms_inventory`, `oms_shipments`

## Recent Additions (Feb 2026)

### CRM Payment Links (`/crm/payment-links`)
- Multi-step Create dialog: customer details → amount+methods → QR preview
- UPI QR code generation via `qrcode` npm package (mock UPI ID: `payments@supransbiz`)
- Bank transfer details (HDFC), copy payment link to clipboard
- Payment link table: search, filter pills (All/Pending/Paid/Expired), Mark as Paid inline action
- Grouped under CRM "Performance" nav category

### FaireDesk — Faire Order Operations Pipeline (Mar 2026)

Complete end-to-end order operations pipeline with 5 new pages:

**New Pages:**
- **Quotations** `/faire/quotations` — List + "New Quotation" dialog; 4 KPI cards; filter tabs (All/Draft/Sent/Quote Received/Accepted/Challenged); table with margin % color-coding; links to detail
- **Quotation Detail** `/faire/quotations/:id` — 3-column layout: order context (with product images) / quotation (status timeline, fulfiller card, line items, costs) / decision panel (margin health bar, action buttons); status transitions (DRAFT→SENT→QUOTE_RECEIVED→ACCEPTED/CHALLENGED/SENT_ELSEWHERE); Challenge + Send Elsewhere dialogs
- **Partner Portal** `/faire/partner-portal` — Fulfiller-facing quote submission UI; fulfiller selector; SENT quotations as cards with product image grids; inline quote submission form; updates quotation to QUOTE_RECEIVED
- **Financial Ledger** `/faire/ledger` — Per-order financials; 4 stat cards; filter tabs; full table with Faire payout vs fulfiller cost vs net margin; Mark as Cleared dialog linking bank transactions
- **Bank Transactions** `/faire/bank-transactions` — Full bank portal with 3 tabs: Faire Payouts (Supabase-backed, 4 stat cards including Personal Txns, filter tabs: All/Faire Payouts/Paid to Suppliers/Unreconciled/Personal, per-row Business/Personal toggle badge fires PATCH, Map Order modal writes faire_order_id to Supabase, Edit modal for tags + category + notes, Attachments modal), Mercury (Supabase-backed, entity filter All/Neom/Cloudnest, 2 entity cards, Edit modal), Wise (live API unchanged). All mock data removed; data sourced from `bank_transactions` Supabase table.
- **Vendors** `/faire/vendors` — Full CRUD vendor directory; Add/Edit modal with name, contact, email, WhatsApp, notes, default flag; default vendor KPI card; WhatsApp clickable links; vendor assignment badge; registered under Quotations nav section
- **Seller Applications** `/faire/applications` — Index with 6 stat cards (Total/Drafting/Applied/Pending Docs/Approved/Rejected), search + status filter, datatable; includes SOP modal (8-step process guide) and Video Tutorial modal. New Application modal creates drafts. Status badge color-coded per stage.
- **Application Detail** `/faire/applications/:id` — 2-column layout: left (7 info cards: Brand Identity, Email & Contact, Domain & Website, Marketplace Strategy, Product Listings, Legal Documents, Application Submission — all inline-editable via click-to-edit PATCH); right sidebar (Follow-up Timeline with type icons + add/delete, Quick Links with type icons + add/delete, Record Info). Action bar: status transitions (Mark Applied → Docs Requested / Mark Rejected / Mark Approved → Promote modal). Full Edit modal for batch editing all fields.

**Real Faire API integration (server/routes.ts):**
- `GET /api/faire/stores` — lists all active stores (id + name + last_synced_at, credentials never leave server)
- `GET /api/faire/orders` — all orders across all stores from Supabase cache
- `GET /api/faire/stores/:storeId/orders?state=` — filtered orders for one store
- `GET /api/faire/stores/:storeId/products` — products for one store
- `GET /api/faire/stores/:storeId/counts` — order/product counts for dashboard
- `POST /api/faire/stores/:storeId/sync` — full sync: fetches brand profile + all orders + all products from Faire API v2 → upserts into Supabase; returns `{orders_synced, products_synced}`
- `POST /api/faire/orders/:id/accept` → `POST faire.com/external-api/v2/orders/:id/processing`
- `POST /api/faire/orders/:id/cancel` → `POST faire.com/external-api/v2/orders/:id/cancel`
- `POST /api/faire/orders/:id/shipments` → `POST faire.com/external-api/v2/orders/:id/shipments`
- Routes now accept `storeId` (UUID) instead of raw token — credentials fetched server-side from Supabase

### Vendor Portal (`/vendor/*`) — purple #7C3AED (Mar 2026)

Minimal supplier-facing portal. 2 pages only. Vendors select their identity via a dropdown (persisted in `localStorage` key `vp_vendor_id`). Landing route is `/vendor/quotations`.

**Pages:**
- **Quotations** `/vendor/quotations` — 3 tabs: Open Requests (SENT quotes awaiting vendor pricing), Submitted (quotes vendor has priced), History (accepted/rejected); inline "Submit Pricing" form per quotation with item unit costs, shipping cost, lead days, and notes
- **Ledger** `/vendor/ledger` — Bank transactions filtered by vendor name keywords from `bank_transactions` table; per-vendor payment history with credit/debit filter and expandable row detail

**Vendor identity (faire_vendors Supabase table):**
- fulf-001: ShipFast Logistics (USA, 4.7★, 245 orders)
- fulf-002: GlobalPack Co (HK, 4.5★, 189 orders)
- fulf-003: QuickFulfill EU (Germany, 4.8★, 312 orders)
- fulf-004: AsiaDirect Supply (India, 4.6★, 176 orders) — default

**Wise API Client (server/wise.ts):**
- Read-only personal token — `Authorization: Bearer {WISE_API_KEY}` (stored as secret `WISE_API_KEY`)
- `getWiseProfiles()` → `GET https://api.wise.com/v2/profiles` — returns all profiles
- `getWiseBalances(profileId)` → `GET https://api.wise.com/v4/profiles/{id}/balances?types=STANDARD` — multi-currency balances
- `getWiseTransfers(profileId, limit)` → `GET https://api.wise.com/v1/profiles/{id}/transfers` — recent transfers
- `getWiseSummary()` — picks first business profile, returns `{ profile, balances }`
- Routes: `GET /api/wise/summary`, `GET /api/wise/transfers`, `GET /api/wise/sync`
- All functions handle API errors gracefully (console.error + return empty data, never crash server)

**Faire API Client (server/faire-api.ts):**
- `fetchAllOrders(creds)` — cursor-paginated, 50/page, returns all order objects
- `fetchAllProducts(creds)` — cursor-paginated, 50/page, returns all product objects
- `fetchBrandProfile(creds)` — fetches brand profile for the store
- Auth: `X-FAIRE-OAUTH-ACCESS-TOKEN` + `X-FAIRE-APP-CREDENTIALS` headers

**Supabase Integration (server/supabase.ts):**
- Project: `ngvrnwjisntjmqrtnume` (teamsync), region: ap-southeast-1
- `faire` schema with 6 tables: `stores`, `products`, `orders`, `order_items`, `shipments`
- 6 active stores: Toyarina, Holiday Farm, Super Santa, Buddha Ayurveda, Buddha Yoga, Gullee Gadgets
- Credentials stored in `faire.stores` (app_credentials + oauth_access_token per store)
- Server queries via public RPC functions with SECURITY DEFINER (PostgREST does not expose `faire` schema)
- RPC functions: `faire_list_stores`, `faire_get_store_credentials`, `faire_sync_orders`, `faire_sync_products`, `faire_get_store_orders`, `faire_get_all_orders`, `faire_get_store_products`, `faire_get_store_counts`, `faire_update_store_profile`
- Orders/products returned from Supabase include `_storeId` (internal UUID) injected server-side
- Env vars: `SUPABASE_URL` (shared), `SUPABASE_SERVICE_ROLE_KEY` (secret), `SUPABASE_ANON_KEY` (secret)

**All 18 Faire frontend pages migrated to real API data via TanStack Query (zero mock-data-faire imports):**
- **dashboard.tsx** — stores + orders + products via useQuery; computes revenue, pending fulfillment, unique retailers from real data; store cards with per-store stats grouped by `_storeId`; recent orders + top products sections
- **orders.tsx** — all orders from `/api/faire/orders`; per-store filtering; Accept/Cancel use `order._storeId`; quotation cross-references from mock-data-faire-ops; store logo (20×20 rounded) shown next to store name in table (STORE_LOGOS map keyed by store name)
- **products.tsx** — slim endpoint `/api/faire/products?slim` (~1.9MB); all 3022 products across 4 stores; SKU column; product thumbnail images from CDN; store/lifecycle/sale-state filters; search by name or SKU; pagination 50/page; bulk inventory update; Vendor column with "Assign" button per row → opens modal to select vendor + exclusive toggle; uses /api/faire/products/:id/vendors
- **order-detail.tsx** — full order data; Accept/Cancel/Add Shipment call real Faire API; quotation/fulfiller/ledger panels from mock-data-faire-ops; WhatsApp + Email share buttons in header; 40×40 product thumbnails in items table (cross-referenced from /api/faire/products?slim)
- **analytics.tsx** — WhatsApp + Email share buttons in page header that generate summary text with KPIs
- **bank-transactions.tsx** — 3-tab bank switcher: Faire Payouts (reconciliation table, filter tabs, Map to Order, attachment upload), Mercury (mock data from mock-data-finance, 2 entity cards for Neom + Cloudnest, full USD transactions table), Wise (live API via /api/wise/*, multi-currency balance cards, transfers table, Sync Now button)
- **product-detail.tsx** — full product data with image gallery; category from `taxonomy_type.name`; reviews fallback
- **inventory.tsx** — slim products; variant-level inventory with store filter
- **pricing.tsx** — slim products; variant pricing with DataTH/DataTD/DataTR + pagination; prepacks table also normalized; prepacks kept as local mock
- **fulfillment.tsx** — orders filtered to NEW/PROCESSING states; ship dialog with `_storeId`; uses PageShell + PageHeader
- **shipments.tsx** — shipments extracted from `order.shipments[]`; enriched with store/retailer info; DataTH/DataTD/DataTR + pagination
- **retailers.tsx** — retailers from `/api/faire/retailers`; paginated; "Enrich" button per row opens enrichment modal (contact name, email, phone, address, business type, store type, website, instagram, notes, enriched_by) → POST /api/faire/retailers/:id/enrichment
- **retailer-detail.tsx** — single retailer + order history; computed stats; enrichment card displayed when data exists (contact, WhatsApp button from phone, address, website/instagram links); "Enrich/Edit Enrichment" CTA button in header; empty dashed state when not yet enriched; data persisted to Supabase `retailer_enrichments` table
- **analytics.tsx** — revenue trends, order state breakdowns, geo data, top products from real data
- **stores.tsx** — store list with per-store summary stats (revenue, order count, product count, retailer count, order pipeline badges); merged `?summary` endpoint with 5min server-side cache; DualCurrency INR subtext on revenue; Sync All + per-store sync + Orders nav
- **quotations.tsx, quotation-detail.tsx, partner-portal.tsx, ledger.tsx** — orders/stores from real API; operational mock data from mock-data-faire-ops retained
- **bank-transactions.tsx** — fully rewritten; no mock data; all data from Supabase `bank_transactions` table (Faire + Mercury) or live Wise API

**Bank Transactions (Supabase `bank_transactions` table):**
- Schema: `id (UUID PK), source (faire_payout|mercury|wise), entity (neom|cloudnest|NULL), bank_name, date (DATE), description, amount (DECIMAL 15,4 native currency), currency (default USD), amount_usd (DECIMAL 15,4 normalized), type (credit|debit), category, is_business (BOOL default true), tags (TEXT[] default {}), reference, faire_order_id, reconciled (BOOL default false), notes, external_id, created_at, updated_at`
- Indexes: source, entity, date DESC
- RPC: `bank_update_transaction(p_id, p_is_business, p_category, p_notes, p_reconciled, p_tags, p_faire_order_id)` — UPDATEs and RETURNs the row
- FX rates for USD normalization: GBP=1.27, AUD=0.65, CAD=0.74, CNY=0.14, INR=0.012, USD=1.0
- Seeded data: 10 Mercury USD txns (Neom: ac004, Cloudnest: ac005) + 15 Faire payout txns (25 total)
- API routes: `GET /api/bank-transactions?source=&entity=&type=&search=&page=&limit=&is_business=` → `{transactions, total}`, `POST /api/bank-transactions` → `{transaction}`, `PATCH /api/bank-transactions/:id` → `{transaction}`

**Ledger Parties (Supabase `ledger_parties` + `ledger_party_transactions` tables):**
- `ledger_parties`: `id, name, type, contact_name, email, phone, country, currency, credit_limit, credit_days, tags[], notes, is_active, created_at, updated_at`
- `ledger_party_transactions`: `id, party_id (FK), type, direction (payable|receivable), date, due_date, amount, currency, amount_usd, reference, description, faire_order_id, bank_transaction_id, status (pending|paid|partial|overdue), paid_amount, payment_date, notes, created_at, updated_at`
- RPC: `get_party_balance(p_party_id)` — returns net balance (receivables − payables)
- Seeded: 10 parties (ShipFast, GlobalPack, QuickFillEU, AsiaDirect, Faire, Shopify, Stripe, Meta Ads, Wyoming SOS, Suprans) with transaction histories
- API routes: `GET /api/ledger-parties`, `GET /api/ledger-parties/:id`, `POST /api/ledger-parties`, `PATCH /api/ledger-parties/:id`, `GET /api/ledger-parties/:id/transactions`, `POST /api/ledger-parties/:id/transactions`, `PATCH /api/ledger-party-transactions/:id`, `GET /api/ledger-parties/:id/balance`

**Modal Architecture (global fix applied Mar 2026):**
- `dialog.tsx` `DialogContent` no longer renders built-in `<DialogPrimitive.Close>` X button — all modals manage their own close
- All faire page modals (fulfillment, pricing, product-detail, bank-transactions) use `DetailModal` from `@/components/layout`
- `DetailModal` renders its own X in the header; `footer` prop accepts any ReactNode for action buttons

**Retailer Enrichment (Supabase `retailer_enrichments` table):**
- Table: `retailer_id (PK), contact_name, contact_email, contact_phone, store_address, business_type, store_type, website, instagram, notes, enriched_by, enriched_at, updated_at`
- RPC functions: `faire_get_retailer_enrichment`, `faire_upsert_retailer_enrichment` (upsert with COALESCE — never overwrites existing fields with NULL)
- API: `GET /api/faire/retailers/:id/enrichment`, `POST /api/faire/retailers/:id/enrichment`
- WhatsApp URL formula: `https://wa.me/{digits_only}` from phone field
- Supabase functions: `getRetailerEnrichment`, `upsertRetailerEnrichment` in server/supabase.ts

**INR Dual-Currency Display (all 18 pages):**
- All USD amounts show INR conversion as muted subtext at 90x rate
- `<DualCurrency cents={n} />` — table cells: `$12.34` with `₹1,111` below
- `<DualCurrencyInline cents={n} />` — inline: `$12.34 (₹1,111)`
- `<DualFromDollars dollars={n} />` — for dollar-based values
- StatCards use `trend={formatINR(cents)}` or `trend={formatINRFromDollars(dollars)}`
- Shared utility: `client/src/lib/faire-currency.tsx`

**Slim products endpoint (`/api/faire/products?slim`):**
- Strips `images[]`, `description`, `short_description` from products; includes `thumb_url` (first image CDN URL) and `sku` per variant
- Server-side in-memory cache (5min TTL) — first load ~5s, cached loads ~0.2s
- Backend paginates Supabase RPC in 1000-row batches to fetch all 3022 products (RPC has 1000 row default)

**Mock data (client/src/lib/mock-data-faire-ops.ts):**
- 4 fulfillers: ShipFast Logistics, GlobalPack Co, QuickFulfill EU, AsiaDirect Supply
- 10 quotations in mixed statuses linked to existing orders
- 11 ledger entries with payout vs cost calculations
- 14 bank transactions (9 reconciled, 5 unreconciled)

### FaireDesk — Full Faire External API v2 Overhaul (Feb 2026)
- Removed 4 fake pages with no API backing: leads, pipeline, campaigns, disputes
- Rewrote mock-data-faire.ts to exactly match Faire External API v2: correct ID prefixes (p_, po_, bo_, oi_, s_, r_), all prices in cents, options as Array<{name,value}>, 8 OrderStates (NEW/PROCESSING/PRE_TRANSIT/IN_TRANSIT/DELIVERED/PENDING_RETAILER_CONFIRMATION/BACKORDERED/CANCELED), FaireAddress, payout_costs with commission_bps/commission_cents, display_id, source, is_free_shipping, brand_discounts, shipment tracking_code+maker_cost_cents+shipping_type
- Updated all 8 feature pages to consume corrected data model: orders, order-detail, products, product-detail, inventory, pricing, shipments, fulfillment
- Also updated dashboard, analytics, retailer-detail for correct stateConfig (8 states) and API v2 field names

### EventHub Event Inquiries (`/hub/leads`)
- 15 event inquiry leads (Corporate/Wedding/Social/Conference/Exhibition)
- Client cards: guest count, tentative date, budget range, source, status badges
- Stat cards: Total Inquiries, New Today, Qualified, Pipeline Value
- Under EventHub "Sales" nav category

### GoyoTours Booking Calendar (`/events/calendar`)
- Monthly calendar grid (Mon-Sun), February 2026 default
- Booking pills colored by tour type (Canton Fair/Custom Tour/Sourcing Tour)
- Click-to-view detail panel on the right
- Month navigation with Today button, status filters
- Under Events "Bookings" nav category

## Finance & Accounts Department (`/finance/*`) — amber #B45309

### 4 Legal Entities
| Entity | Type | Jurisdiction | Currency |
|---|---|---|---|
| Neom International LLC | Multi-member LLC | Wyoming, USA | USD |
| Cloudnest LLC | Multi-member LLC | Wyoming, USA | USD |
| Startup Squad Pvt. Ltd. | Private Limited | Haryana, India | INR |
| Lumbee International Pvt. Ltd. | Private Limited | Haryana, India | INR |

### Pages
- **Dashboard** `/finance` — amber gradient hero, 4-company cash position cards, 6 KPI stats, monthly P&L bars, inter-company mini-table, compliance countdown, recent transactions feed
- **Ledger** `/finance/ledger` — collapsible account tree (Assets/Liabilities/Equity/Revenue/Expenses), Dr/Cr running balance per account, closing balance row, company filter
- **Transactions** `/finance/transactions` — 60 transactions, list/day-grouped toggle, company+type+gateway+search filters, EOD net totals, footer summary
- **Journal Entries** `/finance/journal` — 20 double-entry JE records, Dr=Cr balance validation, IC/SE badges, draft "Post Journal" action, left-list + right-detail panel layout
- **Inter-Company** `/finance/intercompany` — 4×4 balance matrix (open positions), explainer callout, active balances table, exchange rate bar (₹83.20/USD), settlement history
- **Payments** `/finance/payments` — Razorpay (INR) + Stripe (USD) gateway cards, 25 gateway transactions, reconciliation progress bar, unreconciled row highlighting
- **Shared Expenses** `/finance/shared-expenses` — 5 allocation rules with stacked % bars, 3 months of history table, context callout (LIPL 60% / SSPL 40% rent split)
- **Cash Book** `/finance/cashbook` — 20 petty cash entries, day-grouped with running balance, period toggle (week/month/all), category badges
- **Compliance** `/finance/compliance` — 20 filings (India GST/TDS/ROC + US IRS/Wyoming), days-countdown pills, overdue rows in red-50, collapsible rules reference, Mark Filed action
- **Reports** `/finance/reports` — P&L / Balance Sheet / Cash Flow / Trial Balance tabs, consolidated 4-company view with INR conversion, PDF/Excel export buttons

### Mock Data (`client/src/lib/mock-data-finance.ts`)
- 4 company profiles, 40 chart of accounts, 60 transactions, 20 journal entries (with lines), 12 inter-company balances, 25 gateway transactions, 5 shared expense rules, 15 monthly history entries, 20 cash book entries, 20 compliance filings, 10 exchange rates
- Multi-currency: INR (SSPL, LIPL) + USD (NEOM, CLOUD) at ₹83.20/USD

### Company Color Coding
| Company | Short | Tailwind Badge |
|---|---|---|
| Neom International LLC | NEOM | bg-sky-100 text-sky-700 |
| Cloudnest LLC | CLOUD | bg-violet-100 text-violet-700 |
| Startup Squad Pvt. Ltd. | SSPL | bg-emerald-100 text-emerald-700 |
| Lumbee International Pvt. Ltd. | LIPL | bg-amber-100 text-amber-700 |

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

## Universal Reports System (All 16 Verticals)
- **Page**: `pages/universal/reports.tsx` — single shared component, auto-adapts via `detectVerticalFromUrl`
- **Route**: `/[prefix]/reports` for all 16 verticals (LBM Lifestyle also uses `/admin/team-reports`)
- **Data**: `lib/mock-data-reports.ts` (types + assembly) + 4 group files:
  - `mock-data-reports-g1.ts` — hr, sales, events, eventhub
  - `mock-data-reports-g2.ts` — admin, dev, ets, faire
  - `mock-data-reports-g3.ts` — hrms, ats, social
  - `mock-data-reports-g4.ts` — finance, oms, crm, suprans
- **Each vertical**: 2 templates (1 Daily Employee + 1 Weekly Department), 5-7 fields each, ~10 mock submitted/pending/late reports spanning Feb 17–28 2026
- **Features**: Stats bar, filter pills, Submit Report dropdown, FormDialog with dynamic fields, file-browser list grouped by date, pending rows with "Submit Now"
- **Enhanced Report Viewer** (`components/reports/report-viewer.tsx`): Rich report view with charts and fullscreen mode
  - Key metric cards with color-coded borders and vs-previous trend arrows
  - Bar chart for numeric fields (Metrics Overview)
  - Historical trend chart comparing same-template submissions over time
  - Bullet-point rendering for text/textarea fields
  - Fullscreen mode toggle (expand icon → full-page overlay with sticky header)
- **Report Trends Dashboard** (`components/reports/report-trends.tsx`): Aggregate charts on main page
  - Submissions Over Time bar chart (last 7 periods, vertical brand color)
  - By Scope donut pie chart (Employee/Department/Executive)
  - Submissions by Template horizontal bar chart
- **Nav**: "Reports" nav item added to all 16 verticals in verticals-config.ts

## PWA (Progressive Web App)
- **Manifest**: `client/public/manifest.json` — name "TeamSync Portal", theme #225AEA, icons at 128/192/512px + SVG
- **Service Worker**: `client/public/sw.js` — network-first with shell cache fallback for offline support
- **Icons**: `client/public/icon.svg` (source), `favicon.png` (128px), `icon-192.png`, `icon-512.png` — TS logo blue gradient (#1a3fc4→#1860f0), rounded rect, bold white "TS" text
- **Install prompt**: `components/layout/pwa-install-prompt.tsx` — fixed bottom-right card, on-brand, dismissable with localStorage persistence
- **Hook**: `hooks/use-pwa-install.ts` — captures `beforeinstallprompt`, exposes `promptInstall()` and `dismiss()`
- **Note**: Install prompt fires only when browser detects installability (HTTPS + manifest + SW + engagement criteria)

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

### Universal Important Contacts (`/[prefix]/contacts`)
- **Available on ALL 11 verticals**: hr, sales, events, hub, admin, dev, ets, faire, hrms, ats, social
- Vertical-aware filtering: shows contacts scoped to the current vertical + shared contacts (`verticalIds: ["all"]`)
- 3-per-row contact cards with priority dots, category badges, country flags, tags, action buttons (WhatsApp/Email/Phone/Copy)
- Stats strip: Total, High Priority, Shared, Categories
- Search + Category filter + Priority filter
- "Add Contact" FormDialog
- Mock data: `client/src/lib/mock-data-contacts.ts` — 40 contacts across all verticals

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
3. **GoyoTours** (id: `events`, color: #E91E63) — China B2B Travel CRM for Mr. Suprans' delegation business — Routes: `/events/*`
   - **Universal**: Chat, Team, Resources, Tasks, Important Contacts (`/events/contacts`)
   - **Dashboard** — pink gradient welcome banner, 4 KPI cards (Revenue Collected, Bookings, Active Leads, Seats Available), horizontal package strip with progress bars, lead pipeline chips, payment summary, recent bookings table, urgent actions (overdue follow-ups + pending visas)
   - **Packages** (`/events/packages`) — 7 real packages from suprans.in; status filter pills; 2-per-row cards with gradient headers, discount badges, seat progress bars, pricing with GST/TCS note, advance chip, highlights, View+Book CTAs
   - **Package Detail** (`/events/packages/:id`) — day-by-day itinerary, inclusions/exclusions, pricing card (with GST breakdown), capacity widget, hotel info, Create Booking CTA, Copy Brochure Link, filtered bookings table
   - **Leads** (`/events/leads`) — Kanban (New/Contacted/Interested/Booked/Cold/Lost columns) + Table view toggle; cards show business type, city, package badge, source badge, overdue follow-up warning (red), WhatsApp btn; stats (Total, New, Follow-ups Due, Conversion Rate); Add Lead FormDialog
   - **Bookings** (`/events/bookings`) — DataTable: Booking ID, Client+phone, Package, Pax, Total, Advance, Balance, Payment Status, Visa, Travel Date; status + payment filter pills; stats strip; Row click → detail; Record Payment row action; New Booking FormDialog
   - **Booking Detail** (`/events/bookings/:id`) — Client info, Package details (totals/advance/balance), Payment history timeline, Visa & Flight status; Actions: Record Payment, WhatsApp pre-filled reminder, Mark Visa Applied, Print Voucher; Travel countdown
   - **Hotels** (`/events/hotels`) — China hotel directory; city + star filters; 3-per-row cards with rate (listed vs our), contact, amenities, packages used, status dot; Add Hotel FormDialog
   - **Vendors** (`/events/vendors`) — Category pills; 3-per-row cards; ground partner "Guangzhou Connect Tours" pinned with KEY PARTNER badge; star ratings, services chips; Add Vendor FormDialog
   - **Analytics** (`/events/analytics`) — 6 KPI cards, Revenue by Package bar chart, Lead Funnel, Bookings by Source, Top Cities table
   - **Mock data**: `client/src/lib/mock-data-goyo.ts` — 7 packages (full itineraries), 18 leads, 12 bookings (with payments[]), 8 China hotels, 8 vendors
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

## Task Activity Panel (Mar 2026)

All task detail modals now include a real-time Activity panel (right-side) with three sections: **Comments**, **Files** (Supabase Storage), and **Links**.

### Supabase Table: `task_activity`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Auto-generated |
| task_id | TEXT | References task ID (mock or any string) |
| type | TEXT | `'comment'` \| `'attachment'` \| `'link'` |
| content | TEXT | Comment body |
| author | TEXT | Display name (default: `'Team'`) |
| file_url | TEXT | Public Supabase Storage URL |
| file_name | TEXT | Original filename |
| file_size | INT | Bytes |
| link_url | TEXT | Full URL |
| link_title | TEXT | Optional display title |
| created_at | TIMESTAMPTZ | Auto-set |

### Supabase Storage: `task-attachments` bucket (public)
- Files stored at path: `{taskId}/{timestamp}-{filename}`
- Max 50MB per file
- Public access, no auth required
- Files deleted from Storage when activity row is deleted

### API Routes (all new)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks/:taskId/activity` | Returns `{ items: ActivityItem[] }` sorted by created_at ASC |
| POST | `/api/tasks/:taskId/comments` | Body: `{ content, author? }` → creates comment row |
| POST | `/api/tasks/:taskId/links` | Body: `{ url, title? }` → creates link row |
| POST | `/api/tasks/:taskId/attachments` | Multipart: `file` field → uploads to Supabase Storage → creates attachment row |
| DELETE | `/api/tasks/:taskId/activity/:id` | Deletes row + Storage file if attachment |

### Universal Task Detail Modal (tasks.tsx)
- Converted from `DetailModal` to raw `Dialog` at `max-w-5xl`
- Layout: `flex flex-row h-[75vh]` — left `flex-1` (description/progress/subtasks/details) + right `w-80 border-l` (activity panel)
- Activity panel has Comments, Files (with upload), and Links sections
- All 3 activity types use TanStack Query (`queryKey: ['/api/tasks', taskId, 'activity']`) + `useMutation` for writes

### Dev Task Detail Dialog (task-detail-dialog.tsx)
- Replaced static `currentTask.attachments` display with real Supabase-backed list
- Added file upload → `POST /api/tasks/:id/attachments`
- Per-attachment download link + delete button
- Comments section remains local-state only (not persisted)

---

## Chat System (Slack/WhatsApp-level Real-time) — Phase 1 Complete (Mar 2026)

### Architecture
- **Backend**: Supabase Postgres (`channels` + `channel_messages` + `channel_read_state` tables)
- **Realtime**: Supabase Realtime with `REPLICA IDENTITY FULL` on `channel_messages` and `channels` tables
- **Frontend Supabase client**: `client/src/lib/supabase-client.ts` (anon key, used for realtime only)
- **Env vars**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (shared)
- **Current user**: `localStorage.getItem('chat_user_{verticalId}')` → defaults to first vertical member; switchable via header dropdown

### DB Tables
| Table | Key Columns |
|-------|-------------|
| `channels` | id (UUID), vertical_id, name, type (channel/dm/announcement), description, member_names[], is_pinned, is_private, is_archived, topic, last_message, last_message_at, unread_count |
| `channel_messages` | id (UUID), channel_id, sender_name, content, reply_to_id (self-ref), reactions JSONB, message_type, is_deleted, edited_at, file_url, file_name, file_size |
| `channel_read_state` | (user_id, channel_id) PK, last_read_message_id, last_read_at |
| `increment_channel_unread(p_channel_id)` | SQL function to atomically increment unread count |

### Seeded Data
- 34 channels across 8 verticals (hr, sales, events, eventhub, admin, dev, faire, ets)
- ~60 messages seeded from mock data with realistic timestamps

### API Routes (`/api/core/channels/*`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/core/channels?verticalId=X` | List channels for vertical (non-archived, sorted pinned first) |
| POST | `/api/core/channels` | Create channel |
| PATCH | `/api/core/channels/:id` | Update channel |
| DELETE | `/api/core/channels/:id` | Archive channel |
| POST | `/api/core/channels/dm` | Find or create DM between members |
| GET | `/api/core/channels/:id/messages?limit=100` | Get messages (chronological) |
| POST | `/api/core/channels/:id/messages` | Send message |
| PATCH | `/api/core/channels/:id/messages/:mid` | Edit message (sets edited_at) |
| DELETE | `/api/core/channels/:id/messages/:mid` | Soft delete (is_deleted=true) |
| POST | `/api/core/channels/:id/messages/:mid/react` | Toggle emoji reaction |
| POST | `/api/core/channels/:id/read` | Mark channel as read for user |
| GET | `/api/core/channels/:id/unread?user_name=X` | Get unread count |

### Chat Frontend Features
- **Live from DB**: All channels and messages fetched from Supabase via TanStack Query
- **Realtime**: Supabase Realtime INSERT subscription auto-appends new messages
- **Send**: Persists to DB, optimistically updates cache, scrolls to bottom
- **Message grouping**: Consecutive messages from same sender within 5min hide avatar + repeated header
- **Relative timestamps**: "just now", "5m ago", "3:45 AM", "Yesterday 3:45 AM", "Mar 5"
- **Reactions**: Quick emoji picker on hover; toggle own; reaction pills with count + tooltip
- **Reply/quote**: Sets reply_to_id in DB; shows quoted bubble above message
- **Edit/delete**: Own messages only; edit dialog; soft delete shows "This message was deleted"
- **Typing indicator**: Supabase presence broadcast; shows "[name] is typing…" with dots
- **Unread badges**: Shows count in sidebar; cleared when channel opened
- **Create channel**: Dialog with name, description, member multi-select
- **New DM**: Dialog listing vertical team members; find-or-create logic
- **Channel info panel**: Right drawer with members list, online status, description
- **User switcher**: Header dropdown to switch identity (for multi-account testing)
- **Jump to bottom**: Floating button when scrolled up; "New message" badge when out-of-view
- **Online status**: Green/yellow/grey dot on DMs (from verticalMembers mock status)

### Phase 2 (Planned)
- File/image attachments via Supabase Storage `chat-attachments` bucket
- Per-message read receipts (WhatsApp-style double ticks)
- @mentions with notification
- Channel search / global message search

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

## AI Chat Widget

TeamSync includes a floating AI co-pilot powered by **Vercel AI SDK** and **OpenAI** (via Replit AI Integrations).

### Architecture
- **Trigger**: Flower icon button (`@assets/image_1772789030064.png`), fixed bottom-right, Framer Motion spring animations
- **Drawer mode**: Right-side panel, 420px, slides in with Framer Motion. Default view.
- **Full-page mode**: Covers entire viewport. Left sidebar (280px) shows conversation history; right side shows the active chat.
- **Streaming**: `useChat` from `@ai-sdk/react` v3 with `DefaultChatTransport` from `ai` hitting `POST /api/ai/chat`. Uses `streamText` + `pipeUIMessageStreamToResponse` for Express streaming with tool-call support. Input managed via local `useState` + `sendMessage({ text })`.
- **DB Tool Calling**: AI has read-only access to 27 Supabase tables via `queryDatabase` tool. Uses `tool()` from AI SDK v6 with `jsonSchema` (not Zod — Replit modelfarm proxy requires explicit `type: "object"`). `maxSteps: 5` allows multi-step queries. Blocked SQL patterns: INSERT/UPDATE/DELETE/DROP/ALTER/CREATE/TRUNCATE/GRANT/REVOKE/EXECUTE/COPY.
- **Supabase RPC**: `exec_readonly_sql(query_text)` — SECURITY DEFINER function that validates SELECT-only, executes via `jsonb_agg(row_to_json(t))`, returns JSONB array.
- **Persistence**: All conversations and messages saved to Supabase (`ai_conversations`, `ai_messages` tables).
- **Chat History**: Sidebar in expanded view shows all conversations with inline rename (pencil icon → edit input) and delete. Drawer view shows recent 8 chats at bottom.
- **Rename**: `PATCH /api/ai/conversations/:id` with `{ title }`. Inline edit in sidebar with Enter to save, Escape to cancel.

### Files
- `client/src/components/ai-chat/AIChatWidget.tsx` — main widget (trigger, drawer, full-page modes)
- `client/src/components/ai-elements/` — AI Elements components (conversation, message, shimmer, suggestion)
- `server/ai-chat.ts` — Express router with `/api/ai/chat`, `/api/ai/conversations`, `/api/ai/conversations/:id/messages`

### Supabase Tables
```sql
ai_conversations(id uuid PK, title text, vertical_id text, created_at, updated_at)
ai_messages(id uuid PK, conversation_id uuid FK, role text, content text, created_at)
```

### Key Dependencies
- `ai` (Vercel AI SDK v6), `@ai-sdk/openai`, `@ai-sdk/react` — streaming AI
- `use-stick-to-bottom`, `streamdown`, `@streamdown/*` — chat scroll + markdown rendering
- `motion` — shimmer animation in AI elements
- `multer` — file upload handling (memory storage, 10MB limit)
- OpenAI integration configured via Replit AI Integrations (env: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- Chat streaming uses `pipeTextStreamToResponse` (AI SDK v6) with `streamProtocol: "text"` in `useChat`

### Supabase AI Tables
```
ai_attachments(id uuid PK, conversation_id uuid FK, filename text, file_data text [base64], file_size int, mime_type text, created_at)
```

## Universal Ticket Management System (Mar 2026)

Cross-vertical ticket/issue tracking pinned in all 16 verticals as an icon in the top nav bar.

### Supabase `tickets` Table
```
tickets(id uuid PK, ticket_code text UNIQUE auto-gen TK-0001+, vertical_id text, title text, description text, status text [open/in-progress/waiting/escalated/resolved/closed], priority text [critical/high/medium/low], category text, reported_by text, assigned_to text, created_by text, tags text[], resolution text, due_date date, created_at, updated_at)
```
- Auto-increment trigger `trg_assign_ticket_code` generates `TK-0001`, `TK-0002`, etc.
- 20 seed tickets across 14 verticals (hr, sales, faire, events, hub, ets, hrms, crm, finance, oms, dev, social, ats, admin)

### Ticket API Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/core/tickets?verticalId=&status=&priority=&assignedTo=&search=&page=&limit=` | List with filters + pagination |
| GET | `/api/core/tickets/:id` | Single ticket |
| POST | `/api/core/tickets` | Create (accepts both camelCase and snake_case fields) |
| PATCH | `/api/core/tickets/:id` | Update (status, priority, assigned_to, resolution, etc.) |
| DELETE | `/api/core/tickets/:id` | Delete |

### Frontend Pages
- **Index**: `client/src/pages/universal/tickets.tsx` — PageShell + HeroBanner (vertical-branded) + StatGrid (5 cards) + IndexToolbar (search + status FilterPills + priority dropdown) + DataTable with row actions (View/Assign/Status/Delete) + Create FormDialog
- **Detail**: `client/src/pages/universal/ticket-detail.tsx` — Back button + ticket code badge + status/priority badges + action bar (Change Status/Escalate/Resolve/Close/Delete) + editable details section + sidebar info card + timeline card

### Navigation
- "Tickets" nav entry added to all 16 verticals in `verticals-config.ts`
- Pinned as icon button in top navigation via `PINNED_TITLES`
- Routes: `/:vertical/tickets` (index) and `/:vertical/tickets/:id` (detail) registered in App.tsx

### AI Chat API Routes
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/chat` | Stream chat response (OpenAI gpt-4o). Accepts v3 (parts) and v1 (content) message formats |
| GET | `/api/ai/conversations` | List all conversations (last 50, sorted by updated_at) |
| POST | `/api/ai/conversations` | Create conversation |
| PATCH | `/api/ai/conversations/:id` | Rename conversation (body: `{ title }`) |
| GET | `/api/ai/conversations/:id/messages` | Get messages |
| DELETE | `/api/ai/conversations/:id` | Delete conversation |
| POST | `/api/ai/upload` | Upload file (multipart, conversationId required) |
| GET | `/api/ai/conversations/:id/attachments` | List attachments |
| GET | `/api/ai/attachments/:id/download` | Download attachment |
| DELETE | `/api/ai/attachments/:id` | Delete attachment |

## Image Studio (Mar 2026)

AI-powered image generation, library management, preview, and download. Available across all 16 verticals at `/:vertical/image-studio`.

### Supabase Table
```sql
generated_images(id uuid PK, prompt text, negative_prompt text, style text, aspect_ratio text, image_data text, image_url text, width int, height int, status text [pending/completed/failed], vertical_id text, error_message text, created_at, updated_at)
```

### API Routes
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/images/generate` | Create image generation request |
| GET | `/api/images` | List all generated images (last 100) |
| GET | `/api/images/:id` | Get single image |
| DELETE | `/api/images/:id` | Delete image |
| GET | `/api/images/:id/download` | Download image file |

### Frontend
- **Page**: `client/src/pages/universal/image-studio.tsx` — Generate form (prompt, negative prompt, style, aspect ratio) + Library grid + Preview modal + Stats sidebar
- **Server**: `server/image-gen.ts` — Express router, async generation with Supabase storage
- **Navigation**: "Image Studio" nav entry in all 16 verticals (icon: Wand2)
- **API Key**: Set `IMAGE_GEN_API_KEY` env var. Falls back to OpenAI integration key for DALL-E 3.

### Features
- Quick prompt suggestions (6 presets)
- Style presets: Auto, Photorealistic, Digital Art, Illustration, 3D Render, Anime, Watercolor, Oil Painting, Pixel Art, Minimalist
- Aspect ratios: 1:1, 16:9, 9:16, 4:3, 3:4
- Library with status filters (All/Completed/Pending/Failed)
- Full preview modal with prev/next navigation, copy prompt, download, delete
- Auto-polling while images are pending (3s interval)
- Generation stats sidebar

## Client Portal System (Mar 2026)

Client-facing portal prototype accessible via vertical switcher under "Client Portals" section. Uses separate layout (`PortalLayout`) without TopNavigation/AnnouncementBanner/AIChatWidget.

### Architecture
- Routes: `/portal/legalnations/*` — detected via `loc.startsWith("/portal/")` in App.tsx
- Layout: `client/src/components/portal/portal-layout.tsx` — **top navigation** (no sidebar) with "LN" text logo in blue, horizontal nav links, user avatar, Preview Mode badge, mobile nav row
- Router: `PortalRouter` function in App.tsx (separate from main `Router`)
- Mock data: `client/src/lib/mock-data-portal-legalnations.ts` — client profile (Rajesh Kumar), 2 companies, documents, invoices, messages
- Spacing: `px-4 sm:px-8 lg:px-24` responsive (matching PageShell at lg breakpoint)

### Portal Pages (5)
| Page | Route | File |
|------|-------|------|
| Dashboard | `/portal/legalnations` | `client/src/pages/portal/legalnations/dashboard.tsx` |
| Companies | `/portal/legalnations/companies` | `client/src/pages/portal/legalnations/companies.tsx` |
| Documents | `/portal/legalnations/documents` | `client/src/pages/portal/legalnations/documents.tsx` |
| Invoices | `/portal/legalnations/invoices` | `client/src/pages/portal/legalnations/invoices.tsx` |
| Messages | `/portal/legalnations/messages` | `client/src/pages/portal/legalnations/messages.tsx` |

### Navigation Entry
- Vertical switcher (`vertical-switcher.tsx`) has two portal categories:
  - **Client Portals**: LegalNations entry (navigates to `/portal/legalnations`)
  - **Vendor Portals**: Vendor Portal entry (navigates to `/vendor/quotations`, uses main app layout)
- Portals are flagged with `isPortal: true` in verticals-config and filtered out of "Business Products"
- LegalNations portal top nav has LogOut icon button navigating back to `/hr`
- "Preview Mode" badge shown at top of portal pages
