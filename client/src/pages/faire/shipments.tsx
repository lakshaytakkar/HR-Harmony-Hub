import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireShipments, faireOrders, faireStores } from "@/lib/mock-data-faire";

const statusConfig = {
  shipped: { label: "Shipped", color: "#2563EB", bg: "#EFF6FF" },
  in_transit: { label: "In Transit", color: "#D97706", bg: "#FFFBEB" },
  delivered: { label: "Delivered", color: "#059669", bg: "#ECFDF5" },
};

export default function FaireShipments() {
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "shipped" | "in_transit" | "delivered">("all");

  const enriched = faireShipments.map(ship => {
    const order = faireOrders.find(o => o.id === ship.orderId);
    const store = order ? faireStores.find(s => s.id === order.storeId) : null;
    return { ...ship, order, store };
  }).filter(s => {
    if (selectedStore !== "all" && s.store?.id !== selectedStore) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num).then(() => toast({ title: "Copied", description: num }));
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
              {(["all", "shipped", "in_transit", "delivered"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${statusFilter === s ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={statusFilter === s ? { background: "#1A6B45" } : {}} data-testid={`filter-status-${s}`}>
                  {s === "all" ? "All" : s === "in_transit" ? "In Transit" : s.charAt(0).toUpperCase() + s.slice(1)}
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
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Order #</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Store</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Retailer</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Carrier</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Tracking #</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Shipped</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Est. Delivery</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Pkgs</th>
                  </tr>
                </thead>
                <tbody>
                  {enriched.map(ship => {
                    const cfg = statusConfig[ship.status];
                    return (
                      <tr key={ship.id} className="border-b hover:bg-accent/30" data-testid={`shipment-row-${ship.id}`}>
                        <td className="p-3 text-xs font-mono text-muted-foreground">{ship.id}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[9px] font-mono">{ship.order?.order_number}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">{ship.store?.name.split(" ")[0]}</Badge>
                        </td>
                        <td className="p-3 text-xs">{ship.order?.retailer_name}</td>
                        <td className="p-3 text-xs font-medium">{ship.carrier}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono bg-muted rounded px-1.5 py-0.5 max-w-[120px] truncate">{ship.tracking_number}</span>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyTracking(ship.tracking_number)} data-testid={`btn-copy-tracking-${ship.id}`}><Copy size={10} /></Button>
                            <a href={ship.tracking_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" data-testid={`btn-track-${ship.id}`}><ExternalLink size={10} /></Button>
                            </a>
                          </div>
                        </td>
                        <td className="p-3 text-xs">{new Date(ship.shipped_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div>
                            <p className="text-xs">{new Date(ship.estimated_delivery).toLocaleDateString()}</p>
                            {ship.status === "in_transit" && (
                              <div className="mt-1 w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: "60%", background: "#D97706" }} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        </td>
                        <td className="p-3 text-xs text-center">{ship.package_count}</td>
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
