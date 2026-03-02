import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { formatINRFromDollars, DualFromDollars } from "@/lib/faire-currency";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  SortableDataTH,
} from "@/components/layout";

const BRAND_COLOR = "#1A6B45";
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

interface EnrichedRetailer {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  total_orders: number;
  total_spent: number;
  last_ordered: string | null;
  status: "active" | "inactive";
  storeIds: string[];
}

export default function FaireRetailers() {
  const [, setLocation] = useLocation();
  const [selectedStore, setSelectedStore] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
    setCurrentPage(1);
  };
  const PAGE_SIZE = 25;

  const { data: storesData, isLoading: storesLoading } = useQuery<{ stores: any[] }>({
    queryKey: ["/api/faire/stores"],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: retailersData, isLoading: retailersLoading } = useQuery<{ retailers: any[] }>({
    queryKey: ["/api/faire/retailers"],
    queryFn: async () => {
      const res = await fetch("/api/faire/retailers", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const isLoading = storesLoading || retailersLoading;
  const stores = storesData?.stores ?? [];
  const rawRetailers = retailersData?.retailers ?? [];

  const enrichedRetailers: EnrichedRetailer[] = rawRetailers.map((r: any) => ({
    id: r.id,
    name: r.name ?? r.company_name ?? "Unknown Retailer",
    city: r.city,
    state: r.state,
    country: r.country,
    total_orders: r.total_orders ?? 0,
    total_spent: Math.round((r.total_spent_cents ?? 0) / 100),
    last_ordered: r.last_order_at ?? null,
    status: r.last_order_at && (Date.now() - new Date(r.last_order_at).getTime()) < NINETY_DAYS_MS ? "active" as const : "inactive" as const,
    storeIds: r.store_ids ?? [],
  }));

  const filtered = enrichedRetailers.filter(r => {
    if (selectedStore !== "all" && !r.storeIds.includes(selectedStore)) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sortedRetailers = sort
    ? [...filtered].sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        const key = sort.key as keyof EnrichedRetailer;
        const aVal = a[key];
        const bVal = b[key];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * dir;
        return String(aVal).localeCompare(String(bVal)) * dir;
      })
    : filtered;

  const totalPages = Math.max(1, Math.ceil(sortedRetailers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRetailers = sortedRetailers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalRetailers = enrichedRetailers.length;
  const activeRetailers = enrichedRetailers.filter(r => r.status === "active").length;
  const avgOrderValue = totalRetailers > 0
    ? Math.round(enrichedRetailers.reduce((s, r) => s + (r.total_orders > 0 ? r.total_spent / r.total_orders : 0), 0) / totalRetailers)
    : 0;
  const repeatRetailers = enrichedRetailers.filter(r => r.total_orders > 1).length;
  const repeatRate = totalRetailers > 0 ? Math.round((repeatRetailers / totalRetailers) * 100) : 0;

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
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
          title="Retailers"
          subtitle="All buyers across your Faire stores"
          actions={
            <select 
              value={selectedStore} 
              onChange={e => { setSelectedStore(e.target.value); setCurrentPage(1); }} 
              className="h-9 text-sm border rounded-lg px-3 bg-background font-medium" 
              data-testid="select-store"
            >
              <option value="all">All Stores</option>
              {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          {[
            { label: "Total Retailers", value: totalRetailers, color: BRAND_COLOR, bg: "rgba(26, 107, 69, 0.1)" },
            { label: "Active (90d)", value: activeRetailers, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Avg Order Value", value: `$${avgOrderValue}`, color: "#7C3AED", bg: "#F5F3FF", trend: formatINRFromDollars(avgOrderValue) },
            { label: "Repeat Rate", value: `${repeatRate}%`, color: "#D97706", bg: "#FFFBEB" },
          ].map((s, i) => (
            <StatCard
              key={i}
              label={s.label}
              value={s.value}
              icon={Users}
              iconBg={s.bg}
              iconColor={s.color}
              {...(s.trend ? { trend: s.trend } : {})}
            />
          ))}
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
          placeholder="Search retailer or store..."
          color={BRAND_COLOR}
          filters={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          activeFilter={statusFilter}
          onFilter={(v) => { setStatusFilter(v as any); setCurrentPage(1); }}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <SortableDataTH sortKey="name" currentSort={sort} onSort={handleSort}>Retailer</SortableDataTH>
                <SortableDataTH sortKey="city" currentSort={sort} onSort={handleSort}>City/State</SortableDataTH>
                <DataTH>Stores</DataTH>
                <SortableDataTH sortKey="total_orders" currentSort={sort} onSort={handleSort} align="center">Orders</SortableDataTH>
                <SortableDataTH sortKey="total_spent" currentSort={sort} onSort={handleSort}>Total Spent</SortableDataTH>
                <SortableDataTH sortKey="last_ordered" currentSort={sort} onSort={handleSort}>Last Order</SortableDataTH>
                <SortableDataTH sortKey="status" currentSort={sort} onSort={handleSort}>Status</SortableDataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedRetailers.map(retailer => (
                <DataTR key={retailer.id} onClick={() => setLocation(`/faire/retailers/${retailer.id}`)} data-testid={`retailer-row-${retailer.id}`}>
                  <DataTD>
                    <p className="font-medium">{retailer.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{retailer.id}</p>
                  </DataTD>
                  <DataTD className="text-muted-foreground font-medium">
                    {[retailer.city, retailer.state].filter(Boolean).join(", ") || "—"}
                  </DataTD>
                  <DataTD>
                    <div className="flex flex-wrap gap-1">
                      {retailer.storeIds.map(sid => {
                        const store = stores.find((s: any) => s.id === sid);
                        return <Badge key={sid} variant="outline" className="text-[10px] font-medium">{store?.name?.split(" ")[0] ?? sid.slice(0, 8)}</Badge>;
                      })}
                      {retailer.storeIds.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                    </div>
                  </DataTD>
                  <DataTD align="center" className="font-medium">{retailer.total_orders}</DataTD>
                  <DataTD className="font-semibold"><DualFromDollars dollars={retailer.total_spent} /></DataTD>
                  <DataTD className="text-muted-foreground font-medium">{retailer.last_ordered ? new Date(retailer.last_ordered).toLocaleDateString() : "—"}</DataTD>
                  <DataTD>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-tighter ${retailer.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{retailer.status}</span>
                  </DataTD>
                </DataTR>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground font-medium">No retailers match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      {sortedRetailers.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sortedRetailers.length)} of {sortedRetailers.length}
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-8" disabled={safePage <= 1} onClick={() => setCurrentPage(p => p - 1)} data-testid="btn-prev-page">
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page: number;
              if (totalPages <= 7) page = i + 1;
              else if (safePage <= 4) page = i + 1;
              else if (safePage >= totalPages - 3) page = totalPages - 6 + i;
              else page = safePage - 3 + i;
              return (
                <Button
                  key={page} size="sm"
                  variant={page === safePage ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  style={page === safePage ? { background: BRAND_COLOR } : {}}
                  onClick={() => setCurrentPage(page)}
                  data-testid={`btn-page-${page}`}
                >
                  {page}
                </Button>
              );
            })}
            <Button size="sm" variant="outline" className="h-8" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} data-testid="btn-next-page">
              Next
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
