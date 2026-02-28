import {
  Users,
  CheckCircle2,
  Banknote,
  Rocket,
  TrendingUp,
  Clock,
  AlertTriangle,
  Package,
  ArrowRight,
  IndianRupee,
  Ship,
} from "lucide-react";
import { useLocation } from "wouter";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  etsClients,
  etsOrders,
  etsPayments,
  ETS_STAGE_LABELS,
  ETS_ORDER_STATUS_LABELS,
  ETS_ORDER_STATUSES,
  type EtsPipelineStage,
} from "@/lib/mock-data-ets";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";

const stageVariantMap: Record<EtsPipelineStage, "success" | "error" | "warning" | "neutral" | "info"> = {
  "new-lead": "neutral",
  "qualified": "info",
  "token-paid": "warning",
  "store-design": "info",
  "inventory-ordered": "warning",
  "in-transit": "warning",
  "launched": "success",
  "reordering": "success",
};

function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toLocaleString("en-IN");
}

export default function EtsDashboard() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();

  const totalClients = etsClients.length;
  const qualifiedClients = etsClients.filter((c) => c.stage === "qualified").length;
  const tokenPaidClients = etsClients.filter((c) => c.stage === "token-paid").length;
  const launchedClients = etsClients.filter((c) => c.stage === "launched" || c.stage === "reordering").length;

  const totalTokensCollected = etsPayments
    .filter((p) => p.status === "received")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingInvoices = etsPayments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);
  const estimatedPipelineValue = etsClients.reduce(
    (sum, c) => sum + c.totalPaid + c.pendingDues,
    0
  );

  const activeOrders = etsOrders.filter(
    (o) => o.status !== "dispatched"
  );

  const stuckClients = etsClients.filter((c) => c.daysInStage > 3 && c.stage !== "launched" && c.stage !== "reordering");
  const flaggedOrders = etsOrders.filter((o) => o.isFlagged);
  const alerts = [
    ...stuckClients.map((c) => ({
      id: c.id,
      type: "client" as const,
      title: `${c.name} stuck in ${ETS_STAGE_LABELS[c.stage]}`,
      detail: `${c.daysInStage} days — ${c.city}`,
      severity: c.daysInStage > 10 ? "error" as const : "warning" as const,
    })),
    ...flaggedOrders.map((o) => ({
      id: o.id,
      type: "order" as const,
      title: `Order ${o.id} flagged — ${o.clientName}`,
      detail: `${ETS_ORDER_STATUS_LABELS[o.status]} — ETA ${o.etaDays} days`,
      severity: "error" as const,
    })),
  ].sort((a, b) => (a.severity === "error" ? -1 : 1));

  const recentClients = [...etsClients]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const orderStatusIndex = (status: string) => ETS_ORDER_STATUSES.indexOf(status as any);
  const orderProgressPercent = (status: string) => {
    const idx = orderStatusIndex(status);
    return Math.round(((idx + 1) / ETS_ORDER_STATUSES.length) * 100);
  };

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div className="mb-6" data-testid="section-ets-welcome">
            <div className="flex items-center gap-3 mb-1">
              <Rocket className="size-6" style={{ color: "#F97316" }} />
              <h1 className="text-2xl font-semibold font-heading tracking-tight">
                Command Center
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Pipeline snapshot, revenue tracking & active orders at a glance.
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
              <button
                className="w-full text-left"
                onClick={() => navigate("/ets/pipeline")}
                data-testid="stat-total-clients"
              >
                <StatsCard
                  title="Total Clients"
                  value={totalClients}
                  change={`${etsClients.filter((c) => c.stage === "new-lead").length} new leads`}
                  changeType="neutral"
                  icon={<Users className="size-5" />}
                  sparkline={{ values: [8, 9, 10, 11, 12, 13, totalClients], color: "#F97316" }}
                />
              </button>
            </StaggerItem>
            <StaggerItem>
              <button
                className="w-full text-left"
                onClick={() => navigate("/ets/pipeline")}
                data-testid="stat-qualified"
              >
                <StatsCard
                  title="Qualified"
                  value={qualifiedClients}
                  change="Ready for proposal"
                  changeType="neutral"
                  icon={<CheckCircle2 className="size-5" />}
                  sparkline={{ values: [1, 2, 2, 3, 3, 3, qualifiedClients], color: "#3b82f6" }}
                />
              </button>
            </StaggerItem>
            <StaggerItem>
              <button
                className="w-full text-left"
                onClick={() => navigate("/ets/payments")}
                data-testid="stat-token-paid"
              >
                <StatsCard
                  title="Token Paid"
                  value={tokenPaidClients}
                  change="In onboarding"
                  changeType="warning"
                  icon={<Banknote className="size-5" />}
                  sparkline={{ values: [0, 1, 1, 1, 2, 2, tokenPaidClients], color: "#f59e0b" }}
                />
              </button>
            </StaggerItem>
            <StaggerItem>
              <button
                className="w-full text-left"
                onClick={() => navigate("/ets/pipeline")}
                data-testid="stat-launched"
              >
                <StatsCard
                  title="Launched"
                  value={launchedClients}
                  change="Active stores"
                  changeType="positive"
                  icon={<Rocket className="size-5" />}
                  sparkline={{ values: [0, 0, 1, 1, 2, 2, launchedClients], color: "#10b981" }}
                />
              </button>
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} delay={0.1} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StaggerItem>
              <button
                className="w-full text-left"
                onClick={() => navigate("/ets/payments")}
                data-testid="stat-tokens-collected"
              >
                <StatsCard
                  title="Tokens Collected"
                  value={`₹${formatCurrency(totalTokensCollected)}`}
                  change="Total received"
                  changeType="positive"
                  icon={<IndianRupee className="size-5" />}
                />
              </button>
            </StaggerItem>
            <StaggerItem>
              <button
                className="w-full text-left"
                onClick={() => navigate("/ets/payments")}
                data-testid="stat-pending-invoices"
              >
                <StatsCard
                  title="Pending Invoices"
                  value={`₹${formatCurrency(pendingInvoices)}`}
                  change={`${etsPayments.filter((p) => p.status === "overdue").length} overdue`}
                  changeType={etsPayments.some((p) => p.status === "overdue") ? "warning" : "neutral"}
                  icon={<Clock className="size-5" />}
                />
              </button>
            </StaggerItem>
            <StaggerItem>
              <button
                className="w-full text-left"
                onClick={() => navigate("/ets/pipeline")}
                data-testid="stat-pipeline-value"
              >
                <StatsCard
                  title="Pipeline Value"
                  value={`₹${formatCurrency(estimatedPipelineValue)}`}
                  change="Estimated total"
                  changeType="neutral"
                  icon={<TrendingUp className="size-5" />}
                />
              </button>
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
          <Fade direction="up" delay={0.2} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background" data-testid="section-active-orders">
              <div className="border-b px-5 py-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-semibold font-heading">Active Orders</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeOrders.length} orders in progress
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/ets/orders")}
                  data-testid="link-view-all-orders"
                >
                  View All <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
              <div className="divide-y">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 px-5 py-3.5"
                    data-testid={`card-order-${order.id}`}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                      {order.status === "shipped" ? (
                        <Ship className="size-4" />
                      ) : (
                        <Package className="size-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{order.clientName}</p>
                        <StatusBadge
                          status={ETS_ORDER_STATUS_LABELS[order.status]}
                          variant={
                            order.isFlagged
                              ? "error"
                              : order.status === "customs"
                                ? "warning"
                                : order.status === "warehouse"
                                  ? "info"
                                  : "neutral"
                          }
                        />
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${orderProgressPercent(order.status)}%`,
                              backgroundColor: order.isFlagged ? "#ef4444" : "#F97316",
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {order.etaDays > 0 ? `${order.etaDays}d ETA` : "Delivered"}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-medium shrink-0">
                      ₹{formatCurrency(order.valueInr)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-alerts">
              <div className="border-b px-5 py-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-semibold font-heading">Alerts</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alerts.length} items need attention
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/ets/pipeline")}
                  data-testid="link-view-pipeline"
                >
                  Pipeline <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
              <div className="divide-y max-h-[320px] overflow-y-auto">
                {alerts.slice(0, 8).map((alert) => (
                  <button
                    key={`${alert.type}-${alert.id}`}
                    className="w-full text-left flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                    onClick={() =>
                      alert.type === "client"
                        ? navigate(`/ets/clients/${alert.id}`)
                        : navigate("/ets/orders")
                    }
                    data-testid={`alert-${alert.type}-${alert.id}`}
                  >
                    <AlertTriangle
                      className={`size-4 shrink-0 ${
                        alert.severity === "error"
                          ? "text-red-500"
                          : "text-amber-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {alert.detail}
                      </p>
                    </div>
                    <StatusBadge
                      status={alert.severity === "error" ? "High" : "Medium"}
                      variant={alert.severity === "error" ? "error" : "warning"}
                    />
                  </button>
                ))}
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
                <Skeleton className="h-20 w-48" />
                <Skeleton className="h-20 w-48" />
              </div>
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.3}>
            <div className="mt-6 rounded-lg border bg-background" data-testid="section-recent-clients">
              <div className="border-b px-5 py-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-semibold font-heading">Recent Clients</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Last 5 clients added to the pipeline
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/ets/pipeline")}
                  data-testid="link-view-all-clients"
                >
                  View All <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
              <div className="divide-y">
                {recentClients.map((client) => (
                  <button
                    key={client.id}
                    className="w-full text-left flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
                    onClick={() => navigate(`/ets/clients/${client.id}`)}
                    data-testid={`card-recent-client-${client.id}`}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-700 text-xs font-semibold dark:bg-orange-950/50 dark:text-orange-300">
                      {client.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{client.name}</p>
                        <StatusBadge
                          status={ETS_STAGE_LABELS[client.stage]}
                          variant={stageVariantMap[client.stage]}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {client.city} &middot; {client.storeSize} sqft &middot; {client.packageTier.charAt(0).toUpperCase() + client.packageTier.slice(1)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {client.daysInStage}d in stage
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Fade>
        )}

        {loading ? null : (
          <Fade direction="up" delay={0.35}>
            <div className="mt-6 rounded-lg border bg-background" data-testid="section-pipeline-progress">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Pipeline Progress</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Client distribution across stages
                </p>
              </div>
              <div className="p-5">
                <div className="flex items-end gap-2">
                  {(
                    [
                      "new-lead",
                      "qualified",
                      "token-paid",
                      "store-design",
                      "inventory-ordered",
                      "in-transit",
                      "launched",
                      "reordering",
                    ] as const
                  ).map((stage) => {
                    const count = etsClients.filter((c) => c.stage === stage).length;
                    const maxCount = Math.max(
                      ...["new-lead", "qualified", "token-paid", "store-design", "inventory-ordered", "in-transit", "launched", "reordering"].map(
                        (s) => etsClients.filter((c) => c.stage === (s as any)).length
                      )
                    );
                    const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                      <button
                        key={stage}
                        className="flex-1 flex flex-col items-center gap-1.5"
                        onClick={() => navigate("/ets/pipeline")}
                        data-testid={`pipeline-bar-${stage}`}
                      >
                        <span className="text-xs font-semibold">{count}</span>
                        <div
                          className="w-full rounded-md transition-all"
                          style={{
                            height: `${Math.max(heightPercent, 8)}px`,
                            minHeight: "8px",
                            maxHeight: "80px",
                            backgroundColor:
                              stage === "launched" || stage === "reordering"
                                ? "#10b981"
                                : stage === "new-lead"
                                  ? "#94a3b8"
                                  : "#F97316",
                            opacity: 0.8,
                          }}
                        />
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">
                          {ETS_STAGE_LABELS[stage].split(" ").slice(0, 2).join(" ")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Fade>
        )}
      </PageTransition>
    </div>
  );
}
