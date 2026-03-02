import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plus, CreditCard, CheckCircle, Link2, Paperclip, Upload, FileText, RefreshCw, Landmark } from "lucide-react";
import { SiWise } from "react-icons/si";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatUSD, formatINR, DualCurrency, DualCurrencyInline } from "@/lib/faire-currency";
import {
  faireBankTransactions, type FaireBankTransaction, type BankTransactionType,
} from "@/lib/mock-data-faire-ops";
import {
  financeTransactions, chartOfAccounts,
} from "@/lib/mock-data-finance";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar,
  DataTableContainer, DataTH, SortableDataTH, DataTD, DataTR, DetailModal,
} from "@/components/layout";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const BRAND_COLOR = "#1A6B45";
const WISE_GREEN = "#9FE870";
const MERCURY_TEAL = "#00B8A9";

type BankView = "faire" | "mercury" | "wise";
type TabFilter = "all" | "CREDIT" | "DEBIT" | "unreconciled";

function formatWiseCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function wiseStatusConfig(status: string): { bg: string; color: string; label: string } {
  const s = (status ?? "").toLowerCase();
  if (["outgoing_payment_sent", "funds_converted"].includes(s)) return { bg: "#ECFDF5", color: "#059669", label: "Sent" };
  if (s === "processing") return { bg: "#EFF6FF", color: "#2563EB", label: "Processing" };
  if (s === "cancelled") return { bg: "#FEF2F2", color: "#DC2626", label: "Cancelled" };
  if (s === "incoming_payment_waiting") return { bg: "#FFFBEB", color: "#D97706", label: "Waiting" };
  return { bg: "#F3F4F6", color: "#6B7280", label: s.replace(/_/g, " ") || "Unknown" };
}

