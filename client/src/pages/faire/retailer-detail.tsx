import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DualCurrency, formatINRFromDollars } from "@/lib/faire-currency";
import {
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";

const BRAND_COLOR = "#1A6B45";

type OrderState = "NEW" | "PROCESSING" | "PRE_TRANSIT" | "IN_TRANSIT" | "DELIVERED" | "PENDING_RETAILER_CONFIRMATION" | "BACKORDERED" | "CANCELED";

const stateConfig: Record<OrderState, { label: string; color: string; bg: string }> = {
  NEW: { label: "New", color: "#2563EB", bg: "#EFF6FF" },
  PROCESSING: { label: "Processing", color: "#7C3AED", bg: "#F5F3FF" },
  PRE_TRANSIT: { label: "Pre-Transit", color: "#9333EA", bg: "#FAF5FF" },
  IN_TRANSIT: { label: "In Transit", color: "#D97706", bg: "#FFFBEB" },
  DELIVERED: { label: "Delivered", color: "#059669", bg: "#ECFDF5" },
  PENDING_RETAILER_CONFIRMATION: { label: "Pending", color: "#EA580C", bg: "#FFF7ED" },
  BACKORDERED: { label: "Backordered", color: "#DC4A26", bg: "#FFF1EE" },
  CANCELED: { label: "Canceled", color: "#6B7280", bg: "#F9FAFB" },
};

export default function FaireRetailerDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/faire/retailers/:id");
  const retailerId = params?.id;

  const { data: retailerData, isLoading: retailerLoading } = useQuery<{ id: string; name: string; city?: string; state?: string; country?: string }>({
    queryKey: ['/api/faire/retailers', retailerId],
    queryFn: async () => {
      const res = await fetch(`/api/faire/retailers/${retailerId}`, { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: !!retailerId,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: any[] }>({
    queryKey: ['/api/faire/orders'],
    queryFn: async () => {
      const res = await fetch("/api/faire/orders", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: storesData } = useQuery<{ stores: { id: string; name: string; active: boolean; last_synced_at: string }[] }>({
    queryKey: ['/api/faire/stores'],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const isLoading = retailerLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-5 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  const retailer = retailerData;
  const allOrders = ordersData?.orders ?? [];
  const stores = storesData?.stores ?? [];

  const retailerOrders = allOrders.filter((o: any) => o.retailer_id === retailerId);

  const totalOrders = retailerOrders.length;
  const totalSpent = retailerOrders.reduce((sum: number, o: any) => {
    const orderTotal = (o.items ?? []).reduce((s: number, i: any) => s + (i.price_cents ?? 0) * (i.quantity ?? 0), 0);
    return sum + orderTotal;
  }, 0);
  const totalSpentDollars = totalSpent / 100;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpentDollars / totalOrders) : 0;

  const sortedByDate = [...retailerOrders].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const firstOrder = sortedByDate.length > 0 ? sortedByDate[0] : null;
  const lastOrder = sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1] : null;

  const storeIdsSet = new Set(retailerOrders.map((o: any) => o._storeId).filter(Boolean));

  const lastOrderDate = lastOrder ? new Date(lastOrder.created_at) : null;
  const isActive = lastOrderDate ? (Date.now() - lastOrderDate.getTime()) < 90 * 24 * 60 * 60 * 1000 : false;

  const retailerName = retailer?.name ?? retailerId ?? "Unknown Retailer";
  const retailerCity = retailer?.city ?? "";
  const retailerState = retailer?.state ?? "";
  const retailerCountry = retailer?.country ?? "";
  const locationParts = [retailerCity, retailerState, retailerCountry].filter(Boolean).join(", ");

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/faire/retailers")} data-testid="btn-back">
              <ArrowLeft size={15} className="mr-1.5" /> Retailers
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold font-heading" data-testid="text-retailer-name">{retailerName}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`} data-testid="text-retailer-status">{isActive ? "active" : "inactive"}</span>
              </div>
              {locationParts && <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-retailer-location">{locationParts}</p>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setLocation("/faire/retailers")} data-testid="btn-back-alt">
              <Mail size={13} className="mr-1.5" /> Contact
            </Button>
          </div>
        </div>
      </Fade>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Retailer Info</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Name</p><p className="text-sm" data-testid="text-info-name">{retailerName}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Retailer ID</p><p className="text-xs font-mono text-muted-foreground truncate" data-testid="text-info-id">{retailerId}</p></div>
                  {locationParts && <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Location</p><p className="text-sm" data-testid="text-info-location">{locationParts}</p></div>}
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Status</p><p className="text-sm" data-testid="text-info-status">{isActive ? "Active" : "Inactive"}</p></div>
                </div>
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Order History</CardTitle></CardHeader>
              <CardContent className="p-0">
                {retailerOrders.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground" data-testid="text-no-orders">No orders from this retailer yet.</div>
                ) : (
                  <DataTableContainer>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <DataTH>Display ID</DataTH>
                          <DataTH>Store</DataTH>
                          <DataTH>Date</DataTH>
                          <DataTH>Total</DataTH>
                          <DataTH>State</DataTH>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {retailerOrders.map((order: any) => {
                          const store = stores.find(s => s.id === order._storeId);
                          const cfg = stateConfig[order.state as OrderState] ?? stateConfig.NEW;
                          const itemsTotal = (order.items ?? []).reduce((s: number, i: any) => s + (i.price_cents ?? 0) * (i.quantity ?? 0), 0);
                          return (
                            <DataTR key={order.id} onClick={() => setLocation(`/faire/orders/${order.id}`)} data-testid={`order-history-row-${order.id}`}>
                              <DataTD><Badge variant="outline" className="text-[10px] font-mono">{order.display_id}</Badge></DataTD>
                              <DataTD><Badge variant="outline" className="text-[10px]">{store?.name?.split(" ")[0] ?? "Store"}</Badge></DataTD>
                              <DataTD className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</DataTD>
                              <DataTD className="font-semibold"><DualCurrency cents={itemsTotal} /></DataTD>
                              <DataTD><span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span></DataTD>
                            </DataTR>
                          );
                        })}
                      </tbody>
                    </table>
                  </DataTableContainer>
                )}
              </CardContent>
            </Card>
          </Fade>
        </div>

        <div className="space-y-4">
          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Lifetime Stats</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Total Orders", value: totalOrders },
                  { label: "Total Spent", value: `$${totalSpentDollars.toLocaleString()}`, sub: formatINRFromDollars(totalSpentDollars) },
                  { label: "Avg Order Value", value: `$${avgOrderValue}`, sub: formatINRFromDollars(avgOrderValue) },
                  { label: "First Order", value: firstOrder ? new Date(firstOrder.created_at).toLocaleDateString() : "\u2014" },
                  { label: "Last Order", value: lastOrder ? new Date(lastOrder.created_at).toLocaleDateString() : "\u2014" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <span className="text-sm font-semibold" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                      {stat.value}
                      {"sub" in stat && stat.sub && <span className="block text-[10px] text-muted-foreground/70 font-normal text-right">{stat.sub}</span>}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Orders From</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(storeIdsSet).map((sid) => {
                    const store = stores.find(s => s.id === sid);
                    return <Badge key={sid as string} variant="outline" style={{ borderColor: `${BRAND_COLOR}40`, color: BRAND_COLOR }} data-testid={`badge-store-${sid}`}>{store?.name ?? "Unknown Store"}</Badge>;
                  })}
                  {storeIdsSet.size === 0 && <span className="text-xs text-muted-foreground">No store data</span>}
                </div>
              </CardContent>
            </Card>
          </Fade>
        </div>
      </div>
    </PageTransition>
  );
}
