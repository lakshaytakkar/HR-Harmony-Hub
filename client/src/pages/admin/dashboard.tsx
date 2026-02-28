import { useState } from "react";
import { Users, UserCheck, FileText, Activity, ArrowRight, Plus, Settings, BarChart3, Download, LogIn, Pencil, Trash2, Upload } from "lucide-react";
import { Link } from "wouter";

import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { teamMembers, activityLogs } from "@/lib/mock-data-admin";
import { reports } from "@/lib/mock-data-admin";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";

const activityTypeConfig: Record<string, { icon: typeof Plus; color: string }> = {
  create: { icon: Plus, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950" },
  update: { icon: Pencil, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950" },
  delete: { icon: Trash2, color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950" },
  login: { icon: LogIn, color: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800" },
  export: { icon: Upload, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950" },
};

const quickActions = [
  { title: "Manage Team", description: "Add, edit, or remove team members", icon: Users, href: "/admin/team" },
  { title: "System Settings", description: "Configure system preferences", icon: Settings, href: "/admin/settings" },
  { title: "View Reports", description: "Access analytics and reports", icon: BarChart3, href: "/admin/reports" },
  { title: "Export Data", description: "Download data in various formats", icon: Download, href: "/admin/reports" },
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
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div
            className="rounded-2xl px-8 py-7 mb-6 relative overflow-hidden"
            data-testid="section-welcome"
            style={{ background: "linear-gradient(135deg, #673AB7 0%, #512d9e 100%)" }}
          >
            <div className="relative z-10">
              <p className="text-white/75 text-sm font-medium mb-2">👋 {greeting}, Sneha Patel</p>
              <h1 className="text-3xl font-bold text-white font-heading tracking-tight">LBM Lifestyle Admin</h1>
              <p className="text-white/70 text-sm mt-1.5 max-w-2xl">Wholesale & trade portal for lifestyle brand management</p>
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
                title="Total Users"
                value={teamMembers.length}
                change={`${activeUsers} active`}
                changeType="positive"
                icon={<Users className="size-5" />}
                sparkline={{ values: [8, 9, 10, 10, 11, 12, 12], color: "#10b981" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Active Users"
                value={activeUsers}
                change="+2 this month"
                changeType="positive"
                icon={<UserCheck className="size-5" />}
                sparkline={{ values: [6, 7, 7, 8, 9, 9, 10], color: "#3b82f6" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Reports Available"
                value={reports.length}
                change="3 new this week"
                changeType="neutral"
                icon={<FileText className="size-5" />}
                sparkline={{ values: [4, 5, 5, 6, 7, 7, 8], color: "#6366f1" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="System Uptime"
                value="99.8%"
                change="Last 30 days"
                changeType="positive"
                icon={<Activity className="size-5" />}
                sparkline={{ values: [99.5, 99.7, 99.8, 99.9, 99.8, 99.7, 99.8], color: "#10b981" }}
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background p-5">
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
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.15} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background" data-testid="section-recent-activity">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Recent Activity</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Latest actions across the system</p>
              </div>
              <div className="divide-y">
                {activityLogs.map((log) => {
                  const config = activityTypeConfig[log.type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
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
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-quick-actions">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Quick Actions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Shortcuts to common tasks</p>
              </div>
              <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="group flex items-start gap-3 rounded-md border p-4 transition-colors hover:bg-muted/30"
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
            </div>
          </Fade>
        )}
      </PageTransition>
    </div>
  );
}
