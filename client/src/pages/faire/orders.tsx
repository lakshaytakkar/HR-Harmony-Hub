import { useState } from "react";
import { useLocation } from "wouter";
import { RefreshCw, CheckCircle, XCircle, Eye } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireOrders, faireStores, type OrderState } from "@/lib/mock-data-faire";

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

const ALL_STATES: (OrderState | "all")[] = ["all", "NEW", "PRE_TRANSIT", "IN_TRANSIT", "DELIVERED", "CLOSED", "CANCELLED", "BACK_ORDERED"];
const STATE_LABELS: Record<string, string> = { all: "All", NEW: "New", PRE_TRANSIT: "Pre-Transit", IN_TRANSIT: "In Transit", DELIVERED: "Delivered", CLOSED: "Closed", CANCELLED: "Cancelled", BACK_ORDERED: "Backordered" };

const CANCEL_REASONS = ["RETAILER_CANCELLED", "BRAND_CANCELLED", "PAYMENT_FAILED", "OTHER"];

export default function FaireOrders() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(650);
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [stateFilter, setStateFilter] = useState<OrderState | "all">("all");
  const [search, setSearch] = useState("");
  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("RETAILER_CANCELLED");
  const [cancelNotes, setCancelNotes] = useState("");
  const [syncing, setSyncing] = useState(false);

  const filtered = faireOrders.filter(o => {
    if (selectedStore !== "all" && o.storeId !== selectedStore) return false;
    if (stateFilter !== "all" && o.state !== stateFilter) return false;
    if (search && !o.order_number.includes(search) && !o.retailer_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const kpiCounts = {
    NEW: faireOrders.filter(o => o.state === "NEW").length,
    unfulfilled: faireOrders.filter(o => o.state === "NEW" || o.state === "PRE_TRANSIT").length,
    IN_TRANSIT: faireOrders.filter(o => o.state === "IN_TRANSIT").length,
    DELIVERED: faireOrders.filter(o => o.state === "DELIVERED").length,
  };

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1200));
    setSyncing(false);
    toast({ title: "Sync Complete", description: "Fetched 8 new orders from Faire API." });
  };

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-80" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}</div>
        <div className="h-80 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Orders</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg px-2.5 py-1 text-xs text-blue-700 dark:text-blue-300">
                Last synced Feb 28, 9:14 AM · 8 new orders
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSync} disabled={syncing} data-testid="btn-sync-orders">
                <RefreshCw size={12} className={`mr-1.5 ${syncing ? "animate-spin" : ""}`} /> Sync Now
              </Button>
            </div>
          </div>
          <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="h-8 text-xs border rounded-lg px-2" data-testid="select-store">
            <option value="all">All Stores</option>
            {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "New Orders", value: kpiCounts.NEW, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Unfulfilled", value: kpiCounts.unfulfilled, color: "#D97706", bg: "#FFFBEB" },
            { label: "In Transit", value: kpiCounts.IN_TRANSIT, color: "#7C3AED", bg: "#F5F3FF" },
            { label: "Delivered", value: kpiCounts.DELIVERED, color: "#059669", bg: "#ECFDF5" },
          ].map((k, i) => (
            <div key={i} className="rounded-xl border p-3" style={{ background: k.bg }} data-testid={`kpi-${i}`}>
              <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 flex-wrap">
            {ALL_STATES.map(s => (
              <button key={s} onClick={() => setStateFilter(s)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${stateFilter === s ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={stateFilter === s ? { background: BRAND_COLOR } : {}} data-testid={`tab-state-${s}`}>
                {STATE_LABELS[s]}
              </button>
            ))}
          </div>
          <Input placeholder="Order # or retailer..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs h-8 text-sm ml-auto" data-testid="input-search-orders" />
        </div>
      </Fade>

      <Fade>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Order #</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Store</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Retailer</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Items</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Subtotal</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Total</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Payout</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">State</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => {
                    const store = faireStores.find(s => s.id === order.storeId);
                    const cfg = stateConfig[order.state];
                    return (
                      <tr key={order.id} className="border-b hover:bg-accent/30 cursor-pointer" onClick={() => setLocation(`/faire/orders/${order.id}`)} data-testid={`order-row-${order.id}`}>
                        <td className="p-3"><Badge variant="outline" className="text-[9px] font-mono">{order.order_number}</Badge></td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{store?.name.split(" ")[0]}</Badge></td>
                        <td className="p-3">
                          <p className="text-xs font-medium">{order.retailer_name}</p>
                          <p className="text-[10px] text-muted-foreground">{order.retailer_city}, {order.retailer_state}</p>
                        </td>
                        <td className="p-3 text-xs text-center">{order.items.length}</td>
                        <td className="p-3 text-xs">${order.subtotal}</td>
                        <td className="p-3 text-xs font-semibold">${order.total}</td>
                        <td className="p-3 text-xs text-emerald-700 dark:text-emerald-400">${order.payout_amount}</td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="p-3" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setLocation(`/faire/orders/${order.id}`)} data-testid={`btn-view-order-${order.id}`}><Eye size={12} /></Button>
                            {order.state === "NEW" && (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-600" onClick={() => setAcceptId(order.id)} data-testid={`btn-accept-order-${order.id}`}><CheckCircle size={12} /></Button>
                            )}
                            {(order.state === "NEW" || order.state === "PRE_TRANSIT") && (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => setCancelId(order.id)} data-testid={`btn-cancel-order-${order.id}`}><XCircle size={12} /></Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">No orders match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Fade>

      <Dialog open={!!acceptId} onOpenChange={() => setAcceptId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Accept Order?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Accepting this order will move it to Pre-Transit status. The retailer will be notified.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptId(null)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Order Accepted", description: "Order moved to Pre-Transit." }); setAcceptId(null); }} data-testid="btn-confirm-accept">Accept Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Order</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Cancellation Reason</Label>
              <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full h-9 border rounded-lg px-3 text-sm" data-testid="select-cancel-reason">
                {CANCEL_REASONS.map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input value={cancelNotes} onChange={e => setCancelNotes(e.target.value)} placeholder="Additional context..." data-testid="input-cancel-notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)}>Back</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Order Cancelled", description: `Reason: ${cancelReason.replace(/_/g, " ")}` }); setCancelId(null); setCancelNotes(""); }} data-testid="btn-confirm-cancel">Cancel Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
