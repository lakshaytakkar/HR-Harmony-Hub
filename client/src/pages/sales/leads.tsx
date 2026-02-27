import { useState } from "react";
import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { leads, type Lead } from "@/lib/mock-data-sales";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  new: "neutral",
  contacted: "info",
  qualified: "warning",
  converted: "success",
  lost: "error",
};

const sourceVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  website: "info",
  referral: "success",
  ad: "warning",
  organic: "neutral",
};

export default function LeadsPage() {
  const loading = useSimulatedLoading();
  const [data] = useState<Lead[]>(leads);

  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Contact",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <img src={getPersonAvatar(item.name, 28)} alt={item.name} className="size-7 shrink-0 rounded-full" />
          <div>
            <p className="text-sm font-medium" data-testid={`text-lead-name-${item.id}`}>{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (item) => (
        <StatusBadge
          status={item.source.charAt(0).toUpperCase() + item.source.slice(1)}
          variant={sourceVariantMap[item.source]}
        />
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
      key: "assignedTo",
      header: "Assigned To",
      render: (item) => (
        <div className="flex items-center gap-2">
          <img src={getPersonAvatar(item.assignedTo, 24)} alt={item.assignedTo} className="size-6 rounded-full" />
          <span className="text-sm">{item.assignedTo}</span>
        </div>
      ),
    },
    {
      key: "createdDate",
      header: "Created",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.createdDate}</span>,
    },
    {
      key: "notes",
      header: "Notes",
      render: (item) => (
        <span className="text-sm text-muted-foreground max-w-[200px] truncate block" data-testid={`text-notes-${item.id}`}>
          {item.notes}
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
            searchPlaceholder="Search leads..."
            filters={[
              { label: "Source", key: "source", options: ["website", "referral", "ad", "organic"] },
              { label: "Status", key: "status", options: ["new", "contacted", "qualified", "converted", "lost"] },
            ]}
          />
        )}
      </PageTransition>
    </div>
  );
}
