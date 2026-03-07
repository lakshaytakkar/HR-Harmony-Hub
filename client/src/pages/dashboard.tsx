import {
  Briefcase,
  AlertTriangle,
  Clock,
  ListTodo,
  AlertCircle,
  ArrowRight,
  UserPlus,
  GitBranch,
  Flag,
} from "lucide-react";
import { useLocation } from "wouter";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { Button } from "@/components/ui/button";
import {
  formationClients,
  formationTasks,
  escalations,
  teamMembers,
} from "@/lib/mock-data";
import { stageDefinitions } from "@shared/schema";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";

const riskVariant: Record<string, "success" | "error" | "warning" | "neutral"> = {
  "on-track": "success",
  "delayed": "warning",
  "at-risk": "error",
};

const severityVariant: Record<string, "error" | "warning"> = {
  critical: "error",
  warning: "warning",
};

export default function Dashboard() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeFormations = formationClients.filter((c) => c.currentStage < 6).length;
  const stuckDelayed = formationClients.filter(
    (c) => c.riskFlag === "delayed" || c.riskFlag === "at-risk"
  ).length;

  const completedClients = formationClients.filter((c) => c.currentStage === 6);
  const avgCompletionDays =
    completedClients.length > 0
      ? Math.round(
          completedClients.reduce((sum, c) => {
            const start = new Date(c.startDate).getTime();
            const end = new Date(c.expectedCompletion).getTime();
            return sum + (end - start) / (1000 * 60 * 60 * 24);
          }, 0) / completedClients.length
        )
      : 0;

  const pendingTasks = formationTasks.filter(
    (t) => t.status === "pending" || t.status === "in-progress"
  ).length;

  const openEscalations = escalations.filter((e) => !e.resolvedDate).length;

  const stageDistribution = stageDefinitions.map((stage) => ({
    ...stage,
    count: formationClients.filter((c) => c.currentStage === stage.number).length,
  }));
  const maxStageCount = Math.max(...stageDistribution.map((s) => s.count), 1);

  const riskCounts = {
    "at-risk": formationClients.filter((c) => c.riskFlag === "at-risk").length,
    delayed: formationClients.filter((c) => c.riskFlag === "delayed").length,
    "on-track": formationClients.filter((c) => c.riskFlag === "on-track").length,
  };

  const recentEscalations = [...escalations]
    .filter((e) => !e.resolvedDate)
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const activeTeamMembers = teamMembers.filter((m) => m.role !== "admin");

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div
            className="rounded-2xl px-8 py-7 mb-6 relative overflow-hidden"
            data-testid="section-welcome"
            style={{ background: "linear-gradient(135deg, #225AEA 0%, #1a48c4 100%)" }}
          >
            <div className="relative z-10">
              <p className="text-white/75 text-sm font-medium mb-2">👋 {greeting}, Sneha Patel</p>
              <h1 className="text-3xl font-bold text-white font-heading tracking-tight">LegalNations</h1>
              <p className="text-white/70 text-sm mt-1.5 max-w-2xl">US company formation, compliance & team operations portal</p>
            </div>
          </div>
        </Fade>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StaggerItem>
              <StatsCard
                title="Active Formations"
                value={activeFormations}
                change={`${formationClients.length} total clients`}
                changeType="positive"
                icon={<Briefcase className="size-5" />}
                sparkline={{ values: [12, 14, 15, 16, 17, 18, activeFormations], color: "#10b981" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Stuck / Delayed"
                value={stuckDelayed}
                change={stuckDelayed > 3 ? "Needs attention" : "Under control"}
                changeType={stuckDelayed > 3 ? "warning" : "positive"}
                icon={<AlertTriangle className="size-5" />}
                sparkline={{ values: [3, 2, 4, 3, 5, 4, stuckDelayed], color: "#f59e0b" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Avg Completion Days"
                value={avgCompletionDays || "N/A"}
                change={completedClients.length > 0 ? `${completedClients.length} completed` : "No completions yet"}
                changeType="neutral"
                icon={<Clock className="size-5" />}
                sparkline={{ values: [22, 20, 19, 21, 18, 17, avgCompletionDays || 18], color: "#6366f1" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Pending Tasks"
                value={pendingTasks}
                change={`${formationTasks.filter((t) => t.status === "overdue").length} overdue`}
                changeType={formationTasks.filter((t) => t.status === "overdue").length > 0 ? "warning" : "neutral"}
                icon={<ListTodo className="size-5" />}
                sparkline={{ values: [8, 10, 12, 9, 11, 14, pendingTasks], color: "#3b82f6" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Open Escalations"
                value={openEscalations}
                change={`${escalations.filter((e) => e.severity === "critical" && !e.resolvedDate).length} critical`}
                changeType={openEscalations > 3 ? "negative" : "neutral"}
                icon={<AlertCircle className="size-5" />}
                sparkline={{ values: [4, 5, 3, 6, 5, 7, openEscalations], color: "#ef4444" }}
              />
            </StaggerItem>
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
          <Fade direction="up" delay={0.15} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background" data-testid="section-stage-distribution">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Stage Distribution</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Clients at each formation stage</p>
              </div>
              <div className="p-5">
                <div className="flex flex-col gap-3">
                  {stageDistribution.map((stage) => (
                    <div key={stage.id} className="flex items-center gap-3" data-testid={`stage-bar-${stage.number}`}>
                      <span className="text-xs font-medium text-muted-foreground w-24 shrink-0 truncate">
                        {stage.number}. {stage.name}
                      </span>
                      <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-primary/80 rounded-md transition-all duration-500"
                          style={{ width: `${(stage.count / maxStageCount) * 100}%` }}
                        />
                        <span className="absolute inset-y-0 right-2 flex items-center text-xs font-medium text-foreground">
                          {stage.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-risk-overview">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Risk Overview</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Client risk status breakdown</p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50" data-testid="risk-at-risk">
                    <span className="text-2xl font-semibold font-heading text-red-700 dark:text-red-300">{riskCounts["at-risk"]}</span>
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">At Risk</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50" data-testid="risk-delayed">
                    <span className="text-2xl font-semibold font-heading text-amber-700 dark:text-amber-300">{riskCounts.delayed}</span>
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Delayed</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/50" data-testid="risk-on-track">
                    <span className="text-2xl font-semibold font-heading text-emerald-700 dark:text-emerald-300">{riskCounts["on-track"]}</span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">On Track</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {formationClients
                    .filter((c) => c.riskFlag !== "on-track")
                    .slice(0, 4)
                    .map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/30"
                        data-testid={`risk-client-${client.id}`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{client.companyName}</p>
                          <p className="text-xs text-muted-foreground">Stage {client.currentStage} &middot; {client.assignedManager}</p>
                        </div>
                        <StatusBadge
                          status={client.riskFlag === "at-risk" ? "At Risk" : "Delayed"}
                          variant={riskVariant[client.riskFlag]}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Fade>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border bg-background p-5 lg:col-span-2">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <div className="rounded-lg border bg-background p-5">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.25} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border bg-background lg:col-span-2" data-testid="section-recent-escalations">
              <div className="border-b px-5 py-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-semibold font-heading">Recent Escalations</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Open issues requiring attention</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/legalnations/escalations")} data-testid="link-view-all-escalations">
                  View All <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
              <div className="divide-y">
                {recentEscalations.map((esc) => (
                  <div
                    key={esc.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                    data-testid={`card-escalation-${esc.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{esc.companyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {esc.type.replace(/-/g, " ")} &middot; {esc.assignedTo}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <StatusBadge
                        status={esc.severity === "critical" ? "Critical" : "Warning"}
                        variant={severityVariant[esc.severity]}
                      />
                      <span className="text-xs text-muted-foreground">{esc.createdDate}</span>
                    </div>
                  </div>
                ))}
                {recentEscalations.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <p className="text-sm font-medium text-foreground">No open escalations</p>
                    <p className="text-xs text-muted-foreground">All issues have been resolved</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-quick-actions">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Quick Actions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Common tasks</p>
              </div>
              <div className="flex flex-col gap-2 p-4">
                <Button variant="outline" className="justify-start" onClick={() => navigate("/legalnations/clients")} data-testid="button-quick-new-client">
                  <UserPlus className="mr-2 size-4" /> New Client
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => navigate("/legalnations/pipeline")} data-testid="button-quick-pipeline">
                  <GitBranch className="mr-2 size-4" /> View Pipeline
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => navigate("/legalnations/escalations")} data-testid="button-quick-escalations">
                  <Flag className="mr-2 size-4" /> Check Escalations
                </Button>
              </div>
            </div>
          </Fade>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Fade direction="up" delay={0.35}>
            <div className="mt-6">
              <div className="rounded-lg border bg-background" data-testid="section-team-load">
                <div className="border-b px-5 py-4">
                  <h3 className="text-base font-semibold font-heading">Team Load Overview</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Active clients and performance per team member</p>
                </div>
                <div className="grid grid-cols-1 gap-0 divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-5 lg:divide-y-0">
                  {activeTeamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col gap-3 p-5 transition-colors hover:bg-muted/30"
                      data-testid={`card-team-${member.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getPersonAvatar(member.name, 32)}
                          alt={member.name}
                          className="size-8 rounded-full"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{member.role.replace("-", " ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-center">
                          <p className="text-lg font-semibold font-heading">{member.activeClients}</p>
                          <p className="text-[10px] text-muted-foreground">Active</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold font-heading">{member.completedThisMonth}</p>
                          <p className="text-[10px] text-muted-foreground">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold font-heading">{member.avgCompletionDays}</p>
                          <p className="text-[10px] text-muted-foreground">Avg Days</p>
                        </div>
                      </div>
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
