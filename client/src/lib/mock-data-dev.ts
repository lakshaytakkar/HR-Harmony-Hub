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

export const devPrompts: DevPrompt[] = [
  { id: "PRM-001", title: "Full-stack page scaffold", content: "Create a new page for [feature]. Use the existing DataTable component for the main table, StatsCard for KPIs at the top, and StatusBadge for status columns. Follow the pattern in sales/dashboard.tsx. Include: PageBanner header, simulated loading with useSimulatedLoading hook, Stagger/Fade animations, proper data-testid attributes on all interactive elements. Use mock data from the mock-data file — do not create a backend endpoint.", category: "agent", tags: ["scaffold", "page", "pattern"], model: "replit-agent", lastUsed: "2025-02-26", createdDate: "2025-01-15", isFavorite: true },
  { id: "PRM-002", title: "Shadcn component integration", content: "Install and integrate the [component] from shadcn/ui. Follow the project conventions: import from @/components/ui/[name], use Plus Jakarta Sans font only, ensure dark mode support with explicit light/dark variants, add data-testid attributes. Do not modify vite.config.ts or package.json directly.", category: "frontend", tags: ["shadcn", "component", "ui"], model: "replit-agent", lastUsed: "2025-02-24", createdDate: "2025-01-20", isFavorite: true },
  { id: "PRM-003", title: "DataTable with filters pattern", content: "Build a DataTable page with the following columns: [columns]. Add filter dropdowns for [filters]. Include stats cards above the table showing computed counts. Use the existing DataTable component from @/components/hr/data-table — it supports search, columnDefs with render functions, sorting, and pagination. See clients.tsx for the reference pattern.", category: "frontend", tags: ["datatable", "filters", "pattern"], model: "claude", lastUsed: "2025-02-25", createdDate: "2025-02-01", isFavorite: true },
  { id: "PRM-004", title: "Mock data generation", content: "Generate realistic mock data for [entity] with these fields: [fields]. Create 15-20 records with varied data. Use realistic names, dates within the last 3 months, and proper status distributions (not all the same status). Export as a typed array from client/src/lib/mock-data-[vertical].ts. Include the TypeScript interface definition.", category: "agent", tags: ["mock-data", "typescript", "generation"], model: "replit-agent", lastUsed: "2025-02-27", createdDate: "2025-02-05", isFavorite: false },
  { id: "PRM-005", title: "Debug React rendering issue", content: "I'm seeing [error/behavior]. The component is [component name] in [file path]. It renders [description]. Check for: 1) Missing key props in lists, 2) State updates during render, 3) useEffect dependency array issues, 4) Conditional rendering logic errors. Show me the root cause and fix.", category: "debug", tags: ["react", "rendering", "debug"], model: "claude", lastUsed: "2025-02-20", createdDate: "2025-02-10", isFavorite: false },
  { id: "PRM-006", title: "Drizzle schema + storage pattern", content: "Create a Drizzle schema for [entity] in shared/schema.ts. Include: table definition with pgTable, insert schema with createInsertSchema from drizzle-zod using .omit for auto-generated fields, insert type with z.infer, select type with $inferSelect. Then update IStorage interface in server/storage.ts with CRUD methods and implement in MemStorage class.", category: "backend", tags: ["drizzle", "schema", "storage"], model: "replit-agent", lastUsed: "2025-02-18", createdDate: "2025-01-25", isFavorite: true },
  { id: "PRM-007", title: "SQL query for analytics", content: "Write a PostgreSQL query to [analytics goal]. Consider: proper JOINs, GROUP BY with aggregation, date range filtering with date_trunc, window functions for running totals or rankings. Return results in a format suitable for chart rendering (labels + values arrays).", category: "database", tags: ["sql", "analytics", "postgres"], model: "claude", lastUsed: "2025-02-15", createdDate: "2025-02-08", isFavorite: false },
  { id: "PRM-008", title: "Vertical rebuild plan", content: "Plan a complete rebuild of the [vertical name] vertical. Current pages: [list]. New domain: [domain description]. I need: 1) New navigation structure with categories and sub-pages, 2) New mock data interfaces and sample data, 3) Page-by-page specification with components to use, 4) Route cleanup (old pages to delete, new routes to add). Output as a structured session plan with tasks and dependencies.", category: "agent", tags: ["planning", "vertical", "rebuild"], model: "replit-agent", lastUsed: "2025-02-27", createdDate: "2025-02-20", isFavorite: true },
  { id: "PRM-009", title: "Animation pattern for page transitions", content: "Add page transition animations to [page]. Use the existing motion/react setup: wrap the page content in PageTransition, use Stagger for lists of cards, Fade for individual elements. The pattern is: import { PageTransition, Stagger, Fade } from '@/components/ui/animated'. Use staggerDelay={0.05} for card grids, staggerDelay={0.03} for table rows.", category: "frontend", tags: ["animation", "motion", "transitions"], model: "claude", lastUsed: "2025-02-22", createdDate: "2025-02-12", isFavorite: false },
  { id: "PRM-010", title: "Express API endpoint pattern", content: "Create a REST API endpoint at /api/[resource]. Use Express router in server/routes.ts. Validate request body with Zod schema from shared/schema.ts. Call storage interface methods for CRUD. Return proper HTTP status codes (201 for create, 200 for read/update, 204 for delete). Handle errors with try/catch and 500 responses.", category: "backend", tags: ["express", "api", "rest"], model: "replit-agent", lastUsed: "2025-02-16", createdDate: "2025-01-30", isFavorite: false },
  { id: "PRM-011", title: "Kanban board component", content: "Build a kanban board view for [entity] with columns: [columns]. Each card shows: [card fields]. Use a grid layout with overflow-x-auto for horizontal scrolling. Each column is a Card with a header showing column name and count badge. Cards inside are draggable-looking (shadow, rounded corners, compact layout). Include a toggle to switch between Kanban and Table views using Tabs.", category: "frontend", tags: ["kanban", "board", "component"], model: "claude", lastUsed: "2025-02-25", createdDate: "2025-02-15", isFavorite: true },
  { id: "PRM-012", title: "Code review prompt", content: "Review the following code changes for: 1) Missing imports or broken references, 2) TypeScript type safety issues, 3) Proper data-testid coverage on interactive elements, 4) Security concerns (no secrets in client code), 5) Component reuse (are we duplicating existing components?), 6) Consistent patterns with the rest of the codebase. Provide severity-ranked findings.", category: "agent", tags: ["review", "quality", "audit"], model: "claude", lastUsed: "2025-02-27", createdDate: "2025-02-18", isFavorite: false },
];

