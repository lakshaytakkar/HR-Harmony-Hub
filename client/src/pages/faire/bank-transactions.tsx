import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plus, CreditCard, CheckCircle, Link2 } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatUSD, formatINR, DualCurrency, DualCurrencyInline } from "@/lib/faire-currency";
import {
  faireBankTransactions, type FaireBankTransaction, type BankTransactionType,
} from "@/lib/mock-data-faire-ops";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar,
  DataTableContainer, DataTH, DataTD, DataTR, DetailModal,
} from "@/components/layout";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const BRAND_COLOR = "#1A6B45";


type TabFilter = "all" | "CREDIT" | "DEBIT" | "unreconciled";

export default function FaireBankTransactions() {
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
  const [filter, setFilter] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState(faireBankTransactions);

  const [mapModal, setMapModal] = useState<FaireBankTransaction | null>(null);
  const [mapSearch, setMapSearch] = useState("");
  const [mapOrderIds, setMapOrderIds] = useState<string[]>([]);

  const [addModal, setAddModal] = useState(false);
  const [addDate, setAddDate] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addType, setAddType] = useState<BankTransactionType>("CREDIT");
  const [addRef, setAddRef] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addBank, setAddBank] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  const filtered = transactions.filter(t => {
    if (filter === "CREDIT" && t.type !== "CREDIT") return false;
    if (filter === "DEBIT" && t.type !== "DEBIT") return false;
    if (filter === "unreconciled" && t.reconciled) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.description.toLowerCase().includes(s) && !t.reference.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const totalCredits = transactions.filter(t => t.type === "CREDIT").reduce((s, t) => s + t.amount_cents, 0);
  const totalDebits = transactions.filter(t => t.type === "DEBIT").reduce((s, t) => s + t.amount_cents, 0);
  const unreconciledCount = transactions.filter(t => !t.reconciled).length;

  const mapSearchResults = allOrders.filter((o: any) =>
    mapSearch.length > 1 && String(o.display_id ?? "").toLowerCase().includes(mapSearch.toLowerCase())
  );

  function confirmMap() {
    if (!mapModal || mapOrderIds.length === 0) {
      toast({ title: "Select at least one order", variant: "destructive" });
      return;
    }
    setTransactions(prev => prev.map(t => t.id === mapModal.id ? {
      ...t, reconciled: true,
      mapped_order_ids: [...t.mapped_order_ids, ...mapOrderIds],
    } : t));
    setMapModal(null);
    setMapOrderIds([]);
    setMapSearch("");
    toast({ title: "Transaction mapped", description: `Linked to ${mapOrderIds.length} order(s)` });
  }

  function confirmAdd() {
    if (!addDate || !addAmount || !addRef || !addDesc || !addBank) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    const newTxn: FaireBankTransaction = {
      id: `bt_new_${Date.now()}`,
      date: addDate,
      amount_cents: Math.round(parseFloat(addAmount) * 100),
      currency: "USD",
      reference: addRef,
      bank_name: addBank,
      type: addType,
      description: addDesc,
      mapped_order_ids: [],
      mapped_ledger_ids: [],
      reconciled: false,
    };
    setTransactions(prev => [newTxn, ...prev]);
    setAddModal(false);
    setAddDate(""); setAddAmount(""); setAddRef(""); setAddDesc(""); setAddBank("");
    toast({ title: "Transaction added", description: newTxn.reference });
  }

  return (
    <PageShell>
      <PageHeader
        title="Bank Transactions"
        subtitle="Credit and debit transaction log for reconciliation"
        actions={
          <Button
            onClick={() => setAddModal(true)}
            style={{ background: BRAND_COLOR }}
            className="text-white hover:opacity-90"
            data-testid="button-add-transaction"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Transaction
          </Button>
        }
      />

      <Fade>
        <StatGrid cols={3}>
          <StatCard label="Total Credits" value={isLoading ? "—" : formatUSD(totalCredits)} trend={isLoading ? undefined : formatINR(totalCredits)} icon={CreditCard} iconBg="#ECFDF5" iconColor="#059669" />
          <StatCard label="Total Debits" value={isLoading ? "—" : formatUSD(totalDebits)} trend={isLoading ? undefined : formatINR(totalDebits)} icon={CreditCard} iconBg="#FEF2F2" iconColor="#DC2626" />
          <StatCard label="Unreconciled" value={isLoading ? "—" : String(unreconciledCount)} icon={CreditCard} iconBg="#FFFBEB" iconColor="#D97706" />
        </StatGrid>

        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search by description or reference…"
          color={BRAND_COLOR}
          filters={[
            { value: "all", label: "All" },
            { value: "CREDIT", label: "Credits" },
            { value: "DEBIT", label: "Debits" },
            { value: "unreconciled", label: "Unreconciled" },
          ]}
          activeFilter={filter}
          onFilter={k => setFilter(k as TabFilter)}
        />

        <DataTableContainer>
          {isLoading && <div className="h-48 animate-pulse bg-muted/30 rounded" />}
          {!isLoading && filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No transactions match current filters.</div>}
          {!isLoading && filtered.length > 0 && <table className="w-full text-sm">
            <thead>
              <tr>
                <DataTH>Date</DataTH>
                <DataTH>Description</DataTH>
                <DataTH>Bank</DataTH>
                <DataTH>Type</DataTH>
                <DataTH>Amount</DataTH>
                <DataTH>Reference</DataTH>
                <DataTH>Mapped Orders</DataTH>
                <DataTH>Reconciled</DataTH>
                <DataTH>Action</DataTH>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <DataTR
                  key={t.id}
                  data-testid={`row-txn-${t.id}`}
                  className={!t.reconciled ? "border-l-[3px] border-l-amber-400" : ""}
                >
                  <DataTD className="text-xs text-slate-500 whitespace-nowrap">{t.date}</DataTD>
                  <DataTD>
                    <div className="max-w-xs">
                      <div className="font-medium text-sm leading-tight">{t.description}</div>
                    </div>
                  </DataTD>
                  <DataTD className="text-xs text-slate-500">{t.bank_name}</DataTD>
                  <DataTD>
                    <Badge
                      className="border-0 text-xs"
                      style={{
                        background: t.type === "CREDIT" ? "#ECFDF5" : "#FEF2F2",
                        color: t.type === "CREDIT" ? "#059669" : "#DC2626",
                      }}
                    >
                      {t.type}
                    </Badge>
                  </DataTD>
                  <DataTD>
                    <span className="font-semibold" style={{ color: t.type === "CREDIT" ? "#059669" : "#DC2626" }}>
                      {t.type === "CREDIT" ? "+" : "−"}<DualCurrency cents={t.amount_cents} />
                    </span>
                  </DataTD>
                  <DataTD>
                    <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">{t.reference}</span>
                  </DataTD>
                  <DataTD>
                    {t.mapped_order_ids.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {t.mapped_order_ids.map(oid => {
                          const o = allOrders.find((x: any) => x.id === oid);
                          return o ? (
                            <button
                              key={oid}
                              onClick={() => setLocation(`/faire/orders/${oid}`)}
                              className="font-mono text-xs px-1.5 py-0.5 rounded hover:opacity-80"
                              style={{ background: "#EFF6FF", color: "#2563EB" }}
                              data-testid={`link-txn-order-${oid}`}
                            >
                              #{o.display_id}
                            </button>
                          ) : null;
                        })}
                      </div>
                    ) : <span className="text-slate-400 text-xs">—</span>}
                  </DataTD>
                  <DataTD>
                    {t.reconciled ? (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                        <Link2 className="h-3 w-3" /> No — Map
                      </span>
                    )}
                  </DataTD>
                  <DataTD>
                    {!t.reconciled && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setMapModal(t); setMapOrderIds([]); setMapSearch(""); }}
                        data-testid={`button-map-${t.id}`}
                      >
                        Map to Order
                      </Button>
                    )}
                  </DataTD>
                </DataTR>
              ))}
            </tbody>
          </table>}
        </DataTableContainer>
      </Fade>

      {/* Map to Order dialog */}
      <DetailModal
        open={!!mapModal}
        onClose={() => setMapModal(null)}
        title="Map to Order"
        subtitle={`Link transaction "${mapModal?.reference ?? ""}" to one or more orders.`}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setMapModal(null)}>Cancel</Button>
            <Button onClick={confirmMap} style={{ background: BRAND_COLOR }} className="text-white" data-testid="button-confirm-map">
              Confirm Mapping
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 text-sm">
            <div className="font-medium">{mapModal?.description}</div>
            <div className="text-slate-500 mt-1">
              {mapModal?.type} · {mapModal && <DualCurrencyInline cents={mapModal.amount_cents} />} · {mapModal?.date}
            </div>
          </div>
          <div>
            <Label>Search Orders by Display ID</Label>
            <Input
              value={mapSearch}
              onChange={e => setMapSearch(e.target.value)}
              placeholder="e.g. 28841"
              data-testid="input-map-search"
            />
          </div>
          {mapSearchResults.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {mapSearchResults.map(o => (
                <label key={o.id} className="flex items-center gap-2 cursor-pointer p-2 rounded border hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={mapOrderIds.includes(o.id)}
                    onChange={e => setMapOrderIds(prev =>
                      e.target.checked ? [...prev, o.id] : prev.filter(x => x !== o.id)
                    )}
                    data-testid={`checkbox-order-${o.id}`}
                  />
                  <div className="text-sm">
                    <span className="font-mono font-bold">#{o.display_id}</span>
                    <span className="text-slate-500 ml-2">{o.state}</span>
                    <span className="text-slate-400 ml-2">
                      <DualCurrencyInline cents={o.items.reduce((s: number, i: any) => s + i.price_cents * i.quantity, 0)} />
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
          {mapSearch.length > 1 && mapSearchResults.length === 0 && (
            <p className="text-sm text-slate-500">No orders found for "{mapSearch}".</p>
          )}
        </div>
      </DetailModal>

      {/* Add Transaction dialog */}
      <DetailModal
        open={addModal}
        onClose={() => setAddModal(false)}
        title="Add Bank Transaction"
        subtitle="Record a new bank credit or debit transaction."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button onClick={confirmAdd} style={{ background: BRAND_COLOR }} className="text-white" data-testid="button-confirm-add-transaction">
              Add Transaction
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={addDate} onChange={e => setAddDate(e.target.value)} data-testid="input-add-date" />
            </div>
            <div>
              <Label>Amount ($)</Label>
              <Input type="number" step="0.01" value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="0.00" data-testid="input-add-amount" />
            </div>
          </div>
          <div>
            <Label>Type</Label>
            <Select value={addType} onValueChange={v => setAddType(v as BankTransactionType)}>
              <SelectTrigger data-testid="select-add-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREDIT">Credit (money in)</SelectItem>
                <SelectItem value="DEBIT">Debit (money out)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Reference</Label>
            <Input value={addRef} onChange={e => setAddRef(e.target.value)} placeholder="e.g. FAIRE-PAY-123" data-testid="input-add-reference" />
          </div>
          <div>
            <Label>Bank / Account</Label>
            <Input value={addBank} onChange={e => setAddBank(e.target.value)} placeholder="e.g. Chase Business" data-testid="input-add-bank" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={addDesc} onChange={e => setAddDesc(e.target.value)} placeholder="Transaction description" data-testid="input-add-description" />
          </div>
        </div>
      </DetailModal>
    </PageShell>
  );
}
