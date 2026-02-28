import { useState } from "react";
import { Phone, Mail, MessageCircle, CalendarCheck, CheckSquare, FileText, Plus, Clock } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import { crmActivities, ALL_VERTICALS_IN_CRM, type CrmActivity, type ActivityType } from "@/lib/mock-data-crm";

const BRAND = "#0369A1";

const typeConfig: Record<ActivityType, { label: string; icon: typeof Phone; color: string; bg: string; pill: string }> = {
  call: { label: "Call", icon: Phone, color: "text-blue-600", bg: "bg-blue-50", pill: "bg-blue-50 text-blue-700" },
  email: { label: "Email", icon: Mail, color: "text-slate-600", bg: "bg-slate-50", pill: "bg-slate-50 text-slate-700" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-50", pill: "bg-emerald-50 text-emerald-700" },
  meeting: { label: "Meeting", icon: CalendarCheck, color: "text-amber-600", bg: "bg-amber-50", pill: "bg-amber-50 text-amber-700" },
  task: { label: "Task", icon: CheckSquare, color: "text-violet-600", bg: "bg-violet-50", pill: "bg-violet-50 text-violet-700" },
  note: { label: "Note", icon: FileText, color: "text-purple-600", bg: "bg-purple-50", pill: "bg-purple-50 text-purple-700" },
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700" },
  scheduled: { label: "Scheduled", cls: "bg-sky-50 text-sky-700" },
  overdue: { label: "Overdue", cls: "bg-red-50 text-red-700" },
};

function groupByDate(activities: CrmActivity[]): { label: string; items: CrmActivity[] }[] {
  const today = "2026-02-28";
  const yesterday = "2026-02-27";
  const thisWeekStart = "2026-02-22";

  const groups: Record<string, CrmActivity[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  activities.forEach(a => {
    const dt = (a.completedAt || a.scheduledAt || "").split("T")[0];
    if (dt === today) groups["Today"].push(a);
    else if (dt === yesterday) groups["Yesterday"].push(a);
    else if (dt >= thisWeekStart) groups["This Week"].push(a);
    else groups["Earlier"].push(a);
  });

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

const ALL_TYPES: (ActivityType | "all")[] = ["all", "call", "email", "whatsapp", "meeting", "task", "note"];
const ALL_STATUSES = ["all", "completed", "scheduled", "overdue"];

const REPS = [...new Set(crmActivities.map(a => a.performedBy))].sort();

export default function CrmActivities() {
  const isLoading = useSimulatedLoading(600);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("all");
  const [logOpen, setLogOpen] = useState(false);

  const filtered = crmActivities.filter(a => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (verticalFilter !== "all" && a.vertical !== verticalFilter) return false;
    if (repFilter !== "all" && a.performedBy !== repFilter) return false;
    return true;
  }).sort((a, b) => {
    const ta = a.completedAt || a.scheduledAt || "";
    const tb = b.completedAt || b.scheduledAt || "";
    return tb.localeCompare(ta);
  });

  const groups = groupByDate(filtered);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Activities</h1>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-full">
              {filtered.length}
            </span>
          </div>
          <Button size="sm" className="rounded-full gap-1.5 text-white" style={{ backgroundColor: BRAND }} onClick={() => setLogOpen(true)} data-testid="btn-log-activity">
            <Plus className="size-4" /> Log Activity
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {ALL_TYPES.map(t => {
            const cfg = t === "all" ? null : typeConfig[t as ActivityType];
            const Icon = cfg?.icon;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                data-testid={`pill-type-${t}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  typeFilter === t
                    ? "text-white border-transparent"
                    : "bg-background border-border text-muted-foreground hover:border-foreground/30"
                }`}
                style={typeFilter === t ? { backgroundColor: BRAND } : {}}
              >
                {Icon && <Icon className="size-3" />}
                {t === "all" ? "All" : cfg?.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                data-testid={`pill-status-${s}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border capitalize ${
                  statusFilter === s ? "text-white border-transparent" : "bg-background border-border text-muted-foreground hover:border-foreground/30"
                }`}
                style={statusFilter === s ? { backgroundColor: BRAND } : {}}
              >
                {s === "all" ? "All Status" : s}
              </button>
            ))}
          </div>
          <Select value={verticalFilter} onValueChange={setVerticalFilter}>
            <SelectTrigger className="h-9 w-44 rounded-lg" data-testid="select-vertical"><SelectValue placeholder="Vertical" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verticals</SelectItem>
              {ALL_VERTICALS_IN_CRM.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={repFilter} onValueChange={setRepFilter}>
            <SelectTrigger className="h-9 w-44 rounded-lg" data-testid="select-rep"><SelectValue placeholder="Performed By" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reps</SelectItem>
              {REPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Fade>

      <Fade>
        {groups.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm">No activities match the current filters.</div>
        ) : (
          <div className="space-y-6">
            {groups.map(group => (
              <div key={group.label}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-semibold text-muted-foreground">{group.label}</h2>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">{group.items.length} activities</span>
                </div>
                <div className="space-y-2 relative">
                  <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />
                  {group.items.map(act => {
                    const cfg = typeConfig[act.type];
                    const Icon = cfg.icon;
                    const sc = statusConfig[act.status];
                    const vert = ALL_VERTICALS_IN_CRM.find(v => v.id === act.vertical);
                    const ts = (act.completedAt || act.scheduledAt || "").split("T");
                    const timeStr = ts[1] ? ts[1].slice(0, 5) : "";
                    return (
                      <div
                        key={act.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                          act.status === "overdue" ? "bg-red-50/50 dark:bg-red-950/20 border-red-100" : "bg-card border-border hover:bg-muted/30"
                        }`}
                        data-testid={`activity-${act.id}`}
                      >
                        <div className={`size-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 z-10`}>
                          <Icon className={`size-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{act.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{act.description}</p>
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                {act.contactName && (
                                  <span className="text-xs text-blue-600 font-medium">re: {act.contactName}</span>
                                )}
                                {act.dealTitle && (
                                  <span className="text-xs text-muted-foreground">Deal: {act.dealTitle.split("—")[0].trim()}</span>
                                )}
                                <span className="text-xs text-muted-foreground">by {act.performedBy}</span>
                                {vert && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: vert.color }}>
                                    {vert.name}
                                  </span>
                                )}
                              </div>
                              {act.outcome && (
                                <p className="text-xs text-emerald-600 mt-1 font-medium">→ {act.outcome.split(".")[0]}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
                              {timeStr && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="size-3" />
                                  <span>{ts[0]} {timeStr}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Fade>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Activity Type</label>
              <div className="flex flex-wrap gap-2">
                {(["call", "email", "whatsapp", "meeting", "task", "note"] as ActivityType[]).map(t => {
                  const cfg = typeConfig[t];
                  const Icon = cfg.icon;
                  return (
                    <button key={t} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${cfg.pill} border-transparent`} data-testid={`type-btn-${t}`}>
                      <Icon className="size-3" /> {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Contact</label>
              <Input placeholder="Select or type contact name" className="rounded-lg" data-testid="input-contact" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Linked Deal (optional)</label>
              <Input placeholder="Search deals..." className="rounded-lg" data-testid="input-deal" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea placeholder="What happened? Any important notes..." className="rounded-lg resize-none" rows={3} data-testid="input-description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Date</label>
                <Input type="date" className="rounded-lg" defaultValue="2026-02-28" data-testid="input-date" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Outcome (optional)</label>
                <Input placeholder="e.g. Follow-up in 2 days" className="rounded-lg" data-testid="input-outcome" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setLogOpen(false)} data-testid="btn-cancel">Cancel</Button>
              <Button className="flex-1 rounded-lg text-white" style={{ backgroundColor: BRAND }} data-testid="btn-save-activity">Save Activity</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