export const devResources: DevResource[] = [
  { id: "RES-001", title: "Vertical Rebuild Process", description: "Step-by-step process for rebuilding a vertical from scratch", category: "process", tags: ["vertical", "rebuild", "planning"], createdDate: "2025-02-20", updatedDate: "2025-02-27", content: "1. Analyze the target domain and identify core entities\n2. Define navigation structure (L1 categories, L2 sub-pages)\n3. Create TypeScript interfaces in shared/schema.ts\n4. Generate realistic mock data (15-20 records per entity)\n5. Update verticals-config.ts with new nav\n6. Build pages using existing component library (DataTable, StatsCard, etc.)\n7. Update App.tsx routes\n8. Delete old page files\n9. Run architect code review\n10. Update replit.md documentation" },
  { id: "RES-002", title: "Shadcn Component Best Practices", description: "Patterns and pitfalls when using shadcn/ui components", category: "learning", tags: ["shadcn", "ui", "components"], createdDate: "2025-01-20", updatedDate: "2025-02-15", content: "Key learnings:\n- Always import from @/components/ui/[name]\n- SelectItem must have a value prop or it throws\n- useForm from shadcn wraps react-hook-form, pass defaultValues\n- useToast is exported from @/hooks/use-toast (not @/components/ui)\n- Button does not support custom hover color classes\n- Badge variants map to semantic meaning, not raw colors" },
  { id: "RES-003", title: "Parallel Subagent Delegation", description: "How to use subagents for parallel task execution", category: "playbook", tags: ["subagent", "delegation", "parallel"], createdDate: "2025-02-15", updatedDate: "2025-02-27", content: "Use startAsyncSubagent for independent tasks that can run in parallel. Use subagent (sync) for sequential tasks. Always pass relevantFiles to avoid wasted search time. Wait with wait_for_background_tasks. Never start a task with incomplete blockers. Subagents cannot delegate further — handle skill-dependent work yourself (database, env secrets, etc.)." },
  { id: "RES-004", title: "Mock Data Conventions", description: "Standards for generating realistic mock data", category: "process", tags: ["mock-data", "conventions", "standards"], createdDate: "2025-02-01", updatedDate: "2025-02-25", content: "Rules:\n- Use realistic names (mix of cultures/regions)\n- Dates within last 3 months for active records\n- Status distributions should be varied (not all 'active')\n- IDs follow pattern: PREFIX-001, PREFIX-002\n- Include edge cases (overdue items, missing fields, at-risk flags)\n- Export typed arrays with explicit TypeScript interfaces\n- Keep in client/src/lib/mock-data-[vertical].ts" },
  { id: "RES-005", title: "Page Layout Pattern", description: "Standard page layout structure used across all verticals", category: "playbook", tags: ["layout", "pattern", "page"], createdDate: "2025-01-25", updatedDate: "2025-02-20", content: "Every page follows this structure:\n1. PageBanner with title and optional action buttons\n2. Stats cards row (StatsCard components with AnimatedNumber)\n3. Filter bar (dropdowns, search)\n4. Main content (DataTable, card grid, or kanban)\n5. Wrap in PageTransition for enter animation\n6. Use Stagger for card lists, Fade for individual elements\n7. useSimulatedLoading hook for skeleton states\n8. data-testid on all interactive elements" },
  { id: "RES-006", title: "TypeScript Strict Mode Workarounds", description: "Common TypeScript issues and how to handle them in this project", category: "learning", tags: ["typescript", "strict", "workarounds"], createdDate: "2025-02-10", updatedDate: "2025-02-26", content: "Known issues:\n- Set iteration requires Array.from(new Set(...)) instead of spread\n- Implicit 'any' warnings are normal in strict mode, don't block compilation\n- Import types with 'import type' for interfaces\n- Drizzle .array() must be called as method, not wrapper\n- Use z.infer<typeof schema> for insert types\n- Avoid importing React explicitly (Vite JSX transform handles it)" },
  { id: "RES-007", title: "Git Workflow for TeamSync", description: "How version control and checkpoints work in Replit", category: "workflow", tags: ["git", "replit", "checkpoints"], createdDate: "2025-01-15", updatedDate: "2025-02-20", content: "Replit auto-commits at task boundaries. Destructive git commands are blocked. Use read-only git commands for history. Checkpoints include: codebase, chat session, and databases. If a mistake is hard to undo, suggest rollback to previous checkpoint via diagnostics skill." },
  { id: "RES-008", title: "Navigation Config Pattern", description: "How the multi-vertical navigation system works", category: "playbook", tags: ["navigation", "vertical", "config"], createdDate: "2025-02-05", updatedDate: "2025-02-27", content: "Each vertical defines navCategories[] in verticals-config.ts. L1 is rendered as top tabs. L2 appears as a sub-bar when a category with items[] is active. detectVerticalFromUrl maps URL prefixes to verticals. VerticalSync watches location and updates context. VerticalSwitcher navigates to target vertical's first defaultUrl. Both nav bars use rounded-xl border bg-background within px-16 lg:px-24 wrappers." },
];

