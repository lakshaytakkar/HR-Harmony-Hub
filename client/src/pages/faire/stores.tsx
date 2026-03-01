import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, CheckCircle2, AlertTriangle, Package, ShoppingCart, Clock, ExternalLink, Users, DollarSign } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatUSD, formatINR, DualCurrency } from "@/lib/faire-currency";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";

import buddhaAyurvedaLogo from "@/assets/store-logos/buddha-ayurveda.png";
import buddhaYogaLogo from "@/assets/store-logos/buddha-yoga.png";
import gulleeGadgetsLogo from "@/assets/store-logos/gullee-gadgets.png";
import holidayFarmLogo from "@/assets/store-logos/holiday-farm.png";
import superSantaLogo from "@/assets/store-logos/super-santa.png";
import toyarinaLogo from "@/assets/store-logos/toyarina.png";

const BRAND_COLOR = "#1A6B45";

const STORE_LOGOS: Record<string, string> = {
  "Buddha Ayurveda": buddhaAyurvedaLogo,
  "Buddha Yoga": buddhaYogaLogo,
  "Gullee Gadgets": gulleeGadgetsLogo,
  "Holiday Farm": holidayFarmLogo,
  "Super Santa": superSantaLogo,
  "Toyarina": toyarinaLogo,
};

const STORE_CATEGORIES: Record<string, string> = {
  "Buddha Ayurveda": "Ayurvedic & Wellness Products",
  "Buddha Yoga": "Yoga & Meditation Supplies",
  "Gullee Gadgets": "Electronics & Tech Gadgets",
  "Holiday Farm": "Seasonal & Holiday Decor",
  "Super Santa": "Holiday Toys & Gifts",
  "Toyarina": "Children's Toys & Plush",
};

interface FaireStore {
  id: string;
  name: string;
  active: boolean;
  last_synced_at: string | null;
}

interface StoreSummary {
  total_orders: number;
  total_revenue_cents: number;
  unique_retailers: number;
  orders_new: number;
  orders_processing: number;
  orders_in_transit: number;
  orders_delivered: number;
  orders_canceled: number;
  total_products: number;
  avg_order_value_cents: number;
  last_order_at: string | null;
}

interface StoresWithSummary {
  stores: FaireStore[];
  summary: Record<string, StoreSummary>;
}

interface SyncResult {
  success: boolean;
  orders_synced: number;
  products_synced: number;
  profile_synced: boolean;
  error?: string;
}

function getLastSyncLabel(ts: string | null): string {
  if (!ts) return "Never synced";
  const diff = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 2) return "Just now";
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

