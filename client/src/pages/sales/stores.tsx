import { useState } from "react";
import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { shopifyStores, type ShopifyStore } from "@/lib/mock-data-sales";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  active: "success",
  paused: "warning",
  disconnected: "error",
};

export default function StoresPage() {
  const loading = useSimulatedLoading();
  const [data] = useState<ShopifyStore[]>(shopifyStores);

  const columns: Column<ShopifyStore>[] = [
    {
      key: "name",
      header: "Store Name",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-store-name-${item.id}`}>{item.name}</span>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <img src={getPersonAvatar(item.owner, 24)} alt={item.owner} className="size-6 rounded-full" />
          <span className="text-sm">{item.owner}</span>
        </div>
      ),
    },
    {
      key: "domain",
      header: "Domain",
      render: (item) => (
        <span className="text-sm text-muted-foreground" data-testid={`text-domain-${item.id}`}>{item.domain}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          variant={statusVariantMap[item.status]}
        />
      ),
    },
    {
      key: "products",
      header: "Products",
      sortable: true,
      render: (item) => <span className="text-sm">{item.products}</span>,
    },
    {
      key: "orders",
      header: "Orders",
      sortable: true,
      render: (item) => <span className="text-sm">{item.orders.toLocaleString()}</span>,
    },
    {
      key: "revenue",
      header: "Revenue",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-store-revenue-${item.id}`}>
          {formatCurrency(item.revenue)}
        </span>
      ),
    },
  ];

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        {loading ? (
          <TableSkeleton rows={8} columns={7} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search stores..."
            filters={[
              { label: "Status", key: "status", options: ["active", "paused", "disconnected"] },
            ]}
          />
        )}
      </PageTransition>
    </div>
  );
}
