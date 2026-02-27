import { useState } from "react";
import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { products as initialProducts, type Product } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

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

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden">
            <img src={item.image} alt={item.name} className="size-8 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <span className="text-sm font-medium truncate max-w-[200px]">{item.name}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item) => <span className="text-sm">{item.category}</span>,
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (item) => <span className="text-sm text-muted-foreground">{item.supplier}</span>,
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (item) => (
        <div>
          <span className="text-sm font-medium">{formatCurrency(item.price)}</span>
          <span className="text-xs text-muted-foreground ml-1 line-through">{formatCurrency(item.comparePrice)}</span>
        </div>
      ),
    },
    {
      key: "margin",
      header: "Margin",
      sortable: true,
      render: (item) => (
        <span className={`text-sm font-medium ${item.margin >= 60 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
          {item.margin}%
        </span>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      sortable: true,
      render: (item) => <span className="text-sm">{item.orders.toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          variant={statusVariant[item.status]}
        />
      ),
    },
  ];

  const categoryOptions = Array.from(new Set(data.map((p) => p.category)));
  const supplierOptions = Array.from(new Set(data.map((p) => p.supplier)));

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        {loading ? (
          <TableSkeleton rows={8} columns={7} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search products..."
            filters={[
              { label: "Category", key: "category", options: categoryOptions },
              { label: "Supplier", key: "supplier", options: supplierOptions },
              { label: "Status", key: "status", options: ["active", "draft", "archived"] },
            ]}
          />
        )}
      </PageTransition>
    </div>
  );
}
