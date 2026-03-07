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
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionGrid,
  SectionCard,
} from "@/components/layout";
import { ButtonGrid } from "@/components/blocks";

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

  if (loading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-48 bg-muted rounded-2xl" />
        <StatGrid cols={4}>
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </StatGrid>
        <SectionGrid>
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </SectionGrid>
        <SectionGrid>
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </SectionGrid>
        <div className="h-48 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`${greeting}, Sneha Patel`}
        headline="LegalNations"
        tagline="US company formation, compliance & team operations portal"
        color="#225AEA"
        colorDark="#1a48c4"
        metrics={[
          { label: "Active Formations", value: activeFormations },
          { label: "Open Escalations", value: openEscalations },
          { label: "Pending Tasks", value: pendingTasks },
        ]}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Active Formations"
          value={activeFormations}
          trend={`${formationClients.length} total clients`}
          icon={Briefcase}
          iconBg="hsl(var(--emerald-500) / 0.1)"
          iconColor="#10b981"
        />
        <StatCard
          label="Stuck / Delayed"
          value={stuckDelayed}
          trend={stuckDelayed > 3 ? "Needs attention" : "Under control"}
          icon={AlertTriangle}
          iconBg="hsl(var(--amber-500) / 0.1)"
          iconColor="#f59e0b"
        />
        <StatCard
          label="Avg Completion Days"
          value={avgCompletionDays || "N/A"}
          trend={completedClients.length > 0 ? `${completedClients.length} completed` : "No completions yet"}
          icon={Clock}
          iconBg="hsl(var(--violet-500) / 0.1)"
          iconColor="#6366f1"
        />
        <StatCard
          label="Pending Tasks"
          value={pendingTasks}
          trend={`${formationTasks.filter((t) => t.status === "overdue").length} overdue`}
          icon={ListTodo}
          iconBg="hsl(var(--sky-500) / 0.1)"
          iconColor="#3b82f6"
        />
      </StatGrid>

      <SectionGrid>
        <SectionCard title="Stage Distribution">
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
        </SectionCard>

        <SectionCard title="Risk Overview">
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
        </SectionCard>
      </SectionGrid>

      <SectionGrid>
        <SectionCard
          title="Recent Escalations"
          viewAllLabel="View All"
          onViewAll={() => navigate("/legalnations/escalations")}
        >
          <div className="divide-y -mx-5">
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
        </SectionCard>

        <SectionCard title="Quick Actions">
          <ButtonGrid
            items={[
              { id: "new-client", icon: UserPlus, label: "New Client", description: "Add a new client to the system", onClick: () => navigate("/legalnations/clients") },
              { id: "view-pipeline", icon: GitBranch, label: "View Pipeline", description: "Monitor formation pipeline", onClick: () => navigate("/legalnations/pipeline") },
              { id: "check-escalations", icon: Flag, label: "Check Escalations", description: "Review open escalations", onClick: () => navigate("/legalnations/escalations") },
            ]}
            cols={3}
          />
        </SectionCard>
      </SectionGrid>

      <SectionCard title="Team Load Overview">
        <div className="grid grid-cols-1 gap-0 divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-5 lg:divide-y-0 -m-5">
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
      </SectionCard>
    </PageShell>
  );
}
