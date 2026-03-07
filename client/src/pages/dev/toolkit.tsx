import { useState } from "react";
import {
  Wrench,
  Shield,
  AlertTriangle,
  Clock,
  ExternalLink,
  Plus,
  Pin,
  Globe,
  Database,
  BookOpen,
  Smile,
  FileText,
  Navigation,
  Copy,
  CreditCard,
  ScanLine,
  Package,
  Calculator,
  Palette,
  MessageSquare,
  Play,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import {
  SiReplit,
  SiSupabase,
  SiGithub,
  SiStripe,
  SiVercel,
  SiOpenai,
  SiPosthog,
  SiCloudflare,
  SiFigma,
  SiNotion,
  SiTailwindcss,
  SiAnthropic,
  SiResend,
} from "react-icons/si";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { FormDialog } from "@/components/hr/form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { appCredentials, importantLinks, quickTools, projectCredentials, devProjects, type AppCredential, type ImportantLink, type QuickTool, type ProjectCredential } from "@/lib/mock-data-dev";
import { useToast } from "@/hooks/use-toast";
import { PageShell } from "@/components/layout";

type IconComponent = LucideIcon | ((props: { className?: string }) => JSX.Element);

const siIconMap: Record<string, IconComponent> = {
  SiReplit: (props: { className?: string }) => <SiReplit className={props.className} />,
  SiSupabase: (props: { className?: string }) => <SiSupabase className={props.className} />,
  SiGithub: (props: { className?: string }) => <SiGithub className={props.className} />,
  SiStripe: (props: { className?: string }) => <SiStripe className={props.className} />,
  SiVercel: (props: { className?: string }) => <SiVercel className={props.className} />,
  SiOpenai: (props: { className?: string }) => <SiOpenai className={props.className} />,
  SiPosthog: (props: { className?: string }) => <SiPosthog className={props.className} />,
  SiCloudflare: (props: { className?: string }) => <SiCloudflare className={props.className} />,
  SiFigma: (props: { className?: string }) => <SiFigma className={props.className} />,
  SiNotion: (props: { className?: string }) => <SiNotion className={props.className} />,
  SiTailwindcss: (props: { className?: string }) => <SiTailwindcss className={props.className} />,
  SiAnthropic: (props: { className?: string }) => <SiAnthropic className={props.className} />,
  SiResend: (props: { className?: string }) => <SiResend className={props.className} />,
};

const lucideIconMap: Record<string, LucideIcon> = {
  Database,
  BookOpen,
  Smile,
  CreditCard,
  Globe,
  FileText,
  Navigation,
  Pin,
  ScanLine,
  Package,
  Calculator,
  Palette,
  MessageSquare,
};

function getIconComponent(iconName: string): IconComponent {
  if (siIconMap[iconName]) return siIconMap[iconName];
  if (lucideIconMap[iconName]) return lucideIconMap[iconName];
  return Globe;
}

const categoryVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  hosting: "info",
  database: "success",
  ai: "warning",
  payment: "neutral",
  analytics: "info",
  other: "neutral",
};

const envVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  production: "success",
  staging: "warning",
  dev: "info",
};

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  active: "success",
  expired: "error",
  pending: "warning",
};

const linkCategoryVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  tool: "info",
  docs: "neutral",
  dashboard: "success",
  repo: "warning",
};

const toolStatusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  ready: "success",
  wip: "warning",
  planned: "neutral",
};

const toolCategoryVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  payment: "info",
  utility: "neutral",
  generator: "warning",
};

