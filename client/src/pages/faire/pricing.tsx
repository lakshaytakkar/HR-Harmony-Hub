import { useState } from "react";
import { Plus } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireProducts, faireStores } from "@/lib/mock-data-faire";

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
  const isLoading = useSimulatedLoading(600);
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

  const rows = faireProducts.flatMap(p =>
    p.variants.map(v => ({
      ...v,
      productName: p.name,
      storeId: p.storeId,
      moq: p.minimum_order_quantity,
      store: faireStores.find(s => s.id === p.storeId),
    }))
  ).filter(r => {
    if (selectedStore !== "all" && r.storeId !== selectedStore) return false;
    if (search && !r.productName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleRow = (id: string) => setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const filteredPrepacks = selectedStore === "all" ? mockPrepacks : mockPrepacks.filter(pp => pp.storeId === selectedStore);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="h-80 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Pricing & Prepacks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage wholesale and retail prices across all stores</p>
          </div>
          <div className="flex gap-2">
            <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="h-8 text-xs border rounded-lg px-2" data-testid="select-store">
              <option value="all">All Stores</option>
              {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs h-8 text-sm" data-testid="input-search" />
          </div>
        </div>
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
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 w-8"><input type="checkbox" className="rounded" onChange={e => setSelectedRows(e.target.checked ? rows.map(r => r.id) : [])} /></th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Product</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Store</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">SKU</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Wholesale</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Retail</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Margin %</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">MOQ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const margin = Math.round(((r.retail_price_cents - r.wholesale_price_cents) / r.retail_price_cents) * 100);
                    const mc = marginColor(margin);
                    return (
                      <tr key={r.id} className="border-b hover:bg-accent/20" data-testid={`pricing-row-${r.id}`}>
                        <td className="p-3">
                          <input type="checkbox" checked={selectedRows.includes(r.id)} onChange={() => toggleRow(r.id)} className="rounded" data-testid={`check-${r.id}`} />
                        </td>
                        <td className="p-3">
                          <p className="text-xs font-medium">{r.productName}</p>
                          <p className="text-[10px] text-muted-foreground">{r.options.map(o => o.value).join(" / ")}</p>
                        </td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{r.store?.name.split(" ")[0]}</Badge></td>
                        <td className="p-3 text-xs font-mono text-muted-foreground">{r.sku}</td>
                        <td className="p-3 text-xs font-semibold">${(r.wholesale_price_cents / 100).toFixed(2)}</td>
                        <td className="p-3 text-xs">${(r.retail_price_cents / 100).toFixed(2)}</td>
                        <td className="p-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: mc.bg, color: mc.text }}>{margin}%</span>
                        </td>
                        <td className="p-3 text-xs">{r.moq}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Fade>

      <Fade>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Prepacks</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAddPrepackOpen(true)} data-testid="btn-add-prepack"><Plus size={13} className="mr-1.5" /> Add Prepack</Button>
            </div>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-muted-foreground text-xs">Prepack Name</th>
                  <th className="text-left p-2 font-medium text-muted-foreground text-xs">Products</th>
                  <th className="text-left p-2 font-medium text-muted-foreground text-xs">Units</th>
                  <th className="text-left p-2 font-medium text-muted-foreground text-xs">Wholesale</th>
                  <th className="text-left p-2 font-medium text-muted-foreground text-xs">Store</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrepacks.map(pp => (
                  <tr key={pp.id} className="border-b hover:bg-accent/20" data-testid={`prepack-row-${pp.id}`}>
                    <td className="p-2 text-xs font-medium">{pp.name}</td>
                    <td className="p-2 text-xs text-muted-foreground">{pp.products.join(", ")}</td>
                    <td className="p-2 text-xs">{pp.units}</td>
                    <td className="p-2 text-xs font-semibold">${(pp.wholesale_price_cents / 100).toFixed(2)}</td>
                    <td className="p-2"><Badge variant="outline" className="text-[10px]">{faireStores.find(s => s.id === pp.storeId)?.name.split(" ")[0]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
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
    </PageTransition>
  );
}
