# TeamSync - HR Management Portal

## Overview
A custom HR Management Portal branded as TeamSync. Focused on perfect UI/UX inspired by Dropship.io design system, standardized components, comprehensive CRUD operations, and recruiter-ready functionality. Uses DiceBear Micah avatars for people and DiceBear Glass avatars for non-human entities (departments, documents).

## Tech Stack
- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn UI, Wouter (routing), motion/react (animations)
- **Backend**: Express.js (Node.js)
- **State**: In-memory (frontend state management with React useState)
- **Fonts**: Plus Jakarta Sans (headings), Inter (body) — Google Fonts
- **Design System**: Dropship.io-inspired brand tokens (documented in Style Guide page)

## Architecture

### Frontend Structure
```
client/src/
  components/
    layout/
      app-sidebar.tsx    - Navigation sidebar with Main Menu + Design System groups
      topbar.tsx         - Top header bar with search, notifications, user menu
      page-header.tsx    - Reusable page header with title + actions
      announcement-banner.tsx - Full-width blue announcement bar at top of app, dismissible per session
    hr/
      data-table.tsx     - Reusable data table with search, filters, pagination, row actions, empty state illustrations
      status-badge.tsx   - Status badge component with auto-variant mapping
      stats-card.tsx     - Dashboard stats card
      form-dialog.tsx    - Reusable form dialog for CRUD operations
      empty-state.tsx    - Reusable empty state with illustration, messaging, and action button
      page-banner.tsx    - Full-width branded banner with 3D icon, title, description, optional action
      document-preview-modal.tsx - Document preview modal with prev/next navigation, renders PDF/DOCX/XLSX/certificate previews
    ui/
      animated.tsx       - Animation primitives (Fade, Scale, Slide, Stagger, StaggerItem, PageTransition, AnimatedList) using motion/react
      spinner.tsx        - Spinner (5 sizes), PageSpinner (centered with label), InlineSpinner (for buttons)
      table-skeleton.tsx - Skeleton mimicking DataTable layout (header + rows + pagination)
      card-skeleton.tsx  - CardSkeleton, StatsCardSkeleton
      skeleton.tsx       - Base Skeleton component (pulse animation)
      toaster.tsx        - Custom toast renderer (bottom-right, slide-in/out animations)
      ...                - Shadcn UI components
  pages/
    dashboard.tsx        - Overview with stats, charts, recent activity
    employees.tsx        - Employee management with full CRUD
    candidates.tsx       - Recruitment pipeline management
    departments.tsx      - Department/org structure management
    job-postings.tsx     - Job posting management
    leave-management.tsx - Leave request management with approve/reject
    attendance.tsx       - Attendance tracking with daily records
    documents.tsx        - Document management
    style-guide.tsx      - Design System style guide (Typography, Colors, Shadow tabs)
    components-guide.tsx - Component library (Buttons, Forms, Components, Logos & Cursors, Badges, Avatar tabs)
    icons-guide.tsx      - Icon library with search (lucide-react icons organized by category)
    not-found.tsx        - 404 page with illustration
  assets/
    illustrations/       - AI-generated empty state illustrations (background-less PNGs)
  hooks/
    use-toast.ts         - Toast system (showSuccess/showError/showInfo/showWarning + legacy toast())
    use-simulated-loading.ts - Simulated loading hook (500ms delay for demo skeletons)
  lib/
    mock-data.ts         - Realistic mock data for all modules (includes documentPreviews)
    avatars.ts           - DiceBear avatar helpers (Micah for people, Glass for entities)
```

### Sidebar Navigation
- **Main Menu**: Dashboard, Employees, Candidates, Departments, Job Postings, Leave Management, Attendance, Documents
- **Design System**: Style Guide (`/dev/style-guide`), Components (`/dev/components`), Icons (`/dev/icons`)

## Design System Foundation (Dropship.io Tokens)

### CSS Variable Mapping
All Dropship.io tokens are mapped to standard Shadcn CSS custom properties in `client/src/index.css`. Every Shadcn/Tailwind component automatically uses the correct colors, shadows, and spacing via `hsl(var(--token))`. Shadcn UI components use standard code with branding applied only through CSS variables and minimal shadow additions on buttons. No custom elevate system or border-intensity system — pure standard Shadcn patterns.

| CSS Variable | Token | Hex |
|---|---|---|
| `--primary` | Primary 500 (Dropship Blue) | #225AEA |
| `--background` | Background | #FFFFFF |
| `--foreground` | Text Primary | #151E3A |
| `--border` | Border | #E2E6F3 |
| `--muted` | Muted | #F2F3F8 |
| `--muted-foreground` | Muted Text | ~#7A8299 |
| `--secondary` | Secondary | #F2F3F8 |
| `--secondary-foreground` | Secondary Text | #151E3A |
| `--accent` | Accent | #F8F9FC |
| `--input` | Input Border | #E2E6F3 |
| `--sidebar-background` | Sidebar Bg | #F8F9FC |

