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
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  active: "success",
  draft: "neutral",
  archived: "warning",
};

export default function ProductsPage() {
  const loading = useSimulatedLoading();
  const [data] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

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

  return (
    <PageShell>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog and inventory"
        actions={
          <Button
            className="gap-2"
            style={{ backgroundColor: vertical.color }}
            data-testid="button-add-product"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

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
        <TableSkeleton rows={8} columns={7} />
      ) : (
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Product</DataTH>
                <DataTH>Category</DataTH>
                <DataTH>Supplier</DataTH>
                <DataTH>Price</DataTH>
                <DataTH>Margin</DataTH>
                <DataTH>Orders</DataTH>
                <DataTH>Status</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => (
                <DataTR key={item.id}>
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
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {item.name}
                      </span>
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
                    <span
                      className={`text-sm font-medium ${
                        item.margin >= 60 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                      }`}
                    >
                      {item.margin}%
                    </span>
                  </DataTD>
                  <DataTD>
                    <span className="text-sm">{item.orders.toLocaleString()}</span>
                  </DataTD>
                  <DataTD>
                    <StatusBadge
                      status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      variant={statusVariant[item.status]}
                    />
                  </DataTD>
                </DataTR>
              ))}
            </tbody>
          </table>
        </DataTableContainer>
      )}
    </PageShell>
  );
}
