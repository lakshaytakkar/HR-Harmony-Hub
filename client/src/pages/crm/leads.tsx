import { useState } from "react";
import { List, LayoutGrid, Mail, Phone, MoreHorizontal, Plus } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import { crmContacts, ALL_VERTICALS_IN_CRM } from "@/lib/mock-data-crm";
import { cn } from "@/lib/utils";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  DetailModal,
  DetailSection,
  PrimaryAction,
} from "@/components/layout";

const BRAND = "#0284C7";

const statusConfig: Record<string, { label: string; cls: string }> = {
  lead: { label: "New", cls: "bg-slate-100 text-slate-700" },
  prospect: { label: "Contacted", cls: "bg-sky-100 text-sky-700" },
  qualified: { label: "Qualified", cls: "bg-amber-100 text-amber-700" },
  customer: { label: "Converted", cls: "bg-emerald-100 text-emerald-700" },
  churned: { label: "Lost", cls: "bg-red-100 text-red-700" },
};

const sourceConfig: Record<string, string> = {
  website: "bg-sky-50 text-sky-700",
  referral: "bg-emerald-50 text-emerald-700",
  linkedin: "bg-blue-50 text-blue-700",
  "cold-outreach": "bg-slate-50 text-slate-700",
  event: "bg-amber-50 text-amber-700",
  partner: "bg-violet-50 text-violet-700",
  inbound: "bg-teal-50 text-teal-700",
};

const kanbanCols = [
  { key: "lead", label: "New Lead", color: "border-slate-300", bg: "bg-slate-50" },
  { key: "prospect", label: "Contacted", color: "border-sky-300", bg: "bg-sky-50" },
  { key: "qualified", label: "Qualified", color: "border-amber-300", bg: "bg-amber-50" },
  { key: "customer", label: "Converted", color: "border-emerald-300", bg: "bg-emerald-50" },
  { key: "churned", label: "Lost", color: "border-red-300", bg: "bg-red-50" },
];

const REPS = Array.from(new Set(crmContacts.map(c => c.assignedTo))).sort();