export default function FaireStores() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<StoresWithSummary>({
    queryKey: ["/api/faire/stores?summary"],
  });

  const stores = data?.stores ?? [];
  const summaries = data?.summary ?? {};

  const syncMutation = useMutation({
    mutationFn: async (storeId: string) => {
      const res = await apiRequest("POST", `/api/faire/stores/${storeId}/sync`);
      return res.json() as Promise<SyncResult>;
    },
    onSuccess: (data, storeId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores?summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", storeId, "counts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", storeId, "orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", storeId, "products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/products?slim"] });
      setSyncingId(null);
      if (data.success) {
        toast({
          title: "Sync Complete",
          description: `${data.orders_synced} orders · ${data.products_synced} products synced`,
        });
      } else {
        toast({ title: "Sync Failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    },
    onError: () => {
      setSyncingId(null);
      toast({ title: "Sync Error", description: "Could not reach server", variant: "destructive" });
    },
  });

  const handleSync = (store: FaireStore) => {
    setSyncingId(store.id);
    syncMutation.mutate(store.id);
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </PageShell>
    );
  }

  const activeCount = stores.filter(s => s.active).length;
  const syncedCount = stores.filter(s => s.last_synced_at).length;

  const globalTotalRevenue = Object.values(summaries).reduce((s, v) => s + v.total_revenue_cents, 0);
  const globalTotalOrders = Object.values(summaries).reduce((s, v) => s + v.total_orders, 0);
  const globalTotalProducts = Object.values(summaries).reduce((s, v) => s + v.total_products, 0);
  const globalTotalRetailers = Object.values(summaries).reduce((s, v) => s + v.unique_retailers, 0);

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Faire Stores"
          subtitle={`${stores.length} brand accounts · ${activeCount} connected · ${syncedCount} synced`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-9"
                onClick={() => {
                  stores.filter(s => s.active).forEach(s => handleSync(s));
                }}
                disabled={!!syncingId}
                data-testid="btn-sync-all"
              >
                <RefreshCw size={14} className={`mr-2 ${syncingId ? "animate-spin" : ""}`} />
                Sync All
              </Button>
            </div>
          }
        />
      </Fade>

      <Fade>
        <StatGrid cols={4}>
          <StatCard
            label="Total Revenue"
            value={formatUSD(globalTotalRevenue)}
            trend={formatINR(globalTotalRevenue)}
            icon={DollarSign}
            iconBg="#ECFDF5"
            iconColor={BRAND_COLOR}
          />
          <StatCard
            label="Total Orders"
            value={String(globalTotalOrders)}
            icon={ShoppingCart}
            iconBg="#EFF6FF"
            iconColor="#2563EB"
          />
          <StatCard
            label="Total Products"
            value={String(globalTotalProducts)}
            icon={Package}
            iconBg="#FFF7ED"
            iconColor="#EA580C"
          />
          <StatCard
            label="Unique Retailers"
            value={String(globalTotalRetailers)}
            icon={Users}
            iconBg="#FAF5FF"
            iconColor="#7C3AED"
          />
        </StatGrid>
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Store</DataTH>
                <DataTH>Category</DataTH>
                <DataTH>Revenue</DataTH>
                <DataTH>Orders</DataTH>
                <DataTH>Products</DataTH>
                <DataTH>Retailers</DataTH>
                <DataTH>Order Pipeline</DataTH>
                <DataTH>Status</DataTH>
                <DataTH>Last Synced</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stores.map(store => {
                const isSyncing = syncingId === store.id;
                const logo = STORE_LOGOS[store.name];
                const category = STORE_CATEGORIES[store.name] ?? "General Merchandise";
                const s = summaries[store.id];
                return (
                  <DataTR key={store.id} data-testid={`store-row-${store.id}`}>
                    <DataTD>
                      <div className="flex items-center gap-3">
                        {logo ? (
                          <img
                            src={logo}
                            alt={store.name}
                            className="size-12 rounded-xl object-cover shrink-0 shadow-sm border border-muted"
                            data-testid={`img-store-${store.id}`}
                          />
                        ) : (
                          <div
                            className="size-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm"
                            style={{ background: BRAND_COLOR }}
                          >
                            {store.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm" data-testid={`text-store-name-${store.id}`}>{store.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{store.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </DataTD>
                    <DataTD>
                      <span className="text-xs text-muted-foreground">{category}</span>
                    </DataTD>
                    <DataTD>
                      {s && s.total_revenue_cents > 0 ? (
                        <div className="font-semibold text-sm">
                          <DualCurrency cents={s.total_revenue_cents} />
                        </div>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </DataTD>
                    <DataTD>
                      {s && s.total_orders > 0 ? (
                        <div>
                          <span className="font-semibold text-sm" data-testid={`text-orders-${store.id}`}>{s.total_orders}</span>
                          <div className="text-[10px] text-muted-foreground">
                            avg <DualCurrency cents={s.avg_order_value_cents} />
                          </div>
                        </div>
                      ) : <span className="text-muted-foreground text-xs" data-testid={`text-orders-${store.id}`}>—</span>}
                    </DataTD>
                    <DataTD>
                      <span className="font-semibold text-sm" data-testid={`text-products-${store.id}`}>{s?.total_products ?? 0}</span>
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Users size={12} className="text-muted-foreground" />
                        <span className="font-semibold" data-testid={`text-retailers-${store.id}`}>{s?.unique_retailers ?? 0}</span>
                      </div>
                    </DataTD>
                    <DataTD>
                      {s ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          {s.orders_new > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 px-1.5 py-0">
                              {s.orders_new} new
                            </Badge>
                          )}
                          {s.orders_processing > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0">
                              {s.orders_processing} processing
                            </Badge>
                          )}
                          {s.orders_in_transit > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 px-1.5 py-0">
                              {s.orders_in_transit} shipping
                            </Badge>
                          )}
                          {s.orders_delivered > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 px-1.5 py-0">
                              {s.orders_delivered} delivered
                            </Badge>
                          )}
                          {s.orders_canceled > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 px-1.5 py-0">
                              {s.orders_canceled} canceled
                            </Badge>
                          )}
                          {s.total_orders === 0 && <span className="text-muted-foreground text-xs">No orders</span>}
                        </div>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </DataTD>
                    <DataTD>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${store.active ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-600" : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 text-gray-500"}`}>
                        {store.active ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                        {store.active ? "Connected" : "Inactive"}
                      </div>
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {getLastSyncLabel(store.last_synced_at)}
                      </div>
                    </DataTD>
                    <DataTD align="right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => setLocation("/faire/orders")}
                          data-testid={`btn-view-orders-${store.id}`}
                        >
                          <ShoppingCart size={12} className="mr-1" />
                          Orders
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => handleSync(store)}
                          disabled={isSyncing || !store.active}
                          data-testid={`btn-sync-${store.id}`}
                        >
                          <RefreshCw size={12} className={`mr-1 ${isSyncing ? "animate-spin" : ""}`} />
                          {isSyncing ? "Syncing..." : "Sync"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open("https://www.faire.com/brand-portal", "_blank")}
                          data-testid={`btn-open-faire-${store.id}`}
                        >
                          <ExternalLink size={14} />
                        </Button>
                      </div>
                    </DataTD>
                  </DataTR>
                );
              })}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-sm text-muted-foreground font-medium">
                    No stores configured. Add a Faire brand account to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>
    </PageShell>
  );
}
