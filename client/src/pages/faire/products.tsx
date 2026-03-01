import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Star, Trash2, Pencil, Package } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireProducts, faireStores, type ProductLifecycleState, type ProductSaleState } from "@/lib/mock-data-faire";
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

const lifecycleColors: Record<ProductLifecycleState, { bg: string; text: string }> = {
  ACTIVE: { bg: "#ECFDF5", text: "#059669" },
  INACTIVE: { bg: "#F9FAFB", text: "#6B7280" },
  DRAFT: { bg: "#EFF6FF", text: "#2563EB" },
};
const saleColors: Record<ProductSaleState, { bg: string; text: string }> = {
  FOR_SALE: { bg: "#ECFDF5", text: "#059669" },
  NOT_FOR_SALE: { bg: "#FEF2F2", text: "#DC2626" },
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
  const isLoading = useSimulatedLoading(650);
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [lifecycle, setLifecycle] = useState<"all" | ProductLifecycleState>("all");
  const [saleState, setSaleState] = useState<"all" | ProductSaleState>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = faireProducts.filter(p => {
    if (selectedStore !== "all" && p.storeId !== selectedStore) return false;
    if (lifecycle !== "all" && p.lifecycle_state !== lifecycle) return false;
    if (saleState !== "all" && p.sale_state !== saleState) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (isLoading) {
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
          subtitle={`${filtered.length} products across ${faireStores.length} stores`}
          actions={
            <div className="flex items-center gap-2">
              <select 
                value={selectedStore} 
                onChange={e => setSelectedStore(e.target.value)} 
                className="h-9 text-sm border rounded-lg px-3 bg-background" 
                data-testid="select-store-filter"
              >
                <option value="all">All Stores</option>
                {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
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
            { value: "ACTIVE", label: "Active" },
            { value: "DRAFT", label: "Draft" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
          activeFilter={lifecycle}
          onFilter={(v) => setLifecycle(v as any)}
          extra={
            <div className="flex gap-1 ml-auto">
              {(["all", "FOR_SALE", "NOT_FOR_SALE"] as const).map(s => (
                <button 
                  key={s} 
                  onClick={() => setSaleState(s)} 
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${saleState === s ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} 
                  style={saleState === s ? { background: BRAND_COLOR } : {}} 
                  data-testid={`filter-sale-${s}`}
                >
                  {s === "all" ? "All Sales" : s === "FOR_SALE" ? "For Sale" : "Not For Sale"}
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
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { toast({ title: "Marked Active" }); setSelectedIds([]); }}>Mark Active</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { toast({ title: "Marked Inactive" }); setSelectedIds([]); }}>Mark Inactive</Button>
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
                <DataTH>Inventory</DataTH>
                <DataTH>State</DataTH>
                <DataTH>Rating</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(product => {
                const store = faireStores.find(s => s.id === product.storeId);
                const catColor = categoryColors[product.category] || "#6B7280";
                const lc = lifecycleColors[product.lifecycle_state];
                const sc = saleColors[product.sale_state];
                const totalInventory = product.variants.reduce((s, v) => s + v.available_quantity, 0);
                const wholesalePrices = product.variants.map(v => v.wholesale_price);
                const retailPrices = product.variants.map(v => v.retail_price);
                const wMin = Math.min(...wholesalePrices), wMax = Math.max(...wholesalePrices);
                const rMin = Math.min(...retailPrices), rMax = Math.max(...retailPrices);
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
                        <div className="size-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm" style={{ background: catColor }}>
                          {product.category.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{product.category}</p>
                        </div>
                      </div>
                    </DataTD>
                    <DataTD><Badge variant="outline" className="text-[10px]">{store?.name.split(" ")[0]}</Badge></DataTD>
                    <DataTD align="center" className="font-medium">{product.variants.length}</DataTD>
                    <DataTD className="text-foreground/80 font-medium">{wMin === wMax ? `$${wMin}` : `$${wMin}–$${wMax}`}</DataTD>
                    <DataTD className="text-foreground/80 font-medium">{rMin === rMax ? `$${rMin}` : `$${rMin}–$${rMax}`}</DataTD>
                    <DataTD>
                      <div className="flex items-center gap-2">
                        <Package size={12} className="text-muted-foreground" />
                        <span className="font-semibold">{totalInventory}</span>
                      </div>
                    </DataTD>
                    <DataTD>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter" style={{ background: lc.bg, color: lc.text }}>{product.lifecycle_state}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter" style={{ background: sc.bg, color: sc.text }}>{product.sale_state === "FOR_SALE" ? "For Sale" : "Not Sale"}</span>
                      </div>
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="font-bold text-xs">{product.avg_rating}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">({product.review_count})</span>
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
                <tr><td colSpan={10} className="p-8 text-center text-sm text-muted-foreground font-medium">No products match your filters.</td></tr>
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
