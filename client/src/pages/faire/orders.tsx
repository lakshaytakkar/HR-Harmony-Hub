import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, CheckCircle, XCircle, Eye, ShoppingCart, Zap, FileText, Plus } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  faireQuotations, faireFulfillers, type FaireQuotation,
} from "@/lib/mock-data-faire-ops";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar, DataTableContainer,
  DataTH, DataTD, DataTR, DetailModal,
} from "@/components/layout";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const BRAND_COLOR = "#1A6B45";

type OrderState = "NEW" | "PROCESSING" | "PRE_TRANSIT" | "IN_TRANSIT" | "DELIVERED" | "PENDING_RETAILER_CONFIRMATION" | "BACKORDERED" | "CANCELED";

interface FaireStore { id: string; name: string; active: boolean; last_synced_at: string | null }
interface OrderItem { id: string; variant_id: string; product_id: string; product_name: string; quantity: number; price_cents: number }
interface FaireOrder {
  id: string;
  display_id: string;
  state: OrderState;
  created_at: string;
  retailer_id: string;
  source: string;
  is_free_shipping: boolean;
  items: OrderItem[];
  payout_costs: { commission_bps: number };
  _storeId: string;
}

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

const QUOT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:          { label: "Draft",          color: "#6B7280", bg: "#F9FAFB" },
  SENT:           { label: "Sent",           color: "#2563EB", bg: "#EFF6FF" },
  QUOTE_RECEIVED: { label: "Quote Received", color: "#D97706", bg: "#FFFBEB" },
  ACCEPTED:       { label: "Accepted",       color: "#059669", bg: "#ECFDF5" },
  CHALLENGED:     { label: "Challenged",     color: "#EA580C", bg: "#FFF7ED" },
  SENT_ELSEWHERE: { label: "Sent Elsewhere", color: "#64748B", bg: "#F1F5F9" },
};

function buildOrdersQueryKey(selectedStore: string, stateFilter: string) {
  if (selectedStore === "all") return ["/api/faire/orders"];
  return ["/api/faire/stores", selectedStore, "orders"];
}

