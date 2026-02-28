import { useState, useMemo } from "react";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Bug,
  Zap,
  ArrowUp,
  BookOpen,
  ChevronUp,
  Minus,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { TaskDetailDialog } from "@/components/dev/task-detail-dialog";
import { devTasks, devProjects, type DevTask } from "@/lib/mock-data-dev";

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  backlog: "neutral",
  todo: "info",
  "in-progress": "warning",
  "in-review": "info",
  done: "success",
  cancelled: "error",
};

const priorityVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const typeIcons: Record<string, JSX.Element> = {
  bug: <Bug className="size-3.5 text-red-500" />,
  feature: <Zap className="size-3.5 text-purple-500" />,
  improvement: <ArrowUp className="size-3.5 text-blue-500" />,
  task: <CheckSquare className="size-3.5 text-gray-500" />,
  story: <BookOpen className="size-3.5 text-amber-500" />,
};

const priorityIcons: Record<string, JSX.Element> = {
  critical: <AlertTriangle className="size-3.5 text-red-500" />,
  high: <ChevronUp className="size-3.5 text-orange-500" />,
  medium: <Minus className="size-3.5 text-blue-500" />,
  low: <ChevronDown className="size-3.5 text-gray-400" />,
};

function formatLabel(s: string): string {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function DevTasksPage() {
  const loading = useSimulatedLoading();
  const [selectedTask, setSelectedTask] = useState<DevTask | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const inProgress = devTasks.filter((t) => t.status === "in-progress").length;
    const overdue = devTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done" && t.status !== "cancelled").length;
    const doneCount = devTasks.filter((t) => t.status === "done").length;
    return { total: devTasks.length, inProgress, overdue, done: doneCount };
  }, []);

  const projectMap = useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {};
    devProjects.forEach((p) => { map[p.id] = { name: p.name, color: p.color }; });
    return map;
  }, []);

  const assignees = useMemo(() => Array.from(new Set(devTasks.map((t) => t.assignee))), []);
  const projects = useMemo(() => Array.from(new Set(devTasks.map((t) => t.projectKey))), []);

  const columns: Column<DevTask>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (item) => {
        const proj = projectMap[item.projectId];
        return (
          <Badge
            variant="outline"
            className="font-mono text-xs shrink-0"
            style={{ borderColor: proj?.color, color: proj?.color }}
            data-testid={`badge-task-${item.id}`}
          >
            {item.id}
          </Badge>
        );
      },
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2 min-w-0 max-w-[300px]">
          {typeIcons[item.type]}
          <span className="text-sm font-medium truncate" data-testid={`text-task-title-${item.id}`}>{item.title}</span>
        </div>
      ),
    },
    {
      key: "projectKey",
      header: "Project",
      sortable: true,
      render: (item) => {
        const proj = projectMap[item.projectId];
        return (
          <span className="text-xs font-medium" style={{ color: proj?.color }}>{proj?.name}</span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => (
        <StatusBadge status={formatLabel(item.status)} variant={statusVariant[item.status]} />
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          {priorityIcons[item.priority]}
          <StatusBadge status={formatLabel(item.priority)} variant={priorityVariant[item.priority]} />
        </div>
      ),
    },
    {
      key: "assignee",
      header: "Assignee",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
            {getInitials(item.assignee)}
          </div>
          <span className="text-xs truncate">{item.assignee.split(" ")[0]}</span>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (item) => {
        if (!item.dueDate) return <span className="text-xs text-muted-foreground">-</span>;
        const isOverdue = new Date(item.dueDate) < new Date() && item.status !== "done" && item.status !== "cancelled";
        return (
          <div className="flex items-center gap-1">
            <Calendar className={`size-3 ${isOverdue ? "text-red-500" : "text-muted-foreground"}`} />
            <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
              {item.dueDate}
            </span>
          </div>
        );
      },
    },
    {
      key: "storyPoints",
      header: "Points",
      sortable: true,
      render: (item) => (
        <Badge variant="secondary" className="text-xs font-mono">{item.storyPoints}</Badge>
      ),
    },
  ];

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Total Tasks"
                value={stats.total}
                change={`${devProjects.length} projects`}
                changeType="neutral"
                icon={<CheckSquare className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="In Progress"
                value={stats.inProgress}
                change="Active work"
                changeType="positive"
                icon={<Clock className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Overdue"
                value={stats.overdue}
                change={stats.overdue > 0 ? "Needs attention" : "All on track"}
                changeType={stats.overdue > 0 ? "negative" : "positive"}
                icon={<AlertTriangle className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Completed"
                value={stats.done}
                change={`${Math.round((stats.done / stats.total) * 100)}% done`}
                changeType="positive"
                icon={<TrendingUp className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="mt-6">
            <TableSkeleton rows={8} columns={7} />
          </div>
        ) : (
          <Fade direction="up" delay={0.15} className="mt-6">
            <DataTable
              data={devTasks}
              columns={columns}
              searchPlaceholder="Search tasks by title or ID..."
              searchKey="title"
              filters={[
                {
                  label: "Project",
                  key: "projectKey",
                  options: projects,
                },
                {
                  label: "Status",
                  key: "status",
                  options: ["backlog", "todo", "in-progress", "in-review", "done", "cancelled"],
                },
                {
                  label: "Priority",
                  key: "priority",
                  options: ["critical", "high", "medium", "low"],
                },
                {
                  label: "Type",
                  key: "type",
                  options: ["feature", "bug", "improvement", "task", "story"],
                },
                {
                  label: "Assignee",
                  key: "assignee",
                  options: assignees,
                },
              ]}
              onRowClick={(task) => {
                setSelectedTask(task);
                setDetailOpen(true);
              }}
              rowActions={[
                {
                  label: "View Details",
                  onClick: (task) => {
                    setSelectedTask(task);
                    setDetailOpen(true);
                  },
                },
              ]}
              emptyTitle="No tasks found"
              emptyDescription="Try adjusting your filters."
            />
          </Fade>
        )}

        <TaskDetailDialog
          task={selectedTask}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </PageTransition>
    </div>
  );
}
