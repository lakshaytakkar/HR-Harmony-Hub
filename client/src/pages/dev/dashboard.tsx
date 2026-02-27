import {
  MessageSquare,
  Key,
  BookOpen,
  Link2,
  ArrowRight,
  Palette,
  Wrench,
  Terminal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
} from "lucide-react";
import { useLocation } from "wouter";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  devPrompts,
  appCredentials,
  devResources,
  importantLinks,
} from "@/lib/mock-data-dev";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";

export default function DevDashboard() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();

  const totalPrompts = devPrompts.length;
  const activeCredentials = appCredentials.filter((c) => c.status === "active").length;
  const expiredCredentials = appCredentials.filter((c) => c.status === "expired").length;
  const pendingCredentials = appCredentials.filter((c) => c.status === "pending").length;
  const totalResources = devResources.length;
  const pinnedLinks = importantLinks.filter((l) => l.isPinned);

  const recentPrompts = [...devPrompts]
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 5);

  const quickLinks = [
    {
      title: "Design System",
      description: "Style guide, components & icons",
      icon: Palette,
      url: "/dev/style-guide",
      color: "#8b5cf6",
    },
    {
      title: "Prompts",
      description: `${totalPrompts} saved prompts`,
      icon: MessageSquare,
      url: "/dev/prompts",
      color: "#3b82f6",
    },
    {
      title: "Resources",
      description: `${totalResources} processes & playbooks`,
      icon: BookOpen,
      url: "/dev/resources",
      color: "#f59e0b",
    },
    {
      title: "Toolkit",
      description: "Apps, credentials & links",
      icon: Wrench,
      url: "/dev/toolkit",
      color: "#10b981",
    },
  ];

  const modelBadgeVariant: Record<string, "neutral" | "info" | "success"> = {
    claude: "info",
    gpt: "neutral",
    "replit-agent": "success",
  };

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div className="mb-6" data-testid="section-welcome-banner">
            <div className="flex items-center gap-3 mb-1">
              <Terminal className="size-6 text-emerald-500" />
              <h1 className="text-2xl font-semibold font-heading tracking-tight">Developer Hub</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Internal tools, prompts, credentials & resources for the dev team.
            </p>
          </div>
        </Fade>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Total Prompts"
                value={totalPrompts}
                change={`${devPrompts.filter((p) => p.isFavorite).length} favorites`}
                changeType="positive"
                icon={<MessageSquare className="size-5" />}
                sparkline={{ values: [6, 7, 8, 9, 10, 11, totalPrompts], color: "#3b82f6" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Active Credentials"
                value={activeCredentials}
                change={expiredCredentials > 0 ? `${expiredCredentials} expired` : "All active"}
                changeType={expiredCredentials > 0 ? "warning" : "positive"}
                icon={<Key className="size-5" />}
                sparkline={{ values: [5, 6, 6, 7, 7, 8, activeCredentials], color: "#10b981" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Resources"
                value={totalResources}
                change="Processes & playbooks"
                changeType="neutral"
                icon={<BookOpen className="size-5" />}
                sparkline={{ values: [3, 4, 5, 5, 6, 7, totalResources], color: "#f59e0b" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Pinned Links"
                value={pinnedLinks.length}
                change={`${importantLinks.length} total links`}
                changeType="neutral"
                icon={<Link2 className="size-5" />}
                sparkline={{ values: [8, 9, 10, 11, 12, 13, importantLinks.length], color: "#8b5cf6" }}
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} delay={0.1} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <StaggerItem key={link.title}>
                <button
                  onClick={() => navigate(link.url)}
                  className="w-full text-left rounded-lg border bg-background p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  data-testid={`card-quicklink-${link.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="flex size-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${link.color}15`, color: link.color }}
                    >
                      <link.icon className="size-4.5" />
                    </div>
                    <h3 className="text-sm font-semibold font-heading">{link.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background p-5">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
            <div className="rounded-lg border bg-background p-5">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.2} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background" data-testid="section-recent-prompts">
              <div className="border-b px-5 py-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-semibold font-heading">Recent Prompts</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Last used AI prompts</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dev/prompts")} data-testid="link-view-all-prompts">
                  View All <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
              <div className="divide-y">
                {recentPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                    data-testid={`card-prompt-${prompt.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{prompt.title}</p>
                        {prompt.isFavorite && <Star className="size-3 text-amber-500 fill-amber-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {prompt.category} &middot; Last used {prompt.lastUsed}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {prompt.model}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-credential-status">
              <div className="border-b px-5 py-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-semibold font-heading">Credential Status</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Apps & API key overview</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dev/toolkit")} data-testid="link-view-all-credentials">
                  View All <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/50" data-testid="credential-active-count">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-2xl font-semibold font-heading text-emerald-700 dark:text-emerald-300">{activeCredentials}</span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50" data-testid="credential-expired-count">
                    <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
                    <span className="text-2xl font-semibold font-heading text-red-700 dark:text-red-300">{expiredCredentials}</span>
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">Expired</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50" data-testid="credential-pending-count">
                    <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-2xl font-semibold font-heading text-amber-700 dark:text-amber-300">{pendingCredentials}</span>
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {appCredentials
                    .filter((c) => c.status !== "active")
                    .slice(0, 4)
                    .map((cred) => (
                      <div
                        key={cred.id}
                        className="flex items-center justify-between gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/30"
                        data-testid={`credential-alert-${cred.id}`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{cred.appName}</p>
                          <p className="text-xs text-muted-foreground">{cred.environment} &middot; {cred.apiKeyHint}</p>
                        </div>
                        <StatusBadge
                          status={cred.status === "expired" ? "Expired" : "Pending"}
                          variant={cred.status === "expired" ? "error" : "warning"}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Fade>
        )}

        {loading ? (
          <div className="mt-6 rounded-lg border bg-background p-5">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-1/4" />
              <div className="flex gap-3 flex-wrap">
                <Skeleton className="h-20 w-48" />
                <Skeleton className="h-20 w-48" />
                <Skeleton className="h-20 w-48" />
              </div>
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.3}>
            <div className="mt-6 rounded-lg border bg-background" data-testid="section-pinned-links">
              <div className="border-b px-5 py-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-semibold font-heading">Pinned Links</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Quick access to important tools & dashboards</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dev/toolkit")} data-testid="link-view-all-links">
                  View All <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pinnedLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      data-testid={`card-pinned-link-${link.id}`}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Link2 className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Fade>
        )}
      </PageTransition>
    </div>
  );
}
