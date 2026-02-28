import { useState } from "react";
import { Star, Plus, Copy, ExternalLink } from "lucide-react";

import { DataTable, type Column } from "@/components/hr/data-table";
import { StatusBadge } from "@/components/hr/status-badge";
import { FormDialog } from "@/components/hr/form-dialog";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hubVendors, type EventVendor } from "@/lib/mock-data-eventhub";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";
import { useToast } from "@/hooks/use-toast";

const statusVariantMap: Record<string, "success" | "neutral" | "warning"> = {
  active: "success",
  inactive: "neutral",
  pending: "warning",
};

const categoryColorMap: Record<string, string> = {
  "AV & Tech": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Catering: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Photography: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Decoration: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Security: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Transport: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Marketing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}</span>
    </div>
  );
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export default function HubVendors() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const uniqueCategories = Array.from(new Set(hubVendors.map((v) => v.category)));

  const filtered = hubVendors.filter((v) => {
    if (categoryFilter !== "all" && v.category !== categoryFilter) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  const totalVendors = hubVendors.length;
  const activeCount = hubVendors.filter((v) => v.status === "active").length;
  const pendingCount = hubVendors.filter((v) => v.status === "pending").length;
  const avgRating = (hubVendors.reduce((sum, v) => sum + v.rating, 0) / hubVendors.length).toFixed(1);

  const columns: Column<EventVendor>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "category",
      header: "Category",
      render: (item) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColorMap[item.category] || ""}`} data-testid={`badge-category-${item.id}`}>
          {item.category}
        </span>
      ),
    },
    { key: "specialty", header: "Specialty" },
    {
      key: "contactName",
      header: "Contact",
      render: (item) => (
        <div>
          <p className="text-sm font-medium">{item.contactName}</p>
          <p className="text-xs text-muted-foreground">{item.contactEmail}</p>
        </div>
      ),
    },
    {
      key: "eventsAssigned",
      header: "Events",
      sortable: true,
      render: (item) => (
        <Badge variant="outline" className="text-xs" data-testid={`badge-events-${item.id}`}>
          {item.eventsAssigned.length} event{item.eventsAssigned.length !== 1 ? "s" : ""}
        </Badge>
      ),
    },
    {
      key: "ratePerDay",
      header: "Rate/Day",
      sortable: true,
      render: (item) => <span data-testid={`text-rate-${item.id}`}>{formatCurrency(item.ratePerDay)}</span>,
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (item) => <StarRating rating={item.rating} />,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} variant={statusVariantMap[item.status]} />,
    },
  ];

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="hub-vendors-title">Vendors</h1>
            <p className="text-sm text-muted-foreground">{totalVendors} registered vendors</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            data-testid="button-add-vendor"
          >
            <Plus className="size-4" />
            Add Vendor
          </Button>
        </div>

        <div className="mb-5 flex gap-4">
          <div className="rounded-lg border border-border bg-card p-3 text-center min-w-[80px]" data-testid="stat-total-vendors">
            <p className="text-xl font-bold text-foreground">{totalVendors}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center min-w-[80px]" data-testid="stat-active-vendors">
            <p className="text-xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center min-w-[80px]" data-testid="stat-pending-vendors">
            <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center min-w-[80px]" data-testid="stat-avg-rating">
            <p className="text-xl font-bold text-violet-600">{avgRating}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40" data-testid="filter-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <TableSkeleton rows={8} columns={8} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowActions={[
              {
                label: "Copy Email",
                onClick: (item) => {
                  navigator.clipboard.writeText(item.contactEmail);
                  toast({ title: "Email copied", description: item.contactEmail });
                },
              },
              {
                label: "View Events",
                onClick: () => {},
              },
            ]}
          />
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add Vendor"
          description="Register a new vendor for event services."
        >
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="vendor-name">Vendor Name</Label>
              <Input id="vendor-name" placeholder="e.g. SoundWave AV Solutions" data-testid="input-vendor-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="vendor-category">Category</Label>
                <Select>
                  <SelectTrigger id="vendor-category" data-testid="input-vendor-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AV & Tech">AV & Tech</SelectItem>
                    <SelectItem value="Catering">Catering</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                    <SelectItem value="Decoration">Decoration</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="vendor-rate">Rate/Day (INR)</Label>
                <Input id="vendor-rate" type="number" placeholder="e.g. 50000" data-testid="input-vendor-rate" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vendor-specialty">Specialty</Label>
              <Input id="vendor-specialty" placeholder="e.g. Live streaming, LED walls" data-testid="input-vendor-specialty" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vendor-contact-name">Contact Name</Label>
              <Input id="vendor-contact-name" placeholder="Full name" data-testid="input-vendor-contact-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="vendor-email">Contact Email</Label>
                <Input id="vendor-email" type="email" placeholder="email@vendor.com" data-testid="input-vendor-email" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="vendor-phone">Contact Phone</Label>
                <Input id="vendor-phone" placeholder="+91 98xxx xxxxx" data-testid="input-vendor-phone" />
              </div>
            </div>
          </div>
        </FormDialog>
      </PageTransition>
    </div>
  );
}
