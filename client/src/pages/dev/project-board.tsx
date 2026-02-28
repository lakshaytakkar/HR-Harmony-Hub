import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { FormDialog } from "@/components/hr/form-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  devProjects,
  devTasks,
  devSprints,
  type DevTask,
  type DevProject,
} from "@/lib/mock-data-dev";
import {
  ArrowLeft,
  LayoutGrid,
  List,
  Search,
  Plus,
  Calendar,
  Clock,
  Zap,
  Bug,
  ArrowUpCircle,
  CheckCircle2,
  BookOpen,
  AlertCircle,
  CircleDot,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TaskDetailDialog } from "@/components/dev/task-detail-dialog";

type TaskStatus = "backlog" | "todo" | "in-progress" | "in-review" | "done";

const KANBAN_STATUSES: TaskStatus[] = ["backlog", "todo", "in-progress", "in-review", "done"];

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
};

const STATUS_VARIANT: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  backlog: "neutral",
  todo: "info",
  "in-progress": "warning",
  "in-review": "info",
  done: "success",
  cancelled: "error",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  high: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  medium: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const TYPE_ICONS: Record<string, typeof Bug> = {
  bug: Bug,
  feature: Zap,
  improvement: ArrowUpCircle,
  task: CheckCircle2,
  story: BookOpen,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export default function DevProjectBoard() {
  const params = useParams<{ id: string }>();
  const loading = useSimulatedLoading();
  const { toast } = useToast();

  const project = devProjects.find((p) => p.id === params.id);
  const projectTasks = useMemo(
    () => devTasks.filter((t) => t.projectId === params.id),
    [params.id]
  );
  const projectSprints = useMemo(
    () => devSprints.filter((s) => s.projectId === params.id),
    [params.id]
  );

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [sprintFilter, setSprintFilter] = useState("all");
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DevTask | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo" as string,
    priority: "medium" as string,
    type: "task" as string,
    assignee: "",
    dueDate: "",
    storyPoints: "",
    tags: "",
  });

  const assignees = useMemo(() => {
    const set = new Set<string>();
    projectTasks.forEach((t) => { if (t.assignee) set.add(t.assignee); });
    return Array.from(set);
  }, [projectTasks]);

  const filteredTasks = useMemo(() => {
    let result = [...projectTasks];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }
    if (assigneeFilter !== "all") {
      result = result.filter((t) => t.assignee === assigneeFilter);
    }
    if (sprintFilter !== "all") {
      if (sprintFilter === "none") {
        result = result.filter((t) => !t.sprintId);
      } else {
        result = result.filter((t) => t.sprintId === sprintFilter);
      }
    }
    return result;
  }, [projectTasks, searchQuery, priorityFilter, typeFilter, assigneeFilter, sprintFilter]);

  const kanbanColumns = useMemo(() => {
    return KANBAN_STATUSES.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      tasks: filteredTasks.filter((t) => t.status === status),
    }));
  }, [filteredTasks]);

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    toast({
      title: "Task Created",
      description: `${project?.key || ""}-NEW: ${newTask.title}`,
    });
    setAddTaskOpen(false);
    setNewTask({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      type: "task",
      assignee: "",
      dueDate: "",
      storyPoints: "",
      tags: "",
    });
  };

  if (!project) {
    return (
      <div className="px-16 py-6 lg:px-24">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <AlertCircle className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold font-heading" data-testid="text-project-not-found">
            Project Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            The project you're looking for doesn't exist.
          </p>
          <Link href="/dev/projects">
            <Button variant="outline" data-testid="link-back-projects">
              <ArrowLeft className="size-4 mr-1" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalTasks = projectTasks.length;
  const doneTasks = projectTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = projectTasks.filter((t) => t.status === "in-progress").length;
  const overdueTasks = projectTasks.filter((t) => isOverdue(t.dueDate) && t.status !== "done" && t.status !== "cancelled").length;

  const columns: Column<DevTask>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (item) => (
        <Badge
          variant="secondary"
          className="border-0 text-xs font-mono"
          style={{ backgroundColor: `${project.color}15`, color: project.color }}
          data-testid={`badge-task-id-${item.id}`}
        >
          {item.id}
        </Badge>
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium line-clamp-1 max-w-[300px]" data-testid={`text-task-title-${item.id}`}>
          {item.title}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => (
        <StatusBadge
          status={STATUS_LABELS[item.status as TaskStatus] || item.status}
          variant={STATUS_VARIANT[item.status]}
        />
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (item) => (
        <Badge
          variant="secondary"
          className={`border-0 text-xs capitalize ${PRIORITY_COLORS[item.priority]}`}
          data-testid={`badge-priority-${item.id}`}
        >
          {item.priority}
        </Badge>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (item) => {
        const TypeIcon = TYPE_ICONS[item.type] || CircleDot;
        return (
          <div className="flex items-center gap-1.5">
            <TypeIcon className="size-3.5 text-muted-foreground" />
            <span className="text-sm capitalize">{item.type}</span>
          </div>
        );
      },
    },
    {
      key: "assignee",
      header: "Assignee",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px] font-medium" style={{ backgroundColor: `${project.color}20`, color: project.color }}>
              {getInitials(item.assignee)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm truncate max-w-[120px]">{item.assignee}</span>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (item) =>
        item.dueDate ? (
          <span
            className={`text-sm ${isOverdue(item.dueDate) && item.status !== "done" ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}`}
            data-testid={`text-due-date-${item.id}`}
          >
            {item.dueDate}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      key: "storyPoints",
      header: "SP",
      sortable: true,
      render: (item) => (
        <Badge variant="secondary" className="border-0 text-xs font-mono" data-testid={`badge-sp-${item.id}`}>
          {item.storyPoints}
        </Badge>
      ),
    },
  ];

  const rowActions = [
    {
      label: "View Detail",
      onClick: (item: DevTask) => {
        setSelectedTask(item);
        setTaskDetailOpen(true);
      },
    },
  ];

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <Fade direction="up" distance={10} delay={0.05}>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <Link href="/dev/projects">
              <Button variant="ghost" size="icon" data-testid="button-back-projects">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div
              className="size-3 rounded-sm shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <Badge
              variant="secondary"
              className="border-0 text-xs font-mono font-semibold"
              style={{ backgroundColor: `${project.color}15`, color: project.color }}
              data-testid="badge-project-key"
            >
              {project.key}
            </Badge>
            <h1 className="text-xl font-semibold font-heading tracking-tight" data-testid="text-project-name">
              {project.name}
            </h1>
            <StatusBadge
              status={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              variant={project.status === "active" ? "success" : project.status === "paused" ? "warning" : project.status === "completed" ? "info" : "neutral"}
            />
          </div>
          <p className="text-sm text-muted-foreground mb-5 ml-11" data-testid="text-project-description">
            {project.description}
          </p>
        </Fade>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StaggerItem>
              <Card className="p-4" data-testid="card-stat-total-tasks">
                <p className="text-xs text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-semibold font-heading mt-1">{totalTasks}</p>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="p-4" data-testid="card-stat-in-progress">
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-2xl font-semibold font-heading mt-1">{inProgressTasks}</p>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="p-4" data-testid="card-stat-done">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold font-heading mt-1">{doneTasks}</p>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="p-4" data-testid="card-stat-overdue">
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className={`text-2xl font-semibold font-heading mt-1 ${overdueTasks > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                  {overdueTasks}
                </p>
              </Card>
            </StaggerItem>
          </Stagger>
        )}

        <Fade direction="up" distance={10} delay={0.1}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-52 pl-8 text-sm"
                  data-testid="input-board-search"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[130px] text-sm" data-testid="filter-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[120px] text-sm" data-testid="filter-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[140px] text-sm" data-testid="filter-assignee">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {assignees.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {projectSprints.length > 0 && (
                <Select value={sprintFilter} onValueChange={setSprintFilter}>
                  <SelectTrigger className="h-9 w-auto min-w-[160px] text-sm" data-testid="filter-sprint">
                    <SelectValue placeholder="Sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sprints</SelectItem>
                    <SelectItem value="none">No Sprint</SelectItem>
                    {projectSprints.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setAddTaskOpen(true)} data-testid="button-add-task">
                <Plus className="size-4 mr-1" />
                Add Task
              </Button>
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
                  variant={view === "list" ? "default" : "ghost"}
                  onClick={() => setView("list")}
                  data-testid="button-view-list"
                >
                  <List className="size-4" />
                  List
                </Button>
              </div>
            </div>
          </div>
        </Fade>

        <Fade direction="up" distance={10} delay={0.15}>
          {view === "kanban" ? (
            loading ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StatsCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div
                className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mt-2"
                data-testid="kanban-board"
              >
                {kanbanColumns.map(({ status, label, tasks }) => (
                  <div
                    key={status}
                    className="flex flex-col"
                    data-testid={`kanban-column-${status}`}
                  >
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="text-xs font-medium">{label}</span>
                      <Badge variant="secondary" className="border-0 text-[10px] px-1.5 py-0">
                        {tasks.length}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2 min-h-[120px]">
                      {tasks.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-4 text-center">
                          <p className="text-xs text-muted-foreground">No tasks</p>
                        </div>
                      ) : (
                        tasks.map((task) => {
                          const TypeIcon = TYPE_ICONS[task.type] || CircleDot;
                          const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
                          const totalSubtasks = task.subtasks.length;
                          return (
                            <Card
                              key={task.id}
                              className="p-3 hover-elevate cursor-pointer"
                              data-testid={`card-task-${task.id}`}
                              onClick={() => {
                                setSelectedTask(task);
                                setTaskDetailOpen(true);
                              }}
                            >
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Badge
                                  variant="secondary"
                                  className="border-0 text-[10px] font-mono px-1.5 py-0"
                                  style={{ backgroundColor: `${project.color}15`, color: project.color }}
                                >
                                  {task.id}
                                </Badge>
                                <TypeIcon className="size-3 text-muted-foreground ml-auto shrink-0" />
                              </div>
                              <p
                                className="text-xs font-medium leading-snug line-clamp-2 mb-2"
                                data-testid={`text-task-card-title-${task.id}`}
                              >
                                {task.title}
                              </p>
                              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                <Badge
                                  variant="secondary"
                                  className={`border-0 text-[10px] px-1.5 py-0 capitalize ${PRIORITY_COLORS[task.priority]}`}
                                >
                                  {task.priority}
                                </Badge>
                                {task.storyPoints > 0 && (
                                  <Badge variant="secondary" className="border-0 text-[10px] px-1.5 py-0 font-mono">
                                    {task.storyPoints} SP
                                  </Badge>
                                )}
                              </div>
                              {totalSubtasks > 0 && (
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-emerald-500"
                                      style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-muted-foreground shrink-0">
                                    {completedSubtasks}/{totalSubtasks}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-1.5 mt-2 pt-1.5 border-t">
                                <Avatar className="size-5">
                                  <AvatarFallback
                                    className="text-[8px] font-medium"
                                    style={{ backgroundColor: `${project.color}20`, color: project.color }}
                                  >
                                    {getInitials(task.assignee)}
                                  </AvatarFallback>
                                </Avatar>
                                {task.dueDate && (
                                  <div className="flex items-center gap-0.5">
                                    <Calendar className="size-2.5 text-muted-foreground" />
                                    <span
                                      className={`text-[10px] ${
                                        isOverdue(task.dueDate) && task.status !== "done"
                                          ? "text-red-600 dark:text-red-400 font-medium"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {task.dueDate}
                                    </span>
                                  </div>
                                )}
                                {task.tags.length > 0 && (
                                  <Badge variant="secondary" className="border-0 text-[9px] px-1 py-0 truncate max-w-[60px]">
                                    {task.tags[0]}
                                  </Badge>
                                )}
                              </div>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : loading ? (
            <TableSkeleton rows={10} columns={8} />
          ) : (
            <DataTable
              data={filteredTasks}
              columns={columns}
              searchPlaceholder="Search tasks..."
              searchKey="title"
              rowActions={rowActions}
              onRowClick={(task) => {
                setSelectedTask(task);
                setTaskDetailOpen(true);
              }}
              filters={[
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
              ]}
              emptyTitle="No tasks found"
              emptyDescription="There are no tasks matching your filters."
            />
          )}
        </Fade>

        <FormDialog
          open={addTaskOpen}
          onOpenChange={setAddTaskOpen}
          title="Add Task"
          onSubmit={handleAddTask}
          submitLabel="Create Task"
        >
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1"
                data-testid="input-task-title"
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Describe the task..."
                value={newTask.description}
                onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 resize-none text-sm"
                rows={3}
                data-testid="input-task-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(val) => setNewTask((prev) => ({ ...prev, status: val }))}
                >
                  <SelectTrigger className="mt-1" data-testid="select-task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(val) => setNewTask((prev) => ({ ...prev, priority: val }))}
                >
                  <SelectTrigger className="mt-1" data-testid="select-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={newTask.type}
                  onValueChange={(val) => setNewTask((prev) => ({ ...prev, type: val }))}
                >
                  <SelectTrigger className="mt-1" data-testid="select-task-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assignee</Label>
                <Select
                  value={newTask.assignee || "unassigned"}
                  onValueChange={(val) => setNewTask((prev) => ({ ...prev, assignee: val === "unassigned" ? "" : val }))}
                >
                  <SelectTrigger className="mt-1" data-testid="select-task-assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {assignees.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="mt-1"
                  data-testid="input-task-due-date"
                />
              </div>
              <div>
                <Label htmlFor="task-story-points">Story Points</Label>
                <Input
                  id="task-story-points"
                  type="number"
                  min="0"
                  max="21"
                  placeholder="0"
                  value={newTask.storyPoints}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, storyPoints: e.target.value }))}
                  className="mt-1"
                  data-testid="input-task-story-points"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="task-tags">Tags (comma-separated)</Label>
              <Input
                id="task-tags"
                placeholder="e.g., ui, backend, api"
                value={newTask.tags}
                onChange={(e) => setNewTask((prev) => ({ ...prev, tags: e.target.value }))}
                className="mt-1"
                data-testid="input-task-tags"
              />
            </div>
          </div>
        </FormDialog>

        <TaskDetailDialog
          task={selectedTask}
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
        />
      </PageTransition>
    </div>
  );
}
