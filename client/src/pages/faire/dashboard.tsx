import { useState } from "react";
import { useLocation } from "wouter";
import { Bell, TrendingUp, Package, Users, RefreshCw, AlertTriangle } from "lucide-react";
import { Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
} from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireStores, faireOrders, faireProducts, faireDisputes, type OrderState } from "@/lib/mock-data-faire";
import { Badge } from "@/components/ui/badge";

const BRAND_COLOR = "#1A6B45";

const stateConfig: Record<OrderState, { label: string; color: string; bg: string }> = {
  NEW: { label: "New", color: "#2563EB", bg: "#EFF6FF" },
  PRE_TRANSIT: { label: "Pre-Transit", color: "#7C3AED", bg: "#F5F3FF" },
  IN_TRANSIT: { label: "In Transit", color: "#D97706", bg: "#FFFBEB" },
  DELIVERED: { label: "Delivered", color: "#059669", bg: "#ECFDF5" },
  CLOSED: { label: "Closed", color: "#6B7280", bg: "#F9FAFB" },
  CANCELLED: { label: "Cancelled", color: "#DC2626", bg: "#FEF2F2" },
  BACK_ORDERED: { label: "Backordered", color: "#EA580C", bg: "#FFF7ED" },
};

const ORDER_STATES: OrderState[] = ["NEW", "PRE_TRANSIT", "IN_TRANSIT", "DELIVERED", "CLOSED"];

