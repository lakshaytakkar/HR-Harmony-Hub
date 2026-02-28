export interface DevPrompt {
  id: string;
  title: string;
  content: string;
  category: "agent" | "frontend" | "backend" | "database" | "debug";
  tags: string[];
  model: "claude" | "gpt" | "replit-agent";
  lastUsed: string;
  createdDate: string;
  isFavorite: boolean;
}

export interface DevResource {
  id: string;
  title: string;
  description: string;
  category: "process" | "learning" | "playbook" | "workflow";
  tags: string[];
  createdDate: string;
  updatedDate: string;
  content: string;
}

export interface AppCredential {
  id: string;
  appName: string;
  url: string;
  category: "hosting" | "database" | "ai" | "payment" | "analytics" | "other";
  status: "active" | "expired" | "pending";
  environment: "production" | "staging" | "dev";
  apiKeyHint: string;
  notes: string;
  addedDate: string;
  iconName: string;
}

export interface ImportantLink {
  id: string;
  title: string;
  url: string;
  category: "tool" | "docs" | "dashboard" | "repo";
  description: string;
  iconName: string;
  isPinned: boolean;
}

export interface QuickTool {
  id: string;
  name: string;
  description: string;
  category: "payment" | "utility" | "generator";
  status: "ready" | "wip" | "planned";
  route: string;
  vertical: string;
  iconName: string;
}

export interface DevProject {
  id: string;
  name: string;
  key: string;
  description: string;
  color: string;
  status: "active" | "paused" | "completed" | "archived";
  owner: string;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  createdDate: string;
  updatedDate: string;
}

export interface DevTaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DevTaskComment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface DevTaskAttachment {
  name: string;
  type: string;
  size: string;
}

export interface DevTask {
  id: string;
  projectId: string;
  projectKey: string;
  title: string;
  description: string;
  status: "backlog" | "todo" | "in-progress" | "in-review" | "done" | "cancelled";
  priority: "critical" | "high" | "medium" | "low";
  type: "feature" | "bug" | "improvement" | "task" | "story";
  assignee: string;
  reporter: string;
  tags: string[];
  dueDate: string;
  createdDate: string;
  updatedDate: string;
  storyPoints: number;
  sprintId?: string;
  subtasks: DevTaskSubtask[];
  comments: DevTaskComment[];
  attachments: DevTaskAttachment[];
}

export interface DevSprint {
  id: string;
  name: string;
  projectId: string;
  status: "active" | "planned" | "completed";
  startDate: string;
  endDate: string;
  taskIds: string[];
}

export const devPrompts: DevPrompt[] = [
  { id: "PRM-001", title: "Full-stack page scaffold", content: "Create a new page for [feature]. Use the existing DataTable component for the main table, StatsCard for KPIs at the top, and StatusBadge for status columns. Follow the pattern in sales/dashboard.tsx. Include: simulated loading with useSimulatedLoading hook, Stagger/Fade animations, proper data-testid attributes on all interactive elements. Use mock data from the mock-data file — do not create a backend endpoint.", category: "agent", tags: ["scaffold", "page", "pattern"], model: "replit-agent", lastUsed: "2026-02-26", createdDate: "2025-12-15", isFavorite: true },
  { id: "PRM-002", title: "Shadcn component integration", content: "Install and integrate the [component] from shadcn/ui. Follow the project conventions: import from @/components/ui/[name], use Plus Jakarta Sans font only, ensure dark mode support with explicit light/dark variants, add data-testid attributes. Do not modify vite.config.ts or package.json directly.", category: "frontend", tags: ["shadcn", "component", "ui"], model: "replit-agent", lastUsed: "2026-02-24", createdDate: "2025-12-20", isFavorite: true },
  { id: "PRM-003", title: "DataTable with filters pattern", content: "Build a DataTable page with the following columns: [columns]. Add filter dropdowns for [filters]. Include stats cards above the table showing computed counts. Use the existing DataTable component from @/components/hr/data-table — it supports search, columnDefs with render functions, sorting, and pagination. See clients.tsx for the reference pattern.", category: "frontend", tags: ["datatable", "filters", "pattern"], model: "claude", lastUsed: "2026-02-25", createdDate: "2026-02-01", isFavorite: true },
  { id: "PRM-004", title: "Mock data generation", content: "Generate realistic mock data for [entity] with these fields: [fields]. Create 15-20 records with varied data. Use realistic names, dates within the last 3 months, and proper status distributions (not all the same status). Export as a typed array from client/src/lib/mock-data-[vertical].ts. Include the TypeScript interface definition.", category: "agent", tags: ["mock-data", "typescript", "generation"], model: "replit-agent", lastUsed: "2026-02-27", createdDate: "2026-02-05", isFavorite: false },
  { id: "PRM-005", title: "Debug React rendering issue", content: "I'm seeing [error/behavior]. The component is [component name] in [file path]. It renders [description]. Check for: 1) Missing key props in lists, 2) State updates during render, 3) useEffect dependency array issues, 4) Conditional rendering logic errors. Show me the root cause and fix.", category: "debug", tags: ["react", "rendering", "debug"], model: "claude", lastUsed: "2026-02-20", createdDate: "2026-02-10", isFavorite: false },
  { id: "PRM-006", title: "Drizzle schema + storage pattern", content: "Create a Drizzle schema for [entity] in shared/schema.ts. Include: table definition with pgTable, insert schema with createInsertSchema from drizzle-zod using .omit for auto-generated fields, insert type with z.infer, select type with $inferSelect. Then update IStorage interface in server/storage.ts with CRUD methods and implement in MemStorage class.", category: "backend", tags: ["drizzle", "schema", "storage"], model: "replit-agent", lastUsed: "2026-02-18", createdDate: "2025-12-25", isFavorite: true },
  { id: "PRM-007", title: "SQL query for analytics", content: "Write a PostgreSQL query to [analytics goal]. Consider: proper JOINs, GROUP BY with aggregation, date range filtering with date_trunc, window functions for running totals or rankings. Return results in a format suitable for chart rendering (labels + values arrays).", category: "database", tags: ["sql", "analytics", "postgres"], model: "claude", lastUsed: "2026-02-15", createdDate: "2026-02-08", isFavorite: false },
  { id: "PRM-008", title: "Vertical rebuild plan", content: "Plan a complete rebuild of the [vertical name] vertical. Current pages: [list]. New domain: [domain description]. I need: 1) New navigation structure with categories and sub-pages, 2) New mock data interfaces and sample data, 3) Page-by-page specification with components to use, 4) Route cleanup (old pages to delete, new routes to add). Output as a structured session plan with tasks and dependencies.", category: "agent", tags: ["planning", "vertical", "rebuild"], model: "replit-agent", lastUsed: "2026-02-27", createdDate: "2026-02-20", isFavorite: true },
  { id: "PRM-009", title: "Animation pattern for page transitions", content: "Add page transition animations to [page]. Use the existing motion/react setup: wrap the page content in PageTransition, use Stagger for lists of cards, Fade for individual elements. The pattern is: import { PageTransition, Stagger, Fade } from '@/components/ui/animated'. Use staggerDelay={0.05} for card grids, staggerDelay={0.03} for table rows.", category: "frontend", tags: ["animation", "motion", "transitions"], model: "claude", lastUsed: "2026-02-22", createdDate: "2026-02-12", isFavorite: false },
  { id: "PRM-010", title: "Express API endpoint pattern", content: "Create a REST API endpoint at /api/[resource]. Use Express router in server/routes.ts. Validate request body with Zod schema from shared/schema.ts. Call storage interface methods for CRUD. Return proper HTTP status codes (201 for create, 200 for read/update, 204 for delete). Handle errors with try/catch and 500 responses.", category: "backend", tags: ["express", "api", "rest"], model: "replit-agent", lastUsed: "2026-02-16", createdDate: "2025-12-30", isFavorite: false },
  { id: "PRM-011", title: "Kanban board component", content: "Build a kanban board view for [entity] with columns: [columns]. Each card shows: [card fields]. Use a grid layout with overflow-x-auto for horizontal scrolling. Each column is a Card with a header showing column name and count badge. Cards inside are draggable-looking (shadow, rounded corners, compact layout). Include a toggle to switch between Kanban and Table views using Tabs.", category: "frontend", tags: ["kanban", "board", "component"], model: "claude", lastUsed: "2026-02-25", createdDate: "2026-02-15", isFavorite: true },
  { id: "PRM-012", title: "Code review prompt", content: "Review the following code changes for: 1) Missing imports or broken references, 2) TypeScript type safety issues, 3) Proper data-testid coverage on interactive elements, 4) Security concerns (no secrets in client code), 5) Component reuse (are we duplicating existing components?), 6) Consistent patterns with the rest of the codebase. Provide severity-ranked findings.", category: "agent", tags: ["review", "quality", "audit"], model: "claude", lastUsed: "2026-02-27", createdDate: "2026-02-18", isFavorite: false },
];

