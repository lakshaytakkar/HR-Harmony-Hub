import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plus, CreditCard, CheckCircle, Link2, Paperclip, Upload, FileText } from "lucide-react";
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
  DataTableContainer, DataTH, SortableDataTH, DataTD, DataTR, DetailModal,
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

  const [attachModal, setAttachModal] = useState<FaireBankTransaction | null>(null);
  const [attachUploading, setAttachUploading] = useState(false);
  const [attachments, setAttachments] = useState<Record<string, { id: string; file_name: string; url: string }[]>>({});

  const [addModal, setAddModal] = useState(false);
  const [addDate, setAddDate] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addType, setAddType] = useState<BankTransactionType>("CREDIT");
  const [addRef, setAddRef] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addBank, setAddBank] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const PAGE_SIZE = 25;

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
    setCurrentPage(1);
  };

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

  async function openAttachments(txn: FaireBankTransaction) {
    setAttachModal(txn);
    if (!attachments[txn.id]) {
      try {
        const res = await fetch(`/api/faire/transactions/${txn.id}/attachments`);
        const data = await res.json();
        setAttachments(prev => ({ ...prev, [txn.id]: data.attachments ?? [] }));
      } catch {
        setAttachments(prev => ({ ...prev, [txn.id]: [] }));
      }
    }
  }

  async function handleFileUpload(txn: FaireBankTransaction, file: File) {
    setAttachUploading(true);
    try {
      const res = await fetch(`/api/faire/transactions/${txn.id}/attachments`, {
        method: "POST",
        headers: { "Content-Type": file.type, "x-file-name": file.name },
        body: await file.arrayBuffer(),
      });
      const data = await res.json();
      if (data.attachment) {
        setAttachments(prev => ({
          ...prev,
          [txn.id]: [...(prev[txn.id] ?? []), { id: data.attachment.id, file_name: data.attachment.file_name, url: data.attachment.url }],
        }));
        toast({ title: "File attached", description: file.name });
      }
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setAttachUploading(false);
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
            { value: "CREDIT", label: "Faire Payouts" },
            { value: "DEBIT", label: "Paid to Suppliers" },
            { value: "unreconciled", label: "Unreconciled" },
          ]}
          activeFilter={filter}
          onFilter={k => setFilter(k as TabFilter)}
        />

        <DataTableContainer>
          {isLoading && <div className="h-48 animate-pulse bg-muted/30 rounded" />}
          {!isLoading && filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No transactions match current filters.</div>}
          {!isLoading && filtered.length > 0 && (() => {
            const sortedFiltered = sort
              ? [...filtered].sort((a, b) => {
                  const dir = sort.dir === "asc" ? 1 : -1;
                  const k = sort.key;
                  let aVal: any, bVal: any;
                  if (k === "date") { aVal = a.date; bVal = b.date; }
                  else if (k === "description") { aVal = a.description; bVal = b.description; }
                  else if (k === "amount") { aVal = a.amount_cents; bVal = b.amount_cents; }
                  else if (k === "type") { aVal = a.type; bVal = b.type; }
                  else if (k === "reconciled") { aVal = a.reconciled ? 1 : 0; bVal = b.reconciled ? 1 : 0; }
                  else { aVal = (a as any)[k]; bVal = (b as any)[k]; }
                  if (aVal == null && bVal == null) return 0;
                  if (aVal == null) return 1;
                  if (bVal == null) return -1;
                  if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * dir;
                  return String(aVal).localeCompare(String(bVal)) * dir;
                })
              : filtered;
            return <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <SortableDataTH sortKey="date" currentSort={sort} onSort={handleSort}>Date</SortableDataTH>
                <SortableDataTH sortKey="description" currentSort={sort} onSort={handleSort}>Description</SortableDataTH>
                <DataTH>Bank</DataTH>
                <SortableDataTH sortKey="type" currentSort={sort} onSort={handleSort}>Type</SortableDataTH>
                <SortableDataTH sortKey="amount" currentSort={sort} onSort={handleSort}>Amount</SortableDataTH>
                <DataTH>Reference</DataTH>
                <DataTH>Mapped Orders</DataTH>
                <SortableDataTH sortKey="reconciled" currentSort={sort} onSort={handleSort}>Reconciled</SortableDataTH>
                <DataTH>Action</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedFiltered.map(t => (
                <DataTR
                  key={t.id}
                  data-testid={`row-txn-${t.id}`}
                  className={!t.reconciled ? "border-l-[3px] border-l-amber-400" : ""}
                >
                  <DataTD className="text-muted-foreground whitespace-nowrap">{t.date}</DataTD>
                  <DataTD>
                    <div className="max-w-xs">
                      <div className="font-medium leading-tight">{t.description}</div>
                    </div>
                  </DataTD>
                  <DataTD className="text-muted-foreground">{t.bank_name}</DataTD>
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
                    <span className="font-mono text-muted-foreground">{t.reference}</span>
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
                    ) : <span className="text-muted-foreground">—</span>}
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
                    <div className="flex items-center gap-1">
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
                      <button
                        className="relative h-8 w-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        onClick={() => openAttachments(t)}
                        data-testid={`button-attach-${t.id}`}
                        title="Attachments"
                      >
                        <Paperclip size={14} />
                        {(attachments[t.id]?.length ?? 0) > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: BRAND_COLOR }}>
                            {attachments[t.id].length}
                          </span>
                        )}
                      </button>
                    </div>
                  </DataTD>
                </DataTR>
              ))}
            </tbody>
          </table>; })()}
        </DataTableContainer>
      </Fade>

      {/* Attachments modal */}
      <DetailModal
        open={!!attachModal}
        onClose={() => setAttachModal(null)}
        title="Transaction Attachments"
        subtitle={`Proof files for: ${attachModal?.reference ?? ""}`}
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setAttachModal(null)}>Close</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 text-sm">
            <div className="font-medium">{attachModal?.description}</div>
            <div className="text-muted-foreground mt-1">{attachModal?.type} · {attachModal?.date}</div>
          </div>
          <div>
            <Label className="mb-2 block">Upload New File</Label>
            <label className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30 ${attachUploading ? "opacity-50 pointer-events-none" : ""}`}>
              <Upload size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{attachUploading ? "Uploading…" : "Click to select a file (PDF, image, etc.)"}</span>
              <input
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file && attachModal) handleFileUpload(attachModal, file);
                  e.target.value = "";
                }}
                data-testid="input-attachment-file"
              />
            </label>
          </div>
          <div>
            <Label className="mb-2 block">Attached Files ({(attachModal && attachments[attachModal.id]?.length) ?? 0})</Label>
            {attachModal && (attachments[attachModal.id]?.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground py-2">No attachments yet.</p>
            )}
            {attachModal && (attachments[attachModal.id] ?? []).map((a: any) => (
              <div key={a.id} className="flex items-center gap-2 py-2 border-b last:border-b-0">
                <FileText size={14} className="text-muted-foreground shrink-0" />
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline text-primary flex-1 truncate" data-testid={`attachment-link-${a.id}`}>
                  {a.file_name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </DetailModal>

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
            <div className="text-muted-foreground mt-1">
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
                    <span className="text-muted-foreground ml-2">{o.state}</span>
                    <span className="text-muted-foreground ml-2">
                      <DualCurrencyInline cents={o.items.reduce((s: number, i: any) => s + i.price_cents * i.quantity, 0)} />
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
          {mapSearch.length > 1 && mapSearchResults.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders found for "{mapSearch}".</p>
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
