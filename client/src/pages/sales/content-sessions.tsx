import { useState } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { mentorshipSessions as initialSessions, type MentorshipSession } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";
import { SALES_COLOR } from "@/lib/sales-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Video,
  Calendar,
  Clock,
  FolderOpen,
  Plus,
  Pencil,
  GripVertical,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";

const emptySession: Omit<MentorshipSession, "id" | "order"> = {
  title: "",
  url: "",
  category: "",
  duration: "",
  sessionDate: "",
  published: true,
};

export default function ContentSessionsPage() {
  const loading = useSimulatedLoading();
  const [sessions, setSessions] = useState<MentorshipSession[]>(initialSessions);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [reorderMode, setReorderMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<MentorshipSession | null>(null);
  const [formData, setFormData] = useState(emptySession);

  const allCategories = Array.from(new Set(sessions.map((s) => s.category))).sort();
  const publishedCount = sessions.filter((s) => s.published).length;

  const filterOptions = [
    { value: "all", label: "All", count: sessions.length },
    ...allCategories.map((c) => ({
      value: c,
      label: c,
      count: sessions.filter((s) => s.category === c).length,
    })),
  ];

  const filtered = sessions
    .filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === "all" || s.category === activeFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.order - b.order);

  const handleTogglePublished = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, published: !s.published } : s))
    );
  };

  const handleOpenAdd = () => {
    setEditingSession(null);
    setFormData(emptySession);
    setDialogOpen(true);
  };

  const handleOpenEdit = (session: MentorshipSession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      url: session.url,
      category: session.category,
      duration: session.duration,
      sessionDate: session.sessionDate,
      published: session.published,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    if (editingSession) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === editingSession.id ? { ...s, ...formData } : s
        )
      );
    } else {
      const newSession: MentorshipSession = {
        id: `MS-${String(sessions.length + 1).padStart(3, "0")}`,
        ...formData,
        order: sessions.length + 1,
      };
      setSessions((prev) => [...prev, newSession]);
    }
    setDialogOpen(false);
    setEditingSession(null);
    setFormData(emptySession);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...filtered];
    const currentOrder = items[index].order;
    const prevOrder = items[index - 1].order;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === items[index].id) return { ...s, order: prevOrder };
        if (s.id === items[index - 1].id) return { ...s, order: currentOrder };
        return s;
      })
    );
  };

  const handleMoveDown = (index: number) => {
    if (index >= filtered.length - 1) return;
    const items = [...filtered];
    const currentOrder = items[index].order;
    const nextOrder = items[index + 1].order;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === items[index].id) return { ...s, order: nextOrder };
        if (s.id === items[index + 1].id) return { ...s, order: currentOrder };
        return s;
      })
    );
  };

  return (
    <PageShell>
      <PageHeader
        title="Mentorship Sessions"
        subtitle="Manage recorded mentorship sessions and workshops"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={reorderMode ? "default" : "outline"}
              onClick={() => setReorderMode(!reorderMode)}
              data-testid="button-toggle-reorder"
            >
              <GripVertical className="h-4 w-4 mr-1" />
              {reorderMode ? "Done" : "Reorder"}
            </Button>
            <Button
              className="gap-2"
              style={{ backgroundColor: SALES_COLOR }}
              onClick={handleOpenAdd}
              data-testid="button-add-session"
            >
              <Plus className="h-4 w-4" />
              Add Session
            </Button>
          </div>
        }
      />

      <StatGrid cols={3}>
        <StatCard
          label="Total Sessions"
          value={sessions.length}
          icon={Video}
          iconBg="rgba(243, 65, 71, 0.1)"
          iconColor={SALES_COLOR}
        />
        <StatCard
          label="Published"
          value={publishedCount}
          icon={Eye}
          iconBg="rgba(16, 185, 129, 0.1)"
          iconColor="#10b981"
        />
        <StatCard
          label="Categories"
          value={allCategories.length}
          icon={FolderOpen}
          iconBg="rgba(99, 102, 241, 0.1)"
          iconColor="#6366f1"
        />
      </StatGrid>

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        color={SALES_COLOR}
        placeholder="Search sessions..."
      />

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <DataTableContainer>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40">
                {reorderMode && <DataTH className="w-10" />}
                <DataTH>Title</DataTH>
                <DataTH>Category</DataTH>
                <DataTH>Duration</DataTH>
                <DataTH>Session Date</DataTH>
                <DataTH align="center">Published</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={reorderMode ? 7 : 6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Video className="h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm font-medium text-foreground">No sessions found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((session, idx) => (
                  <DataTR key={session.id}>
                    {reorderMode && (
                      <DataTD>
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMoveUp(idx)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                            disabled={idx === 0}
                            data-testid={`button-move-up-${session.id}`}
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </DataTD>
                    )}
                    <DataTD>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-medium" data-testid={`text-session-title-${session.id}`}>
                            {session.title}
                          </p>
                          <a
                            href={session.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1"
                            data-testid={`link-session-url-${session.id}`}
                          >
                            Open recording <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </DataTD>
                    <DataTD>
                      <Badge variant="secondary" data-testid={`badge-category-${session.id}`}>
                        {session.category}
                      </Badge>
                    </DataTD>
                    <DataTD>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {session.duration}
                      </span>
                    </DataTD>
                    <DataTD>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(session.sessionDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </DataTD>
                    <DataTD align="center">
                      <Switch
                        checked={session.published}
                        onCheckedChange={() => handleTogglePublished(session.id)}
                        data-testid={`switch-published-${session.id}`}
                      />
                    </DataTD>
                    <DataTD align="right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(session)}
                        data-testid={`button-edit-${session.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DataTD>
                  </DataTR>
                ))
              )}
            </tbody>
          </table>
        </DataTableContainer>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="dialog-session-form">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {editingSession ? "Edit Session" : "Add Session"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="session-title">Title</Label>
              <Input
                id="session-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Session title"
                data-testid="input-session-title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="session-url">Recording URL</Label>
              <Input
                id="session-url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://zoom.us/rec/share/..."
                data-testid="input-session-url"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="session-category">Category</Label>
                <Input
                  id="session-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Marketing"
                  list="category-suggestions"
                  data-testid="input-session-category"
                />
                <datalist id="category-suggestions">
                  {allCategories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="session-duration">Duration</Label>
                <Input
                  id="session-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. 45 min"
                  data-testid="input-session-duration"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="session-date">Session Date</Label>
                <Input
                  id="session-date"
                  type="date"
                  value={formData.sessionDate}
                  onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                  data-testid="input-session-date"
                />
              </div>
              <div className="flex items-end gap-2 pb-0.5">
                <Switch
                  checked={formData.published}
                  onCheckedChange={(v) => setFormData({ ...formData, published: v })}
                  data-testid="switch-form-published"
                />
                <Label className="text-sm">
                  {formData.published ? (
                    <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Published</span>
                  ) : (
                    <span className="inline-flex items-center gap-1"><EyeOff className="h-3.5 w-3.5" /> Draft</span>
                  )}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-dialog-cancel">
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: SALES_COLOR }}
              onClick={handleSave}
              disabled={!formData.title.trim()}
              data-testid="button-dialog-save"
            >
              {editingSession ? "Save Changes" : "Add Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