export const devResources: DevResource[] = [
  { id: "RES-001", title: "Vertical Rebuild Process", description: "Step-by-step process for rebuilding a vertical from scratch", category: "process", tags: ["vertical", "rebuild", "planning"], createdDate: "2026-02-20", updatedDate: "2026-02-27", content: "1. Analyze the target domain and identify core entities\n2. Define navigation structure (L1 categories, L2 sub-pages)\n3. Create TypeScript interfaces in shared/schema.ts\n4. Generate realistic mock data (15-20 records per entity)\n5. Update verticals-config.ts with new nav\n6. Build pages using existing component library (DataTable, StatsCard, etc.)\n7. Update App.tsx routes\n8. Delete old page files\n9. Run architect code review\n10. Update replit.md documentation" },
  { id: "RES-002", title: "Shadcn Component Best Practices", description: "Patterns and pitfalls when using shadcn/ui components", category: "learning", tags: ["shadcn", "ui", "components"], createdDate: "2025-12-20", updatedDate: "2026-02-15", content: "Key learnings:\n- Always import from @/components/ui/[name]\n- SelectItem must have a value prop or it throws\n- useForm from shadcn wraps react-hook-form, pass defaultValues\n- useToast is exported from @/hooks/use-toast (not @/components/ui)\n- Button does not support custom hover color classes\n- Badge variants map to semantic meaning, not raw colors" },
  { id: "RES-003", title: "Parallel Subagent Delegation", description: "How to use subagents for parallel task execution", category: "playbook", tags: ["subagent", "delegation", "parallel"], createdDate: "2026-02-15", updatedDate: "2026-02-27", content: "Use startAsyncSubagent for independent tasks that can run in parallel. Use subagent (sync) for sequential tasks. Always pass relevantFiles to avoid wasted search time. Wait with wait_for_background_tasks. Never start a task with incomplete blockers. Subagents cannot delegate further — handle skill-dependent work yourself (database, env secrets, etc.)." },
  { id: "RES-004", title: "Mock Data Conventions", description: "Standards for generating realistic mock data", category: "process", tags: ["mock-data", "conventions", "standards"], createdDate: "2026-02-01", updatedDate: "2026-02-25", content: "Rules:\n- Use realistic names (mix of cultures/regions)\n- Dates within last 3 months for active records\n- Status distributions should be varied (not all 'active')\n- IDs follow pattern: PREFIX-001, PREFIX-002\n- Include edge cases (overdue items, missing fields, at-risk flags)\n- Export typed arrays with explicit TypeScript interfaces\n- Keep in client/src/lib/mock-data-[vertical].ts" },
  { id: "RES-005", title: "Page Layout Pattern", description: "Standard page layout structure used across all verticals", category: "playbook", tags: ["layout", "pattern", "page"], createdDate: "2025-12-25", updatedDate: "2026-02-20", content: "Every page follows this structure:\n1. Stats cards row (StatsCard components with AnimatedNumber)\n2. Filter bar (dropdowns, search)\n3. Main content (DataTable, card grid, or kanban)\n4. Wrap in PageTransition for enter animation\n5. Use Stagger for card lists, Fade for individual elements\n6. useSimulatedLoading hook for skeleton states\n7. data-testid on all interactive elements" },
  { id: "RES-006", title: "TypeScript Strict Mode Workarounds", description: "Common TypeScript issues and how to handle them in this project", category: "learning", tags: ["typescript", "strict", "workarounds"], createdDate: "2026-02-10", updatedDate: "2026-02-26", content: "Known issues:\n- Set iteration requires Array.from(new Set(...)) instead of spread\n- Implicit 'any' warnings are normal in strict mode, don't block compilation\n- Import types with 'import type' for interfaces\n- Drizzle .array() must be called as method, not wrapper\n- Use z.infer<typeof schema> for insert types\n- Avoid importing React explicitly (Vite JSX transform handles it)" },
  { id: "RES-007", title: "Git Workflow for TeamSync", description: "How version control and checkpoints work in Replit", category: "workflow", tags: ["git", "replit", "checkpoints"], createdDate: "2025-12-15", updatedDate: "2026-02-20", content: "Replit auto-commits at task boundaries. Destructive git commands are blocked. Use read-only git commands for history. Checkpoints include: codebase, chat session, and databases. If a mistake is hard to undo, suggest rollback to previous checkpoint via diagnostics skill." },
  { id: "RES-008", title: "Navigation Config Pattern", description: "How the multi-vertical navigation system works", category: "playbook", tags: ["navigation", "vertical", "config"], createdDate: "2026-02-05", updatedDate: "2026-02-27", content: "Each vertical defines navCategories[] in verticals-config.ts. L1 is rendered as top tabs. L2 appears as a sub-bar when a category with items[] is active. detectVerticalFromUrl maps URL prefixes to verticals. VerticalSync watches location and updates context. VerticalSwitcher navigates to target vertical's first defaultUrl. Both nav bars use rounded-xl border bg-background within px-16 lg:px-24 wrappers." },
];