export const appCredentials: AppCredential[] = [
  { id: "CRD-001", appName: "Replit", url: "https://replit.com", category: "hosting", status: "active", environment: "production", apiKeyHint: "••••7x4f", notes: "Primary development and hosting platform. Hacker plan.", addedDate: "2025-01-10" },
  { id: "CRD-002", appName: "Supabase", url: "https://supabase.com", category: "database", status: "active", environment: "production", apiKeyHint: "••••kQ9m", notes: "PostgreSQL database, auth, and storage. Free tier.", addedDate: "2025-01-12" },
  { id: "CRD-003", appName: "Claude API (Anthropic)", url: "https://console.anthropic.com", category: "ai", status: "active", environment: "production", apiKeyHint: "••••Wp3r", notes: "Claude 3.5 Sonnet for code generation and analysis.", addedDate: "2025-01-15" },
  { id: "CRD-004", appName: "Stripe", url: "https://dashboard.stripe.com", category: "payment", status: "pending", environment: "dev", apiKeyHint: "••••test", notes: "Payment processing — test mode only for now.", addedDate: "2025-02-01" },
  { id: "CRD-005", appName: "Vercel", url: "https://vercel.com", category: "hosting", status: "active", environment: "staging", apiKeyHint: "••••Nj8k", notes: "Staging deployments for client previews.", addedDate: "2025-01-20" },
  { id: "CRD-006", appName: "GitHub", url: "https://github.com", category: "other", status: "active", environment: "production", apiKeyHint: "••••ghp_", notes: "Source code repositories and CI/CD.", addedDate: "2025-01-10" },
  { id: "CRD-007", appName: "OpenAI", url: "https://platform.openai.com", category: "ai", status: "active", environment: "production", apiKeyHint: "••••sk-p", notes: "GPT-4o for content generation and embeddings.", addedDate: "2025-01-18" },
  { id: "CRD-008", appName: "PostHog", url: "https://app.posthog.com", category: "analytics", status: "expired", environment: "production", apiKeyHint: "••••phc_", notes: "Product analytics — free tier expired, needs renewal.", addedDate: "2025-01-25" },
  { id: "CRD-009", appName: "Resend", url: "https://resend.com", category: "other", status: "active", environment: "production", apiKeyHint: "••••re_l", notes: "Transactional email service for notifications.", addedDate: "2025-02-05" },
  { id: "CRD-010", appName: "Cloudflare", url: "https://dash.cloudflare.com", category: "hosting", status: "active", environment: "production", apiKeyHint: "••••cf_x", notes: "DNS management and CDN for custom domains.", addedDate: "2025-02-10" },
];