const credentialColumns: Column<AppCredential>[] = [
  {
    key: "appName",
    header: "App",
    sortable: true,
    render: (item) => {
      const IconComp = getIconComponent(item.iconName);
      return (
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
            <IconComp className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.appName}</p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary truncate flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
              data-testid={`link-credential-url-${item.id}`}
            >
              {item.url.replace("https://", "")}
              <ExternalLink className="size-2.5 shrink-0" />
            </a>
          </div>
        </div>
      );
    },
  },
  {
    key: "category",
    header: "Category",
    sortable: true,
    render: (item) => (
      <StatusBadge
        status={item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        variant={categoryVariant[item.category]}
      />
    ),
  },
  {
    key: "environment",
    header: "Environment",
    sortable: true,
    render: (item) => (
      <StatusBadge
        status={item.environment.charAt(0).toUpperCase() + item.environment.slice(1)}
        variant={envVariant[item.environment]}
      />
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (item) => (
      <StatusBadge
        status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        variant={statusVariant[item.status]}
      />
    ),
  },
  {
    key: "apiKeyHint",
    header: "API Key",
    render: (item) => (
      <code className="rounded-md bg-muted px-2 py-1 text-xs" data-testid={`text-api-key-${item.id}`}>
        {item.apiKeyHint}
      </code>
    ),
  },
  {
    key: "notes",
    header: "Notes",
    render: (item) => (
      <p className="text-xs text-muted-foreground max-w-[200px] truncate">{item.notes}</p>
    ),
  },
  {
    key: "addedDate",
    header: "Added",
    sortable: true,
    render: (item) => (
      <span className="text-xs text-muted-foreground">{item.addedDate}</span>
    ),
  },
];

export default function ToolkitPage() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();
  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [linkCategoryFilter, setLinkCategoryFilter] = useState<string>("all");
  const [toolCategoryFilter, setToolCategoryFilter] = useState<string>("all");
  const [credScopeFilter, setCredScopeFilter] = useState<"all" | "universal" | "project">("all");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  function startEditing(fieldId: string, currentValue: string) {
    setEditingField(fieldId);
    setEditValues((prev) => ({ ...prev, [fieldId]: currentValue }));
  }

  function commitEdit(fieldId: string) {
    setEditingField(null);
    toast({ title: "Updated", description: "Field saved (local only)" });
  }

  const allCredentials = appCredentials.length;
  const activeCount = appCredentials.filter((c) => c.status === "active").length;
  const expiredCount = appCredentials.filter((c) => c.status === "expired").length;
  const pendingCount = appCredentials.filter((c) => c.status === "pending").length;

  const pinnedLinks = importantLinks.filter((l) => l.isPinned);
  const filteredLinks = linkCategoryFilter === "all"
    ? importantLinks
    : importantLinks.filter((l) => l.category === linkCategoryFilter);

  const linkCategories = Array.from(new Set(importantLinks.map((l) => l.category)));

  const filteredTools = toolCategoryFilter === "all"
    ? quickTools
    : quickTools.filter((t) => t.category === toolCategoryFilter);
  const toolCategories = Array.from(new Set(quickTools.map((t) => t.category)));

  const readyToolsCount = quickTools.filter((t) => t.status === "ready").length;
  const wipToolsCount = quickTools.filter((t) => t.status === "wip").length;

  return (
    <PageShell>
      <PageTransition>
        <Tabs defaultValue="credentials" className="mt-2">
          <TabsList data-testid="tabs-toolkit">
            <TabsTrigger value="credentials" data-testid="tab-credentials">Apps & Credentials</TabsTrigger>
            <TabsTrigger value="links" data-testid="tab-links">Important Links</TabsTrigger>
            <TabsTrigger value="quick-tools" data-testid="tab-quick-tools">Quick Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="credentials">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mt-4">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </div>
            ) : (
              <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-4 mt-4">
                <StaggerItem>
                  <StatsCard
                    title="Active"
                    value={activeCount}
                    change={`${allCredentials} universal`}
                    changeType="positive"
                    icon={<Shield className="size-5" />}
                  />
                </StaggerItem>
                <StaggerItem>
                  <StatsCard
                    title="Project Keys"
                    value={projectCredentials.length}
                    change={`${devProjects.length} projects`}
                    changeType="neutral"
                    icon={<Globe className="size-5" />}
                  />
                </StaggerItem>
                <StaggerItem>
                  <StatsCard
                    title="Expired"
                    value={expiredCount}
                    change={expiredCount > 0 ? "Needs renewal" : "All good"}
                    changeType={expiredCount > 0 ? "negative" : "positive"}
                    icon={<AlertTriangle className="size-5" />}
                  />
                </StaggerItem>
                <StaggerItem>
                  <StatsCard
                    title="Pending"
                    value={pendingCount}
                    change={pendingCount > 0 ? "Awaiting setup" : "None pending"}
                    changeType={pendingCount > 0 ? "warning" : "neutral"}
                    icon={<Clock className="size-5" />}
                  />
                </StaggerItem>
              </Stagger>
            )}

            {loading ? (
              <div className="mt-6">
                <TableSkeleton rows={5} columns={6} />
              </div>
            ) : (
              <Fade direction="up" delay={0.15} className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 rounded-md border p-0.5">
                    {(["all", "universal", "project"] as const).map((scope) => (
                      <Button
                        key={scope}
                        size="sm"
                        variant={credScopeFilter === scope ? "default" : "ghost"}
                        onClick={() => setCredScopeFilter(scope)}
                        className="text-xs"
                        data-testid={`button-scope-${scope}`}
                      >
                        {scope === "all" ? "All" : scope === "universal" ? "Universal" : "Per-Project"}
                      </Button>
                    ))}
                  </div>
                </div>

                {(credScopeFilter === "all" || credScopeFilter === "universal") && (
                  <div className="mb-6">
                    {credScopeFilter === "all" && (
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Universal Credentials</p>
                    )}
                    <DataTable
                      data={appCredentials}
                      columns={credentialColumns}
                      searchPlaceholder="Search credentials..."
                      searchKey="appName"
                      filters={[
                        {
                          label: "Category",
                          key: "category",
                          options: ["hosting", "database", "ai", "payment", "analytics", "other"],
                        },
                        {
                          label: "Status",
                          key: "status",
                          options: ["active", "expired", "pending"],
                        },
                        {
                          label: "Environment",
                          key: "environment",
                          options: ["production", "staging", "dev"],
                        },
                      ]}
                      headerActions={
                        <Button
                          size="sm"
                          onClick={() => setCredentialDialogOpen(true)}
                          data-testid="button-add-credential"
                        >
                          <Plus className="mr-1.5 size-3.5" />
                          Add Credential
                        </Button>
                      }
                      rowActions={[
                        {
                          label: "Copy API Hint",
                          onClick: (item) => {
                            navigator.clipboard.writeText(item.apiKeyHint);
                            toast({ title: "Copied", description: `API key hint for ${item.appName} copied` });
                          },
                        },
                        {
                          label: "Open URL",
                          onClick: (item) => window.open(item.url, "_blank"),
                        },
                      ]}
                      emptyTitle="No credentials found"
                      emptyDescription="Add your first app credential to get started."
                    />
                  </div>
                )}

                {(credScopeFilter === "all" || credScopeFilter === "project") && (
                  <div>
                    {credScopeFilter === "all" && (
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 mt-6">Per-Project Credentials</p>
                    )}
                    <div className="space-y-4">
                      {devProjects.map((proj) => {
                        const creds = projectCredentials.filter((c) => c.projectId === proj.id);
                        if (creds.length === 0) return null;
                        return (
                          <div key={proj.id} className="rounded-lg border bg-background" data-testid={`section-project-creds-${proj.id}`}>
                            <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/20">
                              <div className="size-2.5 rounded-full" style={{ backgroundColor: proj.color }} />
                              <Badge variant="secondary" className="border-0 text-[10px]" style={{ backgroundColor: `${proj.color}15`, color: proj.color }}>
                                {proj.key}
                              </Badge>
                              <span className="text-sm font-semibold font-heading">{proj.name}</span>
                              <Badge variant="secondary" className="border-0 text-[10px] ml-auto">
                                {creds.length} key{creds.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                            <div className="overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b bg-muted/10">
                                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">App</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Environment</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">API Key</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {creds.map((cred) => {
                                    const IconComp = getIconComponent(cred.iconName);
                                    const notesKey = `tk-notes-${cred.id}`;
                                    return (
                                      <tr key={cred.id} className="transition-colors hover:bg-muted/20" data-testid={`row-proj-cred-${cred.id}`}>
                                        <td className="px-4 py-2.5">
                                          <div className="flex items-center gap-2">
                                            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                                              <IconComp className="size-3.5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                              <p className="font-medium text-sm">{cred.appName}</p>
                                              <a href={cred.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                {cred.url.replace("https://", "").split("/").slice(0, 2).join("/")}
                                                <ExternalLink className="size-2.5 shrink-0" />
                                              </a>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                          <StatusBadge
                                            status={cred.environment.charAt(0).toUpperCase() + cred.environment.slice(1)}
                                            variant={envVariant[cred.environment]}
                                          />
                                        </td>
                                        <td className="px-4 py-2.5">
                                          <code className="rounded-md bg-muted px-2 py-1 text-xs">{cred.apiKeyHint}</code>
                                        </td>
                                        <td className="px-4 py-2.5">
                                          <StatusBadge
                                            status={cred.status.charAt(0).toUpperCase() + cred.status.slice(1)}
                                            variant={statusVariant[cred.status]}
                                          />
                                        </td>
                                        <td className="px-4 py-2.5 max-w-[220px]">
                                          {editingField === notesKey ? (
                                            <input
                                              className="text-xs bg-transparent border-b border-primary outline-none w-full"
                                              value={editValues[notesKey] ?? cred.notes}
                                              onChange={(e) => setEditValues((prev) => ({ ...prev, [notesKey]: e.target.value }))}
                                              onBlur={() => commitEdit(notesKey)}
                                              onKeyDown={(e) => { if (e.key === "Enter") commitEdit(notesKey); }}
                                              autoFocus
                                              data-testid={`input-edit-notes-${cred.id}`}
                                            />
                                          ) : (
                                            <p
                                              className="text-xs text-muted-foreground truncate cursor-pointer hover:text-foreground"
                                              onClick={() => startEditing(notesKey, cred.notes)}
                                              data-testid={`text-notes-${cred.id}`}
                                            >
                                              {editValues[notesKey] ?? cred.notes}
                                            </p>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Fade>
            )}
          </TabsContent>

          <TabsContent value="links">
            {loading ? (
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
              </div>
            ) : (
              <div className="mt-4">
                {pinnedLinks.length > 0 && (
                  <Fade direction="up" delay={0.1}>
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Pin className="size-3.5" />
                        Pinned Links
                      </h3>
                      <Stagger staggerInterval={0.04} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {pinnedLinks.map((link) => {
                          const IconComp = getIconComponent(link.iconName);
                          const descKey = `link-desc-${link.id}`;
                          const urlKey = `link-url-${link.id}`;
                          return (
                            <StaggerItem key={link.id}>
                              <Card className="p-4 hover-elevate" data-testid={`link-pinned-${link.id}`}>
                                <div className="flex items-start gap-3">
                                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <IconComp className="size-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm font-medium truncate">{link.title}</p>
                                      <a
                                        href={editValues[urlKey] ?? link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="ml-auto shrink-0"
                                        data-testid={`link-open-${link.id}`}
                                      >
                                        <ExternalLink className="size-3 text-muted-foreground hover:text-primary" />
                                      </a>
                                    </div>
                                    {editingField === descKey ? (
                                      <input
                                        className="text-xs bg-transparent border-b border-primary outline-none w-full mt-0.5"
                                        value={editValues[descKey] ?? link.description}
                                        onChange={(e) => setEditValues((prev) => ({ ...prev, [descKey]: e.target.value }))}
                                        onBlur={() => commitEdit(descKey)}
                                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(descKey); }}
                                        autoFocus
                                        data-testid={`input-edit-link-desc-${link.id}`}
                                      />
                                    ) : (
                                      <p
                                        className="text-xs text-muted-foreground mt-0.5 line-clamp-2 cursor-pointer hover:text-foreground"
                                        onClick={() => startEditing(descKey, link.description)}
                                        data-testid={`text-link-desc-${link.id}`}
                                      >
                                        {editValues[descKey] ?? link.description}
                                      </p>
                                    )}
                                    {editingField === urlKey ? (
                                      <input
                                        className="text-xs bg-transparent border-b border-primary outline-none w-full mt-1"
                                        value={editValues[urlKey] ?? link.url}
                                        onChange={(e) => setEditValues((prev) => ({ ...prev, [urlKey]: e.target.value }))}
                                        onBlur={() => commitEdit(urlKey)}
                                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(urlKey); }}
                                        autoFocus
                                        data-testid={`input-edit-link-url-${link.id}`}
                                      />
                                    ) : (
                                      <p
                                        className="text-xs text-primary/70 mt-1 truncate cursor-pointer hover:text-primary"
                                        onClick={() => startEditing(urlKey, link.url)}
                                        data-testid={`text-link-url-${link.id}`}
                                      >
                                        {(editValues[urlKey] ?? link.url).replace("https://", "")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            </StaggerItem>
                          );
                        })}
                      </Stagger>
                    </div>
                  </Fade>
                )}

                <Fade direction="up" delay={0.2}>
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      All Links ({filteredLinks.length})
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select value={linkCategoryFilter} onValueChange={setLinkCategoryFilter}>
                        <SelectTrigger className="h-8 w-auto min-w-[120px] text-sm" data-testid="filter-link-category">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {linkCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => setLinkDialogOpen(true)}
                        data-testid="button-add-link"
                      >
                        <Plus className="mr-1.5 size-3.5" />
                        Add Link
                      </Button>
                    </div>
                  </div>

                  <Stagger staggerInterval={0.03} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredLinks.map((link) => {
                      const IconComp = getIconComponent(link.iconName);
                      const descKey = `link-desc-${link.id}`;
                      const urlKey = `link-url-${link.id}`;
                      return (
                        <StaggerItem key={link.id}>
                          <Card className="p-4 hover-elevate" data-testid={`link-item-${link.id}`}>
                            <div className="flex items-start gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <IconComp className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-medium truncate">{link.title}</p>
                                  {link.isPinned && (
                                    <Pin className="size-3 text-primary shrink-0" />
                                  )}
                                  <a
                                    href={editValues[urlKey] ?? link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="ml-auto shrink-0"
                                    data-testid={`link-open-all-${link.id}`}
                                  >
                                    <ExternalLink className="size-3 text-muted-foreground hover:text-primary" />
                                  </a>
                                </div>
                                {editingField === descKey ? (
                                  <input
                                    className="text-xs bg-transparent border-b border-primary outline-none w-full mt-0.5"
                                    value={editValues[descKey] ?? link.description}
                                    onChange={(e) => setEditValues((prev) => ({ ...prev, [descKey]: e.target.value }))}
                                    onBlur={() => commitEdit(descKey)}
                                    onKeyDown={(e) => { if (e.key === "Enter") commitEdit(descKey); }}
                                    autoFocus
                                    data-testid={`input-edit-link-desc-${link.id}`}
                                  />
                                ) : (
                                  <p
                                    className="text-xs text-muted-foreground mt-0.5 line-clamp-2 cursor-pointer hover:text-foreground"
                                    onClick={() => startEditing(descKey, link.description)}
                                    data-testid={`text-link-desc-${link.id}`}
                                  >
                                    {editValues[descKey] ?? link.description}
                                  </p>
                                )}
                                {editingField === urlKey ? (
                                  <input
                                    className="text-xs bg-transparent border-b border-primary outline-none w-full mt-1"
                                    value={editValues[urlKey] ?? link.url}
                                    onChange={(e) => setEditValues((prev) => ({ ...prev, [urlKey]: e.target.value }))}
                                    onBlur={() => commitEdit(urlKey)}
                                    onKeyDown={(e) => { if (e.key === "Enter") commitEdit(urlKey); }}
                                    autoFocus
                                    data-testid={`input-edit-link-url-${link.id}`}
                                  />
                                ) : (
                                  <p
                                    className="text-xs text-primary/70 mt-1 truncate cursor-pointer hover:text-primary"
                                    onClick={() => startEditing(urlKey, link.url)}
                                    data-testid={`text-link-url-${link.id}`}
                                  >
                                    {(editValues[urlKey] ?? link.url).replace("https://", "")}
                                  </p>
                                )}
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                  <StatusBadge
                                    status={link.category.charAt(0).toUpperCase() + link.category.slice(1)}
                                    variant={linkCategoryVariant[link.category]}
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        </StaggerItem>
                      );
                    })}
                  </Stagger>

                  {filteredLinks.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12">
                      <p className="text-sm font-medium">No links found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your filter</p>
                    </div>
                  )}
                </Fade>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quick-tools">
            {loading ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-40 rounded-lg" />
                  <Skeleton className="h-40 rounded-lg" />
                  <Skeleton className="h-40 rounded-lg" />
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                  <StaggerItem>
                    <StatsCard
                      title="Ready"
                      value={readyToolsCount}
                      change="Available to use"
                      changeType="positive"
                      icon={<Rocket className="size-5" />}
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <StatsCard
                      title="In Progress"
                      value={wipToolsCount}
                      change="Being developed"
                      changeType="warning"
                      icon={<Wrench className="size-5" />}
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <StatsCard
                      title="Total Tools"
                      value={quickTools.length}
                      change={`${quickTools.filter((t) => t.vertical !== "dev").length} for other verticals`}
                      changeType="neutral"
                      icon={<Package className="size-5" />}
                    />
                  </StaggerItem>
                </Stagger>

                <Fade direction="up" delay={0.15}>
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Tools ({filteredTools.length})
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select value={toolCategoryFilter} onValueChange={setToolCategoryFilter}>
                        <SelectTrigger className="h-8 w-auto min-w-[120px] text-sm" data-testid="filter-tool-category">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {toolCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => setToolDialogOpen(true)}
                        data-testid="button-add-tool"
                      >
                        <Plus className="mr-1.5 size-3.5" />
                        Add Tool
                      </Button>
                    </div>
                  </div>

                  <Stagger staggerInterval={0.04} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredTools.map((tool) => {
                      const IconComp = getIconComponent(tool.iconName);
                      return (
                        <StaggerItem key={tool.id}>
                          <Card className="p-5 hover-elevate" data-testid={`card-tool-${tool.id}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <IconComp className="size-5" />
                              </div>
                              <StatusBadge
                                status={tool.status === "wip" ? "WIP" : tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                                variant={toolStatusVariant[tool.status]}
                              />
                            </div>
                            <div className="mt-3">
                              <h4 className="text-sm font-semibold" data-testid={`text-tool-name-${tool.id}`}>{tool.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tool.description}</p>
                            </div>
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                              <StatusBadge
                                status={tool.category.charAt(0).toUpperCase() + tool.category.slice(1)}
                                variant={toolCategoryVariant[tool.category]}
                              />
                              <Badge variant="outline" className="text-xs">
                                {tool.vertical === "dev" ? "Developer" : tool.vertical.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="mt-4">
                              {tool.status === "ready" ? (
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => toast({ title: "Launching...", description: `Opening ${tool.name}` })}
                                  data-testid={`button-launch-tool-${tool.id}`}
                                >
                                  <Play className="mr-1.5 size-3.5" />
                                  Launch
                                </Button>
                              ) : tool.status === "wip" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  disabled
                                  data-testid={`button-wip-tool-${tool.id}`}
                                >
                                  <Wrench className="mr-1.5 size-3.5" />
                                  In Development
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  disabled
                                  data-testid={`button-planned-tool-${tool.id}`}
                                >
                                  <Clock className="mr-1.5 size-3.5" />
                                  Planned
                                </Button>
                              )}
                            </div>
                          </Card>
                        </StaggerItem>
                      );
                    })}
                  </Stagger>

                  {filteredTools.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12">
                      <p className="text-sm font-medium">No tools found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your filter</p>
                    </div>
                  )}
                </Fade>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <FormDialog
          open={credentialDialogOpen}
          onOpenChange={setCredentialDialogOpen}
          title="Add Credential"
          onSubmit={() => {
            toast({ title: "Credential added", description: "New credential has been saved." });
            setCredentialDialogOpen(false);
          }}
          submitLabel="Add Credential"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cred-app">App Name</Label>
            <Input id="cred-app" placeholder="e.g. Stripe" data-testid="input-cred-app" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cred-url">URL</Label>
            <Input id="cred-url" placeholder="https://..." data-testid="input-cred-url" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select defaultValue="other">
                <SelectTrigger data-testid="select-cred-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hosting">Hosting</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Environment</Label>
              <Select defaultValue="dev">
                <SelectTrigger data-testid="select-cred-environment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="dev">Dev</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select defaultValue="pending">
              <SelectTrigger data-testid="select-cred-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cred-key">API Key Hint (last 4 chars)</Label>
            <Input id="cred-key" placeholder="e.g. ••••ab12" data-testid="input-cred-key" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cred-notes">Notes</Label>
            <Textarea id="cred-notes" placeholder="Additional notes..." className="resize-none" data-testid="input-cred-notes" />
          </div>
        </FormDialog>

        <FormDialog
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          title="Add Link"
          onSubmit={() => {
            toast({ title: "Link added", description: "New link has been saved." });
            setLinkDialogOpen(false);
          }}
          submitLabel="Add Link"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-title">Title</Label>
            <Input id="link-title" placeholder="e.g. GitHub Repo" data-testid="input-link-title" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-url">URL</Label>
            <Input id="link-url" placeholder="https://..." data-testid="input-link-url" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select defaultValue="tool">
              <SelectTrigger data-testid="select-link-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tool">Tool</SelectItem>
                <SelectItem value="docs">Docs</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="repo">Repo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-desc">Description</Label>
            <Textarea id="link-desc" placeholder="Brief description..." className="resize-none" data-testid="input-link-desc" />
          </div>
        </FormDialog>

        <FormDialog
          open={toolDialogOpen}
          onOpenChange={setToolDialogOpen}
          title="Add Quick Tool"
          onSubmit={() => {
            toast({ title: "Tool added", description: "New quick tool has been registered." });
            setToolDialogOpen(false);
          }}
          submitLabel="Add Tool"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tool-name">Tool Name</Label>
            <Input id="tool-name" placeholder="e.g. Razorpay Link Generator" data-testid="input-tool-name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tool-desc">Description</Label>
            <Textarea id="tool-desc" placeholder="What does this tool do?" className="resize-none" data-testid="input-tool-desc" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select defaultValue="utility">
                <SelectTrigger data-testid="select-tool-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                  <SelectItem value="generator">Generator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select defaultValue="planned">
                <SelectTrigger data-testid="select-tool-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="wip">WIP</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tool-vertical">Target Vertical</Label>
            <Select defaultValue="dev">
              <SelectTrigger data-testid="select-tool-vertical">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Developer</SelectItem>
                <SelectItem value="hr">LegalNations</SelectItem>
                <SelectItem value="sales">USDrop AI</SelectItem>
                <SelectItem value="events">GoyoTours</SelectItem>
                <SelectItem value="admin">LBM Lifestyle</SelectItem>
                <SelectItem value="ets">EazyToSell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FormDialog>
      </PageTransition>
    </PageShell>
  );
}
