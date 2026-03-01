import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Package, RefreshCw } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DualCurrency, formatUSD, formatINR } from "@/lib/faire-currency";
import { apiRequest } from "@/lib/queryClient";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  DetailModal,
} from "@/components/layout";

const BRAND_COLOR = "#1A6B45";

type ProductLifecycleState = "PUBLISHED" | "DRAFT" | "UNPUBLISHED" | "DELETED";
type ProductSaleState = "FOR_SALE" | "SALES_PAUSED";

interface FaireStore { id: string; name: string; active: boolean; last_synced_at: string | null }
interface ProductVariant {
  id: string;
  wholesale_price_cents: number;
  retail_price_cents: number;
  available_quantity: number;
  options?: { name: string; value: string }[];
}
interface FaireProduct {
  id: string;
  name: string;
  lifecycle_state: ProductLifecycleState;
  sale_state: ProductSaleState;
  taxonomy_type?: { id: string; name: string };
  variants: ProductVariant[];
  reviews?: { rating: number }[];
  minimum_order_quantity?: number;
  unit_multiplier?: number;
  thumb_url?: string | null;
  _storeId: string;
}

const lifecycleColors: Record<ProductLifecycleState, { bg: string; text: string }> = {
  PUBLISHED: { bg: "#ECFDF5", text: "#059669" },
  DRAFT: { bg: "#EFF6FF", text: "#2563EB" },
  UNPUBLISHED: { bg: "#F9FAFB", text: "#6B7280" },
  DELETED: { bg: "#FEF2F2", text: "#DC2626" },
};
const lifecycleLabels: Record<ProductLifecycleState, string> = {
  PUBLISHED: "Published", DRAFT: "Draft", UNPUBLISHED: "Unpublished", DELETED: "Deleted",
};
const saleColors: Record<ProductSaleState, { bg: string; text: string }> = {
  FOR_SALE: { bg: "#ECFDF5", text: "#059669" },
  SALES_PAUSED: { bg: "#FFF7ED", text: "#EA580C" },
};
const categoryColors: Record<string, string> = {
  "Textiles": "#8B5CF6",
  "Candles & Home Fragrance": "#F59E0B",
  "Kitchen & Dining": "#10B981",
  "Stationery & Office": "#3B82F6",
  "Wall Art & Decor": "#EF4444",
  "Bath & Body": "#EC4899",
  "Skincare": "#F472B6",
  "Food & Beverage": "#84CC16",
};

