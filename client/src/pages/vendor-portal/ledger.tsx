import { useState, useEffect, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign, TrendingUp, TrendingDown, FileText, Building2, User,
  ChevronDown, ChevronUp, Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Fade } from "@/components/ui/animated";
import {
  PageShell, DataTableContainer, DataTH, SortableDataTH, DataTD, DataTR, StatGrid, StatCard,
} from "@/components/layout";
import { formatUSD } from "@/lib/faire-currency";
import { VENDOR_COLOR } from "@/lib/suprans-config";


const FULFILLER_KEYWORDS: Record<string, string[]> = {
  "ShipFast Logistics": ["shipfast", "ship fast"],
  "GlobalPack Co":      ["globalpack", "global pack"],
  "QuickFulfill EU":    ["quickfulfill", "quick fulfill"],
  "AsiaDirect Supply":  ["asiadirect", "asia direct", "riya"],
};

interface BankTx {
  id: string;
  source: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  amount_usd: number | null;
  type: string;
  category: string | null;
  is_business: boolean;
  tags: string[];
  reference: string | null;
  faire_order_id: string | null;
  reconciled: boolean;
  notes: string | null;
}

export default function VendorLedger() {
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"all" | "credit" | "debit">("all");
  const [sortKey, setSortKey] = useState<string | null>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: vendorsData } = useQuery<{ vendors: any[] }>({ queryKey: ["/api/faire/vendors"] });
  const allVendors: any[] = vendorsData?.vendors ?? [];

  const { data: txData, isLoading } = useQuery<{ transactions: BankTx[]; total: number }>({
    queryKey: ["/api/bank-transactions", { source: "faire_payout" }],
    queryFn: () => fetch("/api/bank-transactions?source=faire_payout&limit=200").then(r => r.json()),
  });
  const allTx: BankTx[] = txData?.transactions ?? [];

  useEffect(() => {
    if (allVendors.length > 0 && !selectedVendorId) {
      const stored = localStorage.getItem("vp_vendor_id");
      const match = allVendors.find(v => v.id === stored);
      setSelectedVendorId(match ? stored! : allVendors[0].id);
    }
  }, [allVendors, selectedVendorId]);

  function handleVendorChange(id: string) {
    setSelectedVendorId(id);
    localStorage.setItem("vp_vendor_id", id);
  }

  const vendor = allVendors.find(v => v.id === selectedVendorId);
  const vendorName = vendor?.name ?? "";
  const keywords = FULFILLER_KEYWORDS[vendorName] ?? [vendorName.toLowerCase().split(" ")[0]];

  const myTx = allTx.filter(t =>
    keywords.some(kw => t.description?.toLowerCase().includes(kw))
  );

  const filtered = myTx.filter(t => {
    if (typeFilter === "credit" && t.type !== "credit") return false;
    if (typeFilter === "debit" && t.type !== "debit") return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    const k = sortKey ?? "date";
    const aVal = k === "amount" ? (a.amount_usd ?? a.amount) : (a as any)[k];
    const bVal = k === "amount" ? (b.amount_usd ?? b.amount) : (b as any)[k];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === "number") return (aVal - bVal) * dir;
    return String(aVal).localeCompare(String(bVal)) * dir;
  });

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const totalCredits = myTx.filter(t => t.type === "credit").reduce((s, t) => s + (t.amount_usd ?? t.amount), 0);
  const totalDebits  = myTx.filter(t => t.type === "debit").reduce((s, t) => s + (t.amount_usd ?? t.amount), 0);
  const balance      = totalCredits - totalDebits;
  const unrec        = myTx.filter(t => !t.reconciled).length;

  const sort = sortKey ? { key: sortKey, dir: sortDir } : null;

  return (
    <PageShell>
      <Fade>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading">Ledger</h1>
            <p className="text-sm text-muted-foreground mt-1">Financial transactions and payment history</p>
          </div>
          <div className="w-64">
            <Select value={selectedVendorId} onValueChange={handleVendorChange}>
              <SelectTrigger data-testid="select-vendor-ledger">
                <SelectValue placeholder="Select your company…" />
              </SelectTrigger>
              <SelectContent>
                {allVendors.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Fade>

      <Fade>
        <StatGrid cols={4}>
          <StatCard
            label="Total Credits"
            value={formatUSD(totalCredits)}
            icon={TrendingUp}
            iconBg="#ECFDF5"
            iconColor="#059669"
          />
          <StatCard
            label="Total Debits"
            value={formatUSD(totalDebits)}
            icon={TrendingDown}
            iconBg="#FEF2F2"
            iconColor="#DC2626"
          />
          <StatCard
            label="Net Balance"
            value={formatUSD(balance)}
            icon={DollarSign}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
          />
          <StatCard
            label="Unreconciled"
            value={String(unrec)}
            icon={FileText}
            iconBg="#FFFBEB"
            iconColor="#D97706"
          />
        </StatGrid>
      </Fade>

      <Fade>
        <div className="flex gap-1.5 p-1 bg-muted/50 rounded-xl w-fit border mb-4">
          {(["all", "credit", "debit"] as const).map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={typeFilter === f ? { background: VENDOR_COLOR, color: "#fff" } : { color: "var(--muted-foreground)" }}
              data-testid={`filter-${f}`}
            >
              {f === "all" ? "All" : f === "credit" ? "Credits Received" : "Debits Paid"}
              <span className="ml-1.5 text-xs opacity-70">
                ({f === "all" ? myTx.length : f === "credit" ? myTx.filter(t => t.type === "credit").length : myTx.filter(t => t.type === "debit").length})
              </span>
            </button>
          ))}
        </div>
      </Fade>

      <Fade>
        {isLoading ? (
          <div className="h-48 animate-pulse bg-muted/30 rounded-xl" />
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center border rounded-xl bg-card">
            <DollarSign className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <div className="font-medium text-muted-foreground">No transactions found</div>
            <div className="text-sm text-muted-foreground mt-1">
              {!vendorName ? "Select a vendor to view transactions." : `No ledger entries found for ${vendorName}.`}
            </div>
          </div>
        ) : (
          <DataTableContainer>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <SortableDataTH sortKey="date" currentSort={sort} onSort={handleSort}>Date</SortableDataTH>
                  <DataTH>Description</DataTH>
                  <SortableDataTH sortKey="type" currentSort={sort} onSort={handleSort}>Type</SortableDataTH>
                  <SortableDataTH sortKey="amount" currentSort={sort} onSort={handleSort}>Amount (USD)</SortableDataTH>
                  <DataTH>Reference</DataTH>
                  <DataTH>Tags</DataTH>
                  <DataTH>Business?</DataTH>
                  <DataTH>Status</DataTH>
                  <DataTH></DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sorted.map(t => {
                  const amount = t.amount_usd ?? t.amount;
                  const isExpanded = expandedId === t.id;
                  return (
                    <Fragment key={t.id}>
                    <DataTR
                      data-testid={`row-tx-${t.id}`}
                      className={!t.reconciled ? "border-l-[3px] border-l-amber-400" : ""}
                    >
                        <DataTD className="text-muted-foreground whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString()}
                        </DataTD>
                        <DataTD className="max-w-xs">
                          <span className="line-clamp-2 text-sm">{t.description}</span>
                        </DataTD>
                        <DataTD>
                          <span
                            className="text-xs px-2 py-1 rounded-full font-semibold uppercase"
                            style={t.type === "credit"
                              ? { background: "#ECFDF5", color: "#059669" }
                              : { background: "#FEF2F2", color: "#DC2626" }}
                          >
                            {t.type}
                          </span>
                        </DataTD>
                        <DataTD>
                          <span className={`font-bold ${t.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                            {t.type === "credit" ? "+" : "−"}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </DataTD>
                        <DataTD>
                          {t.reference
                            ? <span className="text-xs text-muted-foreground">{t.reference}</span>
                            : <span className="text-muted-foreground">—</span>}
                        </DataTD>
                        <DataTD>
                          <div className="flex flex-wrap gap-1">
                            {t.tags?.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-0.5">
                                <Tag className="h-2.5 w-2.5" />{tag}
                              </span>
                            ))}
                          </div>
                        </DataTD>
                        <DataTD>
                          <span
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border w-fit"
                            style={t.is_business
                              ? { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }
                              : { background: "#FFFBEB", color: "#D97706", borderColor: "#FDE68A" }}
                          >
                            {t.is_business ? <Building2 size={11} /> : <User size={11} />}
                            {t.is_business ? "Biz" : "Personal"}
                          </span>
                        </DataTD>
                        <DataTD>
                          <span
                            className="text-xs px-2 py-1 rounded-full font-medium"
                            style={t.reconciled
                              ? { background: "#ECFDF5", color: "#059669" }
                              : { background: "#FFFBEB", color: "#D97706" }}
                          >
                            {t.reconciled ? "Reconciled" : "Pending"}
                          </span>
                        </DataTD>
                        <DataTD>
                          {t.notes && (
                            <Button variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : t.id)} data-testid={`button-notes-${t.id}`}>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </Button>
                          )}
                        </DataTD>
                      </DataTR>
                      {isExpanded && t.notes && (
                        <tr className="bg-muted/20">
                          <td colSpan={9} className="px-4 py-3 text-sm text-muted-foreground italic">
                            {t.notes}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
              {sorted.length > 0 && (
                <tfoot>
                  <tr className="border-t bg-muted/20">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold">Total</td>
                    <td className="px-4 py-3 font-bold">
                      <span style={{ color: balance >= 0 ? "#059669" : "#DC2626" }}>
                        {balance >= 0 ? "+" : "−"}${Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td colSpan={5} />
                  </tr>
                </tfoot>
              )}
            </table>
          </DataTableContainer>
        )}
      </Fade>
    </PageShell>
  );
}
