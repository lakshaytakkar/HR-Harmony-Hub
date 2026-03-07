import { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  X,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageShell,
  PageHeader,
  StatCard,
  StatGrid,
  FilterPill,
} from "@/components/layout";
import { verticals } from "@/lib/verticals-config";
import {
  llcApplications,
  LLC_STAGES,
  LLC_WHATSAPP_TEMPLATES,
  type LLCApplication,
  type LLCStage,
} from "@/lib/mock-data-sales";
import { cn } from "@/lib/utils";

function getDaysStuckColor(days: number): string {
  if (days >= 14) return "text-red-600 dark:text-red-400";
  if (days >= 7) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function getDaysStuckBg(days: number): string {
  if (days >= 14) return "bg-red-100 dark:bg-red-900/30";
  if (days >= 7) return "bg-amber-100 dark:bg-amber-900/30";
  return "bg-emerald-100 dark:bg-emerald-900/30";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function LLCTrackerPage() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();
  const vertical = verticals.find((v) => v.id === "sales")!;

  const [data, setData] = useState<LLCApplication[]>(llcApplications);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<LLCApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newAppOpen, setNewAppOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editStage, setEditStage] = useState<LLCStage>("pending");

  const filtered = useMemo(() => {
    return data.filter((app) => {
      const matchSearch =
        app.clientName.toLowerCase().includes(search.toLowerCase()) ||
        app.llcName.toLowerCase().includes(search.toLowerCase()) ||
        app.clientEmail.toLowerCase().includes(search.toLowerCase());
      const matchStage = stageFilter === "all" || app.stage === stageFilter;
      return matchSearch && matchStage;
    });
  }, [data, search, stageFilter]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: data.length };
    LLC_STAGES.forEach((s) => {
      counts[s.key] = data.filter((a) => a.stage === s.key).length;
    });
    return counts;
  }, [data]);

  const totalApps = data.length;
  const completedApps = data.filter((a) => a.stage === "complete");
  const avgCompletionDays = completedApps.length > 0
    ? Math.round(
        completedApps.reduce((sum, a) => {
          const start = new Date(a.appliedDate).getTime();
          const end = new Date(a.milestones.complete!).getTime();
          return sum + (end - start) / (1000 * 60 * 60 * 24);
        }, 0) / completedApps.length
      )
    : 0;
  const stuck14 = data.filter((a) => a.daysInStage >= 14 && a.stage !== "complete").length;
  const inProgress = data.filter((a) => a.stage !== "complete" && a.stage !== "pending").length;

  const openDetail = (app: LLCApplication) => {
    setSelectedApp(app);
    setEditNotes(app.notes);
    setEditStage(app.stage);
    setDetailOpen(true);
  };

  const handleUpdateStage = () => {
    if (!selectedApp) return;
    setData((prev) =>
      prev.map((a) =>
        a.id === selectedApp.id
          ? { ...a, stage: editStage, notes: editNotes, lastUpdated: new Date().toISOString().split("T")[0] }
          : a
      )
    );
    setDetailOpen(false);
    toast({ title: "Application updated", description: `${selectedApp.clientName}'s LLC moved to ${LLC_STAGES.find((s) => s.key === editStage)?.label}` });
  };

  const copyWhatsApp = (app: LLCApplication) => {
    const template = LLC_WHATSAPP_TEMPLATES[app.stage];
    const message = template
      .replace("{name}", app.clientName.split(" ")[0])
      .replace("{llcName}", app.llcName)
      .replace("{state}", app.state);
    navigator.clipboard.writeText(message);
    toast({ title: "Copied to clipboard", description: "WhatsApp message template copied" });
  };

  const groupedByStage = useMemo(() => {
    const groups: Record<LLCStage, LLCApplication[]> = {
      pending: [],
      filed: [],
      ein_applied: [],
      boi_filed: [],
      bank_setup: [],
      stripe_setup: [],
      complete: [],
    };
    filtered.forEach((app) => {
      groups[app.stage].push(app);
    });
    return groups;
  }, [filtered]);

  return (
    <PageShell>
      <PageHeader
        title="LLC Tracker"
        subtitle="Track LLC formation progress for all clients"
        actions={
          <Button
            className="gap-2"
            style={{ backgroundColor: vertical.color }}
            onClick={() => setNewAppOpen(true)}
            data-testid="button-new-application"
          >
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        }
      />

      <StatGrid>
        <StatCard
          label="Total Applications"
          value={totalApps}
          icon={FileText}
          iconBg="#e0f2fe"
          iconColor="#0284c7"
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          icon={Clock}
          iconBg="#fef3c7"
          iconColor="#d97706"
        />
        <StatCard
          label="Avg Completion"
          value={`${avgCompletionDays} days`}
          icon={CheckCircle2}
          iconBg="#d1fae5"
          iconColor="#059669"
        />
        <StatCard
          label="Stuck >14 Days"
          value={stuck14}
          icon={AlertTriangle}
          iconBg="#fee2e2"
          iconColor="#dc2626"
        />
      </StatGrid>

      <div className="flex items-center justify-between gap-4 flex-wrap" data-testid="llc-toolbar">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none h-4 w-4" />
          <Input
            className="pl-10 bg-muted/30"
            placeholder="Search clients or LLC names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-llc"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterPill
            active={stageFilter === "all"}
            color={vertical.color}
            onClick={() => setStageFilter("all")}
            testId="pill-filter-all"
          >
            All ({stageCounts.all})
          </FilterPill>
          {LLC_STAGES.map((s) => (
            <FilterPill
              key={s.key}
              active={stageFilter === s.key}
              color={s.color}
              onClick={() => setStageFilter(s.key)}
              testId={`pill-filter-${s.key}`}
            >
              {s.label} ({stageCounts[s.key] || 0})
            </FilterPill>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4" data-testid="llc-kanban-board">
          {LLC_STAGES.map((stage) => (
            <div
              key={stage.key}
              className="flex-shrink-0 w-64"
              data-testid={`kanban-column-${stage.key}`}
            >
              <div
                className="rounded-md px-3 py-2 mb-3 flex items-center justify-between gap-2"
                style={{ backgroundColor: stage.bg, color: stage.color }}
              >
                <span className="text-xs font-semibold truncate">{stage.label}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 no-default-active-elevate">
                  {groupedByStage[stage.key].length}
                </Badge>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {groupedByStage[stage.key].map((app) => (
                  <Card
                    key={app.id}
                    className="p-3 cursor-pointer hover-elevate"
                    onClick={() => openDetail(app)}
                    data-testid={`llc-card-${app.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-[10px]">{getInitials(app.clientName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" data-testid={`text-client-name-${app.id}`}>
                          {app.clientName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {app.llcName}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {stage.key !== "complete" ? (
                        <span
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded",
                            getDaysStuckColor(app.daysInStage),
                            getDaysStuckBg(app.daysInStage)
                          )}
                          data-testid={`text-days-stuck-${app.id}`}
                        >
                          {app.daysInStage}d in stage
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Done
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{app.state}</span>
                    </div>
                    {app.milestones[stage.key] && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {app.milestones[stage.key]}
                      </div>
                    )}
                  </Card>
                ))}
                {groupedByStage[stage.key].length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-muted-foreground border border-dashed rounded-md">
                    No applications
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden" data-testid="llc-detail-modal">
          {selectedApp && (
            <>
              <div className="px-5 py-4 border-b">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold" data-testid="modal-title">{selectedApp.clientName}</h2>
                    <p className="text-sm text-muted-foreground">{selectedApp.llcName}</p>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: LLC_STAGES.find((s) => s.key === selectedApp.stage)?.bg,
                      color: LLC_STAGES.find((s) => s.key === selectedApp.stage)?.color,
                    }}
                    className="no-default-active-elevate"
                    data-testid="badge-current-stage"
                  >
                    {LLC_STAGES.find((s) => s.key === selectedApp.stage)?.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{selectedApp.clientEmail}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedApp.phone}</span>
                </div>
              </div>

              <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Update Stage</label>
                  <Select value={editStage} onValueChange={(v) => setEditStage(v as LLCStage)}>
                    <SelectTrigger data-testid="select-stage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LLC_STAGES.map((s) => (
                        <SelectItem key={s.key} value={s.key} data-testid={`option-stage-${s.key}`}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Milestones</label>
                  <div className="space-y-2">
                    {LLC_STAGES.map((s) => {
                      const date = selectedApp.milestones[s.key];
                      const stageIndex = LLC_STAGES.findIndex((st) => st.key === s.key);
                      const currentIndex = LLC_STAGES.findIndex((st) => st.key === selectedApp.stage);
                      const isReached = stageIndex <= currentIndex;
                      return (
                        <div
                          key={s.key}
                          className={cn(
                            "flex items-center justify-between gap-2 text-sm rounded-md px-3 py-2",
                            isReached ? "bg-muted/50" : "opacity-50"
                          )}
                          data-testid={`milestone-${s.key}`}
                        >
                          <div className="flex items-center gap-2">
                            {isReached ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: s.color }} />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                            )}
                            <span className={cn(isReached ? "font-medium" : "text-muted-foreground")}>
                              {s.label}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {date || "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="resize-none text-sm"
                    rows={3}
                    data-testid="textarea-notes"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">WhatsApp Update</label>
                  <div className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                    {LLC_WHATSAPP_TEMPLATES[selectedApp.stage]
                      .replace("{name}", selectedApp.clientName.split(" ")[0])
                      .replace("{llcName}", selectedApp.llcName)
                      .replace("{state}", selectedApp.state)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1.5"
                    onClick={() => copyWhatsApp(selectedApp)}
                    data-testid="button-copy-whatsapp"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Message
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">State</span>
                    <span className="font-medium">{selectedApp.state}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Applied</span>
                    <span className="font-medium">{selectedApp.appliedDate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Last Updated</span>
                    <span className="font-medium">{selectedApp.lastUpdated}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Assigned To</span>
                    <span className="font-medium">{selectedApp.assignedTo}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailOpen(false)} data-testid="button-cancel-detail">
                  Cancel
                </Button>
                <Button
                  style={{ backgroundColor: vertical.color }}
                  onClick={handleUpdateStage}
                  data-testid="button-save-detail"
                >
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={newAppOpen} onOpenChange={setNewAppOpen}>
        <DialogContent className="max-w-md" data-testid="new-application-dialog">
          <DialogHeader>
            <DialogTitle>New LLC Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Client Name</label>
              <Input placeholder="Full name" data-testid="input-new-client-name" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <Input placeholder="email@example.com" type="email" data-testid="input-new-email" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
              <Input placeholder="+1-555-0000" data-testid="input-new-phone" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">LLC Name</label>
              <Input placeholder="Business Name LLC" data-testid="input-new-llc-name" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">State</label>
              <Select defaultValue="wyoming">
                <SelectTrigger data-testid="select-new-state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wyoming">Wyoming</SelectItem>
                  <SelectItem value="delaware">Delaware</SelectItem>
                  <SelectItem value="florida">Florida</SelectItem>
                  <SelectItem value="nevada">Nevada</SelectItem>
                  <SelectItem value="texas">Texas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewAppOpen(false)} data-testid="button-cancel-new">
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: vertical.color }}
              onClick={() => {
                setNewAppOpen(false);
                toast({ title: "Application created", description: "New LLC application has been added" });
              }}
              data-testid="button-submit-new"
            >
              Create Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
