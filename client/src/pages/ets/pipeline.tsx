import { useMemo, useState } from "react";
import { Link } from "wouter";
import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { PageBanner } from "@/components/hr/page-banner";
import { FormDialog } from "@/components/hr/form-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  etsClients,
  ETS_PIPELINE_STAGES,
  ETS_STAGE_LABELS,
  type EtsClient,
  type EtsPipelineStage,
  type EtsPackageTier,
} from "@/lib/mock-data-ets";
import {
  LayoutGrid,
  Table2,
  Clock,
  Users,
  MapPin,
  Store,
  Search,
  ChevronRight,
  StickyNote,
  FileText,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const tierColors: Record<EtsPackageTier, string> = {
  lite: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  pro: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  elite: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

const stageVariant: Record<EtsPipelineStage, "success" | "error" | "warning" | "neutral" | "info"> = {
  "new-lead": "neutral",
  "qualified": "info",
  "token-paid": "warning",
  "store-design": "info",
  "inventory-ordered": "warning",
  "in-transit": "info",
  "launched": "success",
  "reordering": "success",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Hot";
  if (score >= 60) return "Warm";
  return "Cold";
}

export default function EtsPipeline() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [citySearch, setCitySearch] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteClient, setNoteClient] = useState<EtsClient | null>(null);
  const [noteText, setNoteText] = useState("");

  const filteredClients = useMemo(() => {
    let result = [...etsClients];
    if (stageFilter !== "all") {
      result = result.filter((c) => c.stage === stageFilter);
    }
    if (tierFilter !== "all") {
      result = result.filter((c) => c.packageTier === tierFilter);
    }
    if (citySearch.trim()) {
      const search = citySearch.toLowerCase();
      result = result.filter((c) => c.city.toLowerCase().includes(search) || c.name.toLowerCase().includes(search));
    }
    return result;
  }, [stageFilter, tierFilter, citySearch]);

  const stageColumns = useMemo(() => {
    return ETS_PIPELINE_STAGES.map((stage) => ({
      stage,
      label: ETS_STAGE_LABELS[stage],
      clients: filteredClients.filter((c) => c.stage === stage),
    }));
  }, [filteredClients]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const stage of ETS_PIPELINE_STAGES) {
      counts[stage] = etsClients.filter((c) => c.stage === stage).length;
    }
    return counts;
  }, []);

  const handleAddNote = () => {
    if (noteClient && noteText.trim()) {
      toast({
        title: "Note Added",
        description: `Note added for ${noteClient.name}`,
      });
      setNoteDialogOpen(false);
      setNoteText("");
      setNoteClient(null);
    }
  };

  const handleMoveStage = (client: EtsClient, newStage: EtsPipelineStage) => {
    toast({
      title: "Stage Updated",
      description: `${client.name} moved to ${ETS_STAGE_LABELS[newStage]}`,
    });
  };

  const columns: Column<EtsClient>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col">
          <Link href={`/ets/clients/${item.id}`}>
            <span className="text-sm font-medium hover:underline cursor-pointer" data-testid={`text-client-name-${item.id}`}>
              {item.name}
            </span>
          </Link>
          <span className="text-xs text-muted-foreground">{item.phone}</span>
        </div>
      ),
    },
    {
      key: "city",
      header: "City",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3 text-muted-foreground" />
          <span className="text-sm">{item.city}</span>
        </div>
      ),
    },
    {
      key: "storeSize",
      header: "Store Size",
      sortable: true,
      render: (item) => <span className="text-sm">{item.storeSize} sqft</span>,
    },
    {
      key: "packageTier",
      header: "Package",
      sortable: true,
      render: (item) => (
        <Badge
          variant="secondary"
          className={`border-0 text-xs font-medium capitalize ${tierColors[item.packageTier]}`}
          data-testid={`badge-tier-${item.id}`}
        >
          {item.packageTier}
        </Badge>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      sortable: true,
      render: (item) => (
        <StatusBadge
          status={ETS_STAGE_LABELS[item.stage]}
          variant={stageVariant[item.stage]}
        />
      ),
    },
    {
      key: "daysInStage",
      header: "Days in Stage",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Clock className="size-3 text-muted-foreground" />
          <span className={`text-sm ${item.daysInStage > 10 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}`}>
            {item.daysInStage}d
          </span>
        </div>
      ),
    },
    {
      key: "score",
      header: "Score",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-medium ${scoreColor(item.score)}`}>{item.score}</span>
          <span className={`text-xs ${scoreColor(item.score)}`}>({scoreLabel(item.score)})</span>
        </div>
      ),
    },
    {
      key: "lastNote",
      header: "Last Note",
      render: (item) => (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]" title={item.lastNote}>
          {item.lastNote}
        </span>
      ),
    },
  ];

  const rowActions = [
    {
      label: "View Detail",
      onClick: (item: EtsClient) => {
        window.location.href = `/ets/clients/${item.id}`;
      },
    },
    {
      label: "Add Note",
      onClick: (item: EtsClient) => {
        setNoteClient(item);
        setNoteDialogOpen(true);
      },
    },
    {
      label: "Generate Proposal",
      onClick: (item: EtsClient) => {
        window.location.href = `/ets/proposals`;
      },
    },
  ];

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <PageBanner
          title="Client Pipeline"
          description="Track all franchise clients through their journey from lead to launch and beyond."
          iconSrc="/3d-icons/job-postings.webp"
        />

        <Fade direction="up" distance={10} delay={0.1}>
          <Stagger className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-5">
            {ETS_PIPELINE_STAGES.map((stage) => (
              <StaggerItem key={stage}>
                <Card
                  className={`p-3 cursor-pointer hover-elevate ${stageFilter === stage ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setStageFilter(stageFilter === stage ? "all" : stage)}
                  data-testid={`card-stage-count-${stage}`}
                >
                  <p className="text-xs text-muted-foreground truncate">{ETS_STAGE_LABELS[stage]}</p>
                  <p className="text-lg font-semibold font-heading mt-0.5" data-testid={`text-stage-count-${stage}`}>
                    {stageCounts[stage]}
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Fade>

        <Fade direction="up" distance={10} delay={0.15}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or city..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="h-9 w-56 pl-8 text-sm"
                  data-testid="input-pipeline-search"
                />
              </div>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[140px] text-sm" data-testid="filter-stage">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {ETS_PIPELINE_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>{ETS_STAGE_LABELS[stage]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[130px] text-sm" data-testid="filter-tier">
                  <SelectValue placeholder="All Packages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packages</SelectItem>
                  <SelectItem value="lite">Lite</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 rounded-md border p-0.5">
              <Button
                size="sm"
                variant={view === "kanban" ? "default" : "ghost"}
                onClick={() => setView("kanban")}
                data-testid="button-view-kanban"
              >
                <LayoutGrid className="size-4" />
                Kanban
              </Button>
              <Button
                size="sm"
                variant={view === "table" ? "default" : "ghost"}
                onClick={() => setView("table")}
                data-testid="button-view-table"
              >
                <Table2 className="size-4" />
                Table
              </Button>
            </div>
          </div>
        </Fade>

        <Fade direction="up" distance={10} delay={0.2}>
          {view === "kanban" ? (
            loading ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 mt-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <StatsCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div
                className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 mt-2"
                data-testid="kanban-board"
              >
                {stageColumns.map(({ stage, label, clients }) => (
                  <div
                    key={stage}
                    className="flex flex-col"
                    data-testid={`kanban-column-${stage}`}
                  >
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="text-xs font-medium truncate">{label}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{clients.length}</span>
                    </div>
                    <div className="flex flex-col gap-2.5 min-h-[100px]">
                      {clients.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-4 text-center">
                          <p className="text-xs text-muted-foreground">No clients</p>
                        </div>
                      ) : (
                        clients.map((client) => (
                          <Card
                            key={client.id}
                            className="p-3 hover-elevate cursor-pointer"
                            data-testid={`card-pipeline-${client.id}`}
                          >
                            <Link href={`/ets/clients/${client.id}`}>
                              <div className="flex items-start justify-between gap-1 mb-1.5">
                                <p className="text-xs font-medium leading-snug truncate" data-testid={`text-pipeline-name-${client.id}`}>
                                  {client.name}
                                </p>
                                <span className={`text-[10px] font-bold shrink-0 ${scoreColor(client.score)}`}>
                                  {client.score}
                                </span>
                              </div>
                            </Link>
                            <div className="flex items-center gap-1 mb-1.5">
                              <MapPin className="size-2.5 text-muted-foreground" />
                              <span className="text-[11px] text-muted-foreground truncate">{client.city}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-1.5">
                              <Store className="size-2.5 text-muted-foreground" />
                              <span className="text-[11px] text-muted-foreground">{client.storeSize} sqft</span>
                            </div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <Badge
                                variant="secondary"
                                className={`border-0 text-[10px] px-1.5 py-0 capitalize ${tierColors[client.packageTier]}`}
                              >
                                {client.packageTier}
                              </Badge>
                              <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground shrink-0">
                                <Clock className="size-2.5" />
                                {client.daysInStage}d
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1" title={client.lastNote}>
                              {client.lastNote}
                            </p>
                            <div className="flex items-center gap-1 mt-2 pt-1.5 border-t">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-6"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setNoteClient(client);
                                  setNoteDialogOpen(true);
                                }}
                                title="Add Note"
                                data-testid={`button-note-${client.id}`}
                              >
                                <StickyNote className="size-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-6"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.location.href = `/ets/proposals`;
                                }}
                                title="Generate Proposal"
                                data-testid={`button-proposal-${client.id}`}
                              >
                                <FileText className="size-3" />
                              </Button>
                              <Link href={`/ets/clients/${client.id}`} className="ml-auto">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-6"
                                  title="View Detail"
                                  data-testid={`button-detail-${client.id}`}
                                >
                                  <Eye className="size-3" />
                                </Button>
                              </Link>
                              <Select
                                value={client.stage}
                                onValueChange={(val) => handleMoveStage(client, val as EtsPipelineStage)}
                              >
                                <SelectTrigger
                                  className="h-6 w-auto min-w-[60px] text-[10px] px-1.5"
                                  data-testid={`select-move-stage-${client.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ChevronRight className="size-2.5" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ETS_PIPELINE_STAGES.map((s) => (
                                    <SelectItem key={s} value={s} className="text-xs">
                                      {ETS_STAGE_LABELS[s]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            loading ? (
              <TableSkeleton rows={10} columns={8} />
            ) : (
              <DataTable
                data={filteredClients}
                columns={columns}
                searchPlaceholder="Search clients..."
                searchKey="name"
                rowActions={rowActions}
                filters={[
                  {
                    label: "Stage",
                    key: "stage",
                    options: ETS_PIPELINE_STAGES.map((s) => s),
                  },
                  {
                    label: "Package",
                    key: "packageTier",
                    options: ["lite", "pro", "elite"],
                  },
                ]}
                emptyTitle="No clients found"
                emptyDescription="There are no clients matching your filters."
              />
            )
          )}
        </Fade>

        <FormDialog
          open={noteDialogOpen}
          onOpenChange={setNoteDialogOpen}
          title={`Add Note — ${noteClient?.name || ""}`}
          onSubmit={handleAddNote}
          submitLabel="Add Note"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="note-text">Note</Label>
            <Textarea
              id="note-text"
              placeholder="Enter your note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="resize-none text-sm"
              rows={4}
              data-testid="input-note-text"
            />
          </div>
        </FormDialog>
      </PageTransition>
    </div>
  );
}
