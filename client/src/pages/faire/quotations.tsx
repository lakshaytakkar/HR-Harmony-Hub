import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, Eye, AlertCircle } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatUSD, formatINR, DualCurrency } from "@/lib/faire-currency";
import {
  faireQuotations, faireFulfillers, type FaireQuotation, type QuotationStatus,
} from "@/lib/mock-data-faire-ops";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar, DataTableContainer,
  DataTH, DataTD, DataTR, DetailModal,
} from "@/components/layout";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const BRAND_COLOR = "#1A6B45";

const STATUS_CONFIG: Record<QuotationStatus, { label: string; color: string; bg: string }> = {
  DRAFT:          { label: "Draft",           color: "#6B7280", bg: "#F9FAFB" },
  SENT:           { label: "Sent",            color: "#2563EB", bg: "#EFF6FF" },
  QUOTE_RECEIVED: { label: "Quote Received",  color: "#D97706", bg: "#FFFBEB" },
  ACCEPTED:       { label: "Accepted",        color: "#059669", bg: "#ECFDF5" },
  CHALLENGED:     { label: "Challenged",      color: "#EA580C", bg: "#FFF7ED" },
  SENT_ELSEWHERE: { label: "Sent Elsewhere",  color: "#64748B", bg: "#F1F5F9" },
};

const STATUS_TABS: (QuotationStatus | "all")[] = [
  "all", "DRAFT", "SENT", "QUOTE_RECEIVED", "ACCEPTED", "CHALLENGED", "SENT_ELSEWHERE",
];
const STATUS_LABELS: Record<string, string> = {
  all: "All", DRAFT: "Draft", SENT: "Sent", QUOTE_RECEIVED: "Quote Received",
  ACCEPTED: "Accepted", CHALLENGED: "Challenged", SENT_ELSEWHERE: "Sent Elsewhere",
};


function quotationFulfillerTotal(q: FaireQuotation): number {
  return q.items.reduce((s, i) => s + i.fulfiller_unit_cost_cents * i.ordered_quantity, 0) + q.fulfiller_shipping_cost_cents;
}

function orderFairePayout(orderId: string, orders: any[]): number {
  const o = orders.find((x: any) => x.id === orderId);
  if (!o) return 0;
  const gross = o.items.reduce((s: number, i: any) => s + i.price_cents * i.quantity, 0);
  return gross - (o.payout_costs?.commission_cents ?? 0);
}

function marginPct(q: FaireQuotation, orders: any[]): number | null {
  const payout = orderFairePayout(q.order_id, orders);
  if (!payout) return null;
  const cost = quotationFulfillerTotal(q);
  return Math.round(((payout - cost) / payout) * 100);
}