export const appCredentials: AppCredential[] = [
  { id: "CRD-001", appName: "Replit", url: "https://replit.com", category: "hosting", status: "active", environment: "production", apiKeyHint: "••••7x4f", notes: "Primary development and hosting platform. Hacker plan.", addedDate: "2025-12-10", iconName: "SiReplit" },
  { id: "CRD-002", appName: "Supabase", url: "https://supabase.com", category: "database", status: "active", environment: "production", apiKeyHint: "••••kQ9m", notes: "PostgreSQL database, auth, and storage. Free tier.", addedDate: "2025-12-12", iconName: "SiSupabase" },
  { id: "CRD-003", appName: "Claude API (Anthropic)", url: "https://console.anthropic.com", category: "ai", status: "active", environment: "production", apiKeyHint: "••••Wp3r", notes: "Claude 3.5 Sonnet for code generation and analysis.", addedDate: "2025-12-15", iconName: "SiAnthropic" },
  { id: "CRD-004", appName: "Stripe", url: "https://dashboard.stripe.com", category: "payment", status: "pending", environment: "dev", apiKeyHint: "••••test", notes: "Payment processing — test mode only for now.", addedDate: "2026-02-01", iconName: "SiStripe" },
  { id: "CRD-005", appName: "Vercel", url: "https://vercel.com", category: "hosting", status: "active", environment: "staging", apiKeyHint: "••••Nj8k", notes: "Staging deployments for client previews.", addedDate: "2025-12-20", iconName: "SiVercel" },
  { id: "CRD-006", appName: "GitHub", url: "https://github.com", category: "other", status: "active", environment: "production", apiKeyHint: "••••ghp_", notes: "Source code repositories and CI/CD.", addedDate: "2025-12-10", iconName: "SiGithub" },
  { id: "CRD-007", appName: "OpenAI", url: "https://platform.openai.com", category: "ai", status: "active", environment: "production", apiKeyHint: "••••sk-p", notes: "GPT-4o for content generation and embeddings.", addedDate: "2025-12-18", iconName: "SiOpenai" },
  { id: "CRD-008", appName: "PostHog", url: "https://app.posthog.com", category: "analytics", status: "expired", environment: "production", apiKeyHint: "••••phc_", notes: "Product analytics — free tier expired, needs renewal.", addedDate: "2025-12-25", iconName: "SiPosthog" },
  { id: "CRD-009", appName: "Resend", url: "https://resend.com", category: "other", status: "active", environment: "production", apiKeyHint: "••••re_l", notes: "Transactional email service for notifications.", addedDate: "2026-02-05", iconName: "SiResend" },
  { id: "CRD-010", appName: "Cloudflare", url: "https://dash.cloudflare.com", category: "hosting", status: "active", environment: "production", apiKeyHint: "••••cf_x", notes: "DNS management and CDN for custom domains.", addedDate: "2026-02-10", iconName: "SiCloudflare" },
];

