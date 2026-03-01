import { useState } from "react";
import { Download, Package2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DualCurrency } from "@/lib/faire-currency";
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
  DetailModal,
} from "@/components/layout";

const BRAND_COLOR = "#1A6B45";

export default function FaireInventory() {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [search, setSearch] = useState("");
  const [qtyVariantId, setQtyVariantId] = useState<string | null>(null);
  const [backorderVariantId, setBackorderVariantId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [backorderDate, setBackorderDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  const { data: productsData, isLoading } = useQuery<{ products: any[] }>({
    queryKey: ["/api/faire/products?slim"],
    queryFn: async () => {
      const res = await fetch("/api/faire/products?slim", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: storesData } = useQuery<{ stores: any[] }>({
    queryKey: ["/api/faire/stores"],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const products = productsData?.products ?? [];
  const stores = storesData?.stores ?? [];

  const allVariants = products.flatMap(product =>
    (product.variants ?? []).map((variant: any) => ({
      ...variant,
      product,
      store: stores.find(s => s.id === product._storeId),
    }))
  ).filter((v: any) => {
    if (selectedStore !== "all" && v.store?.id !== selectedStore) return false;
    if (search && !v.product.name.toLowerCase().includes(search.toLowerCase()) && !v.sku?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalSKUs = allVariants.length;
  const outOfStock = allVariants.filter((v: any) => v.available_quantity === 0).length;
  const lowStock = allVariants.filter((v: any) => v.available_quantity > 0 && v.available_quantity < 5).length;
  const backordered = allVariants.filter((v: any) => v.backordered_until).length;

  const qtyVariant = allVariants.find((v: any) => v.id === qtyVariantId);
  const backorderVariant = allVariants.find((v: any) => v.id === backorderVariantId);

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
          title="Inventory"
          subtitle="Track stock levels across all stores and variants"
          actions={
            <div className="flex items-center gap-2">
              <select
                value={selectedStore}
                onChange={e => setSelectedStore(e.target.value)}
                className="h-9 text-sm border rounded-lg px-3 bg-background font-medium"
                data-testid="select-store"
              >
                <option value="all">All Stores</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Button variant="outline" className="h-9" onClick={() => toast({ title: "Exporting inventory CSV..." })} data-testid="btn-export">
                <Download size={14} className="mr-2" /> Export CSV
              </Button>
            </div>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          {[
            { label: "Total SKUs", value: totalSKUs, color: BRAND_COLOR, bg: "rgba(26, 107, 69, 0.1)" },
            { label: "Out of Stock", value: outOfStock, color: "#DC2626", bg: "#FEF2F2" },
            { label: "Low Stock (<5)", value: lowStock, color: "#D97706", bg: "#FFFBEB" },
            { label: "Backordered", value: backordered, color: "#7C3AED", bg: "#F5F3FF" },
          ].map((s, i) => (
            <StatCard
              key={i}
              label={s.label}
              value={s.value}
              icon={Package2}
              iconBg={s.bg}
              iconColor={s.color}
            />
          ))}
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search product or SKU..."
          color={BRAND_COLOR}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Product</DataTH>
                <DataTH>Store</DataTH>
                <DataTH>SKU</DataTH>
                <DataTH>Options</DataTH>
                <DataTH>Wholesale</DataTH>
                <DataTH>Available Qty</DataTH>
                <DataTH>Backordered Until</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allVariants.map((v: any) => {
                const isOut = v.available_quantity === 0;
                const isLow = v.available_quantity > 0 && v.available_quantity < 5;
                return (
                  <DataTR key={v.id} className={isOut ? "bg-red-50/30 dark:bg-red-950/5" : isLow ? "bg-amber-50/30 dark:bg-amber-950/5" : ""} data-testid={`inv-row-${v.id}`}>
                    <DataTD className="font-semibold text-xs">{v.product.name}</DataTD>
                    <DataTD><Badge variant="outline" className="text-[10px] font-medium">{v.store?.name?.split(" ")[0] ?? "—"}</Badge></DataTD>
                    <DataTD className="font-mono text-[10px] text-muted-foreground">{v.sku}</DataTD>
                    <DataTD>
                      <div className="flex flex-wrap gap-1">
                        {(v.options ?? []).map((o: any) => (
                          <span key={o.name} className="text-[10px] bg-muted/80 rounded px-1.5 py-0.5 font-medium border border-muted-foreground/10">{o.value}</span>
                        ))}
                      </div>
                    </DataTD>
                    <DataTD className="font-medium"><DualCurrency cents={v.wholesale_price_cents ?? 0} /></DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-foreground"}`}>
                          {v.available_quantity}
                        </span>
                        {isOut && <span className="text-[9px] px-1 bg-red-100 text-red-600 rounded font-bold uppercase tracking-tighter">OUT</span>}
                        {isLow && <span className="text-[9px] px-1 bg-amber-100 text-amber-600 rounded font-bold uppercase tracking-tighter">LOW</span>}
                      </div>
                    </DataTD>
                    <DataTD className="text-muted-foreground font-medium">
                      {v.backordered_until ? new Date(v.backordered_until).toLocaleDateString() : "—"}
                    </DataTD>
                    <DataTD align="right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold" onClick={() => { setQtyVariantId(v.id); setEditQty(String(v.available_quantity)); }} data-testid={`btn-update-qty-${v.id}`}>Update Qty</Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold" onClick={() => { setBackorderVariantId(v.id); setBackorderDate(v.backordered_until ?? ""); }} data-testid={`btn-backorder-${v.id}`}>Backorder</Button>
                      </div>
                    </DataTD>
                  </DataTR>
                );
              })}
              {allVariants.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-sm text-muted-foreground font-medium">No inventory variants match your search.</td></tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={!!qtyVariantId}
        onClose={() => setQtyVariantId(null)}
        title={`Update Stock — ${qtyVariant?.sku}`}
        subtitle="Manual inventory adjustment"
        footer={
          <>
            <Button variant="outline" onClick={() => setQtyVariantId(null)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Stock Updated", description: `${qtyVariant?.sku}: ${editQty} units` }); setQtyVariantId(null); }} data-testid="btn-save-qty">Save Changes</Button>
          </>
        }
      >
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Available Quantity</Label>
            <Input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} data-testid="input-qty" />
          </div>
        </div>
      </DetailModal>

      <DetailModal
        open={!!backorderVariantId}
        onClose={() => setBackorderVariantId(null)}
        title={`Set Backorder Date — ${backorderVariant?.sku}`}
        subtitle="Manage stock availability dates"
        footer={
          <>
            <Button variant="outline" onClick={() => setBackorderVariantId(null)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Backorder Date Set", description: backorderDate }); setBackorderVariantId(null); }} data-testid="btn-save-backorder">Save Date</Button>
          </>
        }
      >
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available Again Date</Label>
            <Input type="date" value={backorderDate} onChange={e => setBackorderDate(e.target.value)} data-testid="input-backorder-date" />
          </div>
        </div>
      </DetailModal>
    </PageShell>
  );
}
