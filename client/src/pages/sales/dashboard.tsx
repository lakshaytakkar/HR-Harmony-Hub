import { Users, CreditCard, DollarSign, Package, Headphones, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  PageHeader,
  HeroBanner,
  StatCard,
  StatGrid,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
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
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
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
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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
    <PageShell>
      <HeroBanner
        eyebrow={`👋 ${greeting}, Sneha Patel`}
        headline="USDrop AI"
        tagline="AI-powered dropshipping automation & sales management platform"
        color="#F34147"
        colorDark="#cc2a2f"
        metrics={[
          { label: "Total Users", value: totalUsers },
          { label: "Active Subs", value: activeSubscriptions },
          { label: "Current MRR", value: formatCurrency(currentMrr) }
        ]}
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
            value={totalUsers}
            trend="+18% from last month"
            icon={Users}
            iconBg="rgba(243, 65, 71, 0.1)"
            iconColor="#F34147"
          />
          <StatCard
            label="Active Subscriptions"
            value={activeSubscriptions}
            trend={`${subscriptions.length} total`}
            icon={CreditCard}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
          <StatCard
            label="MRR"
            value={formatCurrency(currentMrr)}
            trend="+9.4% growth"
            icon={DollarSign}
            iconBg="rgba(245, 158, 11, 0.1)"
            iconColor="#f59e0b"
          />
          <StatCard
            label="Open Tickets"
            value={openTickets}
            trend={`${supportTickets.length} total`}
            icon={Headphones}
            iconBg="rgba(239, 68, 68, 0.1)"
            iconColor="#ef4444"
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
          <SectionCard title="MRR Growth">
            <div className="py-4">
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
          </SectionCard>

          <SectionCard
            title="Recent Signups"
            viewAllLabel="View All"
            onViewAll={() => navigate("/sales/users")}
          >
            <div className="divide-y -mx-5 -mb-5">
              {recentSignups.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/20"
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
          </SectionCard>
        </SectionGrid>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[400px] w-full lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionCard
              title="Recent Support Tickets"
              viewAllLabel="View All"
              onViewAll={() => navigate("/sales/tickets")}
            >
              <div className="divide-y -mx-5 -mb-5">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20"
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
            </SectionCard>
          </div>

          <SectionCard title="Quick Actions">
            <div className="flex flex-col gap-2">
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
          </SectionCard>
        </div>
      )}
    </PageShell>
  );
}