export const importantLinks: ImportantLink[] = [
  { id: "LNK-001", title: "Replit Workspace", url: "https://replit.com/@team/teamsync", category: "dashboard", description: "Main development workspace for TeamSync", iconName: "SiReplit", isPinned: true },
  { id: "LNK-002", title: "Supabase Dashboard", url: "https://supabase.com/dashboard", category: "dashboard", description: "Database management, auth config, and storage", iconName: "SiSupabase", isPinned: true },
  { id: "LNK-003", title: "GitHub Repository", url: "https://github.com/team/teamsync", category: "repo", description: "Source code repository with CI/CD workflows", iconName: "SiGithub", isPinned: true },
  { id: "LNK-004", title: "Shadcn UI Docs", url: "https://ui.shadcn.com", category: "docs", description: "Component library documentation and installation guides", iconName: "BookOpen", isPinned: true },
  { id: "LNK-005", title: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs", category: "docs", description: "Utility-first CSS framework reference", iconName: "SiTailwindcss", isPinned: false },
  { id: "LNK-006", title: "Lucide Icons", url: "https://lucide.dev/icons", category: "docs", description: "Icon library used throughout the project", iconName: "Smile", isPinned: false },
  { id: "LNK-007", title: "Stripe Dashboard", url: "https://dashboard.stripe.com", category: "dashboard", description: "Payment processing dashboard and API keys", iconName: "SiStripe", isPinned: false },
  { id: "LNK-008", title: "Vercel Dashboard", url: "https://vercel.com/dashboard", category: "dashboard", description: "Staging deployment management", iconName: "SiVercel", isPinned: false },
  { id: "LNK-009", title: "Anthropic Console", url: "https://console.anthropic.com", category: "dashboard", description: "Claude API usage, billing, and key management", iconName: "SiAnthropic", isPinned: true },
  { id: "LNK-010", title: "Drizzle ORM Docs", url: "https://orm.drizzle.team", category: "docs", description: "TypeScript ORM for PostgreSQL schema and queries", iconName: "Database", isPinned: false },
  { id: "LNK-011", title: "Replit Docs", url: "https://docs.replit.com", category: "docs", description: "Replit platform documentation, deployments, and features", iconName: "SiReplit", isPinned: false },
  { id: "LNK-012", title: "Wouter Router", url: "https://github.com/molefrog/wouter", category: "docs", description: "Minimalist React router used for client-side routing", iconName: "Navigation", isPinned: false },
  { id: "LNK-013", title: "Figma Design Files", url: "https://figma.com/team/teamsync", category: "tool", description: "UI/UX design files and component specs", iconName: "SiFigma", isPinned: true },
  { id: "LNK-014", title: "PostHog Analytics", url: "https://app.posthog.com", category: "dashboard", description: "Product analytics and user behavior tracking", iconName: "SiPosthog", isPinned: false },
  { id: "LNK-015", title: "Notion Workspace", url: "https://notion.so/team", category: "tool", description: "Team documentation, meeting notes, and project specs", iconName: "SiNotion", isPinned: false },
];

export const quickTools: QuickTool[] = [
  { id: "QT-001", name: "Razorpay Link Generator", description: "Generate payment links with customizable amount, description, and expiry. Supports partial payments and UPI auto-collect.", category: "payment", status: "ready", route: "/dev/tools/razorpay-link", vertical: "ets", iconName: "CreditCard" },
  { id: "QT-002", name: "UPI QR Generator", description: "Create UPI QR codes for any VPA with optional amount and transaction note. Downloads as PNG.", category: "payment", status: "ready", route: "/dev/tools/upi-qr", vertical: "dev", iconName: "ScanLine" },
  { id: "QT-003", name: "Invoice PDF Generator", description: "Generate branded PDF invoices from order data with GST calculations, line items, and company letterhead.", category: "generator", status: "wip", route: "/dev/tools/invoice-pdf", vertical: "ets", iconName: "FileText" },
  { id: "QT-004", name: "Shipping Label Generator", description: "Create courier-ready shipping labels with barcode, sender/receiver address, and weight dimensions.", category: "generator", status: "planned", route: "/dev/tools/shipping-label", vertical: "ets", iconName: "Package" },
  { id: "QT-005", name: "GST Calculator", description: "Calculate GST breakup (CGST + SGST or IGST) for any amount. Supports reverse calculation and HSN lookup.", category: "utility", status: "ready", route: "/dev/tools/gst-calc", vertical: "dev", iconName: "Calculator" },
  { id: "QT-006", name: "Color Palette Generator", description: "Generate accessible color palettes from a base hex color. Outputs Tailwind config-ready HSL values.", category: "utility", status: "ready", route: "/dev/tools/color-palette", vertical: "dev", iconName: "Palette" },
  { id: "QT-007", name: "WhatsApp API Tester", description: "Test WhatsApp Business API message templates with variable substitution and preview.", category: "utility", status: "wip", route: "/dev/tools/whatsapp-tester", vertical: "ets", iconName: "MessageSquare" },
];

export const devProjects: DevProject[] = [
  { id: "proj-ts", name: "TeamSync Portal", key: "TS", description: "Multi-vertical team portal with 6 branded products — the main monorepo powering all verticals", color: "#6366F1", status: "active", owner: "Lakshay Takkar", memberCount: 4, taskCount: 12, completedTaskCount: 5, createdDate: "2025-12-10", updatedDate: "2026-02-27" },
  { id: "proj-ln", name: "LegalNations", key: "LN", description: "B2B SaaS platform for US company formation — formation pipeline, compliance tracking, document vault", color: "#2563EB", status: "active", owner: "Lakshay Takkar", memberCount: 3, taskCount: 8, completedTaskCount: 6, createdDate: "2025-12-15", updatedDate: "2026-02-25" },
  { id: "proj-ud", name: "USDrop AI", key: "UD", description: "D2C dropshipping SaaS with AI-powered product research, supplier matching, and store automation", color: "#8B5CF6", status: "active", owner: "Lakshay Takkar", memberCount: 2, taskCount: 6, completedTaskCount: 1, createdDate: "2026-02-01", updatedDate: "2026-02-26" },
  { id: "proj-gt", name: "GoyoTours", key: "GT", description: "Events and experiences platform — tour packages, bookings, vendor coordination, customer CRM", color: "#F59E0B", status: "paused", owner: "Priya Sharma", memberCount: 2, taskCount: 5, completedTaskCount: 2, createdDate: "2025-12-20", updatedDate: "2026-02-15" },
  { id: "proj-ets", name: "EazyToSell", key: "ETS", description: "Retail franchise operations — client pipeline, pricing engine, order tracking, proposal generation", color: "#F97316", status: "active", owner: "Lakshay Takkar", memberCount: 3, taskCount: 7, completedTaskCount: 4, createdDate: "2026-02-10", updatedDate: "2026-02-28" },
  { id: "proj-int", name: "Internal Tools", key: "INT", description: "Developer utilities, shared components, CI/CD pipelines, and infrastructure tooling", color: "#10B981", status: "active", owner: "Lakshay Takkar", memberCount: 2, taskCount: 4, completedTaskCount: 1, createdDate: "2025-12-05", updatedDate: "2026-02-24" },
];

export const devSprints: DevSprint[] = [
  { id: "spr-ts-1", name: "Sprint 8 — Portal Polish", projectId: "proj-ts", status: "active", startDate: "2026-02-17", endDate: "2026-03-02", taskIds: ["TS-001", "TS-002", "TS-003", "TS-004", "TS-005"] },
  { id: "spr-ts-0", name: "Sprint 7 — ETS Vertical", projectId: "proj-ts", status: "completed", startDate: "2026-02-03", endDate: "2026-02-16", taskIds: ["TS-006", "TS-007", "TS-008"] },
  { id: "spr-ln-1", name: "Sprint 4 — Compliance V2", projectId: "proj-ln", status: "active", startDate: "2026-02-17", endDate: "2026-03-02", taskIds: ["LN-001", "LN-002", "LN-003"] },
  { id: "spr-ets-1", name: "Sprint 2 — Price Engine", projectId: "proj-ets", status: "active", startDate: "2026-02-20", endDate: "2026-03-06", taskIds: ["ETS-001", "ETS-002", "ETS-003", "ETS-004"] },
];

export const devTasks: DevTask[] = [
  {
    id: "TS-001", projectId: "proj-ts", projectKey: "TS", title: "Add project & task management to Developer vertical", description: "Build a Jira/ClickUp-quality project management system inside the Developer vertical with kanban boards, task detail dialogs, and sprint tracking.", status: "in-progress", priority: "high", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["developer", "project-mgmt"], dueDate: "2026-03-01", createdDate: "2026-02-20", updatedDate: "2026-02-27", storyPoints: 13, sprintId: "spr-ts-1",
    subtasks: [{ id: "st-1", title: "Create mock data types and generate data", completed: true }, { id: "st-2", title: "Build Projects list page", completed: false }, { id: "st-3", title: "Build Project Board with kanban view", completed: false }, { id: "st-4", title: "Build Task Detail dialog", completed: false }],
    comments: [{ id: "c-1", author: "Lakshay Takkar", content: "Inspired by Suprans repo task management — will improve with sprint tracking and story points.", date: "2026-02-20" }],
    attachments: [{ name: "jira-reference.png", type: "image/png", size: "340 KB" }],
  },
  {
    id: "TS-002", projectId: "proj-ts", projectKey: "TS", title: "Replace PageBanner with compact headers across all verticals", description: "The PageBanner component takes too much vertical space. Remove it from all pages and rely on the navigation context for page identification.", status: "done", priority: "medium", type: "improvement", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["ui", "cleanup"], dueDate: "2026-02-28", createdDate: "2026-02-25", updatedDate: "2026-02-28", storyPoints: 3, sprintId: "spr-ts-1",
    subtasks: [{ id: "st-5", title: "Find all PageBanner usages", completed: true }, { id: "st-6", title: "Remove from all 15 pages", completed: true }],
    comments: [],
    attachments: [],
  },
  {
    id: "TS-003", projectId: "proj-ts", projectKey: "TS", title: "Add real company logos to Developer Toolkit", description: "Replace generic Lucide icons with react-icons/si logos for Replit, Supabase, GitHub, Stripe, etc. in the Toolkit credentials and links sections.", status: "in-progress", priority: "low", type: "improvement", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["ui", "toolkit"], dueDate: "2026-02-28", createdDate: "2026-02-26", updatedDate: "2026-02-28", storyPoints: 2, sprintId: "spr-ts-1",
    subtasks: [{ id: "st-7", title: "Add iconName to AppCredential interface", completed: true }, { id: "st-8", title: "Update icon rendering in toolkit.tsx", completed: false }],
    comments: [],
    attachments: [],
  },
  {
    id: "TS-004", projectId: "proj-ts", projectKey: "TS", title: "Build Quick Tools staging area in Developer Toolkit", description: "Add a third tab to the Toolkit page for staging working utility tools (Razorpay link gen, UPI QR, GST calc) before deploying to target verticals.", status: "todo", priority: "medium", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["toolkit", "quick-tools"], dueDate: "2026-03-05", createdDate: "2026-02-27", updatedDate: "2026-02-27", storyPoints: 5, sprintId: "spr-ts-1",
    subtasks: [{ id: "st-9", title: "Define QuickTool interface and mock data", completed: true }, { id: "st-10", title: "Build Quick Tools tab UI", completed: false }, { id: "st-11", title: "Add tool launch/preview functionality", completed: false }],
    comments: [{ id: "c-2", author: "Lakshay Takkar", content: "Start with Razorpay and UPI QR — these are the most used tools day to day.", date: "2026-02-27" }],
    attachments: [],
  },
  {
    id: "TS-005", projectId: "proj-ts", projectKey: "TS", title: "Dark mode toggle doesn't persist across page navigation", description: "When switching between verticals, the dark mode preference resets to light mode. Need to check ThemeProvider localStorage sync.", status: "backlog", priority: "medium", type: "bug", assignee: "Lakshay Takkar", reporter: "Priya Sharma", tags: ["dark-mode", "bug"], dueDate: "", createdDate: "2026-02-22", updatedDate: "2026-02-22", storyPoints: 2, sprintId: "spr-ts-1",
    subtasks: [],
    comments: [{ id: "c-3", author: "Priya Sharma", content: "Noticed this while testing GoyoTours. Switching from Events to HR resets the theme.", date: "2026-02-22" }],
    attachments: [],
  },
  {
    id: "TS-006", projectId: "proj-ts", projectKey: "TS", title: "Build EazyToSell vertical — all 10 pages", description: "Complete EazyToSell vertical with Dashboard, Pipeline, Client Detail, Products, Calculator, Orders, Payments, Proposals, WhatsApp Templates, Settings.", status: "done", priority: "critical", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["eazytosell", "vertical"], dueDate: "2026-02-16", createdDate: "2026-02-03", updatedDate: "2026-02-16", storyPoints: 21, sprintId: "spr-ts-0",
    subtasks: [{ id: "st-12", title: "Port price engine from GitHub", completed: true }, { id: "st-13", title: "Create mock data (15 clients, 20 products)", completed: true }, { id: "st-14", title: "Build all 10 pages", completed: true }, { id: "st-15", title: "Register routes and nav config", completed: true }],
    comments: [{ id: "c-4", author: "Lakshay Takkar", content: "Ported priceEngine.ts from the EazyToSell GitHub repo. Full chain: EXW→FOB→CIF→Duty→IGST→Landed→Markup→MRP.", date: "2026-02-10" }],
    attachments: [{ name: "ets-mockup.fig", type: "application/figma", size: "2.1 MB" }],
  },
  {
    id: "TS-007", projectId: "proj-ts", projectKey: "TS", title: "Build Developer vertical — 7 pages", description: "Dashboard, Style Guide, Components Guide, Icons Guide, Prompts, Resources, Toolkit for the internal developer hub.", status: "done", priority: "high", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["developer", "vertical"], dueDate: "2026-02-14", createdDate: "2026-02-05", updatedDate: "2026-02-14", storyPoints: 13, sprintId: "spr-ts-0",
    subtasks: [{ id: "st-16", title: "Create design system pages", completed: true }, { id: "st-17", title: "Build prompts and resources pages", completed: true }],
    comments: [],
    attachments: [],
  },
  {
    id: "TS-008", projectId: "proj-ts", projectKey: "TS", title: "Fix JSX.Element type in resources icon map", description: "ResourcesPage icon map was using React.ReactNode but React is not explicitly imported. Changed to JSX.Element which works with Vite JSX transform.", status: "done", priority: "low", type: "bug", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["typescript", "fix"], dueDate: "2026-02-15", createdDate: "2026-02-14", updatedDate: "2026-02-15", storyPoints: 1, sprintId: "spr-ts-0",
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "TS-009", projectId: "proj-ts", projectKey: "TS", title: "Implement calendar and scheduler components", description: "Build reusable calendar (month/week/day views) and scheduling components. Will be plugged into USDrop AI sales sections.", status: "backlog", priority: "high", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["calendar", "scheduler", "reusable"], dueDate: "", createdDate: "2026-02-26", updatedDate: "2026-02-26", storyPoints: 8,
    subtasks: [{ id: "st-18", title: "Research calendar component libraries", completed: false }, { id: "st-19", title: "Build month view", completed: false }, { id: "st-20", title: "Build week view with time slots", completed: false }],
    comments: [{ id: "c-5", author: "Lakshay Takkar", content: "These will plug into USDrop AI sales section for scheduling demos and follow-ups.", date: "2026-02-26" }],
    attachments: [],
  },
  {
    id: "TS-010", projectId: "proj-ts", projectKey: "TS", title: "Mobile responsive navigation", description: "The dual-bar navigation doesn't work well on mobile. Need hamburger menu, collapsible nav, and responsive vertical switcher.", status: "backlog", priority: "medium", type: "improvement", assignee: "Priya Sharma", reporter: "Lakshay Takkar", tags: ["mobile", "responsive", "nav"], dueDate: "", createdDate: "2026-02-18", updatedDate: "2026-02-18", storyPoints: 5,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "TS-011", projectId: "proj-ts", projectKey: "TS", title: "Add animated number counters to all stat cards", description: "Ensure AnimatedNumber component is used consistently across all StatsCard instances in every vertical.", status: "done", priority: "low", type: "improvement", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["animation", "consistency"], dueDate: "2026-02-20", createdDate: "2026-02-15", updatedDate: "2026-02-20", storyPoints: 2,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "TS-012", projectId: "proj-ts", projectKey: "TS", title: "Standardize data-testid naming across all verticals", description: "Audit all pages and ensure data-testid follows the convention: {action}-{target} for interactive elements, {type}-{content} for display elements.", status: "todo", priority: "low", type: "task", assignee: "Priya Sharma", reporter: "Lakshay Takkar", tags: ["testing", "standards"], dueDate: "2026-03-10", createdDate: "2026-02-25", updatedDate: "2026-02-25", storyPoints: 3,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "LN-001", projectId: "proj-ln", projectKey: "LN", title: "Add multi-state formation support", description: "Currently only supports Delaware. Need to add Wyoming, Nevada, and New Mexico with state-specific fee structures and timelines.", status: "in-progress", priority: "high", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["formation", "multi-state"], dueDate: "2026-03-01", createdDate: "2026-02-17", updatedDate: "2026-02-26", storyPoints: 8, sprintId: "spr-ln-1",
    subtasks: [{ id: "st-21", title: "Add state fee data for WY, NV, NM", completed: true }, { id: "st-22", title: "Update formation pipeline for state selection", completed: false }, { id: "st-23", title: "Update pricing calculator", completed: false }],
    comments: [{ id: "c-6", author: "Lakshay Takkar", content: "Wyoming is the most requested after Delaware. Prioritizing that first.", date: "2026-02-17" }],
    attachments: [],
  },
  {
    id: "LN-002", projectId: "proj-ln", projectKey: "LN", title: "Compliance tracker auto-reminders", description: "Add automatic reminder system for Annual Report deadlines, Registered Agent renewals, and BOI filing due dates.", status: "in-review", priority: "high", type: "feature", assignee: "Ankit Verma", reporter: "Lakshay Takkar", tags: ["compliance", "reminders"], dueDate: "2026-02-28", createdDate: "2026-02-18", updatedDate: "2026-02-27", storyPoints: 5, sprintId: "spr-ln-1",
    subtasks: [{ id: "st-24", title: "Build reminder rules engine", completed: true }, { id: "st-25", title: "Create notification UI", completed: true }, { id: "st-26", title: "Test with edge cases (overdue, same-day)", completed: false }],
    comments: [{ id: "c-7", author: "Ankit Verma", content: "Rules engine is done. Need to test edge cases for same-day deadlines and already-overdue items.", date: "2026-02-27" }],
    attachments: [],
  },
  {
    id: "LN-003", projectId: "proj-ln", projectKey: "LN", title: "Document vault folder organization", description: "Allow clients to organize documents into folders (Formation Docs, Tax Returns, Compliance, etc.) instead of flat list.", status: "todo", priority: "medium", type: "improvement", assignee: "Priya Sharma", reporter: "Lakshay Takkar", tags: ["documents", "ux"], dueDate: "2026-03-05", createdDate: "2026-02-20", updatedDate: "2026-02-20", storyPoints: 5, sprintId: "spr-ln-1",
    subtasks: [{ id: "st-27", title: "Design folder structure UI", completed: false }, { id: "st-28", title: "Add drag-and-drop file moving", completed: false }],
    comments: [],
    attachments: [],
  },
  {
    id: "LN-004", projectId: "proj-ln", projectKey: "LN", title: "EIN application status tracker", description: "Track SS-4 application status with IRS — submitted, processing, received, and link to actual EIN document.", status: "done", priority: "high", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["ein", "tracker"], dueDate: "2026-02-10", createdDate: "2026-02-01", updatedDate: "2026-02-10", storyPoints: 5,
    subtasks: [{ id: "st-29", title: "Add EIN status to formation pipeline", completed: true }, { id: "st-30", title: "Create EIN detail panel", completed: true }],
    comments: [],
    attachments: [],
  },
  {
    id: "LN-005", projectId: "proj-ln", projectKey: "LN", title: "Client onboarding wizard", description: "Step-by-step wizard for new client onboarding — company details, officer information, preferences, payment.", status: "done", priority: "critical", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["onboarding", "wizard"], dueDate: "2026-02-05", createdDate: "2025-12-20", updatedDate: "2026-02-05", storyPoints: 8,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "LN-006", projectId: "proj-ln", projectKey: "LN", title: "Annual report filing automation", description: "Auto-fill annual report forms for Delaware, generate PDF, and track filing status.", status: "done", priority: "high", type: "feature", assignee: "Ankit Verma", reporter: "Lakshay Takkar", tags: ["annual-report", "automation"], dueDate: "2026-02-15", createdDate: "2026-02-01", updatedDate: "2026-02-15", storyPoints: 8,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "LN-007", projectId: "proj-ln", projectKey: "LN", title: "Bulk client import from CSV", description: "Import existing client data from CSV with column mapping, validation, and duplicate detection.", status: "done", priority: "medium", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["import", "csv"], dueDate: "2026-02-12", createdDate: "2026-02-05", updatedDate: "2026-02-12", storyPoints: 3,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "LN-008", projectId: "proj-ln", projectKey: "LN", title: "Payment gateway integration for formation fees", description: "Integrate Stripe for collecting formation fees, registered agent fees, and annual renewal payments.", status: "done", priority: "high", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["payments", "stripe"], dueDate: "2026-02-08", createdDate: "2025-12-25", updatedDate: "2026-02-08", storyPoints: 5,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "UD-001", projectId: "proj-ud", projectKey: "UD", title: "AI product research engine", description: "Build AI-powered product research that analyzes trending products from AliExpress, 1688, and Temu with profit margin calculations.", status: "in-progress", priority: "critical", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["ai", "product-research"], dueDate: "2026-03-10", createdDate: "2026-02-05", updatedDate: "2026-02-26", storyPoints: 13,
    subtasks: [{ id: "st-31", title: "Scraper for product data", completed: true }, { id: "st-32", title: "AI analysis pipeline", completed: false }, { id: "st-33", title: "Results dashboard", completed: false }],
    comments: [{ id: "c-8", author: "Lakshay Takkar", content: "Starting with AliExpress API. Will add 1688 and Temu later.", date: "2026-02-05" }],
    attachments: [],
  },
  {
    id: "UD-002", projectId: "proj-ud", projectKey: "UD", title: "Supplier matching algorithm", description: "Match products to verified suppliers based on price, MOQ, shipping speed, and quality score.", status: "backlog", priority: "high", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["ai", "suppliers"], dueDate: "", createdDate: "2026-02-10", updatedDate: "2026-02-10", storyPoints: 8,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "UD-003", projectId: "proj-ud", projectKey: "UD", title: "Store automation — auto product listing", description: "Automatically create product listings on Shopify/WooCommerce from approved products with AI-generated descriptions.", status: "backlog", priority: "medium", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["automation", "shopify"], dueDate: "", createdDate: "2026-02-12", updatedDate: "2026-02-12", storyPoints: 8,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "UD-004", projectId: "proj-ud", projectKey: "UD", title: "Sales pipeline dashboard", description: "Build a sales pipeline for tracking D2C store leads — demo scheduled, trial, subscribed, churned.", status: "todo", priority: "high", type: "feature", assignee: "Priya Sharma", reporter: "Lakshay Takkar", tags: ["sales", "pipeline"], dueDate: "2026-03-15", createdDate: "2026-02-20", updatedDate: "2026-02-20", storyPoints: 8,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "UD-005", projectId: "proj-ud", projectKey: "UD", title: "Competitor price monitoring", description: "Track competitor prices for same/similar products and alert when significant price changes detected.", status: "backlog", priority: "medium", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["monitoring", "pricing"], dueDate: "", createdDate: "2026-02-15", updatedDate: "2026-02-15", storyPoints: 5,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "UD-006", projectId: "proj-ud", projectKey: "UD", title: "Landing page builder for D2C stores", description: "Drag-and-drop landing page builder with conversion-optimized templates for dropshipping stores.", status: "done", priority: "medium", type: "feature", assignee: "Priya Sharma", reporter: "Lakshay Takkar", tags: ["landing-page", "builder"], dueDate: "2026-02-20", createdDate: "2026-02-08", updatedDate: "2026-02-20", storyPoints: 8,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "GT-001", projectId: "proj-gt", projectKey: "GT", title: "Tour package builder with pricing tiers", description: "Create tour packages with multiple pricing tiers (Budget, Standard, Premium) including accommodation, transport, and activities.", status: "in-progress", priority: "high", type: "feature", assignee: "Priya Sharma", reporter: "Priya Sharma", tags: ["tours", "pricing"], dueDate: "2026-03-05", createdDate: "2026-02-01", updatedDate: "2026-02-20", storyPoints: 8,
    subtasks: [{ id: "st-34", title: "Package creation form", completed: true }, { id: "st-35", title: "Tier pricing calculator", completed: true }, { id: "st-36", title: "Itinerary day planner", completed: false }],
    comments: [],
    attachments: [],
  },
  {
    id: "GT-002", projectId: "proj-gt", projectKey: "GT", title: "Vendor management system", description: "Track hotels, transport providers, guides, and activity vendors with ratings, pricing, and availability.", status: "done", priority: "high", type: "feature", assignee: "Priya Sharma", reporter: "Priya Sharma", tags: ["vendors", "management"], dueDate: "2026-02-10", createdDate: "2025-12-25", updatedDate: "2026-02-10", storyPoints: 5,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "GT-003", projectId: "proj-gt", projectKey: "GT", title: "Booking calendar with availability view", description: "Calendar view showing tour availability, bookings, and capacity for each tour package by date.", status: "todo", priority: "medium", type: "feature", assignee: "Priya Sharma", reporter: "Priya Sharma", tags: ["calendar", "bookings"], dueDate: "2026-03-15", createdDate: "2026-02-15", updatedDate: "2026-02-15", storyPoints: 8,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "GT-004", projectId: "proj-gt", projectKey: "GT", title: "Customer review system", description: "Allow customers to leave reviews for tours with star ratings, photos, and verified booking badges.", status: "backlog", priority: "low", type: "feature", assignee: "Priya Sharma", reporter: "Priya Sharma", tags: ["reviews", "customers"], dueDate: "", createdDate: "2026-02-10", updatedDate: "2026-02-10", storyPoints: 5,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "GT-005", projectId: "proj-gt", projectKey: "GT", title: "WhatsApp itinerary sharing", description: "Generate and share tour itineraries via WhatsApp with day-by-day breakdown and booking links.", status: "done", priority: "medium", type: "feature", assignee: "Priya Sharma", reporter: "Priya Sharma", tags: ["whatsapp", "sharing"], dueDate: "2026-02-15", createdDate: "2026-02-05", updatedDate: "2026-02-15", storyPoints: 3,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "ETS-001", projectId: "proj-ets", projectKey: "ETS", title: "Price engine v2 — dynamic duty rates by category", description: "Current price engine uses a flat duty rate. Need to support per-category duty rates that can be configured in Settings.", status: "in-progress", priority: "high", type: "improvement", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["pricing", "duty"], dueDate: "2026-03-01", createdDate: "2026-02-20", updatedDate: "2026-02-27", storyPoints: 5, sprintId: "spr-ets-1",
    subtasks: [{ id: "st-37", title: "Add category duty rate config to settings", completed: true }, { id: "st-38", title: "Update calculateEtsPrices to accept category", completed: false }],
    comments: [],
    attachments: [],
  },
  {
    id: "ETS-002", projectId: "proj-ets", projectKey: "ETS", title: "Order tracking — factory photo uploads", description: "Allow factory photos to be uploaded at the 'Factory Ready' stage showing packaged goods with PO reference.", status: "todo", priority: "medium", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["orders", "photos"], dueDate: "2026-03-05", createdDate: "2026-02-22", updatedDate: "2026-02-22", storyPoints: 3, sprintId: "spr-ets-1",
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "ETS-003", projectId: "proj-ets", projectKey: "ETS", title: "Proposal PDF export with branding", description: "Export proposals as branded PDFs with company logo, investment breakdown table, and terms & conditions.", status: "in-review", priority: "high", type: "feature", assignee: "Ankit Verma", reporter: "Lakshay Takkar", tags: ["proposals", "pdf"], dueDate: "2026-02-28", createdDate: "2026-02-18", updatedDate: "2026-02-27", storyPoints: 5, sprintId: "spr-ets-1",
    subtasks: [{ id: "st-39", title: "Design PDF template", completed: true }, { id: "st-40", title: "Implement PDF generation", completed: true }, { id: "st-41", title: "Add download button to proposals page", completed: false }],
    comments: [{ id: "c-9", author: "Ankit Verma", content: "PDF template is ready. Using jsPDF with custom font loading for Plus Jakarta Sans.", date: "2026-02-27" }],
    attachments: [{ name: "proposal-template.pdf", type: "application/pdf", size: "180 KB" }],
  },
  {
    id: "ETS-004", projectId: "proj-ets", projectKey: "ETS", title: "Client scorecard algorithm", description: "Weighted scoring system for franchise clients based on payment history, engagement, store performance, and reorder frequency.", status: "done", priority: "medium", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["clients", "scoring"], dueDate: "2026-02-25", createdDate: "2026-02-15", updatedDate: "2026-02-25", storyPoints: 3, sprintId: "spr-ets-1",
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "ETS-005", projectId: "proj-ets", projectKey: "ETS", title: "Bulk WhatsApp message sender", description: "Send templated WhatsApp messages to multiple clients at once using the approved templates. Track delivery and read status.", status: "done", priority: "high", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["whatsapp", "bulk"], dueDate: "2026-02-22", createdDate: "2026-02-12", updatedDate: "2026-02-22", storyPoints: 5,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "ETS-006", projectId: "proj-ets", projectKey: "ETS", title: "Inventory reorder alert system", description: "Automatically flag products that are running low based on reorder point thresholds set per store.", status: "done", priority: "medium", type: "feature", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["inventory", "alerts"], dueDate: "2026-02-20", createdDate: "2026-02-10", updatedDate: "2026-02-20", storyPoints: 3,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "ETS-007", projectId: "proj-ets", projectKey: "ETS", title: "MRP band snap rounding bug", description: "Products with landed cost right at band boundary get rounded to wrong MRP tier. Need epsilon check in band snap logic.", status: "done", priority: "critical", type: "bug", assignee: "Lakshay Takkar", reporter: "Ankit Verma", tags: ["pricing", "bug"], dueDate: "2026-02-18", createdDate: "2026-02-16", updatedDate: "2026-02-18", storyPoints: 1,
    subtasks: [],
    comments: [{ id: "c-10", author: "Ankit Verma", content: "Found this with the cotton socks product — landed cost of ₹28.99 was snapping to ₹29 band instead of ₹49.", date: "2026-02-16" }],
    attachments: [],
  },
  {
    id: "INT-001", projectId: "proj-int", projectKey: "INT", title: "Shared component library documentation", description: "Document all reusable components (DataTable, StatsCard, StatusBadge, FormDialog, etc.) with props, usage examples, and visual preview.", status: "done", priority: "medium", type: "task", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["docs", "components"], dueDate: "2026-02-15", createdDate: "2026-02-01", updatedDate: "2026-02-15", storyPoints: 5,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "INT-002", projectId: "proj-int", projectKey: "INT", title: "CI/CD pipeline for staging deployments", description: "Set up automated staging deployments on push to main branch with preview URLs and Slack notifications.", status: "in-progress", priority: "high", type: "task", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["ci-cd", "deployment"], dueDate: "2026-03-05", createdDate: "2026-02-10", updatedDate: "2026-02-24", storyPoints: 5,
    subtasks: [{ id: "st-42", title: "Set up Replit deployment config", completed: true }, { id: "st-43", title: "Add preview URL generation", completed: false }],
    comments: [],
    attachments: [],
  },
  {
    id: "INT-003", projectId: "proj-int", projectKey: "INT", title: "Error boundary component for all pages", description: "Wrap each page route in an error boundary that catches render errors and shows a recovery UI.", status: "todo", priority: "medium", type: "improvement", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["error-handling", "resilience"], dueDate: "2026-03-10", createdDate: "2026-02-20", updatedDate: "2026-02-20", storyPoints: 3,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: "INT-004", projectId: "proj-int", projectKey: "INT", title: "Performance audit — bundle size analysis", description: "Analyze bundle sizes for each vertical, identify heavy dependencies, and set up tree-shaking optimizations.", status: "backlog", priority: "low", type: "task", assignee: "Lakshay Takkar", reporter: "Lakshay Takkar", tags: ["performance", "bundle"], dueDate: "", createdDate: "2026-02-22", updatedDate: "2026-02-22", storyPoints: 3,
    subtasks: [],
    comments: [],
    attachments: [],
  },
];
