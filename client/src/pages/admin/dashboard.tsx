import { useState } from "react";
import { Users, UserCheck, FileText, Activity, ArrowRight, Plus, Settings, BarChart3, Download, LogIn, Pencil, Trash2, Upload } from "lucide-react";
import { Link } from "wouter";

import { teamMembers, activityLogs } from "@/lib/mock-data-admin";
import { reports } from "@/lib/mock-data-admin";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const activityTypeConfig: Record<string, { icon: typeof Plus; color: string }> = {
  create: { icon: Plus, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950" },
  update: { icon: Pencil, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950" },
  delete: { icon: Trash2, color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950" },
  login: { icon: LogIn, color: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800" },
  export: { icon: Upload, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950" },
};

const quickActions = [
  { title: "Manage Team", description: "Add, edit, or remove team members", icon: Users, href: "/lbm/team" },
  { title: "System Settings", description: "Configure system preferences", icon: Settings, href: "/lbm/settings" },
  { title: "View Reports", description: "Access analytics and reports", icon: BarChart3, href: "/lbm/reports" },
  { title: "Export Data", description: "Download data in various formats", icon: Download, href: "/lbm/reports" },
];

function getRelativeTime(timestamp: string): string {
  const now = new Date("2025-02-27T15:00:00");
  const date = new Date(timestamp.replace(" ", "T"));
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function AdminDashboard() {
  const loading = useSimulatedLoading();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const activeUsers = teamMembers.filter((m) => m.status === "active").length;

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`${greeting}, Sneha Patel`}
        headline="LBM Lifestyle Admin"
        tagline="Wholesale & trade portal for lifestyle brand management"
        color="#673AB7"
        colorDark="#512d9e"
      />

      {loading ? (
        <StatGrid>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            label="Total Users"
            value={teamMembers.length}
            trend={`${activeUsers} active`}
            icon={Users}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
          <StatCard
            label="Active Users"
            value={activeUsers}
            trend="+2 this month"
            icon={UserCheck}
            iconBg="rgba(59, 130, 246, 0.1)"
            iconColor="#3b82f6"
          />
          <StatCard
            label="Reports Available"
            value={reports.length}
            trend="3 new this week"
            icon={FileText}
            iconBg="rgba(99, 102, 241, 0.1)"
            iconColor="#6366f1"
          />
          <StatCard
            label="System Uptime"
            value="99.8%"
            trend="Last 30 days"
            icon={Activity}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
        </StatGrid>
      )}

      {loading ? (
        <SectionGrid>
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </SectionGrid>
      ) : (
        <SectionGrid>
          <SectionCard title="Recent Activity" noPadding>
            <div className="divide-y">
              {activityLogs.map((log) => {
                const config = activityTypeConfig[log.type];
                const Icon = config.icon;
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20"
                    data-testid={`activity-log-${log.id}`}
                  >
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-md ${config.color}`}>
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{log.user}</span>{" "}
                        <span className="text-muted-foreground">{log.action}</span>{" "}
                        <span className="font-medium">{log.target}</span>
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground" data-testid={`text-timestamp-${log.id}`}>
                      {getRelativeTime(log.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group flex items-start gap-3 rounded-md border p-4 transition-colors hover:bg-muted/20"
                    data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        </SectionGrid>
      )}
    </PageShell>
  );
}
