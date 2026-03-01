import { useState } from "react";
import { Copy } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireShipments, faireOrders, faireStores, faireRetailers, type OrderState } from "@/lib/mock-data-faire";

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
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [stateFilter, setStateFilter] = useState<"all" | "PRE_TRANSIT" | "IN_TRANSIT" | "DELIVERED">("all");

  const enriched = faireShipments.map(ship => {
    const order = faireOrders.find(o => o.id === ship.orderId);
    const store = order ? faireStores.find(s => s.id === order.storeId) : null;
    const retailer = order ? faireRetailers.find(r => r.id === order.retailer_id) : null;
    return { ...ship, order, store, retailer };
  }).filter(s => {
    if (selectedStore !== "all" && s.store?.id !== selectedStore) return false;
    if (stateFilter !== "all" && s.order?.state !== stateFilter) return false;
    return true;
  });

  const copyTracking = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast({ title: "Copied", description: code }));
  };

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="h-80 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Shipments</h1>
            <p className="text-sm text-muted-foreground mt-0.5">All in-transit and recent shipments</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="h-8 text-xs border rounded-lg px-2" data-testid="select-store">
              <option value="all">All Stores</option>
              {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="flex gap-1">
              {(["all", "PRE_TRANSIT", "IN_TRANSIT", "DELIVERED"] as const).map(s => (
                <button key={s} onClick={() => setStateFilter(s)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${stateFilter === s ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={stateFilter === s ? { background: "#1A6B45" } : {}} data-testid={`filter-state-${s}`}>
                  {s === "all" ? "All" : s === "PRE_TRANSIT" ? "Pre-Transit" : s === "IN_TRANSIT" ? "In Transit" : "Delivered"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Fade>

      <Fade>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Shipment ID</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Order ID</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Store</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Retailer</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Carrier</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Tracking Code</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Shipped</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Shipping Cost</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Type</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Order State</th>
                  </tr>
                </thead>
                <tbody>
                  {enriched.map(ship => {
                    const orderState = ship.order?.state ?? "IN_TRANSIT";
                    const cfg = orderStateConfig[orderState] ?? { label: orderState, color: "#6B7280", bg: "#F9FAFB" };
                    return (
                      <tr key={ship.id} className="border-b hover:bg-accent/30" data-testid={`shipment-row-${ship.id}`}>
                        <td className="p-3 text-xs font-mono text-muted-foreground">{ship.id}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[9px] font-mono">{ship.order?.display_id}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">{ship.store?.name.split(" ")[0]}</Badge>
                        </td>
                        <td className="p-3 text-xs">{ship.retailer?.store_name ?? "—"}</td>
                        <td className="p-3 text-xs font-medium">{ship.carrier}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono bg-muted rounded px-1.5 py-0.5 max-w-[120px] truncate">{ship.tracking_code}</span>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyTracking(ship.tracking_code)} data-testid={`btn-copy-tracking-${ship.id}`}><Copy size={10} /></Button>
                          </div>
                        </td>
                        <td className="p-3 text-xs">{new Date(ship.shipped_at).toLocaleDateString()}</td>
                        <td className="p-3 text-xs font-medium">${(ship.maker_cost_cents / 100).toFixed(2)}</td>
                        <td className="p-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{shipTypeLabels[ship.shipping_type] ?? ship.shipping_type}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {enriched.length === 0 && (
                    <tr><td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">No shipments match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Fade>
    </PageTransition>
  );
}