export default function FaireQuotations() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: ordersData, isLoading } = useQuery<{ orders: any[] }>({
    queryKey: ['/api/faire/orders'],
    queryFn: async () => {
      const res = await fetch('/api/faire/orders', { headers: { 'Cache-Control': 'no-cache' } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });
  const allOrders = ordersData?.orders ?? [];
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [quotations, setQuotations] = useState(faireQuotations);
  const [showNew, setShowNew] = useState(false);
  const [newOrderId, setNewOrderId] = useState("");
  const [newFulfillerId, setNewFulfillerId] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const filtered = quotations.filter(q => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    const order = allOrders.find((o: any) => o.id === q.order_id);
    if (search) {
      const s = search.toLowerCase();
      const fulfiller = faireFulfillers.find(f => f.id === q.fulfiller_id);
      if (!q.id.includes(s) && !String(order?.display_id ?? "").toLowerCase().includes(s) && !fulfiller?.name.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const total = quotations.length;
  const pending = quotations.filter(q => q.status === "QUOTE_RECEIVED").length;
  const accepted = quotations.filter(q => q.status === "ACCEPTED").length;
  const acceptedMargins = quotations
    .filter(q => q.status === "ACCEPTED")
    .map(q => marginPct(q, allOrders))
    .filter((m): m is number => m !== null);
  const avgMargin = acceptedMargins.length ? Math.round(acceptedMargins.reduce((a, b) => a + b, 0) / acceptedMargins.length) : 0;

  function createQuotation() {
    if (!newOrderId || !newFulfillerId) {
      toast({ title: "Select an order and fulfiller", variant: "destructive" });
      return;
    }
    const order = allOrders.find((o: any) => o.id === newOrderId)!;
    const id = `q_new_${Date.now()}`;
    const newQ: FaireQuotation = {
      id, order_id: newOrderId, store_id: order._storeId ?? order.storeId ?? "", fulfiller_id: newFulfillerId,
      status: "DRAFT", items: order.items.map((oi: any, idx: number) => ({
        id: `qi_new_${idx}`, quotation_id: id, order_item_id: oi.id,
        variant_id: oi.variant_id, product_id: oi.product_id,
        product_name: oi.product_name,
        variant_options: [], image_url: "",
        ordered_quantity: oi.quantity, fulfiller_unit_cost_cents: 0,
      })),
      fulfiller_shipping_cost_cents: 0, fulfiller_notes: "", our_notes: newNotes,
      lead_days: 0, sent_at: null, received_at: null, accepted_at: null, challenged_at: null,
      created_at: new Date().toISOString(),
    };
    setQuotations(prev => [newQ, ...prev]);
    setShowNew(false);
    setNewOrderId(""); setNewFulfillerId(""); setNewNotes("");
    toast({ title: "Quotation created", description: `Draft #${id} ready to send` });
    setLocation(`/faire/quotations/${id}`);
  }

  const newOrProcOrders = allOrders.filter((o: any) => o.state === "NEW" || o.state === "PROCESSING");

  return (
    <PageShell>
      <PageHeader
        title="Quotations"
        subtitle={`${total} quote requests across all stores`}
        actions={
          <Button
            data-testid="button-new-quotation"
            onClick={() => setShowNew(true)}
            style={{ background: BRAND_COLOR }}
            className="text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-1" /> New Quotation
          </Button>
        }
      />

      <Fade>
        <StatGrid cols={4}>
          <StatCard label="Total Quotes" value={isLoading ? "—" : String(total)} icon={FileText} iconBg="#F0FDF4" iconColor={BRAND_COLOR} />
          <StatCard label="Pending Review" value={isLoading ? "—" : String(pending)} icon={AlertCircle} iconBg="#FFFBEB" iconColor="#D97706" />
          <StatCard label="Accepted" value={isLoading ? "—" : String(accepted)} icon={FileText} iconBg="#ECFDF5" iconColor="#059669" />
          <StatCard label="Avg Net Margin" value={isLoading ? "—" : `${avgMargin}%`} icon={FileText} iconBg="#EFF6FF" iconColor="#2563EB" />
        </StatGrid>

        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search by quote ID, order, or fulfiller…"
          color={BRAND_COLOR}
          filters={STATUS_TABS.map(s => ({ value: s, label: STATUS_LABELS[s] }))}
          activeFilter={statusFilter}
          onFilter={s => setStatusFilter(s as QuotationStatus | "all")}
        />

        <DataTableContainer>
          {isLoading && <div className="h-48 animate-pulse bg-muted/30 rounded" />}
          {!isLoading && filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No quotations match current filters.</div>}
          {!isLoading && filtered.length > 0 && <table className="w-full text-sm">
            <thead>
              <tr>
                <DataTH>Quote ID</DataTH>
                <DataTH>Order</DataTH>
                <DataTH>Fulfiller</DataTH>
                <DataTH>Items</DataTH>
                <DataTH>Fulfiller Total</DataTH>
                <DataTH>Faire Payout</DataTH>
                <DataTH>Margin</DataTH>
                <DataTH>Status</DataTH>
                <DataTH>Sent / Received</DataTH>
                <DataTH>Action</DataTH>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const order = allOrders.find((o: any) => o.id === q.order_id);
                const fulfiller = faireFulfillers.find(f => f.id === q.fulfiller_id);
                const ftotal = quotationFulfillerTotal(q);
                const fpayout = orderFairePayout(q.order_id, allOrders);
                const mp = marginPct(q, allOrders);
                const sc = STATUS_CONFIG[q.status];
                const marginColor = mp === null ? "#6B7280" : mp > 30 ? "#059669" : mp >= 15 ? "#D97706" : "#DC2626";
                return (
                  <DataTR key={q.id} data-testid={`row-quotation-${q.id}`}>
                    <DataTD>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{q.id}</span>
                    </DataTD>
                    <DataTD>
                      {order ? (
                        <button
                          onClick={() => setLocation(`/faire/orders/${order.id}`)}
                          className="font-mono text-xs px-2 py-0.5 rounded hover:opacity-80"
                          style={{ background: "#EFF6FF", color: "#2563EB" }}
                          data-testid={`link-order-${order.id}`}
                        >
                          #{order.display_id}
                        </button>
                      ) : "—"}
                    </DataTD>
                    <DataTD>
                      {fulfiller ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: BRAND_COLOR }}>
                            {fulfiller.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium">{fulfiller.name}</span>
                        </div>
                      ) : "—"}
                    </DataTD>
                    <DataTD>{q.items.length}</DataTD>
                    <DataTD>{q.status === "DRAFT" || q.status === "SENT" ? "—" : <DualCurrency cents={ftotal} />}</DataTD>
                    <DataTD><DualCurrency cents={fpayout} /></DataTD>
                    <DataTD>
                      {mp !== null && q.status !== "DRAFT" && q.status !== "SENT" ? (
                        <span className="font-semibold" style={{ color: marginColor }}>{mp}%</span>
                      ) : "—"}
                    </DataTD>
                    <DataTD>
                      <Badge style={{ background: sc.bg, color: sc.color }} className="border-0">{sc.label}</Badge>
                    </DataTD>
                    <DataTD className="text-xs text-slate-500">
                      <div>{q.sent_at ? new Date(q.sent_at).toLocaleDateString() : "—"}</div>
                      <div>{q.received_at ? new Date(q.received_at).toLocaleDateString() : "—"}</div>
                    </DataTD>
                    <DataTD>
                      <Button
                        size="sm"
                        variant={q.status === "QUOTE_RECEIVED" ? "default" : "outline"}
                        style={q.status === "QUOTE_RECEIVED" ? { background: BRAND_COLOR, color: "white" } : {}}
                        onClick={() => setLocation(`/faire/quotations/${q.id}`)}
                        data-testid={`button-view-quotation-${q.id}`}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {q.status === "QUOTE_RECEIVED" ? "Review" : "View"}
                      </Button>
                    </DataTD>
                  </DataTR>
                );
              })}
            </tbody>
          </table>}
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="New Quotation"
        subtitle="Create a draft quote request to send to a fulfiller."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={createQuotation} style={{ background: BRAND_COLOR }} className="text-white" data-testid="button-create-quotation-confirm">
              Create Draft
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Order</Label>
            <Select value={newOrderId} onValueChange={setNewOrderId}>
              <SelectTrigger data-testid="select-new-order">
                <SelectValue placeholder="Select order…" />
              </SelectTrigger>
              <SelectContent>
                {newOrProcOrders.map(o => (
                  <SelectItem key={o.id} value={o.id}>#{o.display_id} — {o._storeId ?? o.storeId ?? "unknown"} ({o.state})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Fulfiller</Label>
            <Select value={newFulfillerId} onValueChange={setNewFulfillerId}>
              <SelectTrigger data-testid="select-new-fulfiller">
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
            <Label>Internal Notes</Label>
            <Textarea
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              placeholder="Optional notes for this quote request…"
              data-testid="input-new-quotation-notes"
            />
          </div>
        </div>
      </DetailModal>
    </PageShell>
  );
}
