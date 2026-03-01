import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle, ExternalLink } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { formatUSD, formatINR, DualCurrency, DualCurrencyInline } from "@/lib/faire-currency";
import {
  faireLedgerEntries, faireBankTransactions, type FaireLedgerEntry, type LedgerPaymentStatus,
} from "@/lib/mock-data-faire-ops";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar,
  DataTableContainer, DataTH, DataTD, DataTR, DetailModal,
} from "@/components/layout";

const BRAND_COLOR = "#1A6B45";

const STATUS_CONFIG: Record<LedgerPaymentStatus, { label: string; color: string; bg: string }> = {
  PENDING:        { label: "Pending",        color: "#D97706", bg: "#FFFBEB" },
  PARTIALLY_PAID: { label: "Partially Paid", color: "#2563EB", bg: "#EFF6FF" },
  CLEARED:        { label: "Cleared",        color: "#059669", bg: "#ECFDF5" },
};

const STATUS_TABS: (LedgerPaymentStatus | "all")[] = ["all", "PENDING", "PARTIALLY_PAID", "CLEARED"];
const STATUS_LABELS: Record<string, string> = {
  all: "All", PENDING: "Pending", PARTIALLY_PAID: "Partially Paid", CLEARED: "Cleared",
};


export default function FaireLedger() {
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
  const { data: storesData } = useQuery<{ stores: any[] }>({
    queryKey: ['/api/faire/stores'],
    queryFn: async () => {
      const res = await fetch('/api/faire/stores', { headers: { 'Cache-Control': 'no-cache' } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });
  const allStores = storesData?.stores ?? [];
  const [statusFilter, setStatusFilter] = useState<LedgerPaymentStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [ledger, setLedger] = useState(faireLedgerEntries);
  const [clearModal, setClearModal] = useState<FaireLedgerEntry | null>(null);
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [clearNotes, setClearNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  const filtered = ledger.filter(e => {
    if (statusFilter !== "all" && e.payment_status !== statusFilter) return false;
    if (search) {
      const o = allOrders.find((x: any) => x.id === e.order_id);
      if (!String(o?.display_id ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const totalReceivable = ledger.filter(e => e.payment_status === "PENDING").reduce((s, e) => s + e.faire_payout_cents, 0);
  const totalPayable = ledger.filter(e => e.payment_status !== "CLEARED").reduce((s, e) => s + e.fulfiller_cost_cents + e.shipping_cost_cents, 0);
  const netProfit = ledger.filter(e => e.payment_status === "CLEARED").reduce((s, e) => s + e.net_margin_cents, 0);
  const pendingRecon = ledger.filter(e => e.payment_status !== "CLEARED").length;

  const unmappedTxns = faireBankTransactions.filter(t => !t.reconciled);

  function openClearModal(entry: FaireLedgerEntry) {
    setClearModal(entry);
    setSelectedTxIds([]);
    setClearNotes(entry.notes);
  }

  function confirmClear() {
    if (!clearModal) return;
    setLedger(prev => prev.map(e => e.id === clearModal.id ? {
      ...e,
      payment_status: "CLEARED" as LedgerPaymentStatus,
      bank_transaction_ids: [...e.bank_transaction_ids, ...selectedTxIds],
      notes: clearNotes,
      faire_paid_at: e.faire_paid_at ?? new Date().toISOString(),
      fulfiller_paid_at: e.fulfiller_paid_at ?? new Date().toISOString(),
    } : e));
    setClearModal(null);
    toast({ title: "Entry cleared", description: `Ledger entry for ${clearModal.order_id} marked as Cleared` });
  }

  return (
    <PageShell>
      <PageHeader
        title="Financial Ledger"
        subtitle="Per-order financial records tracking Faire payouts vs fulfiller costs"
      />

      <Fade>
        <StatGrid cols={4}>
          <StatCard label="Faire Receivable" value={isLoading ? "—" : formatUSD(totalReceivable)} trend={isLoading ? undefined : formatINR(totalReceivable)} icon={BookOpen} iconBg="#F0FDF4" iconColor={BRAND_COLOR} />
          <StatCard label="Fulfiller Payable" value={isLoading ? "—" : formatUSD(totalPayable)} trend={isLoading ? undefined : formatINR(totalPayable)} icon={BookOpen} iconBg="#FEF2F2" iconColor="#DC2626" />
          <StatCard label="Net Profit (Cleared)" value={isLoading ? "—" : formatUSD(netProfit)} trend={isLoading ? undefined : formatINR(netProfit)} icon={BookOpen} iconBg="#ECFDF5" iconColor="#059669" />
          <StatCard label="Pending Reconciliation" value={isLoading ? "—" : String(pendingRecon)} icon={BookOpen} iconBg="#FFFBEB" iconColor="#D97706" />
        </StatGrid>

        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search by order display ID…"
          color={BRAND_COLOR}
          filters={STATUS_TABS.map(s => ({ value: s, label: STATUS_LABELS[s] }))}
          activeFilter={statusFilter}
          onFilter={s => setStatusFilter(s as LedgerPaymentStatus | "all")}
        />

        <DataTableContainer>
          {isLoading && <div className="h-48 animate-pulse bg-muted/30 rounded" />}
          {!isLoading && filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No ledger entries match current filters.</div>}
          {!isLoading && filtered.length > 0 && <table className="w-full text-sm">
            <thead>
              <tr>
                <DataTH>Order</DataTH>
                <DataTH>Store</DataTH>
                <DataTH>Faire Payout</DataTH>
                <DataTH>Commission</DataTH>
                <DataTH>Fulfiller Cost</DataTH>
                <DataTH>Shipping</DataTH>
                <DataTH>Net Margin</DataTH>
                <DataTH>Status</DataTH>
                <DataTH>Faire Paid</DataTH>
                <DataTH>Fulfiller Paid</DataTH>
                <DataTH>Txns</DataTH>
                <DataTH>Action</DataTH>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const order = allOrders.find((o: any) => o.id === e.order_id);
                const store = allStores.find((s: any) => s.id === e.store_id);
                const sc = STATUS_CONFIG[e.payment_status];
                const marginPct = e.faire_payout_cents ? Math.round((e.net_margin_cents / e.faire_payout_cents) * 100) : 0;
                const marginColor = marginPct > 30 ? "#059669" : marginPct >= 15 ? "#D97706" : "#DC2626";
                return (
                  <DataTR key={e.id} data-testid={`row-ledger-${e.id}`}>
                    <DataTD>
                      {order ? (
                        <button
                          onClick={() => setLocation(`/faire/orders/${order.id}`)}
                          className="font-mono text-xs px-2 py-0.5 rounded hover:opacity-80"
                          style={{ background: "#EFF6FF", color: "#2563EB" }}
                          data-testid={`link-ledger-order-${order.id}`}
                        >
                          #{order.display_id}
                        </button>
                      ) : e.order_id}
                    </DataTD>
                    <DataTD className="text-xs text-slate-600">{store?.name ?? e.store_id}</DataTD>
                    <DataTD className="font-medium"><DualCurrency cents={e.faire_payout_cents} /></DataTD>
                    <DataTD className="text-xs text-slate-500"><DualCurrency cents={e.commission_cents} /></DataTD>
                    <DataTD><DualCurrency cents={e.fulfiller_cost_cents} /></DataTD>
                    <DataTD className="text-xs text-slate-500"><DualCurrency cents={e.shipping_cost_cents} /></DataTD>
                    <DataTD>
                      <div className="font-semibold" style={{ color: marginColor }}><DualCurrency cents={e.net_margin_cents} /></div>
                      <div className="text-xs" style={{ color: marginColor }}>{marginPct}%</div>
                    </DataTD>
                    <DataTD>
                      <Badge style={{ background: sc.bg, color: sc.color }} className="border-0 text-xs">{sc.label}</Badge>
                    </DataTD>
                    <DataTD className="text-xs text-slate-500">
                      {e.faire_paid_at ? new Date(e.faire_paid_at).toLocaleDateString() : "—"}
                    </DataTD>
                    <DataTD className="text-xs text-slate-500">
                      {e.fulfiller_paid_at ? new Date(e.fulfiller_paid_at).toLocaleDateString() : "—"}
                    </DataTD>
                    <DataTD>
                      {e.bank_transaction_ids.length > 0 ? (
                        <span
                          className="text-xs px-2 py-0.5 rounded font-medium cursor-pointer hover:opacity-80"
                          style={{ background: "#EFF6FF", color: "#2563EB" }}
                          onClick={() => setLocation("/faire/bank-transactions")}
                          data-testid={`link-txns-${e.id}`}
                        >
                          {e.bank_transaction_ids.length} txn{e.bank_transaction_ids.length > 1 ? "s" : ""}
                        </span>
                      ) : <span className="text-slate-400 text-xs">—</span>}
                    </DataTD>
                    <DataTD>
                      {e.payment_status !== "CLEARED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openClearModal(e)}
                          data-testid={`button-clear-${e.id}`}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Mark Cleared
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Cleared
                        </span>
                      )}
                    </DataTD>
                  </DataTR>
                );
              })}
            </tbody>
          </table>}
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={!!clearModal}
        onClose={() => setClearModal(null)}
        title="Mark as Cleared"
        subtitle={`Mark ledger entry for order ${allOrders.find((o: any) => o.id === clearModal?.order_id)?.display_id ?? "—"} as fully cleared.`}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setClearModal(null)}>Cancel</Button>
            <Button onClick={confirmClear} style={{ background: BRAND_COLOR }} className="text-white" data-testid="button-confirm-clear">
              Confirm Cleared
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label className="font-semibold mb-2 block">Link Bank Transactions</Label>
            {unmappedTxns.length === 0 ? (
              <p className="text-sm text-slate-500">No unreconciled transactions available.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {unmappedTxns.map(t => (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer p-2 rounded border hover:bg-slate-50">
                    <Checkbox
                      checked={selectedTxIds.includes(t.id)}
                      onCheckedChange={checked => setSelectedTxIds(prev =>
                        checked ? [...prev, t.id] : prev.filter(x => x !== t.id)
                      )}
                      data-testid={`checkbox-txn-${t.id}`}
                    />
                    <div className="text-sm flex-1">
                      <div className="font-medium">{t.description}</div>
                      <div className="text-xs text-slate-500">{t.reference} · {t.date} · <DualCurrencyInline cents={t.amount_cents} /></div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={clearNotes}
              onChange={e => setClearNotes(e.target.value)}
              placeholder="Add clearing notes…"
              data-testid="input-clear-notes"
            />
          </div>
        </div>
      </DetailModal>
    </PageShell>
  );
}
