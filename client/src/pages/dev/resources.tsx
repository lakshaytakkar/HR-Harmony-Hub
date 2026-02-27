import { useState } from "react";
import {
  BookOpen,
  FileText,
  Lightbulb,
  ClipboardList,
  Workflow,
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  Tag,
  Filter,
} from "lucide-react";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/hr/form-dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { devResources, type DevResource } from "@/lib/mock-data-dev";

const categoryIcon: Record<string, JSX.Element> = {
  process: <ClipboardList className="size-4" />,
  learning: <Lightbulb className="size-4" />,
  playbook: <FileText className="size-4" />,
  workflow: <Workflow className="size-4" />,
};

const categoryLabel: Record<string, string> = {
  process: "Process",
  learning: "Learning",
  playbook: "Playbook",
  workflow: "Workflow",
};

const categoryVariant: Record<string, "info" | "success" | "warning" | "neutral"> = {
  process: "info",
  learning: "success",
  playbook: "warning",
  workflow: "neutral",
};

export default function DevResources() {
  const loading = useSimulatedLoading();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = categoryFilter === "all"
    ? devResources
    : devResources.filter((r) => r.category === categoryFilter);

  const totalResources = devResources.length;
  const processCt = devResources.filter((r) => r.category === "process").length;
  const learningCt = devResources.filter((r) => r.category === "learning").length;
  const playbookCt = devResources.filter((r) => r.category === "playbook").length;
  const workflowCt = devResources.filter((r) => r.category === "workflow").length;

  const categories = ["process", "learning", "playbook", "workflow"] as const;
  const grouped: Record<string, DevResource[]> = {};
  for (const cat of categories) {
    const items = filtered.filter((r) => r.category === cat);
    if (items.length > 0) grouped[cat] = items;
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StaggerItem>
              <StatsCard
                title="Total Resources"
                value={totalResources}
                change="Knowledge base"
                changeType="neutral"
                icon={<BookOpen className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Processes"
                value={processCt}
                change="Standard procedures"
                changeType="positive"
                icon={<ClipboardList className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Learnings"
                value={learningCt}
                change="Lessons captured"
                changeType="positive"
                icon={<Lightbulb className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Playbooks"
                value={playbookCt}
                change="Step-by-step guides"
                changeType="neutral"
                icon={<FileText className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Workflows"
                value={workflowCt}
                change="Automated flows"
                changeType="neutral"
                icon={<Workflow className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        {!loading && (
          <Fade direction="up" delay={0.1}>
            <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <Filter className="size-4 text-muted-foreground" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]" data-testid="select-category-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="playbook">Playbook</SelectItem>
                    <SelectItem value="workflow">Workflow</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground" data-testid="text-resource-count">
                  {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
              <Button size="sm" onClick={() => setDialogOpen(true)} data-testid="button-add-resource">
                <Plus className="mr-1.5 size-4" /> Add Resource
              </Button>
            </div>
          </Fade>
        )}

        {!loading && (
          <Fade direction="up" delay={0.2}>
            <div className="mt-6 flex flex-col gap-8">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} data-testid={`section-category-${cat}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {categoryIcon[cat]}
                    </div>
                    <h2 className="text-base font-semibold font-heading">
                      {categoryLabel[cat]}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {items.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {items.map((resource) => {
                      const isExpanded = expandedIds.has(resource.id);
                      return (
                        <div
                          key={resource.id}
                          className="rounded-lg border bg-background transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                          data-testid={`card-resource-${resource.id}`}
                        >
                          <button
                            className="flex w-full items-start gap-3 p-4 text-left"
                            onClick={() => toggleExpand(resource.id)}
                            data-testid={`button-expand-${resource.id}`}
                          >
                            <div className="mt-0.5 shrink-0 text-muted-foreground">
                              {isExpanded ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-semibold">{resource.title}</h3>
                                <StatusBadge
                                  status={categoryLabel[resource.category]}
                                  variant={categoryVariant[resource.category]}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {resource.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="size-3" />
                                  <span>Updated {resource.updatedDate}</span>
                                </div>
                                {resource.tags.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <Tag className="size-3 text-muted-foreground" />
                                    {resource.tags.map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0"
                                        data-testid={`badge-tag-${tag}`}
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="border-t px-4 py-4 pl-11" data-testid={`content-resource-${resource.id}`}>
                              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
                                {resource.content}
                              </pre>
                              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                                <span>Created: {resource.createdDate}</span>
                                <span>Updated: {resource.updatedDate}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {Object.keys(grouped).length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16" data-testid="text-empty-resources">
                  <BookOpen className="size-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">No resources found</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your filter</p>
                </div>
              )}
            </div>
          </Fade>
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add Resource"
          onSubmit={() => setDialogOpen(false)}
          submitLabel="Add Resource"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resource-title">Title</Label>
            <Input id="resource-title" placeholder="Resource title" data-testid="input-resource-title" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resource-description">Description</Label>
            <Input id="resource-description" placeholder="Brief description" data-testid="input-resource-description" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resource-category">Category</Label>
            <Select>
              <SelectTrigger data-testid="select-resource-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="process">Process</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="playbook">Playbook</SelectItem>
                <SelectItem value="workflow">Workflow</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resource-tags">Tags (comma-separated)</Label>
            <Input id="resource-tags" placeholder="tag1, tag2, tag3" data-testid="input-resource-tags" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resource-content">Content</Label>
            <Textarea
              id="resource-content"
              placeholder="Resource content (markdown-style text)"
              className="min-h-[120px]"
              data-testid="input-resource-content"
            />
          </div>
        </FormDialog>
      </PageTransition>
    </div>
  );
}
