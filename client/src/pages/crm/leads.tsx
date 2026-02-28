import { useState } from "react";
import { List, LayoutGrid, Search, Mail, Phone, MoreHorizontal, Plus, ChevronDown } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import { crmContacts, crmDeals, ALL_VERTICALS_IN_CRM, type CrmContact } from "@/lib/mock-data-crm";

const BRAND = "#0369A1";

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

const REPS = [...new Set(crmContacts.map(c => c.assignedTo))].sort();

export default function CrmLeads() {
  const isLoading = useSimulatedLoading(600);
  const [view, setView] = useState<"table" | "kanban">("table");
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("all");
  const [search, setSearch] = useState("");

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
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-52" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">All Leads</h1>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-full">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-none ${view === "table" ? "bg-muted" : ""}`}
                onClick={() => setView("table")}
                data-testid="btn-view-table"
              >
                <List className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-none ${view === "kanban" ? "bg-muted" : ""}`}
                onClick={() => setView("kanban")}
                data-testid="btn-view-kanban"
              >
                <LayoutGrid className="size-4" />
              </Button>
            </div>
            <Button size="sm" className="rounded-full gap-1.5" style={{ backgroundColor: BRAND }} data-testid="btn-add-lead">
              <Plus className="size-4" /> Add Lead
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[{ id: "all", name: "All Verticals", color: BRAND }, ...ALL_VERTICALS_IN_CRM].map(v => (
            <button
              key={v.id}
              onClick={() => setVerticalFilter(v.id)}
              data-testid={`pill-vertical-${v.id}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                verticalFilter === v.id
                  ? "text-white border-transparent"
                  : "bg-background border-border text-muted-foreground hover:border-foreground/30"
              }`}
              style={verticalFilter === v.id ? { backgroundColor: v.color, borderColor: v.color } : {}}
            >
              {v.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-9 h-9 w-56 rounded-lg"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-9 w-40 rounded-lg" data-testid="select-source">
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
            <SelectTrigger className="h-9 w-40 rounded-lg" data-testid="select-status">
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
            <SelectTrigger className="h-9 w-44 rounded-lg" data-testid="select-assignee">
              <SelectValue placeholder="Assigned To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reps</SelectItem>
              {REPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Fade>

      {view === "table" ? (
        <Fade>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Company</th>
                      <th className="text-left p-4 font-medium">Vertical</th>
                      <th className="text-left p-4 font-medium">Source</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Assigned To</th>
                      <th className="text-left p-4 font-medium">Last Activity</th>
                      <th className="p-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map(contact => {
                      const vert = getVertical(contact.vertical);
                      const sc = statusConfig[contact.status];
                      return (
                        <tr key={contact.id} className="hover:bg-muted/30 transition-colors" data-testid={`lead-row-${contact.id}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <img src={getPersonAvatar(contact.name, 32)} alt={contact.name} className="size-8 rounded-full shrink-0" />
                              <div>
                                <p className="text-sm font-medium">{contact.name}</p>
                                <p className="text-xs text-muted-foreground">{contact.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm">{contact.company}</p>
                              <p className="text-xs text-muted-foreground">{contact.designation}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {vert && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                                style={{ backgroundColor: vert.color }}
                                data-testid={`badge-vertical-${contact.id}`}
                              >
                                {vert.name}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${sourceConfig[contact.source] ?? "bg-slate-50 text-slate-700"}`}>
                              {contact.source.replace("-", " ")}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc?.cls}`}>
                              {sc?.label}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <img src={getPersonAvatar(contact.assignedTo, 24)} alt={contact.assignedTo} className="size-6 rounded-full" />
                              <span className="text-sm">{contact.assignedTo}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{contact.lastActivity}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <a href={`mailto:${contact.email}`} data-testid={`btn-email-${contact.id}`}>
                                <Button variant="ghost" size="icon" className="size-7"><Mail className="size-3.5" /></Button>
                              </a>
                              <Button variant="ghost" size="icon" className="size-7" data-testid={`btn-call-${contact.id}`}>
                                <Phone className="size-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="size-7" data-testid={`btn-more-${contact.id}`}>
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-muted-foreground text-sm">
                          No leads match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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
    </PageTransition>
  );
}
