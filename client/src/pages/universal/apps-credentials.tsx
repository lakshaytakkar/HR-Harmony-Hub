import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Search,
  ExternalLink,
  Shield,
  AlertTriangle,
  Clock,
  Globe,
  Database,
  CreditCard,
  Cpu,
  BarChart3,
  MessageCircle,
  Palette,
  FileText,
  Users,
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
  SiAnthropic,
  SiResend,
  SiSlack,
} from "react-icons/si";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import { sharedExternalApps, type ExternalApp } from "@/lib/mock-data-shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  SiAnthropic: (props: { className?: string }) => <SiAnthropic className={props.className} />,
  SiResend: (props: { className?: string }) => <SiResend className={props.className} />,
  SiSlack: (props: { className?: string }) => <SiSlack className={props.className} />,
};

function getIcon(iconName: string): IconComponent {
  if (siIconMap[iconName]) return siIconMap[iconName];
  return Globe;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  hosting: Globe,
  database: Database,
  ai: Cpu,
  payment: CreditCard,
  analytics: BarChart3,
  communication: MessageCircle,
  design: Palette,
  docs: FileText,
  crm: Users,
  hr: Users,
  other: Globe,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", icon: Shield },
  expired: { label: "Expired", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", icon: AlertTriangle },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300", icon: Clock },
};

const ENV_COLORS: Record<string, string> = {
  production: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  staging: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  dev: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

function formatCategory(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function UniversalAppsCredentials() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const loading = useSimulatedLoading(400);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");

  const apps = useMemo(() => {
    if (!vertical) return [];
    return sharedExternalApps.filter((a) => a.verticalId === vertical.id);
  }, [vertical]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    apps.forEach((a) => set.add(a.category));
    return Array.from(set).sort();
  }, [apps]);

  const filtered = useMemo(() => {
    let result = apps;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.appName.toLowerCase().includes(q) ||
          a.notes.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") result = result.filter((a) => a.category === categoryFilter);
    if (statusFilter !== "all") result = result.filter((a) => a.status === statusFilter);
    if (envFilter !== "all") result = result.filter((a) => a.environment === envFilter);
    return result;
  }, [apps, searchQuery, categoryFilter, statusFilter, envFilter]);

  const activeCount = apps.filter((a) => a.status === "active").length;
  const expiredCount = apps.filter((a) => a.status === "expired").length;
  const pendingCount = apps.filter((a) => a.status === "pending").length;
  const hasCredentials = apps.filter((a) => a.apiKeyHint).length;

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-64" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold font-heading" data-testid="text-page-title">
                Apps & Credentials
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                External services and API keys for {vertical?.shortName || "this vertical"}
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
                data-testid="input-search-apps"
              />
            </div>
          </div>

          <Fade>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryCard label="Total Apps" value={apps.length} color="text-foreground" />
              <SummaryCard label="Active" value={activeCount} color="text-emerald-600 dark:text-emerald-400" />
              <SummaryCard label="With Credentials" value={hasCredentials} color="text-blue-600 dark:text-blue-400" />
              <SummaryCard
                label={expiredCount > 0 ? "Expired" : "Pending"}
                value={expiredCount > 0 ? expiredCount : pendingCount}
                color={expiredCount > 0 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}
              />
            </div>
          </Fade>

          <div className="flex flex-wrap gap-2">
            <FilterChip label="All" active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} testId="filter-category-all" />
            {categories.map((c) => (
              <FilterChip key={c} label={formatCategory(c)} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} testId={`filter-category-${c}`} />
            ))}
            <div className="w-px bg-border mx-1" />
            <FilterChip label="All Status" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} testId="filter-status-all" />
            <FilterChip label="Active" active={statusFilter === "active"} onClick={() => setStatusFilter("active")} testId="filter-status-active" />
            <FilterChip label="Expired" active={statusFilter === "expired"} onClick={() => setStatusFilter("expired")} testId="filter-status-expired" />
            <FilterChip label="Pending" active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")} testId="filter-status-pending" />
            <div className="w-px bg-border mx-1" />
            <FilterChip label="All Env" active={envFilter === "all"} onClick={() => setEnvFilter("all")} testId="filter-env-all" />
            <FilterChip label="Production" active={envFilter === "production"} onClick={() => setEnvFilter("production")} testId="filter-env-production" />
            <FilterChip label="Staging" active={envFilter === "staging"} onClick={() => setEnvFilter("staging")} testId="filter-env-staging" />
            <FilterChip label="Dev" active={envFilter === "dev"} onClick={() => setEnvFilter("dev")} testId="filter-env-dev" />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Globe className="size-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No apps found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <Stagger staggerDelay={0.04}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((app) => (
                  <StaggerItem key={app.id}>
                    <AppCard app={app} verticalColor={vertical?.color} />
                  </StaggerItem>
                ))}
              </div>
            </Stagger>
          )}
        </div>
      </PageTransition>
    </PageShell>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="border bg-card">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`text-2xl font-bold font-heading mt-1 ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function FilterChip({ label, active, onClick, testId }: { label: string; active: boolean; onClick: () => void; testId: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
      data-testid={testId}
    >
      {label}
    </button>
  );
}

function AppCard({ app, verticalColor }: { app: ExternalApp; verticalColor?: string }) {
  const Icon = getIcon(app.iconName);
  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.active;
  const StatusIcon = statusCfg.icon;
  const CatIcon = CATEGORY_ICONS[app.category] || Globe;

  return (
    <Card className="border bg-card hover:shadow-md transition-shadow group" data-testid={`card-app-${app.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="size-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: verticalColor ? `${verticalColor}15` : "hsl(var(--muted))" }}
          >
            <Icon className="size-5" style={{ color: verticalColor || "hsl(var(--foreground))" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold truncate" data-testid={`text-app-name-${app.id}`}>
                {app.appName}
              </h3>
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                data-testid={`link-app-${app.id}`}
              >
                <ExternalLink className="size-3.5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{app.notes}</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 mt-4">
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${statusCfg.color} border-0`}>
            <StatusIcon className="size-3 mr-1" />
            {statusCfg.label}
          </Badge>
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${ENV_COLORS[app.environment] || ""} border-0`}>
            {app.environment}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
            <CatIcon className="size-3 mr-1" />
            {formatCategory(app.category)}
          </Badge>
        </div>

        {app.apiKeyHint && (
          <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Shield className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono text-muted-foreground">{app.apiKeyHint}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
