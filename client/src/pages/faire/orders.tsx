import { useState } from "react";
import { useLocation } from "wouter";
import { RefreshCw, CheckCircle, XCircle, Eye, ShoppingCart, Zap } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireOrders, faireStores, faireRetailers, type OrderState } from "@/lib/mock-data-faire";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  DetailModal,
} from "@/components/layout";

const BRAND_COLOR = "#1A6B45";

const stateConfig: Record<OrderState, { label: string; color: string; bg: string }> = {
  NEW: { label: "New", color: "#2563EB", bg: "#EFF6FF" },
  PROCESSING: { label: "Processing", color: "#7C3AED", bg: "#F5F3FF" },
  PRE_TRANSIT: { label: "Pre-Transit", color: "#9333EA", bg: "#FAF5FF" },
  IN_TRANSIT: { label: "In Transit", color: "#D97706", bg: "#FFFBEB" },
  DELIVERED: { label: "Delivered", color: "#059669", bg: "#ECFDF5" },
  PENDING_RETAILER_CONFIRMATION: { label: "Pending Confirmation", color: "#EA580C", bg: "#FFF7ED" },
  BACKORDERED: { label: "Backordered", color: "#DC4A26", bg: "#FFF1EE" },
  CANCELED: { label: "Canceled", color: "#6B7280", bg: "#F9FAFB" },
};

const ALL_STATES: (OrderState | "all")[] = ["all", "NEW", "PROCESSING", "PRE_TRANSIT", "IN_TRANSIT", "DELIVERED", "PENDING_RETAILER_CONFIRMATION", "BACKORDERED", "CANCELED"];
const STATE_LABELS: Record<string, string> = {
  all: "All", NEW: "New", PROCESSING: "Processing", PRE_TRANSIT: "Pre-Transit",
  IN_TRANSIT: "In Transit", DELIVERED: "Delivered",
  PENDING_RETAILER_CONFIRMATION: "Pending", BACKORDERED: "Backordered", CANCELED: "Canceled",
};

const CANCEL_REASONS = [
  "REQUESTED_BY_RETAILER", "RETAILER_NOT_GOOD_FIT", "CHANGE_REPLACE_ORDER",
  "ITEM_OUT_OF_STOCK", "INCORRECT_PRICING", "ORDER_TOO_SMALL",
  "REJECT_INTERNATIONAL_ORDER", "OTHER",
];
const CANCEL_LABELS: Record<string, string> = {
  REQUESTED_BY_RETAILER: "Requested by retailer",
  RETAILER_NOT_GOOD_FIT: "Retailer not a good fit",
  CHANGE_REPLACE_ORDER: "Change / replace order",
  ITEM_OUT_OF_STOCK: "Item out of stock",
  INCORRECT_PRICING: "Incorrect pricing",
  ORDER_TOO_SMALL: "Order too small",
  REJECT_INTERNATIONAL_ORDER: "Reject international order",
  OTHER: "Other",
};

const SOURCE_LABELS: Record<string, string> = {
  MARKETPLACE: "Marketplace",
  FAIRE_DIRECT: "Faire Direct",
  TRADESHOW: "Tradeshow",
};

