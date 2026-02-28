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
  FolderKanban,
  CheckSquare,
  Bug,
  Zap,
  ArrowUp,
  ChevronUp,
  Minus,
  ChevronDown,
} from "lucide-react";
import { useLocation } from "wouter";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  devPrompts,
  appCredentials,
  devResources,
  importantLinks,
  devProjects,
  devTasks,
} from "@/lib/mock-data-dev";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";

const priorityIcons: Record<string, JSX.Element> = {
  critical: <AlertTriangle className="size-3 text-red-500" />,
  high: <ChevronUp className="size-3 text-orange-500" />,
  medium: <Minus className="size-3 text-blue-500" />,
  low: <ChevronDown className="size-3 text-gray-400" />,
};

const typeIcons: Record<string, JSX.Element> = {
  bug: <Bug className="size-3 text-red-500" />,
  feature: <Zap className="size-3 text-purple-500" />,
  improvement: <ArrowUp className="size-3 text-blue-500" />,
  task: <CheckSquare className="size-3 text-gray-500" />,
  story: <BookOpen className="size-3 text-amber-500" />,
};

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  backlog: "neutral",
  todo: "info",
  "in-progress": "warning",
  "in-review": "info",
  done: "success",
  cancelled: "error",
};

function formatLabel(s: string): string {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function DevDashboard() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const totalPrompts = devPrompts.length;
  const activeCredentials = appCredentials.filter((c) => c.status === "active").length;
  const expiredCredentials = appCredentials.filter((c) => c.status === "expired").length;
  const pendingCredentials = appCredentials.filter((c) => c.status === "pending").length;
  const totalResources = devResources.length;
  const pinnedLinks = importantLinks.filter((l) => l.isPinned);
  const activeProjects = devProjects.filter((p) => p.status === "active").length;
  const totalTasks = devTasks.length;
  const inProgressTasks = devTasks.filter((t) => t.status === "in-progress").length;

  const recentPrompts = [...devPrompts]
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 5);

  const myTasks = devTasks
    .filter((t) => t.assignee === "Lakshay Takkar" && t.status !== "done" && t.status !== "cancelled")
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 6);

  const quickLinks = [
    {
      title: "Design System",
      description: "Style guide, components & icons",
      icon: Palette,
      url: "/dev/style-guide",
      color: "#8b5cf6",
    },
    {
      title: "Projects",
      description: `${activeProjects} active projects`,
      icon: FolderKanban,
      url: "/dev/projects",
      color: "#6366f1",
    },
    {
      title: "Tasks",
      description: `${inProgressTasks} in progress`,
      icon: CheckSquare,
      url: "/dev/tasks",
      color: "#f97316",
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

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div
            className="rounded-2xl px-8 py-7 mb-6 relative overflow-hidden"
            data-testid="section-welcome"
            style={{ background: "linear-gradient(135deg, #10B981 0%, #0a9064 100%)" }}
          >
            <div className="relative z-10">
              <p className="text-white/75 text-sm font-medium mb-2">👋 {greeting}, Sneha Patel</p>
              <h1 className="text-3xl font-bold text-white font-heading tracking-tight">Developer Hub</h1>
              <p className="text-white/70 text-sm mt-1.5 max-w-2xl">Design system, internal tooling & developer resources</p>
            </div>
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
                title="Active Projects"
                value={activeProjects}
                change={`${devProjects.length} total`}
                changeType="positive"
                icon={<FolderKanban className="size-5" />}
                sparkline={{ values: [3, 4, 4, 5, 5, 6, activeProjects], color: "#6366f1" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Open Tasks"
                value={totalTasks - devTasks.filter((t) => t.status === "done" || t.status === "cancelled").length}
                change={`${inProgressTasks} in progress`}
                changeType="warning"
                icon={<CheckSquare className="size-5" />}
                sparkline={{ values: [15, 18, 20, 22, 25, 28, totalTasks], color: "#f97316" }}
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
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} delay={0.1} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
              <Skeleton className="h-4 w-1/3 mb-3" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-3" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.2} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background" data-testid="section-my-tasks">
              <div className="border-b px-5 py-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-semibold font-heading">My Tasks</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{myTasks.length} open tasks assigned to you</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dev/tasks")} data-testid="link-view-all-tasks">
                  View All <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
              <div className="divide-y">
                {myTasks.map((task) => {
                  const proj = devProjects.find((p) => p.id === task.projectId);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/30 cursor-pointer"
                      onClick={() => navigate(`/dev/projects/${task.projectId}`)}
                      data-testid={`card-my-task-${task.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 shrink-0">
                          {priorityIcons[task.priority]}
                          {typeIcons[task.type]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] shrink-0 px-1"
                              style={{ borderColor: proj?.color, color: proj?.color }}
                            >
                              {task.id}
                            </Badge>
                            <p className="text-sm font-medium truncate">{task.title}</p>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={formatLabel(task.status)} variant={statusVariant[task.status]} />
                    </div>
                  );
                })}
                {myTasks.length === 0 && (
                  <div className="p-5 text-center text-sm text-muted-foreground">All tasks complete!</div>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-project-progress">
              <div className="border-b px-5 py-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-semibold font-heading">Project Progress</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Completion across all projects</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dev/projects")} data-testid="link-view-all-projects">
                  View All <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
              <div className="p-5 space-y-4">
                {devProjects.map((proj) => {
                  const pct = proj.taskCount > 0 ? Math.round((proj.completedTaskCount / proj.taskCount) * 100) : 0;
                  return (
                    <div
                      key={proj.id}
                      className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-muted/30"
                      onClick={() => navigate(`/dev/projects/${proj.id}`)}
                      data-testid={`card-project-progress-${proj.id}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                          <span className="text-sm font-medium truncate">{proj.name}</span>
                          <Badge variant="outline" className="font-mono text-[10px] shrink-0" style={{ borderColor: proj.color, color: proj.color }}>
                            {proj.key}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{proj.completedTaskCount}/{proj.taskCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium text-muted-foreground w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Fade>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-3" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-3" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.3} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
      </PageTransition>
    </div>
  );
}
