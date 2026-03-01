import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  PageShell, PageHeader, DataTableContainer, DataTH, DataTD, DataTR,
} from "@/components/layout";

const BRAND_COLOR = "#1A6B45";

function marginColor(pct: number) {
  if (pct >= 50) return { bg: "#ECFDF5", text: "#059669" };
  if (pct >= 30) return { bg: "#FFFBEB", text: "#D97706" };
  return { bg: "#FEF2F2", text: "#DC2626" };
}

const mockPrepacks = [
  { id: "pp-001", name: "Candle Sampler Trio", products: ["Soy Wax Pillar Candle Set (3 scents)"], units: 3, wholesale_price_cents: 7500, storeId: "store-001" },
  { id: "pp-002", name: "Wellness Starter Kit", products: ["Lavender Body Oil 4oz", "Rose Facial Serum 1oz"], units: 2, wholesale_price_cents: 3600, storeId: "store-005" },
  { id: "pp-003", name: "Kitchen Essentials Bundle", products: ["Rattan Fruit Bowl Lg", "Linen Napkin Set (Natural)"], units: 2, wholesale_price_cents: 4400, storeId: "store-002" },
];

export default function FairePricing() {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkType, setBulkType] = useState<"wholesale" | "retail">("wholesale");
  const [bulkValue, setBulkValue] = useState("");
  const [bulkMode, setBulkMode] = useState<"percent" | "fixed">("percent");
  const [addPrepackOpen, setAddPrepackOpen] = useState(false);
  const [prepackName, setPrepackName] = useState("");
  const [prepackPrice, setPrepackPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: any[] }>({
    queryKey: ["/api/faire/products?slim"],
    queryFn: async () => {
      const res = await fetch("/api/faire/products?slim", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: storesData, isLoading: storesLoading } = useQuery<{ stores: any[] }>({
    queryKey: ["/api/faire/stores"],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const isLoading = productsLoading || storesLoading;
  const products = productsData?.products ?? [];
  const stores = storesData?.stores ?? [];

  const rows = products.flatMap((p: any) =>
    (p.variants ?? []).map((v: any) => ({
      ...v,
      productName: p.name,
      storeId: p._storeId,
      moq: p.minimum_order_quantity,
      store: stores.find((s: any) => s.id === p._storeId),
    }))
  ).filter((r: any) => {
    if (selectedStore !== "all" && r.storeId !== selectedStore) return false;
    if (search && !r.productName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleRow = (id: string) => setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const filteredPrepacks = selectedStore === "all" ? mockPrepacks : mockPrepacks.filter(pp => pp.storeId === selectedStore);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Pricing & Prepacks"
          subtitle="Manage wholesale and retail prices across all stores"
          actions={
            <div className="flex gap-2">
              <select value={selectedStore} onChange={e => { setSelectedStore(e.target.value); setCurrentPage(1); }} className="h-8 text-xs border rounded-lg px-2" data-testid="select-store">
                <option value="all">All Stores</option>
                {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="max-w-xs h-8 text-sm" data-testid="input-search" />
            </div>
          }
        />
      </Fade>

      {selectedRows.length > 0 && (
        <Fade>
          <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-4 py-2">
            <span className="text-xs text-muted-foreground">{selectedRows.length} variants selected</span>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setBulkType("wholesale"); setBulkOpen(true); }} data-testid="btn-bulk-wholesale">Adjust Wholesale</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setBulkType("retail"); setBulkOpen(true); }} data-testid="btn-bulk-retail">Adjust Retail</Button>
            <button className="text-xs text-muted-foreground ml-2 hover:text-foreground" onClick={() => setSelectedRows([])}>Clear</button>
          </div>
        </Fade>
      )}

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH className="w-8"><input type="checkbox" className="rounded" onChange={e => setSelectedRows(e.target.checked ? rows.map((r: any) => r.id) : [])} /></DataTH>
                <DataTH>Product</DataTH>
                <DataTH>Store</DataTH>
                <DataTH>SKU</DataTH>
                <DataTH>Wholesale</DataTH>
                <DataTH>Retail</DataTH>
                <DataTH>Margin %</DataTH>
                <DataTH>MOQ</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedRows.map((r: any) => {
                const wholesaleCents = r.wholesale_price_cents ?? 0;
                const retailCents = r.retail_price_cents ?? 0;
                const margin = retailCents > 0 ? Math.round(((retailCents - wholesaleCents) / retailCents) * 100) : 0;
                const mc = marginColor(margin);
                return (
                  <DataTR key={r.id} data-testid={`pricing-row-${r.id}`}>
                    <DataTD>
                      <input type="checkbox" checked={selectedRows.includes(r.id)} onChange={() => toggleRow(r.id)} className="rounded" data-testid={`check-${r.id}`} />
                    </DataTD>
                    <DataTD>
                      <p className="text-xs font-medium">{r.productName}</p>
                      <p className="text-[10px] text-muted-foreground">{(r.options ?? []).map((o: any) => o.value).join(" / ")}</p>
                    </DataTD>
                    <DataTD><Badge variant="outline" className="text-[10px]">{r.store?.name?.split(" ")[0] ?? "—"}</Badge></DataTD>
                    <DataTD className="text-xs font-mono text-muted-foreground">{r.sku}</DataTD>
                    <DataTD className="text-xs font-semibold">${(wholesaleCents / 100).toFixed(2)}</DataTD>
                    <DataTD className="text-xs">${(retailCents / 100).toFixed(2)}</DataTD>
                    <DataTD>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: mc.bg, color: mc.text }}>{margin}%</span>
                    </DataTD>
                    <DataTD className="text-xs">{r.moq}</DataTD>
                  </DataTR>
                );
              })}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      {rows.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, rows.length)} of {rows.length}
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-8" disabled={safePage <= 1} onClick={() => setCurrentPage(p => p - 1)} data-testid="btn-prev-page">Previous</Button>
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
            <Button size="sm" variant="outline" className="h-8" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} data-testid="btn-next-page">Next</Button>
          </div>
        </div>
      )}

      <Fade>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Prepacks</h2>
          <Button size="sm" variant="outline" onClick={() => setAddPrepackOpen(true)} data-testid="btn-add-prepack"><Plus size={13} className="mr-1.5" /> Add Prepack</Button>
        </div>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Prepack Name</DataTH>
                <DataTH>Products</DataTH>
                <DataTH>Units</DataTH>
                <DataTH>Wholesale</DataTH>
                <DataTH>Store</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPrepacks.map(pp => (
                <DataTR key={pp.id} data-testid={`prepack-row-${pp.id}`}>
                  <DataTD className="text-xs font-medium">{pp.name}</DataTD>
                  <DataTD className="text-xs text-muted-foreground">{pp.products.join(", ")}</DataTD>
                  <DataTD className="text-xs">{pp.units}</DataTD>
                  <DataTD className="text-xs font-semibold">${(pp.wholesale_price_cents / 100).toFixed(2)}</DataTD>
                  <DataTD><Badge variant="outline" className="text-[10px]">{stores.find((s: any) => s.id === pp.storeId)?.name?.split(" ")[0] ?? "—"}</Badge></DataTD>
                </DataTR>
              ))}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <Dialog open={bulkOpen} onOpenChange={() => setBulkOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adjust {bulkType === "wholesale" ? "Wholesale" : "Retail"} Price — {selectedRows.length} variants</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex gap-2">
              <button onClick={() => setBulkMode("percent")} className={`flex-1 py-2 text-sm rounded-lg border ${bulkMode === "percent" ? "text-white border-transparent" : "bg-background"}`} style={bulkMode === "percent" ? { background: BRAND_COLOR } : {}} data-testid="mode-percent">% Change</button>
              <button onClick={() => setBulkMode("fixed")} className={`flex-1 py-2 text-sm rounded-lg border ${bulkMode === "fixed" ? "text-white border-transparent" : "bg-background"}`} style={bulkMode === "fixed" ? { background: BRAND_COLOR } : {}} data-testid="mode-fixed">Fixed $ Amount</button>
            </div>
            <div className="space-y-1.5">
              <Label>{bulkMode === "percent" ? "Percentage Change (e.g. +5 or -10)" : "New Price ($)"}</Label>
              <Input type="number" value={bulkValue} onChange={e => setBulkValue(e.target.value)} placeholder={bulkMode === "percent" ? "e.g. 5" : "e.g. 28"} data-testid="input-bulk-value" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Prices Updated", description: `${selectedRows.length} variants updated.` }); setBulkOpen(false); setSelectedRows([]); }} data-testid="btn-apply-bulk">Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addPrepackOpen} onOpenChange={() => setAddPrepackOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Prepack</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Prepack Name</Label><Input value={prepackName} onChange={e => setPrepackName(e.target.value)} placeholder="e.g. Wellness Starter Kit" data-testid="input-prepack-name" /></div>
            <div className="space-y-1.5"><Label>Wholesale Price ($)</Label><Input type="number" value={prepackPrice} onChange={e => setPrepackPrice(e.target.value)} placeholder="e.g. 75.00" data-testid="input-prepack-price" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPrepackOpen(false)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Prepack Created", description: prepackName }); setAddPrepackOpen(false); setPrepackName(""); setPrepackPrice(""); }} data-testid="btn-save-prepack">Create Prepack</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
