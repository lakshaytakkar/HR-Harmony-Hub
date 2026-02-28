import { useState } from "react";
import { Search, X } from "lucide-react";
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

const COLUMNS: { stage: string; label: string; border: string; bg: string; text: string; hdr: string }[] = [
  { stage: "new", label: "New Lead", border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-700", hdr: "bg-slate-100" },
  { stage: "contacted", label: "Contacted", border: "border-sky-200", bg: "bg-sky-50", text: "text-sky-700", hdr: "bg-sky-100" },
  { stage: "qualified", label: "Qualified", border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", hdr: "bg-amber-100" },
  { stage: "proposal", label: "Proposal Sent", border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700", hdr: "bg-blue-100" },
  { stage: "negotiation", label: "Negotiation", border: "border-orange-200", bg: "bg-orange-50", text: "text-orange-700", hdr: "bg-orange-100" },
  { stage: "won", label: "Won", border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", hdr: "bg-emerald-100" },
  { stage: "lost", label: "Lost", border: "border-red-200", bg: "bg-red-50", text: "text-red-700", hdr: "bg-red-100" },
];

const priorityDot: Record<string, string> = {
  high: "bg-red-500", medium: "bg-amber-400", low: "bg-emerald-500",
};

const REPS = [...new Set(crmDeals.map(d => d.assignedTo))].sort();

function formatValue(d: CrmDeal) {
  if (d.currency === "USD") return `$${(d.value / 1000).toFixed(0)}K`;
  if (d.value >= 100000) return `₹${(d.value / 100000).toFixed(1)}L`;
  return `₹${(d.value / 1000).toFixed(0)}K`;
}

function convRate(stage: string) {
  const stageOrder = ["new", "contacted", "qualified", "proposal", "negotiation"];
  const idx = stageOrder.indexOf(stage);
  if (idx < 0 || idx >= stageOrder.length - 1) return null;
  const curr = crmDeals.filter(d => d.stage === stageOrder[idx]).length;
  const next = crmDeals.filter(d => d.stage === stageOrder[idx + 1]).length;
  if (curr === 0) return null;
  return Math.round((next / (curr + next)) * 100);
}

export default function CrmPipeline() {
  const isLoading = useSimulatedLoading(700);
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<CrmDeal | null>(null);

  const filtered = crmDeals.filter(d => {
    if (verticalFilter !== "all" && d.vertical !== verticalFilter) return false;
    if (repFilter !== "all" && d.assignedTo !== repFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.title.toLowerCase().includes(q) && !d.companyName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const dealsByStage = (stage: string) => filtered.filter(d => d.stage === stage);
  const stageTotal = (stage: string) => dealsByStage(stage).reduce((s, d) => s + (d.currency === "INR" ? d.value : d.value * 83), 0);

  const getVertical = (id: string) => ALL_VERTICALS_IN_CRM.find(v => v.id === id);
  const getContact = (id: string) => crmContacts.find(c => c.id === id);
  const getDealActivities = (dealId: string) => crmActivities.filter(a => a.dealId === dealId).slice(0, 4);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-10 bg-muted rounded" />
        <div className="flex gap-4">
          {[...Array(7)].map((_, i) => <div key={i} className="w-72 shrink-0 h-96 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Deal Pipeline</h1>
          <div className="text-sm text-muted-foreground">
            {filtered.length} deals · Total:{" "}
            <span className="font-semibold text-foreground">
              ₹{(["new", "contacted", "qualified", "proposal", "negotiation"].reduce((s, st) => s + stageTotal(st), 0) / 100000).toFixed(1)}L
            </span>
          </div>
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

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search deals..." className="pl-9 h-9 w-56 rounded-lg" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search" />
          </div>
          <Select value={repFilter} onValueChange={setRepFilter}>
            <SelectTrigger className="h-9 w-44 rounded-lg" data-testid="select-assignee"><SelectValue placeholder="Assigned To" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reps</SelectItem>
              {REPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Fade>

      <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2">
        {COLUMNS.map(col => {
          const deals = dealsByStage(col.stage);
          const total = stageTotal(col.stage);
          const rate = convRate(col.stage);
          return (
            <div key={col.stage} className="shrink-0 w-[280px] flex flex-col" data-testid={`pipeline-col-${col.stage}`}>
              <div className={`${col.hdr} rounded-t-xl px-3 py-2.5 border ${col.border} border-b-0`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${col.text}`}>{col.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-white/60 ${col.text} font-semibold`}>{deals.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {total >= 100000 ? `₹${(total / 100000).toFixed(1)}L` : `₹${(total / 1000).toFixed(0)}K`}
                </p>
              </div>

              <div className={`flex-1 border ${col.border} rounded-b-xl p-2 space-y-2 min-h-[400px] max-h-[calc(100vh-320px)] overflow-y-auto`}>
                {deals.map(deal => {
                  const vert = getVertical(deal.vertical);
                  return (
                    <div
                      key={deal.id}
                      className="bg-card rounded-xl p-3 shadow-sm border border-border/50 cursor-pointer hover:shadow-md hover:border-border transition-all space-y-2.5"
                      onClick={() => setSelectedDeal(deal)}
                      data-testid={`deal-card-${deal.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight line-clamp-2">{deal.title}</p>
                        <div className={`size-2 rounded-full shrink-0 mt-1 ${priorityDot[deal.priority]}`} title={`${deal.priority} priority`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground truncate">{deal.companyName}</p>
                        <p className="text-xs text-muted-foreground truncate">{deal.contactName}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold">{formatValue(deal)}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {deal.probability}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        {vert && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: vert.color }}>
                            {vert.name}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <img src={getPersonAvatar(deal.assignedTo, 20)} alt={deal.assignedTo} className="size-5 rounded-full" title={deal.assignedTo} />
                          <span className="text-xs text-muted-foreground">{deal.expectedClose.slice(5)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {deals.length === 0 && (
                  <div className="h-16 flex items-center justify-center text-xs text-muted-foreground">
                    No deals
                  </div>
                )}
              </div>

              {rate !== null && (
                <div className="text-center py-1.5">
                  <span className="text-xs text-muted-foreground">{rate}% advance to next</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedDeal} onOpenChange={o => !o && setSelectedDeal(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedDeal && (() => {
            const vert = getVertical(selectedDeal.vertical);
            const contact = getContact(selectedDeal.contactId);
            const acts = getDealActivities(selectedDeal.id);
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="pr-4 leading-snug">{selectedDeal.title}</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    {vert && (
                      <span className="text-xs px-2.5 py-1 rounded-full text-white font-medium" style={{ backgroundColor: vert.color }}>
                        {vert.name}
                      </span>
                    )}
                    <span className="text-lg font-bold">{formatValue(selectedDeal)}</span>
                    <span className="text-sm text-muted-foreground">({selectedDeal.probability}% probability)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Stage</p>
                      <p className="font-medium capitalize">{selectedDeal.stage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Priority</p>
                      <div className="flex items-center gap-1.5">
                        <div className={`size-2 rounded-full ${priorityDot[selectedDeal.priority]}`} />
                        <p className="font-medium capitalize">{selectedDeal.priority}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expected Close</p>
                      <p className="font-medium">{selectedDeal.expectedClose}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{selectedDeal.assignedTo}</p>
                    </div>
                  </div>

                  {contact && (
                    <div className="border rounded-xl p-3 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium mb-2">Contact</p>
                      <div className="flex items-center gap-2.5">
                        <img src={getPersonAvatar(contact.name, 32)} alt={contact.name} className="size-8 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.designation} · {contact.company}</p>
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedDeal.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm bg-muted rounded-lg p-3">{selectedDeal.notes}</p>
                    </div>
                  )}

                  {acts.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Recent Activities</p>
                      <div className="space-y-2">
                        {acts.map(a => (
                          <div key={a.id} className="flex items-start gap-2 text-sm">
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded capitalize shrink-0">{a.type}</span>
                            <span className="text-muted-foreground truncate">{a.title}</span>
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