export const importantLinks: ImportantLink[] = [
  { id: "LNK-001", title: "Replit Workspace", url: "https://replit.com/@team/teamsync", category: "dashboard", description: "Main development workspace for TeamSync", iconName: "Code2", isPinned: true },
  { id: "LNK-002", title: "Supabase Dashboard", url: "https://supabase.com/dashboard", category: "dashboard", description: "Database management, auth config, and storage", iconName: "Database", isPinned: true },
  { id: "LNK-003", title: "GitHub Repository", url: "https://github.com/team/teamsync", category: "repo", description: "Source code repository with CI/CD workflows", iconName: "GitBranch", isPinned: true },
  { id: "LNK-004", title: "Shadcn UI Docs", url: "https://ui.shadcn.com", category: "docs", description: "Component library documentation and installation guides", iconName: "BookOpen", isPinned: true },
  { id: "LNK-005", title: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs", category: "docs", description: "Utility-first CSS framework reference", iconName: "Paintbrush", isPinned: false },
  { id: "LNK-006", title: "Lucide Icons", url: "https://lucide.dev/icons", category: "docs", description: "Icon library used throughout the project", iconName: "Smile", isPinned: false },
  { id: "LNK-007", title: "Stripe Dashboard", url: "https://dashboard.stripe.com", category: "dashboard", description: "Payment processing dashboard and API keys", iconName: "CreditCard", isPinned: false },
  { id: "LNK-008", title: "Vercel Dashboard", url: "https://vercel.com/dashboard", category: "dashboard", description: "Staging deployment management", iconName: "Globe", isPinned: false },
  { id: "LNK-009", title: "Anthropic Console", url: "https://console.anthropic.com", category: "dashboard", description: "Claude API usage, billing, and key management", iconName: "Bot", isPinned: true },
  { id: "LNK-010", title: "Drizzle ORM Docs", url: "https://orm.drizzle.team", category: "docs", description: "TypeScript ORM for PostgreSQL schema and queries", iconName: "Database", isPinned: false },
  { id: "LNK-011", title: "Replit Docs", url: "https://docs.replit.com", category: "docs", description: "Replit platform documentation, deployments, and features", iconName: "FileText", isPinned: false },
  { id: "LNK-012", title: "Wouter Router", url: "https://github.com/molefrog/wouter", category: "docs", description: "Minimalist React router used for client-side routing", iconName: "Navigation", isPinned: false },
  { id: "LNK-013", title: "Figma Design Files", url: "https://figma.com/team/teamsync", category: "tool", description: "UI/UX design files and component specs", iconName: "Figma", isPinned: true },
  { id: "LNK-014", title: "PostHog Analytics", url: "https://app.posthog.com", category: "dashboard", description: "Product analytics and user behavior tracking", iconName: "BarChart3", isPinned: false },
  { id: "LNK-015", title: "Notion Workspace", url: "https://notion.so/team", category: "tool", description: "Team documentation, meeting notes, and project specs", iconName: "StickyNote", isPinned: false },
];
