import { useState } from "react";
import { Copy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  PageShell, PageHeader, DataTableContainer, DataTH, DataTD, DataTR,
} from "@/components/layout";
import { DualCurrency } from "@/lib/faire-currency";

const BRAND_COLOR = "#1A6B45";

type OrderState = "NEW" | "PROCESSING" | "PRE_TRANSIT" | "IN_TRANSIT" | "DELIVERED" | "BACKORDERED" | "CANCELED";

const orderStateConfig: Record<string, { label: string; color: string; bg: string }> = {
  PRE_TRANSIT: { label: "Pre-Transit", color: "#9333EA", bg: "#FAF5FF" },
  IN_TRANSIT: { label: "In Transit", color: "#D97706", bg: "#FFFBEB" },
  DELIVERED: { label: "Delivered", color: "#059669", bg: "#ECFDF5" },
};

const shipTypeLabels: Record<string, string> = {
  SHIP_ON_YOUR_OWN: "Own Label",
  FAIRE_SHIPPING_LABEL: "Faire Label",
};

export default function FaireShipments() {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [stateFilter, setStateFilter] = useState<"all" | "PRE_TRANSIT" | "IN_TRANSIT" | "DELIVERED">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: any[] }>({
    queryKey: ["/api/faire/orders"],
    queryFn: async () => {
      const res = await fetch("/api/faire/orders", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: storesData, isLoading: storesLoading } = useQuery<{ stores: any[] }>({
    queryKey: ["/api/faire/stores"],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const isLoading = ordersLoading || storesLoading;
  const orders = ordersData?.orders ?? [];
  const stores = storesData?.stores ?? [];

  const enriched = orders
    .filter(order => order.shipments && order.shipments.length > 0)
    .flatMap(order => {
      const store = stores.find(s => s.id === order._storeId);
      return (order.shipments as any[]).map((ship: any) => ({
        ...ship,
        order,
        store,
        retailerId: order.retailer_id,
      }));
    })
    .filter(s => {
      if (selectedStore !== "all" && s.store?.id !== selectedStore) return false;
      if (stateFilter !== "all" && s.order?.state !== stateFilter) return false;
      return true;
    });

  const totalPages = Math.max(1, Math.ceil(enriched.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedShipments = enriched.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const copyTracking = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast({ title: "Copied", description: code }));
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Shipments"
          subtitle="All in-transit and recent shipments"
          actions={
            <div className="flex items-center gap-2">
              <select value={selectedStore} onChange={e => { setSelectedStore(e.target.value); setCurrentPage(1); }} className="h-8 text-xs border rounded-lg px-2" data-testid="select-store">
                <option value="all">All Stores</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="flex gap-1">
                {(["all", "PRE_TRANSIT", "IN_TRANSIT", "DELIVERED"] as const).map(s => (
                  <button key={s} onClick={() => { setStateFilter(s); setCurrentPage(1); }} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${stateFilter === s ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={stateFilter === s ? { background: "#1A6B45" } : {}} data-testid={`filter-state-${s}`}>
                    {s === "all" ? "All" : s === "PRE_TRANSIT" ? "Pre-Transit" : s === "IN_TRANSIT" ? "In Transit" : "Delivered"}
                  </button>
                ))}
              </div>
            </div>
          }
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Shipment ID</DataTH>
                <DataTH>Order ID</DataTH>
                <DataTH>Store</DataTH>
                <DataTH>Retailer</DataTH>
                <DataTH>Carrier</DataTH>
                <DataTH>Tracking Code</DataTH>
                <DataTH>Shipped</DataTH>
                <DataTH>Shipping Cost</DataTH>
                <DataTH>Type</DataTH>
                <DataTH>Order State</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedShipments.map(ship => {
                const orderState = ship.order?.state ?? "IN_TRANSIT";
                const cfg = orderStateConfig[orderState] ?? { label: orderState, color: "#6B7280", bg: "#F9FAFB" };
                return (
                  <DataTR key={ship.id} data-testid={`shipment-row-${ship.id}`}>
                    <DataTD className="font-mono text-muted-foreground">{ship.id}</DataTD>
                    <DataTD>
                      <Badge variant="outline" className="text-[10px] font-mono">{ship.order?.display_id}</Badge>
                    </DataTD>
                    <DataTD>
                      <Badge variant="outline" className="text-[10px]">{ship.store?.name?.split(" ")[0] ?? "—"}</Badge>
                    </DataTD>
                    <DataTD>{ship.retailerId ?? "—"}</DataTD>
                    <DataTD className="font-medium">{ship.carrier}</DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono bg-muted rounded px-1.5 py-0.5 max-w-[120px] truncate">{ship.tracking_code}</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyTracking(ship.tracking_code)} data-testid={`btn-copy-tracking-${ship.id}`}><Copy size={10} /></Button>
                      </div>
                    </DataTD>
                    <DataTD>{ship.shipped_at ? new Date(ship.shipped_at).toLocaleDateString() : "—"}</DataTD>
                    <DataTD className="font-semibold">{ship.maker_cost_cents != null ? <DualCurrency cents={ship.maker_cost_cents} /> : "—"}</DataTD>
                    <DataTD>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{shipTypeLabels[ship.shipping_type] ?? ship.shipping_type ?? "—"}</span>
                    </DataTD>
                    <DataTD>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </DataTD>
                  </DataTR>
                );
              })}
              {enriched.length === 0 && (
                <tr><td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">No shipments match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      {enriched.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, enriched.length)} of {enriched.length}
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-8" disabled={safePage <= 1} onClick={() => setCurrentPage(p => p - 1)} data-testid="btn-prev-page">Previous</Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page: number;
              if (totalPages <= 7) page = i + 1;
              else if (safePage <= 4) page = i + 1;
              else if (safePage >= totalPages - 3) page = totalPages - 6 + i;
              else page = safePage - 3 + i;
              return (
                <Button key={page} size="sm" variant={page === safePage ? "default" : "outline"} className="h-8 w-8 p-0" style={page === safePage ? { background: BRAND_COLOR } : {}} onClick={() => setCurrentPage(page)} data-testid={`btn-page-${page}`}>{page}</Button>
              );
            })}
            <Button size="sm" variant="outline" className="h-8" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} data-testid="btn-next-page">Next</Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
