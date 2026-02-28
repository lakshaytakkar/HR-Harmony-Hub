import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Star, Pencil, Trash2, Tag } from "lucide-react";
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

export default function FaireProductDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/faire/products/:id");
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();

  const product = faireProducts.find(p => p.id === params?.id) ?? faireProducts[0];
  const store = faireStores.find(s => s.id === product.storeId);

  const [editOpen, setEditOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [editWholesale, setEditWholesale] = useState("");
  const [editRetail, setEditRetail] = useState("");
  const [editQty, setEditQty] = useState("");

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-5 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-20 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/faire/products")} data-testid="btn-back">
              <ArrowLeft size={15} className="mr-1.5" /> Products
            </Button>
            <h1 className="text-xl font-bold font-heading">{product.name}</h1>
            <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "#ECFDF5", color: "#059669" }}>{product.lifecycle_state}</span>
            <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "#ECFDF5", color: "#059669" }}>{product.sale_state === "FOR_SALE" ? "For Sale" : "Not For Sale"}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} data-testid="btn-edit-product"><Pencil size={13} className="mr-1.5" /> Edit</Button>
            <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => setDeleteOpen(true)} data-testid="btn-delete-product"><Trash2 size={13} className="mr-1.5" /> Delete</Button>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{store?.name}</Badge>
          <Badge variant="outline">{product.category}</Badge>
          <Badge variant="outline">{product.subcategory}</Badge>
          <Badge variant="outline">Made in: {product.made_in_countries.join(", ")}</Badge>
          <Badge variant="outline">MOQ: {product.minimum_order_quantity}</Badge>
          <Badge variant="outline">Units/Case: {product.units_per_case}</Badge>
          {product.taxable && <Badge variant="outline">Taxable</Badge>}
          {product.tags.map(tag => (
            <div key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs">
              <Tag size={9} /> {tag}
            </div>
          ))}
        </div>
      </Fade>

      <Fade>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{product.description}</p></CardContent>
        </Card>
      </Fade>

      <Fade>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.floor(product.avg_rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />)}
            <span className="text-sm font-semibold ml-1">{product.avg_rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">{product.review_count} reviews · {product.retailer_count} retailers carry this</span>
        </div>
      </Fade>

      <Fade>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Variants</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">SKU</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Options</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Wholesale</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Retail</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Inventory</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">State</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map(variant => {
                  const isLow = variant.available_quantity > 0 && variant.available_quantity < 5;
                  const isOut = variant.available_quantity === 0;
                  return (
                    <tr key={variant.id} className={`border-b ${isOut ? "bg-red-50/40 dark:bg-red-950/10" : isLow ? "bg-amber-50/40 dark:bg-amber-950/10" : ""}`} data-testid={`variant-row-${variant.id}`}>
                      <td className="p-3 text-xs font-mono">{variant.sku}</td>
                      <td className="p-3">
                        {Object.entries(variant.options).map(([k, v]) => (
                          <Badge key={k} variant="outline" className="text-[9px] mr-1">{k}: {v}</Badge>
                        ))}
                      </td>
                      <td className="p-3 text-xs font-medium">${variant.wholesale_price}</td>
                      <td className="p-3 text-xs">${variant.retail_price}</td>
                      <td className="p-3">
                        <span className={`text-xs font-semibold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : ""}`}>{variant.available_quantity}</span>
                        {variant.backordered_until && <p className="text-[9px] text-muted-foreground">Backorder until {new Date(variant.backordered_until).toLocaleDateString()}</p>}
                      </td>
                      <td className="p-3"><span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700">{variant.lifecycle_state}</span></td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedVariantId(variant.id); setEditWholesale(String(variant.wholesale_price)); setEditRetail(String(variant.retail_price)); setPriceOpen(true); }} data-testid={`btn-edit-price-${variant.id}`}>Edit Price</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedVariantId(variant.id); setEditQty(String(variant.available_quantity)); setStockOpen(true); }} data-testid={`btn-update-stock-${variant.id}`}>Stock</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>

      {product.reviews.length > 0 && (
        <Fade>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Product Reviews</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {product.reviews.slice(0, 5).map(review => (
                <div key={review.id} className="rounded-lg border p-3" data-testid={`review-${review.id}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold">{review.retailer_name}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />)}
                      <span className="text-[10px] text-muted-foreground ml-1">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>
      )}

      <Dialog open={priceOpen} onOpenChange={() => setPriceOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Price — {selectedVariant?.sku}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Wholesale Price ($)</Label><Input type="number" value={editWholesale} onChange={e => setEditWholesale(e.target.value)} data-testid="input-wholesale" /></div>
            <div className="space-y-1.5"><Label>Retail Price ($)</Label><Input type="number" value={editRetail} onChange={e => setEditRetail(e.target.value)} data-testid="input-retail" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceOpen(false)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Price Updated", description: `Wholesale: $${editWholesale} · Retail: $${editRetail}` }); setPriceOpen(false); }} data-testid="btn-save-price">Save Price</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={stockOpen} onOpenChange={() => setStockOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Stock — {selectedVariant?.sku}</DialogTitle></DialogHeader>
          <div className="space-y-1.5 py-2"><Label>New Available Quantity</Label><Input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} data-testid="input-qty" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockOpen(false)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Stock Updated", description: `New quantity: ${editQty}` }); setStockOpen(false); }} data-testid="btn-save-stock">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={() => setEditOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Product Name</Label><Input defaultValue={product.name} data-testid="input-product-name" /></div>
            <div className="space-y-1.5"><Label>Description</Label><textarea className="w-full h-20 border rounded-lg px-3 py-2 text-sm resize-none" defaultValue={product.description} data-testid="input-description" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Lifecycle State</Label>
                <select className="w-full h-9 border rounded-lg px-3 text-sm" defaultValue={product.lifecycle_state} data-testid="select-lifecycle"><option>ACTIVE</option><option>DRAFT</option><option>INACTIVE</option></select>
              </div>
              <div className="space-y-1.5"><Label>Sale State</Label>
                <select className="w-full h-9 border rounded-lg px-3 text-sm" defaultValue={product.sale_state} data-testid="select-sale-state"><option value="FOR_SALE">For Sale</option><option value="NOT_FOR_SALE">Not For Sale</option></select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Product Updated" }); setEditOpen(false); }} data-testid="btn-save-product">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={() => setDeleteOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Product?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently remove "{product.name}" from your Faire store. This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Product Deleted" }); setDeleteOpen(false); setLocation("/faire/products"); }} data-testid="btn-confirm-delete">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