export default function FaireOrders() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(650);
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [stateFilter, setStateFilter] = useState<OrderState | "all">("all");
  const [search, setSearch] = useState("");
  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("REQUESTED_BY_RETAILER");
  const [cancelNotes, setCancelNotes] = useState("");
  const [syncing, setSyncing] = useState(false);

  const filtered = faireOrders.filter(o => {
    if (selectedStore !== "all" && o.storeId !== selectedStore) return false;
    if (stateFilter !== "all" && o.state !== stateFilter) return false;
    if (search) {
      const retailer = faireRetailers.find(r => r.id === o.retailer_id);
      const retailerName = retailer?.store_name ?? "";
      if (!o.display_id.toLowerCase().includes(search.toLowerCase()) && !retailerName.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const kpiCounts = {
    NEW: faireOrders.filter(o => o.state === "NEW").length,
    PROCESSING: faireOrders.filter(o => o.state === "PROCESSING").length,
    IN_TRANSIT: faireOrders.filter(o => o.state === "IN_TRANSIT").length,
    DELIVERED: faireOrders.filter(o => o.state === "DELIVERED").length,
  };

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1200));
    setSyncing(false);
    toast({ title: "Sync Complete", description: "Fetched latest orders from Faire API." });
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-80 animate-pulse" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </StatGrid>
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Orders"
          subtitle="Manage orders across all your Faire stores"
          actions={
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg px-2.5 py-1 text-xs text-blue-700 dark:text-blue-300">
                Last synced Feb 28, 9:14 AM
              </div>
              <Button size="sm" variant="outline" className="h-9" onClick={handleSync} disabled={syncing} data-testid="btn-sync-orders">
                <RefreshCw size={14} className={`mr-2 ${syncing ? "animate-spin" : ""}`} /> Sync Now
              </Button>
              <select
                value={selectedStore}
                onChange={e => setSelectedStore(e.target.value)}
                className="h-9 text-sm border rounded-lg px-3 bg-background"
                data-testid="select-store"
              >
                <option value="all">All Stores</option>
                {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          {[
            { label: "New Orders", value: kpiCounts.NEW, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Processing", value: kpiCounts.PROCESSING, color: "#7C3AED", bg: "#F5F3FF" },
            { label: "In Transit", value: kpiCounts.IN_TRANSIT, color: "#D97706", bg: "#FFFBEB" },
            { label: "Delivered", value: kpiCounts.DELIVERED, color: "#059669", bg: "#ECFDF5" },
          ].map((k, i) => (
            <StatCard
              key={i}
              label={k.label}
              value={k.value}
              icon={ShoppingCart}
              iconBg={k.bg}
              iconColor={k.color}
            />
          ))}
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Display ID or retailer..."
          color={BRAND_COLOR}
          filters={ALL_STATES.map(s => ({ value: s, label: STATE_LABELS[s] }))}
          activeFilter={stateFilter}
          onFilter={(v) => setStateFilter(v as any)}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Display ID</DataTH>
                <DataTH>Store</DataTH>
                <DataTH>Retailer</DataTH>
                <DataTH>Source</DataTH>
                <DataTH align="center">Items</DataTH>
                <DataTH>Total</DataTH>
                <DataTH>Commission</DataTH>
                <DataTH>State</DataTH>
                <DataTH>Date</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(order => {
                const store = faireStores.find(s => s.id === order.storeId);
                const retailer = faireRetailers.find(r => r.id === order.retailer_id);
                const cfg = stateConfig[order.state];
                const itemsTotal = order.items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
                const commPct = (order.payout_costs.commission_bps / 100).toFixed(0);
                return (
                  <DataTR key={order.id} onClick={() => setLocation(`/faire/orders/${order.id}`)} data-testid={`order-row-${order.id}`}>
                    <DataTD>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-mono">{order.display_id}</Badge>
                        {order.is_free_shipping && <span title="Free shipping"><Zap size={11} className="text-emerald-500" /></span>}
                      </div>
                    </DataTD>
                    <DataTD><Badge variant="outline" className="text-[10px]">{store?.name.split(" ")[0]}</Badge></DataTD>
                    <DataTD>
                      <p className="font-medium">{retailer?.store_name ?? order.retailer_id}</p>
                      <p className="text-[10px] text-muted-foreground">{retailer?.city}, {retailer?.state}</p>
                    </DataTD>
                    <DataTD>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{SOURCE_LABELS[order.source]}</span>
                    </DataTD>
                    <DataTD align="center">{order.items.length}</DataTD>
                    <DataTD className="font-semibold">${(itemsTotal / 100).toFixed(2)}</DataTD>
                    <DataTD className="text-muted-foreground font-medium">{commPct}%</DataTD>
                    <DataTD>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </DataTD>
                    <DataTD className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</DataTD>
                    <DataTD align="right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setLocation(`/faire/orders/${order.id}`)} data-testid={`btn-view-order-${order.id}`}><Eye size={14} /></Button>
                        {order.state === "NEW" && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600" onClick={() => setAcceptId(order.id)} data-testid={`btn-accept-order-${order.id}`}><CheckCircle size={14} /></Button>
                        )}
                        {(order.state === "NEW" || order.state === "PROCESSING" || order.state === "PRE_TRANSIT") && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => setCancelId(order.id)} data-testid={`btn-cancel-order-${order.id}`}><XCircle size={14} /></Button>
                        )}
                      </div>
                    </DataTD>
                  </DataTR>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">No orders match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={!!acceptId}
        onClose={() => setAcceptId(null)}
        title="Accept Order"
        subtitle="Move order to Processing status"
        footer={
          <>
            <Button variant="outline" onClick={() => setAcceptId(null)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Order Accepted", description: "Order moved to Processing." }); setAcceptId(null); }} data-testid="btn-confirm-accept">Accept → Processing</Button>
          </>
        }
      >
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">Accepting this order will move it to Processing status. The retailer will be notified automatically.</p>
        </div>
      </DetailModal>

      <DetailModal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel Order"
        subtitle="Select a reason for cancellation"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelId(null)}>Back</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Order Canceled", description: `Reason: ${CANCEL_LABELS[cancelReason]}` }); setCancelId(null); setCancelNotes(""); }} data-testid="btn-confirm-cancel">Cancel Order</Button>
          </>
        }
      >
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cancellation Reason</Label>
            <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full h-10 border rounded-lg px-3 text-sm bg-background" data-testid="select-cancel-reason">
              {CANCEL_REASONS.map(r => <option key={r} value={r}>{CANCEL_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (optional)</Label>
            <Input value={cancelNotes} onChange={e => setCancelNotes(e.target.value)} placeholder="Additional context..." data-testid="input-cancel-notes" />
          </div>
        </div>
      </DetailModal>
    </PageShell>
  );
}
