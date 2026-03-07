import { useState } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { products as initialProducts, type Product } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";
import { verticals } from "@/lib/verticals-config";
import {
  Plus,
  TrendingUp,
  Trophy,
  Lock,
  Unlock,
  ChevronDown,
  X,
  Star,
  Package,
  DollarSign,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  active: "success",
  draft: "neutral",
  archived: "warning",
};

export default function ProductsPage() {
  const loading = useSimulatedLoading();
  const [data, setData] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);

  const vertical = verticals.find((v) => v.id === "sales")!;

  const filtered = data.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "all" || item.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const categories = Array.from(new Set(data.map((p) => p.category)));
  const filterOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  const toggleField = (id: string, field: "isTrending" | "isWinning" | "isLocked") => {
    setData((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: !p[field] } : p))
    );
    if (detailProduct?.id === id) {
      setDetailProduct((prev) => prev ? { ...prev, [field]: !prev[field] } : null);
    }
  };

  const bulkToggle = (field: "isTrending" | "isWinning" | "isLocked", value: boolean) => {
    setData((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, [field]: value } : p))
    );
    setSelectedIds(new Set());
  };

  const openDetail = (product: Product) => {
    const current = data.find((p) => p.id === product.id) || product;
    setDetailProduct(current);
    setEditForm({ ...current });
  };

  const saveDetail = () => {
    if (!editForm) return;
    const profit = editForm.comparePrice - editForm.costPrice;
    const margin = editForm.comparePrice > 0 ? Math.round((profit / editForm.comparePrice) * 100) : 0;
    const updated = { ...editForm, margin };
    setData((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setDetailProduct(updated);
  };

  const trendingCount = data.filter((p) => p.isTrending).length;
  const winningCount = data.filter((p) => p.isWinning).length;
  const lockedCount = data.filter((p) => p.isLocked).length;

  return (
    <PageShell>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog and inventory"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {selectedIds.size > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" data-testid="button-bulk-actions">
                    Bulk Actions ({selectedIds.size})
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => bulkToggle("isTrending", true)}
                    data-testid="action-mark-trending"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Mark Trending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => bulkToggle("isTrending", false)}
                    data-testid="action-unmark-trending"
                  >
                    <TrendingUp className="mr-2 h-4 w-4 opacity-40" />
                    Unmark Trending
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => bulkToggle("isWinning", true)}
                    data-testid="action-mark-winning"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Mark Winning
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => bulkToggle("isWinning", false)}
                    data-testid="action-unmark-winning"
                  >
                    <Trophy className="mr-2 h-4 w-4 opacity-40" />
                    Unmark Winning
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => bulkToggle("isLocked", true)}
                    data-testid="action-lock"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Lock
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => bulkToggle("isLocked", false)}
                    data-testid="action-unlock"
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    Unlock
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              className="gap-2"
              style={{ backgroundColor: vertical.color }}
              data-testid="button-add-product"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-4 flex-wrap">
        <Badge variant="secondary" className="gap-1.5" data-testid="badge-trending-count">
          <TrendingUp className="h-3 w-3" />
          {trendingCount} Trending
        </Badge>
        <Badge variant="secondary" className="gap-1.5" data-testid="badge-winning-count">
          <Trophy className="h-3 w-3" />
          {winningCount} Winning
        </Badge>
        <Badge variant="secondary" className="gap-1.5" data-testid="badge-locked-count">
          <Lock className="h-3 w-3" />
          {lockedCount} Locked
        </Badge>
      </div>

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        color={vertical.color}
        placeholder="Search products..."
      />

      {loading ? (
        <TableSkeleton rows={8} columns={9} />
      ) : (
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>
                  <Checkbox
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                    data-testid="checkbox-select-all"
                  />
                </DataTH>
                <DataTH>Product</DataTH>
                <DataTH>Category</DataTH>
                <DataTH>Supplier</DataTH>
                <DataTH>Price</DataTH>
                <DataTH>Profit</DataTH>
                <DataTH>Orders</DataTH>
                <DataTH>Flags</DataTH>
                <DataTH>Status</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => {
                const profit = item.comparePrice - item.costPrice;
                return (
                  <DataTR
                    key={item.id}
                    onClick={() => openDetail(item)}
                    className={cn(selectedIds.has(item.id) && "bg-muted/40")}
                  >
                    <DataTD>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={() => toggleSelect(item.id)}
                          aria-label={`Select ${item.name}`}
                          data-testid={`checkbox-product-${item.id}`}
                        />
                      </div>
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="size-8 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-medium truncate block max-w-[200px]" data-testid={`text-product-name-${item.id}`}>
                            {item.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.sku}</span>
                        </div>
                      </div>
                    </DataTD>
                    <DataTD>
                      <span className="text-sm">{item.category}</span>
                    </DataTD>
                    <DataTD>
                      <span className="text-sm text-muted-foreground">{item.supplier}</span>
                    </DataTD>
                    <DataTD>
                      <div>
                        <span className="text-sm font-medium">{formatCurrency(item.price)}</span>
                        <span className="text-xs text-muted-foreground ml-1 line-through">
                          {formatCurrency(item.comparePrice)}
                        </span>
                      </div>
                    </DataTD>
                    <DataTD>
                      <div>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            profit > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                          )}
                        >
                          {formatCurrency(profit)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">({item.margin}%)</span>
                      </div>
                    </DataTD>
                    <DataTD>
                      <span className="text-sm">{item.orders.toLocaleString()}</span>
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleField(item.id, "isTrending")}
                          className={cn(
                            "p-1 rounded-md transition-colors",
                            item.isTrending
                              ? "text-orange-500 bg-orange-50 dark:bg-orange-950"
                              : "text-muted-foreground/40"
                          )}
                          title="Trending"
                          data-testid={`toggle-trending-${item.id}`}
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => toggleField(item.id, "isWinning")}
                          className={cn(
                            "p-1 rounded-md transition-colors",
                            item.isWinning
                              ? "text-amber-500 bg-amber-50 dark:bg-amber-950"
                              : "text-muted-foreground/40"
                          )}
                          title="Winning"
                          data-testid={`toggle-winning-${item.id}`}
                        >
                          <Trophy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => toggleField(item.id, "isLocked")}
                          className={cn(
                            "p-1 rounded-md transition-colors",
                            item.isLocked
                              ? "text-red-500 bg-red-50 dark:bg-red-950"
                              : "text-muted-foreground/40"
                          )}
                          title={item.isLocked ? "Locked" : "Unlocked"}
                          data-testid={`toggle-locked-${item.id}`}
                        >
                          {item.isLocked ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <Unlock className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </DataTD>
                    <DataTD>
                      <StatusBadge
                        status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        variant={statusVariant[item.status]}
                      />
                    </DataTD>
                  </DataTR>
                );
              })}
            </tbody>
          </table>
        </DataTableContainer>
      )}

      <Sheet open={!!detailProduct} onOpenChange={(open) => !open && setDetailProduct(null)}>
        <SheetContent className="sm:max-w-lg p-0" data-testid="sheet-product-detail">
          {detailProduct && editForm && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-4 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <SheetTitle className="text-lg" data-testid="text-detail-product-name">
                      {detailProduct.name}
                    </SheetTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">{detailProduct.sku}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleField(detailProduct.id, "isTrending")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        detailProduct.isTrending
                          ? "text-orange-500 bg-orange-50 dark:bg-orange-950"
                          : "text-muted-foreground/40"
                      )}
                      data-testid="detail-toggle-trending"
                    >
                      <TrendingUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleField(detailProduct.id, "isWinning")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        detailProduct.isWinning
                          ? "text-amber-500 bg-amber-50 dark:bg-amber-950"
                          : "text-muted-foreground/40"
                      )}
                      data-testid="detail-toggle-winning"
                    >
                      <Trophy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleField(detailProduct.id, "isLocked")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        detailProduct.isLocked
                          ? "text-red-500 bg-red-50 dark:bg-red-950"
                          : "text-muted-foreground/40"
                      )}
                      data-testid="detail-toggle-locked"
                    >
                      {detailProduct.isLocked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Unlock className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="px-6 py-5 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={detailProduct.image}
                        alt={detailProduct.name}
                        className="size-16 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge
                        status={detailProduct.status.charAt(0).toUpperCase() + detailProduct.status.slice(1)}
                        variant={statusVariant[detailProduct.status]}
                      />
                      {detailProduct.isTrending && (
                        <Badge variant="secondary" className="gap-1 text-orange-600 dark:text-orange-400">
                          <TrendingUp className="h-3 w-3" /> Trending
                        </Badge>
                      )}
                      {detailProduct.isWinning && (
                        <Badge variant="secondary" className="gap-1 text-amber-600 dark:text-amber-400">
                          <Trophy className="h-3 w-3" /> Winning
                        </Badge>
                      )}
                      {detailProduct.isLocked && (
                        <Badge variant="secondary" className="gap-1 text-red-600 dark:text-red-400">
                          <Lock className="h-3 w-3" /> Locked
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border p-3 text-center">
                      <Package className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <div className="text-lg font-semibold" data-testid="text-detail-orders">{detailProduct.orders.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Orders</div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <DollarSign className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <div className="text-lg font-semibold" data-testid="text-detail-revenue">{formatCurrency(detailProduct.revenue)}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <Star className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <div className="text-lg font-semibold" data-testid="text-detail-rating">{detailProduct.rating || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Product Details</h3>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="edit-name" className="text-xs text-muted-foreground">Name</Label>
                        <Input
                          id="edit-name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          data-testid="input-edit-name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-description" className="text-xs text-muted-foreground">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="resize-none"
                          rows={3}
                          data-testid="input-edit-description"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="edit-sku" className="text-xs text-muted-foreground">SKU</Label>
                          <Input
                            id="edit-sku"
                            value={editForm.sku}
                            onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                            data-testid="input-edit-sku"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-weight" className="text-xs text-muted-foreground">Weight</Label>
                          <Input
                            id="edit-weight"
                            value={editForm.weight}
                            onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                            data-testid="input-edit-weight"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="edit-category" className="text-xs text-muted-foreground">Category</Label>
                        <Input
                          id="edit-category"
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          data-testid="input-edit-category"
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-supplier" className="text-xs text-muted-foreground">Supplier</Label>
                        <Input
                          id="edit-supplier"
                          value={editForm.supplier}
                          onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                          data-testid="input-edit-supplier"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Pricing</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="edit-cost" className="text-xs text-muted-foreground">Cost Price</Label>
                        <Input
                          id="edit-cost"
                          type="number"
                          step="0.01"
                          value={editForm.costPrice}
                          onChange={(e) => setEditForm({ ...editForm, costPrice: parseFloat(e.target.value) || 0 })}
                          data-testid="input-edit-cost"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-price" className="text-xs text-muted-foreground">Selling Price</Label>
                        <Input
                          id="edit-price"
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                          data-testid="input-edit-price"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-compare" className="text-xs text-muted-foreground">Compare Price</Label>
                        <Input
                          id="edit-compare"
                          type="number"
                          step="0.01"
                          value={editForm.comparePrice}
                          onChange={(e) => setEditForm({ ...editForm, comparePrice: parseFloat(e.target.value) || 0 })}
                          data-testid="input-edit-compare"
                        />
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Profit (Compare - Cost)</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400" data-testid="text-auto-profit">
                          {formatCurrency(editForm.comparePrice - editForm.costPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Margin</span>
                        <span className="font-semibold" data-testid="text-auto-margin">
                          {editForm.comparePrice > 0
                            ? Math.round(((editForm.comparePrice - editForm.costPrice) / editForm.comparePrice) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Additional Images</h3>
                    <div className="space-y-2">
                      {editForm.additionalImages.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            value={url}
                            onChange={(e) => {
                              const imgs = [...editForm.additionalImages];
                              imgs[idx] = e.target.value;
                              setEditForm({ ...editForm, additionalImages: imgs });
                            }}
                            placeholder="Image URL"
                            data-testid={`input-additional-image-${idx}`}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const imgs = editForm.additionalImages.filter((_, i) => i !== idx);
                              setEditForm({ ...editForm, additionalImages: imgs });
                            }}
                            data-testid={`button-remove-image-${idx}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditForm({ ...editForm, additionalImages: [...editForm.additionalImages, ""] })
                        }
                        data-testid="button-add-image-url"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Image URL
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Tags</h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {editForm.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                          <button
                            onClick={() => {
                              const tags = editForm.tags.filter((_, i) => i !== idx);
                              setEditForm({ ...editForm, tags });
                            }}
                            className="ml-0.5"
                            data-testid={`button-remove-tag-${idx}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add tag..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val && !editForm.tags.includes(val)) {
                              setEditForm({ ...editForm, tags: [...editForm.tags, val] });
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                        data-testid="input-add-tag"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Metadata Toggles</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                          <Label className="text-sm">Trending</Label>
                        </div>
                        <Switch
                          checked={editForm.isTrending}
                          onCheckedChange={(v) => setEditForm({ ...editForm, isTrending: v })}
                          data-testid="switch-trending"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <Label className="text-sm">Winning</Label>
                        </div>
                        <Switch
                          checked={editForm.isWinning}
                          onCheckedChange={(v) => setEditForm({ ...editForm, isWinning: v })}
                          data-testid="switch-winning"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-red-500" />
                          <Label className="text-sm">Locked</Label>
                        </div>
                        <Switch
                          checked={editForm.isLocked}
                          onCheckedChange={(v) => setEditForm({ ...editForm, isLocked: v })}
                          data-testid="switch-locked"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="border-t px-6 py-4 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDetailProduct(null)}
                  data-testid="button-cancel-detail"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveDetail}
                  style={{ backgroundColor: vertical.color }}
                  data-testid="button-save-detail"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
