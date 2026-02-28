import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { faireStores, faireOrders, faireProducts, faireRetailers, type OrderState } from "@/lib/mock-data-faire";

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

const MONTHS = ["Sep '25", "Oct '25", "Nov '25", "Dec '25", "Jan '26", "Feb '26"];
const MONTHLY_REVENUE = [98400, 112600, 156800, 189200, 134500, 174800];

const GEO_DATA = [
  { state: "TX", retailers: 12, orders: 28, revenue: 42600 },
  { state: "CA", retailers: 18, orders: 42, revenue: 68400 },
  { state: "NY", retailers: 9, orders: 19, revenue: 31200 },
  { state: "CO", retailers: 7, orders: 14, revenue: 22800 },
  { state: "WA", retailers: 6, orders: 11, revenue: 16400 },
  { state: "IL", retailers: 8, orders: 18, revenue: 24600 },
  { state: "FL", retailers: 5, orders: 10, revenue: 14800 },
  { state: "AZ", retailers: 5, orders: 9, revenue: 13800 },
];

export default function FaireAnalytics() {
  const isLoading = useSimulatedLoading(700);
  const [selectedStore, setSelectedStore] = useState("all");
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "month" | "3m">("month");

  const storeOrders = selectedStore === "all" ? faireOrders : faireOrders.filter(o => o.storeId === selectedStore);
  const storeProducts = selectedStore === "all" ? faireProducts : faireProducts.filter(p => p.storeId === selectedStore);

  const totalRevenue = selectedStore === "all"
    ? faireStores.reduce((s, st) => s + st.monthlyRevenue, 0)
    : (faireStores.find(s => s.id === selectedStore)?.monthlyRevenue ?? 0);

  const totalOrders = storeOrders.length;
  const uniqueRetailers = new Set(storeOrders.map(o => o.retailer_id)).size;
  const avgOrderValue = totalOrders > 0 ? Math.round(storeOrders.reduce((s, o) => s + o.total, 0) / totalOrders) : 0;
  const unitsSold = storeOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);
  const cancelledOrders = storeOrders.filter(o => o.state === "CANCELLED").length;
  const returnRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : "0.0";

  const maxRevenue = Math.max(...faireStores.map(s => s.monthlyRevenue));

  const topProducts = storeProducts
    .sort((a, b) => b.retailer_count - a.retailer_count)
    .slice(0, 10)
    .map((p, i) => {
      const store = faireStores.find(s => s.id === p.storeId);
      const unitsSold = p.variants.reduce((s, v) => s + v.available_quantity, 0);
      const revenue = p.variants.reduce((s, v) => s + v.wholesale_price * 10, 0);
      return { rank: i + 1, name: p.name, store, unitsSold, revenue, rating: p.avg_rating };
    });

  const monthPct = (i: number) => {
    if (i === 0) return null;
    const pct = ((MONTHLY_REVENUE[i] - MONTHLY_REVENUE[i - 1]) / MONTHLY_REVENUE[i - 1] * 100).toFixed(1);
    return parseFloat(pct);
  };

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-6 gap-3">{[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>
        <div className="grid grid-cols-2 gap-5">{[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Marketplace performance across all stores</p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1">
              {(["7d", "30d", "month", "3m"] as const).map(t => (
                <button key={t} onClick={() => setTimeFilter(t)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${timeFilter === t ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={timeFilter === t ? { background: BRAND_COLOR } : {}} data-testid={`filter-time-${t}`}>
                  {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : t === "month" ? "This Month" : "3 Months"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-1 overflow-x-auto pb-1">
          <button onClick={() => setSelectedStore("all")} className={`px-4 py-1.5 text-xs rounded-lg border shrink-0 transition-colors font-medium ${selectedStore === "all" ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={selectedStore === "all" ? { background: BRAND_COLOR } : {}} data-testid="tab-all-stores">
            All Stores
          </button>
          {faireStores.map(s => (
            <button key={s.id} onClick={() => setSelectedStore(s.id)} className={`px-4 py-1.5 text-xs rounded-lg border shrink-0 transition-colors font-medium ${selectedStore === s.id ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={selectedStore === s.id ? { background: BRAND_COLOR } : {}} data-testid={`tab-store-${s.id}`}>
              {s.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: "Revenue MTD", value: `$${(totalRevenue / 1000).toFixed(0)}K` },
            { label: "Total Orders", value: totalOrders },
            { label: "Avg Order Value", value: `$${avgOrderValue}` },
            { label: "Unique Retailers", value: uniqueRetailers },
            { label: "Units Sold", value: unitsSold },
            { label: "Return Rate", value: `${returnRate}%` },
          ].map((k, i) => (
            <div key={i} className="rounded-xl border bg-card p-3" data-testid={`analytics-kpi-${i}`}>
              <p className="text-lg font-bold">{k.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
      </Fade>

      <div className="grid grid-cols-2 gap-5">
        <Fade>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue by Store (MTD)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {faireStores.map(store => {
                const barWidth = Math.round((store.monthlyRevenue / maxRevenue) * 100);
                return (
                  <div key={store.id} data-testid={`bar-store-${store.id}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium truncate">{store.name}</p>
                      <p className="text-xs font-bold">${(store.monthlyRevenue / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, background: BRAND_COLOR }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Orders by State</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(["NEW", "PRE_TRANSIT", "IN_TRANSIT", "DELIVERED", "CLOSED", "CANCELLED", "BACK_ORDERED"] as OrderState[]).map(state => {
                  const cfg = stateConfig[state];
                  const count = storeOrders.filter(o => o.state === state).length;
                  return (
                    <div key={state} className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: cfg.bg }} data-testid={`state-chip-${state}`}>
                      <span className="text-lg font-bold" style={{ color: cfg.color }}>{count}</span>
                      <span className="text-xs" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Top 10 Products</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">#</th>
                    <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">Product</th>
                    <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">Store</th>
                    <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">Retailers</th>
                    <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">⭐</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map(p => (
                    <tr key={p.rank} className="border-b hover:bg-accent/20" data-testid={`top-product-row-${p.rank}`}>
                      <td className="p-2.5 text-xs font-bold text-muted-foreground">{p.rank}</td>
                      <td className="p-2.5 text-xs font-medium">{p.name}</td>
                      <td className="p-2.5 text-xs text-muted-foreground">{p.store?.name.split(" ")[0]}</td>
                      <td className="p-2.5 text-xs font-semibold">{p.unitsSold}</td>
                      <td className="p-2.5 text-xs">{p.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Retailer Geography</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">State</th>
                    <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">Retailers</th>
                    <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">Orders</th>
                    <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {GEO_DATA.sort((a, b) => b.revenue - a.revenue).map(row => (
                    <tr key={row.state} className="border-b hover:bg-accent/20" data-testid={`geo-row-${row.state}`}>
                      <td className="p-2.5 text-xs font-semibold">{row.state}</td>
                      <td className="p-2.5 text-xs">{row.retailers}</td>
                      <td className="p-2.5 text-xs">{row.orders}</td>
                      <td className="p-2.5 text-xs font-semibold">${row.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Fade>
      </div>

      <Fade>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">6-Month Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-0">
              {MONTHS.map((month, i) => {
                const revenue = MONTHLY_REVENUE[i];
                const pct = monthPct(i);
                const maxR = Math.max(...MONTHLY_REVENUE);
                const barH = Math.round((revenue / maxR) * 100);
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2" data-testid={`month-bar-${i}`}>
                    <div className="flex items-end h-20 w-full px-1">
                      <div className="w-full rounded-t-md transition-all" style={{ height: `${barH}%`, background: BRAND_COLOR, opacity: i === MONTHS.length - 1 ? 1 : 0.7 }} />
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold">${(revenue / 1000).toFixed(0)}K</p>
                      {pct !== null && (
                        <div className={`flex items-center gap-0.5 text-[9px] font-medium ${pct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {pct >= 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                          {Math.abs(pct)}%
                        </div>
                      )}
                      <p className="text-[9px] text-muted-foreground">{month}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </Fade>
    </PageTransition>
  );
}