function MercuryView() {
  const MERCURY_ACCOUNTS = ["ac004", "ac005"];
  const mercuryAccounts = chartOfAccounts.filter((a) => MERCURY_ACCOUNTS.includes(a.id));
  const mercuryTxns = financeTransactions
    .filter((t) => MERCURY_ACCOUNTS.includes(t.accountId) && t.currency === "USD")
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalInflow = mercuryTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalOutflow = mercuryTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netBalance = totalInflow - totalOutflow;

  const entityStats = [
    {
      companyId: "neom",
      label: "Neom International LLC",
      short: "Neom",
      account: mercuryAccounts.find((a) => a.id === "ac004"),
      txns: mercuryTxns.filter((t) => t.companyId === "neom"),
    },
    {
      companyId: "cloudnest",
      label: "Cloudnest LLC",
      short: "Cloudnest",
      account: mercuryAccounts.find((a) => a.id === "ac005"),
      txns: mercuryTxns.filter((t) => t.companyId === "cloudnest"),
    },
  ].map((e) => ({
    ...e,
    inflow: e.txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-sm"
            style={{ background: MERCURY_TEAL }}
          >
            M
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold font-heading">Mercury</span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30">
                USD Business Checking
              </Badge>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Live sync coming soon
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">2 entities · Neom International LLC · Cloudnest LLC</p>
          </div>
        </div>
      </div>

      <StatGrid cols={4}>
        <StatCard label="Total Inflow" value={`$${totalInflow.toLocaleString()}`} icon={CreditCard} iconBg="#ECFDF5" iconColor="#059669" />
        <StatCard label="Total Outflow" value={`$${totalOutflow.toLocaleString()}`} icon={CreditCard} iconBg="#FEF2F2" iconColor="#DC2626" />
        <StatCard label="Net Balance" value={`$${netBalance.toLocaleString()}`} icon={CreditCard} iconBg="#EFF6FF" iconColor="#2563EB" />
        <StatCard label="Transactions" value={String(mercuryTxns.length)} icon={CreditCard} iconBg="#FFFBEB" iconColor="#D97706" />
      </StatGrid>

      <div className="grid grid-cols-2 gap-4">
        {entityStats.map(({ label, short, account, txns, inflow }) => (
          <Card key={short} className="border">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
                    {account?.code} · {account?.subtype}
                  </p>
                </div>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-sm"
                  style={{ background: MERCURY_TEAL }}
                >
                  M
                </div>
              </div>
              <div className="space-y-1.5 pt-1 border-t">
                <div className="flex justify-between text-xs pt-1.5">
                  <span className="text-muted-foreground">Opening balance</span>
                  <span className="font-semibold">${(account?.openingBalance ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total inflow</span>
                  <span className="font-semibold text-emerald-600">+${inflow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className="font-semibold">{txns.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTableContainer>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <DataTH>Date</DataTH>
              <DataTH>Description</DataTH>
              <DataTH>Entity</DataTH>
              <DataTH>Amount</DataTH>
              <DataTH>Category</DataTH>
              <DataTH>Status</DataTH>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mercuryTxns.map((t) => (
              <DataTR key={t.id} data-testid={`mercury-row-${t.id}`}>
                <DataTD className="text-muted-foreground whitespace-nowrap">{t.date}</DataTD>
                <DataTD>
                  <div className="font-medium leading-tight max-w-xs">{t.description}</div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{t.reference}</div>
                </DataTD>
                <DataTD>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium"
                    style={{ borderColor: `${MERCURY_TEAL}40`, color: MERCURY_TEAL }}
                  >
                    {t.companyId === "neom" ? "Neom" : "Cloudnest"}
                  </Badge>
                </DataTD>
                <DataTD>
                  <span className="font-semibold" style={{ color: t.type === "income" ? "#059669" : "#DC2626" }}>
                    {t.type === "income" ? "+" : "−"}${t.amount.toLocaleString()}
                  </span>
                </DataTD>
                <DataTD className="text-muted-foreground text-xs">{t.category}</DataTD>
                <DataTD>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      t.reconciledStatus === "reconciled"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    }`}
                  >
                    {t.reconciledStatus}
                  </span>
                </DataTD>
              </DataTR>
            ))}
          </tbody>
        </table>
      </DataTableContainer>
    </div>
  );
}

function WiseView() {
  const [syncing, setSyncing] = useState(false);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery<{ profile: any; balances: any[]; lastSynced: string }>({
    queryKey: ["/api/wise/summary"],
  });

  const {
    data: transfersData,
    isLoading: transfersLoading,
    refetch: refetchTransfers,
  } = useQuery<{ transfers: any[] }>({
    queryKey: ["/api/wise/transfers"],
  });

  async function handleSync() {
    setSyncing(true);
    await Promise.all([refetchSummary(), refetchTransfers()]);
    setSyncing(false);
  }

  const profile = summaryData?.profile;
  const balances = summaryData?.balances ?? [];
  const transfers = transfersData?.transfers ?? [];
  const lastSynced = summaryData?.lastSynced;
  const isLoading = summaryLoading || transfersLoading;

  const profileName =
    profile?.details?.businessName ??
    profile?.details?.name ??
    (profile?.details?.firstName && profile?.details?.lastName
      ? `${profile.details.firstName} ${profile.details.lastName}`
      : null) ??
    "Wise Account";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <SiWise size={36} style={{ color: WISE_GREEN }} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold font-heading">Wise</span>
              {profile && (
                <Badge variant="outline" className="text-[10px]">
                  {profileName}
                </Badge>
              )}
              {lastSynced && (
                <span className="text-[10px] text-muted-foreground">
                  Synced {new Date(lastSynced).toLocaleTimeString()}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Multi-currency business account · Read-only</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSync}
          disabled={syncing || isLoading}
          data-testid="button-wise-sync"
        >
          <RefreshCw size={13} className={`mr-1.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync Now"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
        </div>
      ) : balances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <SiWise size={48} style={{ color: WISE_GREEN, opacity: 0.3 }} />
          <div>
            <p className="font-semibold text-muted-foreground">No balance data available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Check that your Wise API key is set, then try syncing again.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing} data-testid="button-wise-retry">
            <RefreshCw size={13} className={`mr-1.5 ${syncing ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {balances.map((b: any) => {
              const currency = b.currency ?? b.amount?.currency ?? "?";
              const value = b.amount?.value ?? 0;
              return (
                <div
                  key={b.id ?? currency}
                  className="rounded-xl border p-4 space-y-2"
                  style={{ background: `${WISE_GREEN}0D`, borderColor: `${WISE_GREEN}50` }}
                  data-testid={`wise-balance-${currency}`}
                >
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: WISE_GREEN, color: "#1A2B0A" }}
                  >
                    {currency}
                  </span>
                  <p className="text-xl font-bold leading-tight">{formatWiseCurrency(value, currency)}</p>
                  <p className="text-[10px] text-muted-foreground">Available balance</p>
                </div>
              );
            })}
          </div>

          {transfers.length > 0 && (
            <DataTableContainer>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <DataTH>Date</DataTH>
                    <DataTH>Reference / ID</DataTH>
                    <DataTH>Amount</DataTH>
                    <DataTH>Status</DataTH>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transfers.map((t: any) => {
                    const cfg = wiseStatusConfig(t.status);
                    return (
                      <DataTR key={t.id} data-testid={`wise-transfer-${t.id}`}>
                        <DataTD className="text-muted-foreground whitespace-nowrap">
                          {t.created ? new Date(t.created).toLocaleDateString() : "—"}
                        </DataTD>
                        <DataTD>
                          <div className="font-medium">{t.details?.reference ?? `Transfer #${t.id}`}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">#{t.id}</div>
                        </DataTD>
                        <DataTD>
                          <span className="font-semibold">
                            {formatWiseCurrency(
                              t.targetValue ?? t.sourceValue ?? 0,
                              t.targetCurrency ?? t.sourceCurrency ?? "USD"
                            )}
                          </span>
                        </DataTD>
                        <DataTD>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </DataTD>
                      </DataTR>
                    );
                  })}
                </tbody>
              </table>
            </DataTableContainer>
          )}

          {transfers.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">No recent transfers found.</div>
          )}
        </>
      )}
    </div>
  );
}

