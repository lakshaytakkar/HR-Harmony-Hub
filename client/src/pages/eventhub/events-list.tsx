import { useState } from "react";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";

import { DataTable, type Column } from "@/components/hr/data-table";
import { StatusBadge } from "@/components/hr/status-badge";
import { FormDialog } from "@/components/hr/form-dialog";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hubEvents, type NetworkingEvent } from "@/lib/mock-data-eventhub";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const statusVariantMap: Record<string, "info" | "success" | "neutral" | "error"> = {
  upcoming: "info",
  live: "success",
  completed: "neutral",
  cancelled: "error",
};

const typeVariantMap: Record<string, "info" | "success" | "neutral" | "warning" | "purple"> = {
  Seminar: "info",
  Workshop: "warning",
  Conference: "neutral",
  "Investor Meet": "success",
  "Launch Event": "info",
  Roundtable: "neutral",
};

const columns: Column<NetworkingEvent>[] = [
  { key: "id", header: "ID", sortable: true },
  { key: "name", header: "Name", sortable: true },
  {
    key: "type",
    header: "Type",
    render: (item) => <StatusBadge status={item.type} variant={typeVariantMap[item.type] || "neutral"} />,
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    render: (item) => (
      <span data-testid={`text-date-${item.id}`}>
        {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </span>
    ),
  },
  { key: "venue", header: "Venue" },
  { key: "city", header: "City", sortable: true },
  {
    key: "status",
    header: "Status",
    render: (item) => <StatusBadge status={item.status} variant={statusVariantMap[item.status]} />,
  },
  {
    key: "totalAttendees",
    header: "Attendees",
    sortable: true,
    render: (item) => <span data-testid={`text-attendees-${item.id}`}>{item.totalAttendees}</span>,
  },
  {
    key: "budget",
    header: "Budget",
    sortable: true,
    render: (item) => <span data-testid={`text-budget-${item.id}`}>{formatCurrency(item.budget)}</span>,
  },
  {
    key: "actualSpend",
    header: "Actual Spend",
    sortable: true,
    render: (item) => (
      <span data-testid={`text-actual-${item.id}`}>
        {item.actualSpend > 0 ? formatCurrency(item.actualSpend) : <span className="text-muted-foreground">—</span>}
      </span>
    ),
  },
];

const uniqueStatuses = Array.from(new Set(hubEvents.map((e) => e.status)));
const uniqueTypes = Array.from(new Set(hubEvents.map((e) => e.type)));
const uniqueCities = Array.from(new Set(hubEvents.map((e) => e.city)));

export default function HubEventsList() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [events, setEvents] = useState(hubEvents);

  const filtered = events.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (cityFilter !== "all" && e.city !== cityFilter) return false;
    return true;
  });

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="hub-events-title">All Events</h1>
            <p className="text-sm text-muted-foreground">{events.length} networking events</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            data-testid="button-create-event"
          >
            <Plus className="size-4" />
            Create Event
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map((s) => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40" data-testid="filter-type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-36" data-testid="filter-city">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {uniqueCities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <TableSkeleton rows={8} columns={10} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(item) => navigate(`/hub/events/${item.id}`)}
            rowActions={[
              {
                label: "View Detail",
                onClick: (item) => navigate(`/hub/events/${item.id}`),
              },
              {
                label: "Mark as Live",
                onClick: (item) => {
                  setEvents((prev) => prev.map((e) => e.id === item.id ? { ...e, status: "live" as const } : e));
                },
              },
              {
                label: "Mark as Completed",
                onClick: (item) => {
                  setEvents((prev) => prev.map((e) => e.id === item.id ? { ...e, status: "completed" as const } : e));
                },
              },
            ]}
          />
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Create New Event"
          description="Fill in the details to schedule a new networking event."
        >
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="event-name">Event Name</Label>
              <Input id="event-name" placeholder="e.g. Founders Summit 2026" data-testid="input-event-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="event-type">Type</Label>
                <Select>
                  <SelectTrigger id="event-type" data-testid="input-event-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Investor Meet">Investor Meet</SelectItem>
                    <SelectItem value="Launch Event">Launch Event</SelectItem>
                    <SelectItem value="Roundtable">Roundtable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="event-city">City</Label>
                <Input id="event-city" placeholder="e.g. Mumbai" data-testid="input-event-city" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="event-date">Start Date</Label>
                <Input id="event-date" type="date" data-testid="input-event-date" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="event-end-date">End Date</Label>
                <Input id="event-end-date" type="date" data-testid="input-event-end-date" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="event-venue">Venue</Label>
              <Input id="event-venue" placeholder="e.g. Taj Palace Convention Centre" data-testid="input-event-venue" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="event-budget">Budget (INR)</Label>
                <Input id="event-budget" type="number" placeholder="e.g. 1500000" data-testid="input-event-budget" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="event-organizer">Organizer</Label>
                <Input id="event-organizer" placeholder="Full name" data-testid="input-event-organizer" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="event-description">Description</Label>
              <Input id="event-description" placeholder="Brief event description" data-testid="input-event-description" />
            </div>
          </div>
        </FormDialog>
      </PageTransition>
    </div>
  );
}
