import { useState } from "react";
import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { competitorStores, type CompetitorStore } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function CompetitorsPage() {
  const loading = useSimulatedLoading();
  const [data] = useState<CompetitorStore[]>(competitorStores);

  const columns: Column<CompetitorStore>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-competitor-name-${item.id}`}>{item.name}</span>
      ),
    },
    {
      key: "domain",
      header: "Domain",
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.domain}</span>
      ),
    },
    {
      key: "niche",
      header: "Niche",
      render: (item) => <span className="text-sm">{item.niche}</span>,
    },
    {
      key: "estimatedRevenue",
      header: "Est. Revenue",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-est-revenue-${item.id}`}>
          {formatCurrency(item.estimatedRevenue)}
        </span>
      ),
    },
    {
      key: "productCount",
      header: "Products",
      sortable: true,
      render: (item) => <span className="text-sm">{item.productCount.toLocaleString()}</span>,
    },
    {
      key: "trafficRank",
      header: "Traffic Rank",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground" data-testid={`text-rank-${item.id}`}>
          #{item.trafficRank.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search competitors..."
          />
        )}
      </PageTransition>
    </div>
  );
}