Shadows use `rgba(21,30,58,...)` base color (from `--shadow-xs` through `--shadow-2xl`).
Button shadows: `--shadow-btn-primary` (blue inset glow), `--shadow-btn-secondary` (subtle ring shadow).

### Status Colors (Semantic — separate from brand palette)
Status badges and change indicators use Tailwind semantic colors intentionally distinct from the brand palette:
- **Success**: `emerald` (Active, Present, Approved, Hired, Open)
- **Error**: `red` (Inactive, Absent, Rejected, Closed)
- **Warning**: `amber` (On Leave, Half Day, Pending)
- **Info**: `blue` (Interview, Screening, Notice Period)
- **Neutral**: `slate` (Contract, Archived, Late)

### Typography
- **Heading Font**: Plus Jakarta Sans (Google Fonts) — `font-heading` Tailwind class. Applied globally via `DialogTitle`, `AlertDialogTitle` base components, plus `PageBanner`, `StatsCard`, `Topbar`, sidebar brand, dashboard section headers
- **Body Font**: Inter (Google Fonts) — `font-sans` Tailwind class
- **Heading Weights**: Medium (500), Semibold (600), Bold (700), Extra Bold (800)
- **Body Weights**: Regular (400), Medium (500), Semibold (600)

| Scale | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Display | 64px | Semibold | 80px |
| Heading 1 | 48px | Semibold | 1.2 |
| Heading 2 | 40px | Semibold | 1.2 |
| Heading 3 | 32px | Semibold | 1.4 |
| Heading 4 | 24px | Semibold | 1.5 |
| Heading 5 | 20px | Semibold | 1.4 |
| Heading 6 | 16px | Semibold | 1.5 |
| Body Large | 18px | Regular/Medium | 28px |
| Body Base | 16px | Regular/Medium | 24px |
| Body Small | 14px | Regular/Medium | 20px |
| Body XSmall | 12px | Regular/Medium | 16px |

### Colors — Primary (Dropship Blue)
| Token | Hex |
|-------|------|
| 50 | #EBF1FF |
| 100 | #D6E2FE |
| 200 | #ADC5FD |
| 300 | #84A8FC |
| 400 | #5B8BFB |
| 500 | #225AEA |

### Colors — Greyscale
| Token | Hex |
|-------|------|
| 0 | #FFFFFF |
| 25 | #F8F9FC |
| 50 | #F2F3F8 |
| 100 | #E2E6F3 |
| 200 | #C5CCE3 |
| 300 | #A4ACB9 |
| 400 | #7A8299 |
| 500 | #5A6380 |
| 600 | #36394A |
| 700 | #272835 |
| 800 | #1A1D2E |
| 900 | #151E3A |

### Shadows
| Name | CSS Value |
|------|-----------|
| XSmall | 0px 1px 2px rgba(21,30,58,0.06) |
| Small | 0px 1px 3px rgba(21,30,58,0.05), 0px 1px 2px rgba(21,30,58,0.04) |
| Medium | 0px 5px 10px -2px rgba(21,30,58,0.04), 0px 4px 8px -1px rgba(21,30,58,0.02) |
| Large | 0px 12px 16px -4px rgba(21,30,58,0.08), 0px 4px 6px -2px rgba(21,30,58,0.03) |
| XLarge | 0px 24px 48px -12px rgba(21,30,58,0.12) |
| XXLarge | 0px 24px 48px -12px rgba(21,30,58,0.18) |
| Btn Primary | rgba(0,14,88,0.4) 0px 1px 2px 0px, rgba(34,90,234,0.84) 0px 0px 0px 1px |
| Btn Secondary | rgba(21,30,58,0.12) 0px 1px 2px 0px, rgba(21,30,58,0.12) 0px 0px 0px 1px |

### Border Radius
- Standard Shadcn `rounded-md` (10px from config), `rounded-lg` (12px from config)
- Cards: `rounded-lg` (12px)
- General: `--radius: 0.75rem` (12px)


### Key Components
- **DataTable**: Generic table with search, filters, sorting, pagination, checkboxes, row actions, empty state illustrations
- **StatusBadge**: Auto-maps status strings to success/error/warning/info/neutral color variants
- **FormDialog**: Standard dialog for create/edit forms (scale+fade animation on open)
- **StatsCard**: Dashboard metric card with icon and change indicator
- **EmptyState**: Reusable empty state with illustration, title, description, and optional action button (fade+scale on mount)
- **PageBanner**: Full-width indigo banner with 3D PNG icon (48×48), title, description, optional action button. Used at the top of every HR page. Icons stored in `client/public/3d-icons/`
- **AnnouncementBanner**: Full-width blue bar at the very top of the app (above sidebar + content), dismissible per session via sessionStorage (`announcement-dismissed` key). Slide-down on mount, slide-up on dismiss. Renders in `App.tsx`
- **DocumentPreviewModal**: Full modal for previewing documents — renders mock content by type (PDF sections, DOCX templates, XLSX tables, certificates) with prev/next navigation
- **Spinner/PageSpinner/InlineSpinner**: Loading spinners in 5 sizes (xs→xl). PageSpinner is centered with optional label. InlineSpinner for buttons
- **TableSkeleton/CardSkeleton/StatsCardSkeleton**: Skeleton loading states mimicking real component layouts