export default function CrmLeads() {
  const isLoading = useSimulatedLoading(600);
  const [view, setView] = useState<"table" | "kanban">("table");
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const filtered = crmContacts.filter(c => {
    if (verticalFilter !== "all" && c.vertical !== verticalFilter) return false;
    if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (repFilter !== "all" && c.assignedTo !== repFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.company.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const getVertical = (id: string) => ALL_VERTICALS_IN_CRM.find(v => v.id === id);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-52 animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </PageShell>
    );
  }

  const verticalOptions = [
    { value: "all", label: "All Verticals" },
    ...ALL_VERTICALS_IN_CRM.map((v) => ({ value: v.id, label: v.name })),
  ];

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="All Leads"
          subtitle={`${filtered.length} leads total`}
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg overflow-hidden bg-card h-9">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-full w-9 rounded-none",
                    view === "table" ? "bg-muted" : ""
                  )}
                  onClick={() => setView("table")}
                  data-testid="btn-view-table"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-full w-9 rounded-none",
                    view === "kanban" ? "bg-muted" : ""
                  )}
                  onClick={() => setView("kanban")}
                  data-testid="btn-view-kanban"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          }
        />

        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search leads..."
          color={BRAND}
          filters={verticalOptions}
          activeFilter={verticalFilter}
          onFilter={setVerticalFilter}
          primaryAction={{
            label: "Add Lead",
            onClick: () => {},
          }}
          extra={
            <div className="flex items-center gap-2">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="h-9 w-40 bg-muted/30" data-testid="select-source">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-40 bg-muted/30" data-testid="select-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="lead">New Lead</SelectItem>
                  <SelectItem value="prospect">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="customer">Converted</SelectItem>
                  <SelectItem value="churned">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={repFilter} onValueChange={setRepFilter}>
                <SelectTrigger className="h-9 w-44 bg-muted/30" data-testid="select-assignee">
                  <SelectValue placeholder="Assigned To" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reps</SelectItem>
                  {REPS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
      </Fade>

      {view === "table" ? (
        <Fade>
          <DataTableContainer>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <DataTH>Contact</DataTH>
                  <DataTH>Company</DataTH>
                  <DataTH>Vertical</DataTH>
                  <DataTH>Source</DataTH>
                  <DataTH>Status</DataTH>
                  <DataTH>Assigned To</DataTH>
                  <DataTH>Last Activity</DataTH>
                  <DataTH className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((contact) => {
                  const vert = getVertical(contact.vertical);
                  const sc = statusConfig[contact.status];
                  return (
                    <DataTR
                      key={contact.id}
                      onClick={() => setSelectedLead(contact)}
                      data-testid={`lead-row-${contact.id}`}
                    >
                      <DataTD>
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getPersonAvatar(contact.name, 32)}
                            alt={contact.name}
                            className="size-8 rounded-full shrink-0"
                          />
                          <div>
                            <p className="text-sm font-medium">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {contact.email}
                            </p>
                          </div>
                        </div>
                      </DataTD>
                      <DataTD>
                        <div>
                          <p className="text-sm">{contact.company}</p>
                          <p className="text-xs text-muted-foreground">
                            {contact.designation}
                          </p>
                        </div>
                      </DataTD>
                      <DataTD>
                        {vert && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                            style={{ backgroundColor: vert.color }}
                            data-testid={`badge-vertical-${contact.id}`}
                          >
                            {vert.name}
                          </span>
                        )}
                      </DataTD>
                      <DataTD>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                            sourceConfig[contact.source] ??
                            "bg-slate-50 text-slate-700"
                          }`}
                        >
                          {contact.source.replace("-", " ")}
                        </span>
                      </DataTD>
                      <DataTD>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc?.cls}`}
                        >
                          {sc?.label}
                        </span>
                      </DataTD>
                      <DataTD>
                        <div className="flex items-center gap-2">
                          <img
                            src={getPersonAvatar(contact.assignedTo, 24)}
                            alt={contact.assignedTo}
                            className="size-6 rounded-full"
                          />
                          <span className="text-sm">{contact.assignedTo}</span>
                        </div>
                      </DataTD>
                      <DataTD className="text-muted-foreground">
                        {contact.lastActivity}
                      </DataTD>
                      <DataTD align="right">
                        <div className="flex items-center gap-1">
                          <a
                            href={`mailto:${contact.email}`}
                            data-testid={`btn-email-${contact.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="icon" className="size-7">
                              <Mail className="size-3.5" />
                            </Button>
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            data-testid={`btn-call-${contact.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            data-testid={`btn-more-${contact.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="size-3.5" />
                          </Button>
                        </div>
                      </DataTD>
                    </DataTR>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-12 text-center text-muted-foreground text-sm"
                    >
                      No leads match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DataTableContainer>
        </Fade>
      ) : (
        <Fade>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {kanbanCols.map(col => {
              const colContacts = filtered.filter(c => c.status === col.key);
              return (
                <div key={col.key} className="shrink-0 w-72" data-testid={`kanban-col-${col.key}`}>
                  <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl ${col.bg} border ${col.color} border-b-0`}>
                    <span className="text-sm font-semibold">{col.label}</span>
                    <span className="text-xs bg-white/70 rounded-full px-2 py-0.5 font-medium">{colContacts.length}</span>
                  </div>
                  <div className={`border ${col.color} rounded-b-xl p-2 space-y-2 min-h-32`}>
                    {colContacts.map(c => {
                      const vert = getVertical(c.vertical);
                      return (
                        <Card key={c.id} className="border-0 shadow-sm" data-testid={`kanban-card-${c.id}`}>
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <img src={getPersonAvatar(c.name, 28)} alt={c.name} className="size-7 rounded-full" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{c.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{c.company}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {vert && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: vert.color }}>
                                  {vert.name}
                                </span>
                              )}
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${sourceConfig[c.source] ?? ""}`}>
                                {c.source.replace("-", " ")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <img src={getPersonAvatar(c.assignedTo, 20)} alt={c.assignedTo} className="size-5 rounded-full" title={c.assignedTo} />
                              <span className="text-xs text-muted-foreground">{c.lastActivity}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {colContacts.length === 0 && (
                      <div className="h-16 flex items-center justify-center text-xs text-muted-foreground">
                        No leads
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Fade>
      )}

      <DetailModal
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.name || ""}
        subtitle={selectedLead?.company}
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setSelectedLead(null)}>Close</Button>
            <Button className="bg-sky-600 hover:bg-sky-700 text-white" onClick={() => setSelectedLead(null)}>Save Changes</Button>
          </div>
        }
      >
        {selectedLead && (
          <>
            <DetailSection title="Contact Information">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedLead.phone || "—"}</p>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Company Details">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedLead.company}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Designation</p>
                  <p className="font-medium">{selectedLead.designation}</p>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Lead Details">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize bg-slate-100 text-slate-700 w-fit">{selectedLead.source.replace("-", " ")}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${statusConfig[selectedLead.status]?.cls}`}>{statusConfig[selectedLead.status]?.label}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vertical</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 w-fit">{getVertical(selectedLead.vertical)?.name}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Activity</p>
                  <p className="font-medium">{selectedLead.lastActivity}</p>
                </div>
              </div>
            </DetailSection>
          </>
        )}
      </DetailModal>
    </PageShell>
  );
}
