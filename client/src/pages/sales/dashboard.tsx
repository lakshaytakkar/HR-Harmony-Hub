import { Users, CreditCard, DollarSign, Package, Headphones, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import {
  externalUsers,
  subscriptions,
  products,
  supportTickets,
  revenueMetrics,
} from "@/lib/mock-data-sales";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { useLocation } from "wouter";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const ticketPriorityVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  low: "neutral",
  medium: "warning",
  high: "error",
  urgent: "error",
};

const ticketStatusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  open: "info",
  "in-progress": "warning",
  resolved: "success",
  closed: "neutral",
};

export default function SalesDashboard() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();

  const totalUsers = externalUsers.length;
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length;
  const currentMrr = revenueMetrics[revenueMetrics.length - 1].mrr;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const openTickets = supportTickets.filter((t) => t.status === "open" || t.status === "in-progress").length;

  const recentSignups = [...externalUsers]
    .sort((a, b) => new Date(b.signupDate).getTime() - new Date(a.signupDate).getTime())
    .slice(0, 5);

  const recentTickets = [...supportTickets]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const maxMrr = Math.max(...revenueMetrics.map((m) => m.mrr));

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
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
                title="Total Users"
                value={totalUsers}
                change="+18% from last month"
                changeType="positive"
                icon={<Users className="size-5" />}
                sparkline={{ values: [120, 145, 160, 178, 195, 210], color: "#6366f1" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Active Subscriptions"
                value={activeSubscriptions}
                change={`${subscriptions.length} total`}
                changeType="neutral"
                icon={<CreditCard className="size-5" />}
                sparkline={{ values: [8, 9, 10, 10, 11, 11], color: "#10b981" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="MRR"
                value={formatCurrency(currentMrr)}
                change="+9.4% growth"
                changeType="positive"
                icon={<DollarSign className="size-5" />}
                sparkline={{ values: revenueMetrics.map((m) => m.mrr), color: "#f59e0b" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Products Listed"
                value={activeProducts}
                change={`${products.length} total`}
                changeType="neutral"
                icon={<Package className="size-5" />}
                sparkline={{ values: [10, 12, 13, 14, 15, 16], color: "#3b82f6" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Open Tickets"
                value={openTickets}
                change={`${supportTickets.length} total`}
                changeType={openTickets > 5 ? "warning" : "neutral"}
                icon={<Headphones className="size-5" />}
                sparkline={{ values: [4, 6, 5, 7, 8, openTickets], color: "#ef4444" }}
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
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.15} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background" data-testid="section-revenue-chart">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">MRR Growth</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly recurring revenue trend</p>
              </div>
              <div className="p-5">
                <svg viewBox="0 0 400 200" className="w-full h-auto" data-testid="chart-mrr">
                  {revenueMetrics.map((m, i) => {
                    const barWidth = 40;
                    const gap = (400 - revenueMetrics.length * barWidth) / (revenueMetrics.length + 1);
                    const x = gap + i * (barWidth + gap);
                    const height = (m.mrr / maxMrr) * 150;
                    return (
                      <g key={m.month}>
                        <rect
                          x={x}
                          y={170 - height}
                          width={barWidth}
                          height={height}
                          rx={3}
                          className="fill-primary"
                          opacity={0.8}
                          data-testid={`bar-mrr-${m.month}`}
                        />
                        <text
                          x={x + barWidth / 2}
                          y={190}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[11px]"
                        >
                          {m.month}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={170 - height - 6}
                          textAnchor="middle"
                          className="fill-foreground text-[10px] font-medium"
                        >
                          ${(m.mrr / 1000).toFixed(1)}k
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-recent-signups">
              <div className="border-b px-5 py-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-semibold font-heading">Recent Signups</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Latest user registrations</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/sales/users")} data-testid="link-view-all-users">
                  View All <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
              <div className="divide-y">
                {recentSignups.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                    data-testid={`card-user-${user.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getPersonAvatar(user.name, 32)}
                        alt={user.name}
                        className="size-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge
                        status={user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                        variant={user.plan === "enterprise" ? "info" : user.plan === "pro" ? "success" : user.plan === "starter" ? "warning" : "neutral"}
                      />
                    </div>
                  </div>
                ))}
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
            <div className="rounded-lg border bg-background lg:col-span-2" data-testid="section-recent-tickets">
              <div className="border-b px-5 py-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-semibold font-heading">Recent Support Tickets</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Latest customer issues</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/sales/tickets")} data-testid="link-view-all-tickets">
                  View All <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
              <div className="divide-y">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                    data-testid={`card-ticket-${ticket.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{ticket.user} &middot; {ticket.createdDate}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <StatusBadge
                        status={ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        variant={ticketPriorityVariant[ticket.priority]}
                      />
                      <StatusBadge
                        status={ticket.status === "in-progress" ? "In Progress" : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        variant={ticketStatusVariant[ticket.status]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-quick-actions">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Quick Actions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Common tasks</p>
              </div>
              <div className="flex flex-col gap-2 p-4">
                <Button variant="outline" className="justify-start" onClick={() => navigate("/sales/products")} data-testid="button-quick-products">
                  <Package className="mr-2 size-4" /> Browse Products
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => navigate("/sales/users")} data-testid="button-quick-users">
                  <Users className="mr-2 size-4" /> Manage Users
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => navigate("/sales/tickets")} data-testid="button-quick-tickets">
                  <Headphones className="mr-2 size-4" /> Support Tickets
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => navigate("/sales/revenue")} data-testid="button-quick-analytics">
                  <TrendingUp className="mr-2 size-4" /> Revenue Analytics
                </Button>
              </div>
            </div>
          </Fade>
        )}
      </PageTransition>
    </div>
  );
}
