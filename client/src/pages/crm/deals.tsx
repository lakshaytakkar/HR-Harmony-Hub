import { useState, useMemo } from "react";
import { Search, MoreHorizontal, Plus, ArrowUpDown } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import { crmDeals, crmContacts, crmActivities, ALL_VERTICALS_IN_CRM, type CrmDeal } from "@/lib/mock-data-crm";

const BRAND = "#0369A1";

const stageBadge: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-sky-100 text-sky-700",
  qualified: "bg-amber-100 text-amber-700",
  proposal: "bg-blue-100 text-blue-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

const stageLabels: Record<string, string> = {
  new: "New Lead", contacted: "Contacted", qualified: "Qualified",
  proposal: "Proposal Sent", negotiation: "Negotiation", won: "Won", lost: "Lost",
};

const priorityDot: Record<string, string> = {
  high: "bg-red-500", medium: "bg-amber-400", low: "bg-emerald-500",
};

const REPS = [...new Set(crmDeals.map(d => d.assignedTo))].sort();

function formatValue(d: CrmDeal) {
  if (d.currency === "USD") return `$${d.value.toLocaleString()}`;
  return `₹${d.value.toLocaleString()}`;
}

function formatINRShort(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${(v / 1000).toFixed(0)}K`;
}

export default function CrmDeals() {
  const isLoading = useSimulatedLoading(600);
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"value" | "close" | "probability">("value");
  const [selectedDeal, setSelectedDeal] = useState<CrmDeal | null>(null);

  const filtered = useMemo(() => {
    return crmDeals
      .filter(d => {
        if (verticalFilter !== "all" && d.vertical !== verticalFilter) return false;
        if (stageFilter !== "all" && d.stage !== stageFilter) return false;
        if (priorityFilter !== "all" && d.priority !== priorityFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!d.title.toLowerCase().includes(q) && !d.companyName.toLowerCase().includes(q) && !d.contactName.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "value") {
          const av = a.currency === "INR" ? a.value : a.value * 83;
          const bv = b.currency === "INR" ? b.value : b.value * 83;
          return bv - av;
        }
        if (sortBy === "close") return a.expectedClose.localeCompare(b.expectedClose);
        if (sortBy === "probability") return b.probability - a.probability;
        return 0;
      });
  }, [verticalFilter, stageFilter, priorityFilter, search, sortBy]);

  const totalPipeline = filtered
    .filter(d => !["won", "lost"].includes(d.stage))
    .reduce((s, d) => s + (d.currency === "INR" ? d.value : d.value * 83), 0);

  const avgProb = filtered.length
    ? Math.round(filtered.reduce((s, d) => s + d.probability, 0) / filtered.length)
    : 0;

  const closingThisMonth = filtered.filter(d => d.expectedClose.startsWith("2026-03")).length;

  const getVertical = (id: string) => ALL_VERTICALS_IN_CRM.find(v => v.id === id);
  const getContact = (id: string) => crmContacts.find(c => c.id === id);
  const getDealActivities = (dealId: string) => crmActivities.filter(a => a.dealId === dealId).slice(0, 4);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">All Deals</h1>
          <Button size="sm" className="rounded-full gap-1.5 text-white" style={{ backgroundColor: BRAND }} data-testid="btn-add-deal">
            <Plus className="size-4" /> Add Deal
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pipeline Value", value: formatINRShort(totalPipeline), sub: "Active deals only" },
            { label: "Closing This Month", value: `${closingThisMonth} deals`, sub: "Expected in March 2026" },
            { label: "Avg Probability", value: `${avgProb}%`, sub: "Across filtered deals" },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm font-medium mt-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[{ id: "all", name: "All Verticals", color: BRAND }, ...ALL_VERTICALS_IN_CRM].map(v => (
            <button
              key={v.id}
              onClick={() => setVerticalFilter(v.id)}
              data-testid={`pill-vertical-${v.id}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                verticalFilter === v.id ? "text-white border-transparent" : "bg-background border-border text-muted-foreground hover:border-foreground/30"
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
            <Input placeholder="Search deals..." className="pl-9 h-9 w-56 rounded-lg" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search" />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="h-9 w-40 rounded-lg" data-testid="select-stage"><SelectValue placeholder="Stage" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {Object.entries(stageLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 w-36 rounded-lg" data-testid="select-priority"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="h-9 w-40 rounded-lg" data-testid="select-sort"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Sort by Value</SelectItem>
              <SelectItem value="close">Sort by Close Date</SelectItem>
              <SelectItem value="probability">Sort by Probability</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Fade>

      <Fade>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left p-4 font-medium">Deal</th>
                    <th className="text-left p-4 font-medium">Vertical</th>
                    <th className="text-left p-4 font-medium">Value</th>
                    <th className="text-left p-4 font-medium">Stage</th>
                    <th className="text-left p-4 font-medium">Probability</th>
                    <th className="text-left p-4 font-medium">Close Date</th>
                    <th className="text-left p-4 font-medium">Assigned To</th>
                    <th className="text-left p-4 font-medium">Priority</th>
                    <th className="text-left p-4 font-medium">Last Activity</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(deal => {
                    const vert = getVertical(deal.vertical);
                    return (
                      <tr
                        key={deal.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedDeal(deal)}
                        data-testid={`deal-row-${deal.id}`}
                      >
                        <td className="p-4">
                          <p className="text-sm font-medium max-w-[200px] truncate">{deal.title}</p>
                          <p className="text-xs text-muted-foreground">{deal.companyName} · {deal.contactName}</p>
                        </td>
                        <td className="p-4">
                          {vert && (
                            <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: vert.color }}>
                              {vert.name}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-bold">{formatValue(deal)}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadge[deal.stage]}`}>
                            {stageLabels[deal.stage]}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${deal.probability >= 70 ? "bg-emerald-500" : deal.probability >= 40 ? "bg-amber-400" : "bg-slate-400"}`}
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{deal.probability}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{deal.expectedClose}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <img src={getPersonAvatar(deal.assignedTo, 24)} alt={deal.assignedTo} className="size-6 rounded-full" />
                            <span className="text-sm">{deal.assignedTo}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <div className={`size-2 rounded-full ${priorityDot[deal.priority]}`} />
                            <span className="text-xs capitalize text-muted-foreground">{deal.priority}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">{deal.lastActivity}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="icon" className="size-7" onClick={e => e.stopPropagation()} data-testid={`btn-more-${deal.id}`}>
                            <MoreHorizontal className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-sm text-muted-foreground">No deals match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {filtered.length} of {crmDeals.length} deals</span>
              <span>Total value: <span className="font-semibold text-foreground">{formatINRShort(filtered.reduce((s, d) => s + (d.currency === "INR" ? d.value : d.value * 83), 0))}</span> · Avg probability: <span className="font-semibold text-foreground">{avgProb}%</span></span>
            </div>
          </CardContent>
        </Card>
      </Fade>

      <Dialog open={!!selectedDeal} onOpenChange={o => !o && setSelectedDeal(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedDeal && (() => {
            const vert = getVertical(selectedDeal.vertical);
            const contact = getContact(selectedDeal.contactId);
            const acts = getDealActivities(selectedDeal.id);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="leading-snug pr-6">{selectedDeal.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {vert && <span className="text-xs px-2.5 py-1 rounded-full text-white font-medium" style={{ backgroundColor: vert.color }}>{vert.name}</span>}
                    <span className="text-xl font-bold">{formatValue(selectedDeal)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadge[selectedDeal.stage]}`}>{stageLabels[selectedDeal.stage]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Probability</p><p className="font-medium">{selectedDeal.probability}%</p></div>
                    <div><p className="text-xs text-muted-foreground">Priority</p><div className="flex items-center gap-1.5"><div className={`size-2 rounded-full ${priorityDot[selectedDeal.priority]}`} /><p className="font-medium capitalize">{selectedDeal.priority}</p></div></div>
                    <div><p className="text-xs text-muted-foreground">Expected Close</p><p className="font-medium">{selectedDeal.expectedClose}</p></div>
                    <div><p className="text-xs text-muted-foreground">Assigned To</p><p className="font-medium">{selectedDeal.assignedTo}</p></div>
                    <div><p className="text-xs text-muted-foreground">Source</p><p className="font-medium capitalize">{selectedDeal.source.replace("-", " ")}</p></div>
                    <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{selectedDeal.createdDate}</p></div>
                  </div>
                  {contact && (
                    <div className="border rounded-xl p-3">
                      <p className="text-xs text-muted-foreground font-medium mb-2">Contact</p>
                      <div className="flex items-center gap-2.5">
                        <img src={getPersonAvatar(contact.name, 32)} alt={contact.name} className="size-8 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.designation} · {contact.company}</p>
                          <p className="text-xs text-muted-foreground">{contact.email} · {contact.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedDeal.notes && <div><p className="text-xs text-muted-foreground mb-1">Notes</p><p className="text-sm bg-muted rounded-lg p-3">{selectedDeal.notes}</p></div>}
                  {acts.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Recent Activities</p>
                      <div className="space-y-2">
                        {acts.map(a => (
                          <div key={a.id} className="flex items-start gap-2 text-sm">
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded capitalize shrink-0">{a.type}</span>
                            <span className="text-muted-foreground">{a.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