export default function FaireBankTransactions() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [bankView, setBankView] = useState<BankView>("faire");

  const { data: ordersData, isLoading } = useQuery<{ orders: any[] }>({
    queryKey: ["/api/faire/orders"],
    queryFn: async () => {
      const res = await fetch("/api/faire/orders", { headers: { "Cache-Control": "no-cache" } });
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

  const filtered = transactions.filter((t) => {
    if (filter === "CREDIT" && t.type !== "CREDIT") return false;
    if (filter === "DEBIT" && t.type !== "DEBIT") return false;
    if (filter === "unreconciled" && t.reconciled) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.description.toLowerCase().includes(s) && !t.reference.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const totalCredits = transactions.filter((t) => t.type === "CREDIT").reduce((s, t) => s + t.amount_cents, 0);
  const totalDebits = transactions.filter((t) => t.type === "DEBIT").reduce((s, t) => s + t.amount_cents, 0);
  const unreconciledCount = transactions.filter((t) => !t.reconciled).length;

  const mapSearchResults = allOrders.filter(
    (o: any) => mapSearch.length > 1 && String(o.display_id ?? "").toLowerCase().includes(mapSearch.toLowerCase())
  );

  function confirmMap() {
    if (!mapModal || mapOrderIds.length === 0) {
      toast({ title: "Select at least one order", variant: "destructive" });
      return;
    }
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === mapModal.id
          ? { ...t, reconciled: true, mapped_order_ids: [...t.mapped_order_ids, ...mapOrderIds] }
          : t
      )
    );
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
        setAttachments((prev) => ({ ...prev, [txn.id]: data.attachments ?? [] }));
      } catch {
        setAttachments((prev) => ({ ...prev, [txn.id]: [] }));
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
        setAttachments((prev) => ({
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
    setTransactions((prev) => [newTxn, ...prev]);
    setAddModal(false);
    setAddDate(""); setAddAmount(""); setAddRef(""); setAddDesc(""); setAddBank("");
    toast({ title: "Transaction added", description: newTxn.reference });
  }

  const BANK_TABS: { id: BankView; label: string; icon: React.ReactNode }[] = [
    {
      id: "faire",
      label: "Faire Payouts",
      icon: <Landmark size={15} />,
    },
    {
      id: "mercury",
      label: "Mercury",
      icon: (
        <span
          className="inline-flex w-[18px] h-[18px] rounded items-center justify-center font-black text-white leading-none"
          style={{ background: MERCURY_TEAL, fontSize: 11 }}
        >
          M
        </span>
      ),
    },
    {
      id: "wise",
      label: "Wise",
      icon: <SiWise size={15} style={{ color: bankView === "wise" ? "#fff" : WISE_GREEN }} />,
    },
  ];

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Bank Transactions"
          subtitle="Credit and debit transaction log for reconciliation"
          actions={
            bankView === "faire" ? (
              <Button
                onClick={() => setAddModal(true)}
                style={{ background: BRAND_COLOR }}
                className="text-white hover:opacity-90"
                data-testid="button-add-transaction"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Transaction
              </Button>
            ) : undefined
          }
        />
      </Fade>

      <Fade>
        <div className="flex gap-1.5 p-1 rounded-xl bg-muted/50 border w-fit" data-testid="bank-view-switcher">
          {BANK_TABS.map((tab) => {
            const active = bankView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setBankView(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={
                  active
                    ? { background: BRAND_COLOR, color: "#fff" }
                    : { color: "var(--muted-foreground)", background: "transparent" }
                }
                data-testid={`bank-tab-${tab.id}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </Fade>

      {bankView === "mercury" && (
        <Fade>
          <MercuryView />
        </Fade>
      )}

      {bankView === "wise" && (
        <Fade>
          <WiseView />
        </Fade>
      )}

      {bankView === "faire" && (
        <>
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
              onFilter={(k) => setFilter(k as TabFilter)}
            />

            <DataTableContainer>
              {isLoading && <div className="h-48 animate-pulse bg-muted/30 rounded" />}
              {!isLoading && filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No transactions match current filters.
                </div>
              )}
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
                return (
                  <table className="w-full text-sm">
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
                      {sortedFiltered.map((t) => (
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
                                {t.mapped_order_ids.map((oid) => {
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
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
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
                                  <span
                                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                                    style={{ background: BRAND_COLOR }}
                                  >
                                    {attachments[t.id].length}
                                  </span>
                                )}
                              </button>
                            </div>
                          </DataTD>
                        </DataTR>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </DataTableContainer>
          </Fade>

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
                <label
                  className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30 ${attachUploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <Upload size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {attachUploading ? "Uploading…" : "Click to select a file (PDF, image, etc.)"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && attachModal) handleFileUpload(attachModal, file);
                      e.target.value = "";
                    }}
                    data-testid="input-attachment-file"
                  />
                </label>
              </div>
              <div>
                <Label className="mb-2 block">
                  Attached Files ({(attachModal && attachments[attachModal.id]?.length) ?? 0})
                </Label>
                {attachModal && (attachments[attachModal.id]?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground py-2">No attachments yet.</p>
                )}
                {attachModal &&
                  (attachments[attachModal.id] ?? []).map((a: any) => (
                    <div key={a.id} className="flex items-center gap-2 py-2 border-b last:border-b-0">
                      <FileText size={14} className="text-muted-foreground shrink-0" />
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline text-primary flex-1 truncate"
                        data-testid={`attachment-link-${a.id}`}
                      >
                        {a.file_name}
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          </DetailModal>

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
                  onChange={(e) => setMapSearch(e.target.value)}
                  placeholder="e.g. 28841"
                  data-testid="input-map-search"
                />
              </div>
              {mapSearchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mapSearchResults.map((o) => (
                    <label key={o.id} className="flex items-center gap-2 cursor-pointer p-2 rounded border hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={mapOrderIds.includes(o.id)}
                        onChange={(e) =>
                          setMapOrderIds((prev) =>
                            e.target.checked ? [...prev, o.id] : prev.filter((x) => x !== o.id)
                          )
                        }
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
                  <Input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} data-testid="input-add-date" />
                </div>
                <div>
                  <Label>Amount ($)</Label>
                  <Input type="number" step="0.01" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="0.00" data-testid="input-add-amount" />
                </div>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={addType} onValueChange={(v) => setAddType(v as BankTransactionType)}>
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
                <Input value={addRef} onChange={(e) => setAddRef(e.target.value)} placeholder="e.g. FAIRE-PAY-123" data-testid="input-add-reference" />
              </div>
              <div>
                <Label>Bank / Account</Label>
                <Input value={addBank} onChange={(e) => setAddBank(e.target.value)} placeholder="e.g. Chase Business" data-testid="input-add-bank" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={addDesc} onChange={(e) => setAddDesc(e.target.value)} placeholder="Transaction description" data-testid="input-add-description" />
              </div>
            </div>
          </DetailModal>
        </>
      )}
    </PageShell>
  );
}