export default function FaireProducts() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStore, setSelectedStore] = useState("all");
  const [lifecycle, setLifecycle] = useState<"all" | ProductLifecycleState>("all");
  const [saleState, setSaleState] = useState<"all" | ProductSaleState>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  const { data: storesData } = useQuery<{ stores: FaireStore[] }>({
    queryKey: ["/api/faire/stores"],
  });
  const stores = storesData?.stores ?? [];

  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: FaireProduct[] }>({
    queryKey: ["/api/faire/products?slim"],
    queryFn: async () => {
      const res = await fetch("/api/faire/products?slim", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const rawProducts = productsData?.products ?? [];
  const allProducts = selectedStore === "all"
    ? rawProducts
    : rawProducts.filter(p => p._storeId === selectedStore);

  const filtered = allProducts.filter(p => {
    if (lifecycle !== "all" && p.lifecycle_state !== lifecycle) return false;
    if (saleState !== "all" && p.sale_state !== saleState) return false;
    if (search && !(p.name ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const [settingInventory, setSettingInventory] = useState(false);

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
        queryClient.invalidateQueries({ queryKey: [`/api/faire/stores/${selectedStore}/products`] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/products"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/stores"] });
        toast({ title: "Sync Complete", description: `${data.products_synced} products · ${data.orders_synced} orders synced` });
      } else {
        toast({ title: "Sync Failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleSetInventory = async () => {
    if (selectedStore === "all") {
      toast({ title: "Select a store", description: "Please select a specific store first.", variant: "destructive" });
      return;
    }
    setSettingInventory(true);
    try {
      const res = await apiRequest("POST", `/api/faire/stores/${selectedStore}/set-inventory`, { quantity: 10000 });
      const data = await res.json() as { success: boolean; updated: number; failed: number; error?: string };
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: [`/api/faire/stores/${selectedStore}/products`] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/products"] });
        toast({ title: "Inventory Updated", description: `${data.updated} variants set to 10,000 · ${data.failed} failed` });
      } else {
        toast({ title: "Failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setSettingInventory(false);
    }
  };

  const storeName = (storeId: string) => stores.find(s => s.id === storeId)?.name ?? storeId;

  if (productsLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Product Catalog"
          subtitle={`${filtered.length} products${selectedStore !== "all" ? ` · ${storeName(selectedStore)}` : " across all stores"}`}
          actions={
            <div className="flex items-center gap-2">
              <select
                value={selectedStore}
                onChange={e => { setSelectedStore(e.target.value); setSelectedIds([]); }}
                className="h-9 text-sm border rounded-lg px-3 bg-background"
                data-testid="select-store-filter"
              >
                <option value="all">All Stores</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Button
                size="sm"
                variant="outline"
                className="h-9"
                onClick={handleSetInventory}
                disabled={settingInventory || selectedStore === "all"}
                data-testid="btn-set-inventory"
              >
                <Package size={14} className={`mr-2 ${settingInventory ? "animate-spin" : ""}`} />
                {settingInventory ? "Updating…" : "Set Qty 10K"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9"
                onClick={handleSync}
                disabled={syncing || selectedStore === "all"}
                data-testid="btn-sync-products"
              >
                <RefreshCw size={14} className={`mr-2 ${syncing ? "animate-spin" : ""}`} />
                Sync
              </Button>
              <Button onClick={() => toast({ title: "Add Product", description: "Product creation form coming soon." })} style={{ background: BRAND_COLOR }} className="text-white hover-elevate" data-testid="btn-add-product">
                <Plus size={16} className="mr-2" /> Add Product
              </Button>
            </div>
          }
        />
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search products..."
          color={BRAND_COLOR}
          filters={[
            { value: "all", label: "All Lifecycle" },
            { value: "PUBLISHED", label: "Published" },
            { value: "DRAFT", label: "Draft" },
            { value: "UNPUBLISHED", label: "Unpublished" },
            { value: "DELETED", label: "Deleted" },
          ]}
          activeFilter={lifecycle}
          onFilter={(v) => setLifecycle(v as any)}
          extra={
            <div className="flex gap-1 ml-auto">
              {(["all", "FOR_SALE", "SALES_PAUSED"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSaleState(s)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${saleState === s ? "text-white border-transparent" : "bg-background hover:bg-muted"}`}
                  style={saleState === s ? { background: BRAND_COLOR } : {}}
                  data-testid={`filter-sale-${s}`}
                >
                  {s === "all" ? "All Sales" : s === "FOR_SALE" ? "For Sale" : "Paused"}
                </button>
              ))}
            </div>
          }
        />
      </Fade>

      {selectedIds.length > 0 && (
        <Fade>
          <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-4 py-2">
            <span className="text-xs text-muted-foreground font-medium">{selectedIds.length} selected</span>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { toast({ title: "Marked Published" }); setSelectedIds([]); }}>Mark Published</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { toast({ title: "Marked Unpublished" }); setSelectedIds([]); }}>Unpublish</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { toast({ title: "Exported CSV" }); setSelectedIds([]); }}>Export CSV</Button>
            <button className="text-xs text-muted-foreground ml-2 hover:text-foreground underline underline-offset-4" onClick={() => setSelectedIds([])}>Clear</button>
          </div>
        </Fade>
      )}

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-muted-foreground/30"
                      onChange={e => setSelectedIds(e.target.checked ? filtered.map(p => p.id) : [])}
                    />
                  </th>
                  <DataTH>Product</DataTH>
                  <DataTH>Store</DataTH>
                  <DataTH align="center">Variants</DataTH>
                  <DataTH>Wholesale</DataTH>
                  <DataTH>Retail</DataTH>
                  <DataTH>MOQ / Case</DataTH>
                  <DataTH>State</DataTH>
                  <DataTH align="right">Actions</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedProducts.map(product => {
                  const category = product.taxonomy_type?.name ?? "Uncategorized";
                  const catColor = categoryColors[category] || "#6B7280";
                  const lc = lifecycleColors[product.lifecycle_state] ?? lifecycleColors.DRAFT;
                  const sc = saleColors[product.sale_state] ?? saleColors.SALES_PAUSED;
                  const variants = product.variants ?? [];
                  const wholesalePrices = variants.map(v => v.wholesale_price_cents ?? 0).filter(Boolean);
                  const retailPrices = variants.map(v => v.retail_price_cents ?? 0).filter(Boolean);
                  const wMin = wholesalePrices.length ? Math.min(...wholesalePrices) : 0;
                  const wMax = wholesalePrices.length ? Math.max(...wholesalePrices) : 0;
                  const rMin = retailPrices.length ? Math.min(...retailPrices) : 0;
                  const rMax = retailPrices.length ? Math.max(...retailPrices) : 0;
                  const moq = product.minimum_order_quantity ?? 1;
                  const caseSize = product.unit_multiplier ?? 1;
                  return (
                    <DataTR key={product.id} onClick={() => setLocation(`/faire/products/${product.id}`)} data-testid={`product-row-${product.id}`}>
                      <td className="p-4" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded border-muted-foreground/30"
                        />
                      </td>
                      <DataTD>
                        <div className="flex items-center gap-3">
                          {product.thumb_url ? (
                            <img
                              src={product.thumb_url}
                              alt={product.name}
                              className="size-9 rounded-lg object-cover shrink-0 shadow-sm"
                              loading="lazy"
                              data-testid={`img-product-${product.id}`}
                            />
                          ) : (
                            <div className="size-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm" style={{ background: catColor }}>
                              {category.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm">{product.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{category}</p>
                          </div>
                        </div>
                      </DataTD>
                      <DataTD><Badge variant="outline" className="text-[10px]">{storeName(product._storeId).split(" ")[0]}</Badge></DataTD>
                      <DataTD align="center" className="font-medium">{variants.length}</DataTD>
                      <DataTD className="text-foreground/80 font-medium">
                        {wMin === 0 ? "—" : wMin === wMax ? (
                          <DualCurrency cents={wMin} />
                        ) : (
                          <span>
                            {`$${(wMin / 100).toFixed(0)}–$${(wMax / 100).toFixed(0)}`}
                            <span className="block text-[10px] text-muted-foreground/70 font-normal">{formatINR(wMin)}–{formatINR(wMax)}</span>
                          </span>
                        )}
                      </DataTD>
                      <DataTD className="text-foreground/80 font-medium">
                        {rMin === 0 ? "—" : rMin === rMax ? (
                          <DualCurrency cents={rMin} />
                        ) : (
                          <span>
                            {`$${(rMin / 100).toFixed(0)}–$${(rMax / 100).toFixed(0)}`}
                            <span className="block text-[10px] text-muted-foreground/70 font-normal">{formatINR(rMin)}–{formatINR(rMax)}</span>
                          </span>
                        )}
                      </DataTD>
                      <DataTD>
                        <div className="text-xs">
                          <span className="font-medium">{moq}</span>
                          <span className="text-muted-foreground"> / </span>
                          <span className="font-medium">{caseSize}</span>
                        </div>
                      </DataTD>
                      <DataTD>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter" style={{ background: lc.bg, color: lc.text }}>{lifecycleLabels[product.lifecycle_state] ?? product.lifecycle_state}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter" style={{ background: sc.bg, color: sc.text }}>{product.sale_state === "FOR_SALE" ? "For Sale" : "Paused"}</span>
                        </div>
                      </DataTD>
                      <DataTD align="right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setLocation(`/faire/products/${product.id}`)} data-testid={`btn-view-product-${product.id}`}><Pencil size={14} /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => setDeleteId(product.id)} data-testid={`btn-delete-product-${product.id}`}><Trash2 size={14} /></Button>
                        </div>
                      </DataTD>
                    </DataTR>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-sm text-muted-foreground font-medium">
                      {allProducts.length === 0
                        ? "No products synced yet. Select a store and click Sync."
                        : "No products match your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Product"
        subtitle="This action cannot be undone"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Product Deleted" }); setDeleteId(null); }} data-testid="btn-confirm-delete">Delete Product</Button>
          </>
        }
      >
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground font-medium">Are you sure you want to delete this product? This will remove the product and all its variants from your Faire store permanently.</p>
        </div>
      </DetailModal>
    </PageShell>
  );
}