### Toast System
- Custom module-level toast store (not React context). 4 semantic types: success (green), error (red), info (blue), warning (amber)
- API: `showSuccess(title, desc?)`, `showError(title, desc?)`, `showInfo(title, desc?)`, `showWarning(title, desc?)`
- Legacy compat: `toast({ title, description, variant })` still works
- Position: fixed bottom-right, auto-dismiss 3s, slide-in/out animation with layout reflow

### Loading States
- All 8 HR pages use `useSimulatedLoading(500)` hook for a brief skeleton flash on mount
- Pages with DataTable show `TableSkeleton` while loading
- Dashboard shows `StatsCardSkeleton` grid + `Skeleton` cards while loading
- In future with DB, these will be replaced by real react-query loading states

### Component Library Reference (Components Page)
- **Buttons**: 5 variants (Primary, Secondary, Outline, Ghost, Destructive) × 3 sizes (lg, default, sm) × states (Default, Hover, Focused, Disabled) + icon-only
- **Forms**: Text Input (Default/Filled/Disabled/Error + icon prefixes), Select/Dropdown, Checkbox, Switch/Toggle
- **Table Components**: Cell types (Avatar+Text, Title+Description, Badge, Button, Plain Text), Header styles
- **Loading**: Spinner sizes (xs→xl), PageSpinner, InlineSpinner, StatsCardSkeleton grid, CardSkeleton variants, TableSkeleton
- **Toasts**: 4 semantic toast types with trigger buttons + static style previews
- **Banner**: PageBanner demo with 3D icon variants + 3D icon gallery (8 icons)
- **Badges**: 5 colors (Neutral/Primary/Green/Yellow/Red) × 3 sizes (Large/Medium/Small) × 2 styles (Fill/Outlined) + Dot and Close icon types
- **Avatars**: 7 sizes (24px→72px), Initials/Icon fallback types, 4 status indicators (Online/Offline/Busy/Away), stacked avatar groups
- **Logos & Cursors**: TeamSync brand mark (Primary, Dark, Icon-only) + 12 cursor type demos

### Icon Library Reference (Icons Page)
- 150+ lucide-react icons organized into 12 categories: Navigation, Actions, Communication, Media, Files, Arrows, Interface, Status, Data, Business, Text, Devices, Misc
- Searchable grid with category grouping

### HR Modules
1. **Dashboard** - Stats overview, recent candidates, pending leaves, attendance summary, dept overview
2. **Employees** - CRUD with department/status filters
3. **Candidates** - Pipeline management with stage progression
4. **Departments** - Organization structure management
5. **Job Postings** - Position management with type/status filters
6. **Leave Management** - Request submission and approval workflow
7. **Attendance** - Daily check-in/out tracking with stats
8. **Documents** - HR document management with categories

### Data Model
All types defined in `shared/schema.ts` with Zod validation schemas.
Currently using frontend state (useState) with mock data. Database integration planned for later phase.

## Animation System
Uses `motion/react` (Framer Motion) for professional, polished animations throughout the app.

### Animation Primitives (`client/src/components/ui/animated.tsx`)
- **Fade**: Opacity 0→1 with optional direction (up/down/left/right) and distance
- **Scale**: Scale 0.95→1 + fade, for mount reveals
- **Slide**: Slide from direction + fade
- **Stagger / StaggerItem**: Container that staggers children's animations (configurable interval)
- **PageTransition**: Route-level wrapper with subtle fade + slide-up (8px, 0.35s)
- **AnimatedList**: Stagger-animated list wrapping each child

### Animation Patterns
- **Page transitions**: Every page wraps scrollable content in `PageTransition` (fade+slide-up on mount)
- **Dashboard**: Stats cards use `Stagger` (50ms apart), section panels use `Fade` with increasing delays (0.15s, 0.25s)
- **Overlays**: Dialog/AlertDialog use motion scale+fade (0.95→1), Sheet slides from edge with spring physics, dropdown/popover/tooltip/select use refined CSS animations
- **Toaster**: AnimatePresence + motion for slide-in from right, slide-out, and layout reflow
- **Sidebar**: Staggered nav items (30ms apart), active indicator with `layoutId` animation
- **Banner**: AnnouncementBanner slides down on mount, slides up on dismiss
- **Buttons**: CSS `active:scale-[0.97]` micro-interaction
- **PageBanner**: Fade+slide-down on mount
- **EmptyState**: Scale+fade on mount

## Running
- `npm run dev` starts both Express backend and Vite frontend dev server
- Frontend served on same port as backend via Vite middleware