export default function FaireOrders() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStore, setSelectedStore] = useState("all");
  const [stateFilter, setStateFilter] = useState<OrderState | "all">("all");
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("REQUESTED_BY_RETAILER");
  const [cancelNotes, setCancelNotes] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const [quoteOrderId, setQuoteOrderId] = useState<string | null>(null);
  const [quoteFulfillerId, setQuoteFulfillerId] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quotations, setQuotations] = useState(faireQuotations);

  const { data: storesData } = useQuery<{ stores: FaireStore[] }>({
    queryKey: ["/api/faire/stores"],
  });
  const stores = storesData?.stores ?? [];

  const ordersUrl = selectedStore === "all"
    ? `/api/faire/orders${stateFilter !== "all" ? `?state=${stateFilter}` : ""}`
    : `/api/faire/stores/${selectedStore}/orders${stateFilter !== "all" ? `?state=${stateFilter}` : ""}`;

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: FaireOrder[] }>({
    queryKey: selectedStore === "all"
      ? ["/api/faire/orders", stateFilter]
      : ["/api/faire/stores", selectedStore, "orders", stateFilter],
    queryFn: () => fetch(ordersUrl).then(r => r.json()),
  });

  const allOrders = ordersData?.orders ?? [];

  const filtered = allOrders.filter(o => {
    if (search) {
      const sid = (o.display_id ?? "").toLowerCase();
      const rid = (o.retailer_id ?? "").toLowerCase();
      const q = search.toLowerCase();
      if (!sid.includes(q) && !rid.includes(q)) return false;
    }
    return true;
  });

  const kpiCounts = {
    NEW: allOrders.filter(o => o.state === "NEW").length,
    PROCESSING: allOrders.filter(o => o.state === "PROCESSING").length,
    IN_TRANSIT: allOrders.filter(o => o.state === "IN_TRANSIT").length,
    DELIVERED: allOrders.filter(o => o.state === "DELIVERED").length,
  };

  const handleSync = async () => {
    if (selectedStore === "all") {
      toast({ title: "Select a store", description: "Please select a specific store to sync.", variant: "destructive" });
      return;
    }
    setSyncing(true);
    try {
      const res = await apiRequest("POST", `/api/faire/stores/${selectedStore}/sync`);
      const data = await res.json() as { success: boolean; orders_synced: number; products_synced: number; error?: string };
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", selectedStore, "orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/stores"] });
        toast({ title: "Sync Complete", description: `${data.orders_synced} orders · ${data.products_synced} products synced` });
      } else {
        toast({ title: "Sync Failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  async function handleAccept() {
    if (!acceptId) return;
    const order = allOrders.find(o => o.id === acceptId);
    setAcceptLoading(true);
    try {
      const res = await fetch(`/api/faire/orders/${acceptId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: order?._storeId }),
      });
      const data = await res.json() as { success: boolean; state?: string; mock?: boolean; error?: string };
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/faire/orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", order?._storeId, "orders"] });
        toast({
          title: "Order Accepted",
          description: `Moved to Processing${data.mock ? " (no store selected — mock mode)" : ""}`,
        });
      } else {
        toast({ title: "Faire API Error", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setAcceptLoading(false);
      setAcceptId(null);
    }
  }

  async function handleCancel() {
    if (!cancelId) return;
    const order = allOrders.find(o => o.id === cancelId);
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/faire/orders/${cancelId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: order?._storeId, reason: cancelReason }),
      });
      const data = await res.json() as { success: boolean; state?: string; mock?: boolean; error?: string };
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/faire/orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", order?._storeId, "orders"] });
        toast({
          title: "Order Canceled",
          description: `Reason: ${CANCEL_LABELS[cancelReason]}${data.mock ? " (mock)" : ""}`,
        });
      } else {
        toast({ title: "Faire API Error", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setCancelLoading(false);
      setCancelId(null);
      setCancelNotes("");
    }
  }

  function handleRequestQuote() {
    if (!quoteOrderId || !quoteFulfillerId) {
      toast({ title: "Select an order and fulfiller", variant: "destructive" });
      return;
    }
    const order = allOrders.find(o => o.id === quoteOrderId)!;
    const id = `q_new_${Date.now()}`;
    const newQ: FaireQuotation = {
      id, order_id: quoteOrderId, store_id: order._storeId, fulfiller_id: quoteFulfillerId,
      status: "DRAFT",
      items: (order.items ?? []).map((oi, idx) => ({
        id: `qi_new_${idx}`, quotation_id: id, order_item_id: oi.id,
        variant_id: oi.variant_id, product_id: oi.product_id,
        product_name: oi.product_name, variant_options: [], image_url: "",
        ordered_quantity: oi.quantity, fulfiller_unit_cost_cents: 0,
      })),
      fulfiller_shipping_cost_cents: 0, fulfiller_notes: "", our_notes: quoteNotes,
      lead_days: 0, sent_at: null, received_at: null, accepted_at: null, challenged_at: null,
      created_at: new Date().toISOString(),
    };
    setQuotations(prev => [newQ, ...prev]);
    setQuoteOrderId(null);
    setQuoteFulfillerId("");
    setQuoteNotes("");
    toast({ title: "Quotation created", description: `Draft #${id}` });
    setLocation(`/faire/quotations/${id}`);
  }

  const storeName = (storeId: string) => stores.find(s => s.id === storeId)?.name ?? storeId;

  if (ordersLoading) {
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
              <Button size="sm" variant="outline" className="h-9" onClick={handleSync} disabled={syncing} data-testid="btn-sync-orders">
                <RefreshCw size={14} className={`mr-2 ${syncing ? "animate-spin" : ""}`} /> Sync
              </Button>
              <select
                value={selectedStore}
                onChange={e => setSelectedStore(e.target.value)}
                className="h-9 text-sm border rounded-lg px-3 bg-background"
                data-testid="select-store"
              >
                <option value="all">All Stores</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
            <StatCard key={i} label={k.label} value={k.value} icon={ShoppingCart} iconBg={k.bg} iconColor={k.color} />
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
          onFilter={(v) => setStateFilter(v as OrderState | "all")}
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
                <DataTH>Quotation</DataTH>
                <DataTH>State</DataTH>
                <DataTH>Date</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(order => {
                const cfg = stateConfig[order.state] ?? stateConfig.CANCELED;
                const items = order.items ?? [];
                const itemsTotal = items.reduce((sum, i) => sum + (i.price_cents ?? 0) * (i.quantity ?? 1), 0);
                const commPct = ((order.payout_costs?.commission_bps ?? 0) / 100).toFixed(0);
                const linkedQuote = quotations.find(q => q.order_id === order.id);
                const qsc = linkedQuote ? QUOT_STATUS_CONFIG[linkedQuote.status] : null;
                const canRequestQuote = !linkedQuote && (order.state === "NEW" || order.state === "PROCESSING");
                return (
                  <DataTR key={order.id} onClick={() => setLocation(`/faire/orders/${order.id}`)} data-testid={`order-row-${order.id}`}>
                    <DataTD>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-mono">{order.display_id ?? order.id.slice(-8)}</Badge>
                        {order.is_free_shipping && <span title="Free shipping"><Zap size={11} className="text-emerald-500" /></span>}
                      </div>
                    </DataTD>
                    <DataTD>
                      <Badge variant="outline" className="text-[10px]">
                        {storeName(order._storeId).split(" ")[0]}
                      </Badge>
                    </DataTD>
                    <DataTD>
                      <p className="font-medium text-xs truncate max-w-[120px]">{order.retailer_id}</p>
                    </DataTD>
                    <DataTD>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                        {SOURCE_LABELS[order.source] ?? order.source}
                      </span>
                    </DataTD>
                    <DataTD align="center">{items.length}</DataTD>
                    <DataTD className="font-semibold">${(itemsTotal / 100).toFixed(2)}</DataTD>
                    <DataTD className="text-muted-foreground font-medium">{commPct}%</DataTD>
                    <DataTD onClick={e => e.stopPropagation()}>
                      {linkedQuote && qsc ? (
                        <button
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium hover:opacity-80"
                          style={{ background: qsc.bg, color: qsc.color }}
                          onClick={() => setLocation(`/faire/quotations/${linkedQuote.id}`)}
                          data-testid={`link-quote-${order.id}`}
                        >
                          <FileText size={9} className="inline mr-1" />{qsc.label}
                        </button>
                      ) : canRequestQuote ? (
                        <button
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium border border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 flex items-center gap-1"
                          onClick={e => { e.stopPropagation(); setQuoteOrderId(order.id); }}
                          data-testid={`btn-request-quote-${order.id}`}
                        >
                          <Plus size={9} /> Quote
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </DataTD>
                    <DataTD>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
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
                <tr>
                  <td colSpan={11} className="p-8 text-center text-sm text-muted-foreground">
                    {allOrders.length === 0
                      ? "No orders synced yet. Use Sync to fetch orders from Faire."
                      : "No orders match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      {/* Accept dialog */}
      <DetailModal
        open={!!acceptId}
        onClose={() => setAcceptId(null)}
        title="Accept Order"
        subtitle="This will call the Faire API to move the order to Processing"
        footer={
          <>
            <Button variant="outline" onClick={() => setAcceptId(null)} disabled={acceptLoading}>Cancel</Button>
            <Button
              style={{ background: BRAND_COLOR }}
              className="text-white hover:opacity-90"
              onClick={handleAccept}
              disabled={acceptLoading}
              data-testid="btn-confirm-accept"
            >
              {acceptLoading ? "Accepting…" : "Accept → Processing"}
            </Button>
          </>
        }
      >
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">Accepting this order calls the Faire External API to move it to Processing. The retailer will be notified.</p>
        </div>
      </DetailModal>

      {/* Cancel dialog */}
      <DetailModal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel Order"
        subtitle="Select a reason for cancellation"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelId(null)} disabled={cancelLoading}>Back</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelLoading} data-testid="btn-confirm-cancel">
              {cancelLoading ? "Canceling…" : "Cancel Order"}
            </Button>
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

      {/* Request Quote dialog */}
      <DetailModal
        open={!!quoteOrderId}
        onClose={() => setQuoteOrderId(null)}
        title="Request Quote"
        subtitle="Create a draft quotation to send to a fulfiller."
        footer={
          <>
            <Button variant="outline" onClick={() => setQuoteOrderId(null)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white" onClick={handleRequestQuote} data-testid="btn-confirm-request-quote">
              Create Draft
            </Button>
          </>
        }
      >
        <div className="space-y-4 px-1">
          <div>
            <Label>Fulfiller</Label>
            <Select value={quoteFulfillerId} onValueChange={setQuoteFulfillerId}>
              <SelectTrigger data-testid="select-quote-fulfiller">
                <SelectValue placeholder="Select fulfiller…" />
              </SelectTrigger>
              <SelectContent>
                {faireFulfillers.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name} ({f.country})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={quoteNotes}
              onChange={e => setQuoteNotes(e.target.value)}
              placeholder="Internal notes for this quote…"
              data-testid="input-quote-notes"
            />
          </div>
        </div>
      </DetailModal>
    </PageShell>
  );
}
