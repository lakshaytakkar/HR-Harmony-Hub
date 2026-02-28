import { useState } from "react";
import { Download } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireProducts, faireStores } from "@/lib/mock-data-faire";

const BRAND_COLOR = "#1A6B45";

export default function FaireInventory() {
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [search, setSearch] = useState("");
  const [qtyVariantId, setQtyVariantId] = useState<string | null>(null);
  const [backorderVariantId, setBackorderVariantId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [backorderDate, setBackorderDate] = useState("");

  const allVariants = faireProducts.flatMap(product =>
    product.variants.map(variant => ({
      ...variant,
      product,
      store: faireStores.find(s => s.id === product.storeId),
    }))
  ).filter(v => {
    if (selectedStore !== "all" && v.store?.id !== selectedStore) return false;
    if (search && !v.product.name.toLowerCase().includes(search.toLowerCase()) && !v.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalSKUs = allVariants.length;
  const outOfStock = allVariants.filter(v => v.available_quantity === 0).length;
  const lowStock = allVariants.filter(v => v.available_quantity > 0 && v.available_quantity < 5).length;
  const backordered = allVariants.filter(v => v.backordered_until).length;

  const qtyVariant = allVariants.find(v => v.id === qtyVariantId);
  const backorderVariant = allVariants.find(v => v.id === backorderVariantId);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}</div>
        <div className="h-80 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Inventory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track stock levels across all stores and variants</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast({ title: "Exporting inventory CSV..." })} data-testid="btn-export">
            <Download size={13} className="mr-1.5" /> Export
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total SKUs", value: totalSKUs, color: "#1A6B45", bg: "#ECFDF5" },
            { label: "Out of Stock", value: outOfStock, color: "#DC2626", bg: "#FEF2F2" },
            { label: "Low Stock (<5)", value: lowStock, color: "#D97706", bg: "#FFFBEB" },
            { label: "Backordered", value: backordered, color: "#7C3AED", bg: "#F5F3FF" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border p-3" style={{ background: s.bg }} data-testid={`inv-stat-${i}`}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-2">
          <Input placeholder="Search product or SKU..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs h-8 text-sm" data-testid="input-search" />
          <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="h-8 text-xs border rounded-lg px-2" data-testid="select-store">
            <option value="all">All Stores</option>
            {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </Fade>

      <Fade>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Product</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Store</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">SKU</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Options</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Available Qty</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Backordered Until</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allVariants.map(v => {
                    const isOut = v.available_quantity === 0;
                    const isLow = v.available_quantity > 0 && v.available_quantity < 5;
                    return (
                      <tr key={v.id} className={`border-b hover:bg-accent/20 ${isOut ? "bg-red-50/50 dark:bg-red-950/10" : isLow ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}`} data-testid={`inv-row-${v.id}`}>
                        <td className="p-3 text-xs font-medium">{v.product.name}</td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{v.store?.name.split(" ")[0]}</Badge></td>
                        <td className="p-3 text-xs font-mono text-muted-foreground">{v.sku}</td>
                        <td className="p-3">
                          {Object.entries(v.options).map(([k, val]) => (
                            <span key={k} className="text-[10px] bg-muted rounded px-1.5 py-0.5 mr-1">{val}</span>
                          ))}
                        </td>
                        <td className="p-3">
                          <span className={`text-sm font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-foreground"}`}>
                            {v.available_quantity}
                          </span>
                          {isOut && <span className="ml-1 text-[9px] text-red-500 font-medium">OUT</span>}
                          {isLow && <span className="ml-1 text-[9px] text-amber-500 font-medium">LOW</span>}
                        </td>
                        <td className="p-3 text-xs">
                          {v.backordered_until ? new Date(v.backordered_until).toLocaleDateString() : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setQtyVariantId(v.id); setEditQty(String(v.available_quantity)); }} data-testid={`btn-update-qty-${v.id}`}>Update Qty</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setBackorderVariantId(v.id); setBackorderDate(v.backordered_until ?? ""); }} data-testid={`btn-backorder-${v.id}`}>Backorder</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Fade>

      <Dialog open={!!qtyVariantId} onOpenChange={() => setQtyVariantId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Stock — {qtyVariant?.sku}</DialogTitle></DialogHeader>
          <div className="space-y-1.5 py-2"><Label>New Available Quantity</Label><Input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} data-testid="input-qty" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQtyVariantId(null)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Stock Updated", description: `${qtyVariant?.sku}: ${editQty} units` }); setQtyVariantId(null); }} data-testid="btn-save-qty">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!backorderVariantId} onOpenChange={() => setBackorderVariantId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Backorder Date — {backorderVariant?.sku}</DialogTitle></DialogHeader>
          <div className="space-y-1.5 py-2"><Label>Available Again Date</Label><Input type="date" value={backorderDate} onChange={e => setBackorderDate(e.target.value)} data-testid="input-backorder-date" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackorderVariantId(null)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Backorder Date Set", description: backorderDate }); setBackorderVariantId(null); }} data-testid="btn-save-backorder">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
