# TeamSync - HR Management Portal

## Overview
A custom HR Management Portal (formerly LUMIN HR, now branded as TeamSync). Focused on perfect UI/UX, standardized components, comprehensive CRUD operations, and recruiter-ready functionality. Uses DiceBear Micah avatars for people and DiceBear Glass avatars for non-human entities (departments, documents).

## Tech Stack
- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn UI, Wouter (routing)
- **Backend**: Express.js (Node.js)
- **State**: In-memory (frontend state management with React useState)
- **Font**: Inter (Google Fonts)
- **Design System**: LUMIN brand tokens (documented in Style Guide page)

## Architecture

### Frontend Structure
```
client/src/
  components/
    layout/
      app-sidebar.tsx    - Navigation sidebar with Main Menu + Design System groups
      topbar.tsx         - Top header bar with search, notifications, user menu
      page-header.tsx    - Reusable page header with title + actions
    hr/
      data-table.tsx     - Reusable data table with search, filters, pagination, row actions, empty state illustrations
      status-badge.tsx   - Status badge component with auto-variant mapping
      stats-card.tsx     - Dashboard stats card
      form-dialog.tsx    - Reusable form dialog for CRUD operations
      empty-state.tsx    - Reusable empty state with illustration, messaging, and action button
      page-banner.tsx    - Full-width branded banner with 3D icon, title, description, optional action
      document-preview-modal.tsx - Document preview modal with prev/next navigation, renders PDF/DOCX/XLSX/certificate previews
    ui/
      spinner.tsx        - Spinner (5 sizes), PageSpinner (centered with label), InlineSpinner (for buttons)
      table-skeleton.tsx - Skeleton mimicking DataTable layout (header + rows + pagination)
      card-skeleton.tsx  - CardSkeleton, StatsCardSkeleton
      skeleton.tsx       - Base Skeleton component (pulse animation)
      toaster.tsx        - Custom toast renderer (bottom-right, semantic colors)
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

## Design System Foundation (LUMIN Tokens)

### CSS Variable Mapping
All LUMIN tokens are precisely mapped to CSS custom properties in `client/src/index.css`. Every Shadcn/Tailwind component automatically uses the correct LUMIN colors, shadows, and spacing via `hsl(var(--token))`. The style guide pages are the single source of truth for the design system.

| CSS Variable | LUMIN Token | Hex |
|---|---|---|
| `--primary` | Primary 500 (Indigo) | #4F46E5 |
| `--background` | Greyscale 0 | #F8F9FB |
| `--foreground` | Greyscale 900 | #0D0D12 |
| `--border` | Greyscale 100 | #DFE1E7 |
| `--muted` | Greyscale 50 | #ECEFF3 |
| `--muted-foreground` | Greyscale 400 | #818898 |
| `--secondary` | Greyscale 50 | #ECEFF3 |
| `--secondary-foreground` | Greyscale 600 | #36394A |
| `--accent` | Greyscale 25 | #F6F8FA |
| `--input` | Greyscale 200 | #C1C7D0 |
| `--sidebar` | Greyscale 25 | #F6F8FA |

Shadows use LUMIN tokens: `rgba(13,13,18,...)` base color (from `--shadow-xs` through `--shadow-2xl`).

### Status Colors (Semantic — separate from brand palette)
Status badges and change indicators use Tailwind semantic colors intentionally distinct from the LUMIN brand palette:
- **Success**: `emerald` (Active, Present, Approved, Hired, Open)
- **Error**: `red` (Inactive, Absent, Rejected, Closed)
- **Warning**: `amber` (On Leave, Half Day, Pending)
- **Info**: `blue` (Interview, Screening, Notice Period)
- **Neutral**: `slate` (Contract, Archived, Late)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: Regular (400), Medium (500), Semibold (600)

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

### Colors — Primary (Indigo)
| Token | Hex |
|-------|------|
| 50 | #EEF2FF |
| 100 | #E0E7FF |
| 200 | #C7D2FE |
| 300 | #A5B4FC |
| 400 | #818CF8 |
| 500 | #4F46E5 |

### Colors — Greyscale
| Token | Hex |
|-------|------|
| 0 | #F8F9FB |
| 25 | #F6F8FA |
| 50 | #ECEFF3 |
| 100 | #DFE1E7 |
| 200 | #C1C7D0 |
| 300 | #A4ACB9 |
| 400 | #818898 |
| 500 | #666D80 |
| 600 | #36394A |
| 700 | #272835 |
| 800 | #1A1B25 |
| 900 | #0D0D12 |

### Shadows
| Name | CSS Value |
|------|-----------|
| XSmall | 0px 1px 2px rgba(13,13,18,0.06) |
| Small | 0px 1px 3px rgba(13,13,18,0.05), 0px 1px 2px rgba(13,13,18,0.04) |
| Medium | 0px 5px 10px -2px rgba(13,13,18,0.04), 0px 4px 8px -1px rgba(13,13,18,0.02) |
| Large | 0px 12px 16px -4px rgba(13,13,18,0.08), 0px 4px 6px -2px rgba(13,13,18,0.03) |
| XLarge | 0px 24px 48px -12px rgba(13,13,18,0.12) |
| XXLarge | 0px 24px 48px -12px rgba(13,13,18,0.18) |


### Key Components
- **DataTable**: Generic table with search, filters, sorting, pagination, checkboxes, row actions, empty state illustrations
- **StatusBadge**: Auto-maps status strings to success/error/warning/info/neutral color variants
- **FormDialog**: Standard dialog for create/edit forms (no popup animations)
- **StatsCard**: Dashboard metric card with icon and change indicator
- **EmptyState**: Reusable empty state with illustration, title, description, and optional action button
- **PageBanner**: Full-width indigo banner with 3D PNG icon (48×48), title, description, optional action button. Used at the top of every HR page. Icons stored in `client/public/3d-icons/`
- **DocumentPreviewModal**: Full modal for previewing documents — renders mock content by type (PDF sections, DOCX templates, XLSX tables, certificates) with prev/next navigation
- **Spinner/PageSpinner/InlineSpinner**: Loading spinners in 5 sizes (xs→xl). PageSpinner is centered with optional label. InlineSpinner for buttons
- **TableSkeleton/CardSkeleton/StatsCardSkeleton**: Skeleton loading states mimicking real component layouts

### Toast System
- Custom module-level toast store (not React context). 4 semantic types: success (green), error (red), info (blue), warning (amber)
- API: `showSuccess(title, desc?)`, `showError(title, desc?)`, `showInfo(title, desc?)`, `showWarning(title, desc?)`
- Legacy compat: `toast({ title, description, variant })` still works
- Position: fixed bottom-right, auto-dismiss 3s, no animations (user preference)

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

## Running
- `npm run dev` starts both Express backend and Vite frontend dev server
- Frontend served on same port as backend via Vite middleware
