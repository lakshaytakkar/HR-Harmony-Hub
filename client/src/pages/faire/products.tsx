import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Star, Trash2, Pencil } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireProducts, faireStores, type ProductLifecycleState, type ProductSaleState } from "@/lib/mock-data-faire";

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
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-80 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Product Catalog</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} products across 6 stores</p>
          </div>
          <Button onClick={() => toast({ title: "Add Product", description: "Product creation form coming soon." })} style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" data-testid="btn-add-product">
            <Plus size={15} className="mr-1.5" /> Add Product
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap items-center gap-3">
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs h-8 text-sm" data-testid="input-search-products" />
          <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="h-8 text-xs border rounded-lg px-2" data-testid="select-store-filter">
            <option value="all">All Stores</option>
            {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex gap-1">
            {(["all", "ACTIVE", "DRAFT", "INACTIVE"] as const).map(l => (
              <button key={l} onClick={() => setLifecycle(l)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${lifecycle === l ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={lifecycle === l ? { background: BRAND_COLOR } : {}} data-testid={`filter-lifecycle-${l}`}>
                {l === "all" ? "All" : l.charAt(0) + l.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["all", "FOR_SALE", "NOT_FOR_SALE"] as const).map(s => (
              <button key={s} onClick={() => setSaleState(s)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${saleState === s ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={saleState === s ? { background: BRAND_COLOR } : {}} data-testid={`filter-sale-${s}`}>
                {s === "all" ? "All" : s === "FOR_SALE" ? "For Sale" : "Not For Sale"}
              </button>
            ))}
          </div>
        </div>
      </Fade>

      {selectedIds.length > 0 && (
        <Fade>
          <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-4 py-2">
            <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { toast({ title: "Marked Active" }); setSelectedIds([]); }} data-testid="btn-bulk-active">Mark Active</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { toast({ title: "Marked Inactive" }); setSelectedIds([]); }} data-testid="btn-bulk-inactive">Mark Inactive</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { toast({ title: "Exported CSV" }); setSelectedIds([]); }} data-testid="btn-bulk-export">Export CSV</Button>
            <button className="text-xs text-muted-foreground ml-2 hover:text-foreground" onClick={() => setSelectedIds([])}>Clear</button>
          </div>
        </Fade>
      )}

      <Fade>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 w-8"><input type="checkbox" className="rounded" onChange={e => setSelectedIds(e.target.checked ? filtered.map(p => p.id) : [])} /></th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Product</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Store</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Variants</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Wholesale</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Retail</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Inventory</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">State</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Rating</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
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
                      <tr key={product.id} className="border-b hover:bg-accent/30 cursor-pointer" onClick={() => setLocation(`/faire/products/${product.id}`)} data-testid={`product-row-${product.id}`}>
                        <td className="p-3" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="rounded" data-testid={`check-product-${product.id}`} />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: catColor }}>
                              {product.category.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-xs">{product.name}</p>
                              <p className="text-[10px] text-muted-foreground">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{store?.name.split(" ")[0]}</Badge></td>
                        <td className="p-3 text-xs text-center">{product.variants.length}</td>
                        <td className="p-3 text-xs">{wMin === wMax ? `$${wMin}` : `$${wMin}–$${wMax}`}</td>
                        <td className="p-3 text-xs">{rMin === rMax ? `$${rMin}` : `$${rMin}–$${rMax}`}</td>
                        <td className="p-3 text-xs">{totalInventory}</td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: lc.bg, color: lc.text }}>{product.lifecycle_state}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: sc.bg, color: sc.text }}>{product.sale_state === "FOR_SALE" ? "For Sale" : "Not For Sale"}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs">{product.avg_rating}</span>
                            <span className="text-[10px] text-muted-foreground">({product.review_count})</span>
                          </div>
                        </td>
                        <td className="p-3" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setLocation(`/faire/products/${product.id}`)} data-testid={`btn-view-product-${product.id}`}><Pencil size={12} /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => setDeleteId(product.id)} data-testid={`btn-delete-product-${product.id}`}><Trash2 size={12} /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">No products match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Fade>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Product?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will remove the product from your Faire store. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Product Deleted" }); setDeleteId(null); }} data-testid="btn-confirm-delete">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
