import { useState, useMemo } from "react";
import {
  MessageSquare,
  Star,
  Bot,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Heart,
  Search,
  Filter,
} from "lucide-react";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { FormDialog } from "@/components/hr/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { devPrompts, type DevPrompt } from "@/lib/mock-data-dev";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const categoryOptions = ["agent", "frontend", "backend", "database", "debug"] as const;
const modelOptions = ["claude", "gpt", "replit-agent"] as const;

const categoryVariant: Record<string, "info" | "success" | "warning" | "neutral" | "error"> = {
  agent: "info",
  frontend: "success",
  backend: "warning",
  database: "neutral",
  debug: "error",
};

const modelVariant: Record<string, "info" | "success" | "warning"> = {
  claude: "info",
  gpt: "success",
  "replit-agent": "warning",
};

const modelLabel: Record<string, string> = {
  claude: "Claude",
  gpt: "GPT",
  "replit-agent": "Replit Agent",
};

export default function PromptsPage() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();

  const [prompts, setPrompts] = useState<DevPrompt[]>(devPrompts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [favoriteFilter, setFavoriteFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<string>("agent");
  const [newModel, setNewModel] = useState<string>("claude");
  const [newTags, setNewTags] = useState("");

  const filteredPrompts = useMemo(() => {
    let result = [...prompts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (modelFilter !== "all") {
      result = result.filter((p) => p.model === modelFilter);
    }

    if (favoriteFilter === "favorites") {
      result = result.filter((p) => p.isFavorite);
    }

    return result;
  }, [prompts, searchQuery, categoryFilter, modelFilter, favoriteFilter]);

  const totalPrompts = prompts.length;
  const totalFavorites = prompts.filter((p) => p.isFavorite).length;
  const modelCounts = {
    claude: prompts.filter((p) => p.model === "claude").length,
    gpt: prompts.filter((p) => p.model === "gpt").length,
    "replit-agent": prompts.filter((p) => p.model === "replit-agent").length,
  };

  const handleCopy = async (prompt: DevPrompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopiedId(prompt.id);
      toast({ title: "Copied to clipboard", description: `"${prompt.title}" prompt copied.` });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  };

  const toggleFavorite = (id: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const handleAddPrompt = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPrompt: DevPrompt = {
      id: `PRM-${String(prompts.length + 1).padStart(3, "0")}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory as DevPrompt["category"],
      model: newModel as DevPrompt["model"],
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      lastUsed: new Date().toISOString().split("T")[0],
      createdDate: new Date().toISOString().split("T")[0],
      isFavorite: false,
    };

    setPrompts((prev) => [newPrompt, ...prev]);
    setDialogOpen(false);
    setNewTitle("");
    setNewContent("");
    setNewCategory("agent");
    setNewModel("claude");
    setNewTags("");
    toast({ title: "Prompt added", description: `"${newPrompt.title}" has been saved.` });
  };

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Total Prompts"
                value={totalPrompts}
                change={`${filteredPrompts.length} shown`}
                changeType="neutral"
                icon={<MessageSquare className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Favorites"
                value={totalFavorites}
                change={`${Math.round((totalFavorites / totalPrompts) * 100)}% of total`}
                changeType="positive"
                icon={<Star className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Claude Prompts"
                value={modelCounts.claude}
                change={`GPT: ${modelCounts.gpt}, Agent: ${modelCounts["replit-agent"]}`}
                changeType="neutral"
                icon={<Bot className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Categories"
                value={categoryOptions.length}
                change="agent, frontend, backend, db, debug"
                changeType="neutral"
                icon={<Filter className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        <Fade direction="up" delay={0.15} className="mt-6">
          <div className="rounded-lg border bg-background">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-60 pl-8 text-sm"
                  data-testid="input-prompts-search"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 w-auto min-w-[130px] text-sm" data-testid="filter-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={modelFilter} onValueChange={setModelFilter}>
                  <SelectTrigger className="h-8 w-auto min-w-[130px] text-sm" data-testid="filter-model">
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    {modelOptions.map((m) => (
                      <SelectItem key={m} value={m}>
                        {modelLabel[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={favoriteFilter} onValueChange={setFavoriteFilter}>
                  <SelectTrigger className="h-8 w-auto min-w-[120px] text-sm" data-testid="filter-favorite">
                    <SelectValue placeholder="Favorites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prompts</SelectItem>
                    <SelectItem value="favorites">Favorites Only</SelectItem>
                  </SelectContent>
                </Select>

                <Button size="sm" onClick={() => setDialogOpen(true)} data-testid="button-add-prompt">
                  <Plus className="mr-1.5 size-3.5" /> Add Prompt
                </Button>
              </div>
            </div>

            <div className="divide-y">
              {filteredPrompts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12" data-testid="empty-state">
                  <MessageSquare className="size-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">No prompts found</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                filteredPrompts.map((prompt) => {
                  const isExpanded = expandedId === prompt.id;
                  const isCopied = copiedId === prompt.id;

                  return (
                    <div
                      key={prompt.id}
                      className="transition-colors hover:bg-muted/30"
                      data-testid={`card-prompt-${prompt.id}`}
                    >
                      <div
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
                        data-testid={`button-expand-${prompt.id}`}
                      >
                        <div className="shrink-0 text-muted-foreground">
                          {isExpanded ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium truncate" data-testid={`text-title-${prompt.id}`}>
                              {prompt.title}
                            </p>
                            <StatusBadge
                              status={prompt.category}
                              variant={categoryVariant[prompt.category]}
                            />
                            <StatusBadge
                              status={modelLabel[prompt.model]}
                              variant={modelVariant[prompt.model]}
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {prompt.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0"
                                data-testid={`badge-tag-${tag}`}
                              >
                                {tag}
                              </Badge>
                            ))}
                            <span className="text-xs text-muted-foreground">
                              Last used: {prompt.lastUsed}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleFavorite(prompt.id)}
                            data-testid={`button-favorite-${prompt.id}`}
                          >
                            <Heart
                              className={cn(
                                "size-4",
                                prompt.isFavorite
                                  ? "fill-red-500 text-red-500"
                                  : "text-muted-foreground"
                              )}
                            />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleCopy(prompt)}
                            data-testid={`button-copy-${prompt.id}`}
                          >
                            {isCopied ? (
                              <Check className="size-4 text-emerald-500" />
                            ) : (
                              <Copy className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pl-11" data-testid={`content-prompt-${prompt.id}`}>
                          <div className="rounded-md border bg-muted/30 p-4">
                            <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                              {prompt.content}
                            </pre>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              Created: {prompt.createdDate}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopy(prompt)}
                              data-testid={`button-copy-expanded-${prompt.id}`}
                            >
                              {isCopied ? (
                                <Check className="mr-1.5 size-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="mr-1.5 size-3.5" />
                              )}
                              {isCopied ? "Copied" : "Copy Prompt"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {filteredPrompts.length > 0 && (
              <div className="border-t px-4 py-3">
                <p className="text-sm text-muted-foreground" data-testid="text-prompts-count">
                  Showing {filteredPrompts.length} of {totalPrompts} prompts
                </p>
              </div>
            )}
          </div>
        </Fade>

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add Prompt"
          onSubmit={handleAddPrompt}
          submitLabel="Save Prompt"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prompt-title">Title</Label>
            <Input
              id="prompt-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Full-stack page scaffold"
              data-testid="input-prompt-title"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prompt-content">Prompt Content</Label>
            <Textarea
              id="prompt-content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write the full prompt text here..."
              rows={6}
              data-testid="input-prompt-content"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger data-testid="select-prompt-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Model</Label>
              <Select value={newModel} onValueChange={setNewModel}>
                <SelectTrigger data-testid="select-prompt-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {modelLabel[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prompt-tags">Tags (comma-separated)</Label>
            <Input
              id="prompt-tags"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="e.g. scaffold, page, pattern"
              data-testid="input-prompt-tags"
            />
          </div>
        </FormDialog>
      </PageTransition>
    </div>
  );
}