export default function FaireDashboard() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");

  const filteredOrders = selectedStore === "all" ? faireOrders : faireOrders.filter(o => o.storeId === selectedStore);

  const totalRevenueMTD = faireStores.reduce((s, st) => s + st.monthlyRevenue, 0);
  const newOrdersToday = faireStores.reduce((s, st) => s + st.todayOrders, 0);
  const pendingFulfillment = faireOrders.filter(o => o.state === "NEW" || o.state === "PRE_TRANSIT").length;
  const activeRetailers = faireStores.reduce((s, st) => s + st.activeRetailers, 0);
  const openDisputes = faireDisputes.filter(d => d.status === "open" || d.status === "escalated").length;

  const recentOrders = [...faireOrders]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 6);

  const topProducts = faireProducts
    .sort((a, b) => b.retailer_count - a.retailer_count)
    .slice(0, 5);

  const handleSync = () => {
    toast({ title: "Syncing Orders", description: "Fetching latest orders from Faire API..." });
  };

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>
        <div className="h-12 bg-muted rounded-lg" />
        <div className="grid grid-cols-2 gap-6"><div className="h-64 bg-muted rounded-xl" /><div className="h-64 bg-muted rounded-xl" /></div>
      </div>
    );
  }

  return (
    <PageShell>
      <HeroBanner
        eyebrow="👋 Good morning, Ananya"
        headline="Faire Marketplace"
        tagline="Managing 6 brand storefronts · Last synced 14 min ago"
        color={BRAND_COLOR}
        colorDark="#2D8A60"
        actions={
          <select
            value={selectedStore}
            onChange={e => setSelectedStore(e.target.value)}
            className="text-xs bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1.5 backdrop-blur-sm outline-none"
            data-testid="select-store"
          >
            <option value="all" className="text-foreground">All Stores</option>
            {faireStores.map(s => <option key={s.id} value={s.id} className="text-foreground">{s.name}</option>)}
          </select>
        }
      />

      {(pendingFulfillment > 0 || openDisputes > 0) && (
        <Fade>
          <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-center gap-4" data-testid="urgent-actions-widget">
            <div className="size-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-white" />
            </div>
            <div className="flex-1 space-y-1">
              {pendingFulfillment > 0 && (
                <button onClick={() => setLocation("/faire/fulfillment")} className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 hover:underline" data-testid="link-fulfillment">
                  <span className="font-semibold">{pendingFulfillment} orders need fulfillment</span>
                  <span className="text-amber-600">→</span>
                </button>
              )}
              {openDisputes > 0 && (
                <button onClick={() => setLocation("/faire/disputes")} className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 hover:underline" data-testid="link-disputes">
                  <span className="font-semibold">{openDisputes} disputes open</span>
                  <span className="text-amber-600">→</span>
                </button>
              )}
            </div>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shrink-0" onClick={() => setLocation("/faire/fulfillment")} data-testid="btn-urgent-action">
              Take Action
            </Button>
          </div>
        </Fade>
      )}

      <Stagger>
        <StatGrid>
          <StaggerItem>
            <StatCard
              label="Total Revenue MTD"
              value={`$${(totalRevenueMTD / 1000).toFixed(0)}K`}
              icon={TrendingUp}
              iconBg="rgba(5, 150, 105, 0.1)"
              iconColor="#059669"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="New Orders Today"
              value={newOrdersToday}
              icon={Package}
              iconBg="rgba(37, 99, 235, 0.1)"
              iconColor="#2563EB"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Pending Fulfillment"
              value={pendingFulfillment}
              icon={Bell}
              iconBg={pendingFulfillment > 0 ? "rgba(217, 119, 6, 0.1)" : "rgba(13, 148, 136, 0.1)"}
              iconColor={pendingFulfillment > 0 ? "#D97706" : "#0D9488"}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Active Retailers"
              value={activeRetailers}
              icon={Users}
              iconBg="rgba(124, 58, 237, 0.1)"
              iconColor="#7C3AED"
            />
          </StaggerItem>
        </StatGrid>
      </Stagger>

      <Fade>
        <SectionCard
          title="Store Health"
          viewAllLabel="Sync Now"
          onViewAll={handleSync}
        >
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {faireStores.map(store => (
              <div
                key={store.id}
                className="min-w-[160px] shrink-0 rounded-xl border bg-card p-3 cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setLocation("/faire/stores")}
                data-testid={`store-mini-card-${store.id}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`size-2 rounded-full ${store.status === "connected" ? "bg-emerald-500" : store.status === "error" ? "bg-red-500" : "bg-gray-400"}`} />
                  <p className="text-xs font-semibold truncate">{store.name}</p>
                </div>
                <p className="text-base font-bold">{store.todayOrders} <span className="text-[10px] text-muted-foreground font-normal">orders today</span></p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">${(store.monthlyRevenue / 1000).toFixed(0)}K <span className="text-muted-foreground font-normal">MTD</span></p>
              </div>
            ))}
          </div>
        </SectionCard>
      </Fade>

      <Fade>
        <div className="flex gap-2 flex-wrap">
          {ORDER_STATES.map(state => {
            const cfg = stateConfig[state];
            const count = filteredOrders.filter(o => o.state === state).length;
            return (
              <div key={state} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }} data-testid={`state-chip-${state}`}>
                <span className="text-base font-bold">{count}</span>
                <span>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </Fade>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Fade>
          <SectionCard title="Recent Orders" noPadding>
            <div className="space-y-1 p-2">
              {recentOrders.map(order => {
                const store = faireStores.find(s => s.id === order.storeId);
                const cfg = stateConfig[order.state];
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/faire/orders/${order.id}`)}
                    data-testid={`recent-order-${order.id}`}
                  >
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0">{order.order_number}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{order.retailer_name}</p>
                      <p className="text-[10px] text-muted-foreground">{order.retailer_city}, {order.retailer_state}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] shrink-0" style={{ color: BRAND_COLOR, borderColor: `${BRAND_COLOR}40` }}>{store?.name.split(" ")[0]}</Badge>
                    <p className="text-xs font-semibold shrink-0">${order.total}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </Fade>

        <Fade>
          <SectionCard title="Top Products This Month" noPadding>
            <div className="space-y-1 p-2">
              {topProducts.map((product, i) => {
                const store = faireStores.find(s => s.id === product.storeId);
                return (
                  <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => setLocation(`/faire/products/${product.id}`)} data-testid={`top-product-${product.id}`}>
                    <div className="size-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: BRAND_COLOR }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{product.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        <Badge variant="outline" className="text-[9px]">{store?.name.split(" ")[0]}</Badge>
                        <span className="text-[10px] text-muted-foreground">{product.variants.length} variants</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold">{product.retailer_count}</p>
                      <p className="text-[10px] text-muted-foreground">retailers</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </Fade>
      </div>
    </PageShell>
  );
}
