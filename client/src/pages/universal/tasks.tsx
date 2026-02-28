import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { 
  LayoutGrid, 
  List, 
  Search, 
  Plus, 
  Calendar, 
  MoreHorizontal, 
  CheckSquare, 
  Clock, 
  MoreVertical,
  ChevronRight,
  PlusCircle,
  MessageSquare
} from "lucide-react";
import { 
  detectVerticalFromUrl, 
  getVerticalById 
} from "@/lib/verticals-config";
import { 
  sharedTasks, 
  verticalMembers, 
  SharedTask, 
  SharedTaskSubtask 
} from "@/lib/mock-data-shared";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getPersonAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormDialog } from "@/components/hr/form-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function UniversalTasks() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const loading = useSimulatedLoading(600);

  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  const [tasks, setTasks] = useState<SharedTask[]>(() => {
    if (!vertical) return [];
    return sharedTasks.filter(t => t.verticalId === vertical.id);
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    if (activeTab === "my") {
      // Mocking current user as the first member of the vertical
      const currentUser = verticalMembers.find(m => m.verticalId === vertical?.id)?.name;
      result = result.filter(t => t.assigneeName === currentUser);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );
    }

    if (priorityFilter !== "all") {
      result = result.filter(t => t.priority === priorityFilter);
    }

    return result;
  }, [tasks, activeTab, searchQuery, priorityFilter, vertical]);

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const inProgress = filteredTasks.filter(t => t.status === "in-progress").length;
    const done = filteredTasks.filter(t => t.status === "done").length;
    const overdue = filteredTasks.filter(t => {
      if (t.status === "done") return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date();
    }).length;

    return { total, inProgress, done, overdue };
  }, [filteredTasks]);

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTask: SharedTask = {
      id: `TASK-${Math.random().toString(36).substr(2, 9)}`,
      verticalId: vertical?.id || "",
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: (formData.get("status") as SharedTask["status"]) || "todo",
      priority: (formData.get("priority") as SharedTask["priority"]) || "medium",
      assigneeName: formData.get("assignee") as string,
      dueDate: formData.get("dueDate") as string,
      tags: (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean),
      createdDate: new Date().toISOString().split('T')[0],
      subtasks: []
    };
    setTasks(prev => [...prev, newTask]);
    setIsCreateOpen(false);
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  if (!vertical) return null;

  return (
    <PageTransition className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b shrink-0 flex items-center justify-between bg-card">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage and track team responsibilities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-muted p-1 rounded-lg border">
            <Button 
              variant={viewMode === "board" ? "secondary" : "ghost"} 
              size="icon" 
              className={cn("h-8 w-8", viewMode === "board" && "bg-card shadow-sm")}
              onClick={() => setViewMode("board")}
              data-testid="btn-grid-view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="icon" 
              className={cn("h-8 w-8", viewMode === "list" && "bg-card shadow-sm")}
              onClick={() => setViewMode("list")}
              data-testid="btn-list-view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            className="gap-2" 
            style={{ backgroundColor: vertical.color }}
            onClick={() => setIsCreateOpen(true)}
            data-testid="btn-new-task"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Stats Row — compact inline strip */}
      <div className="flex items-stretch border-b bg-card shrink-0">
        {([
          { label: "Total Tasks", value: stats.total },
          { label: "In Progress", value: stats.inProgress },
          { label: "Overdue",     value: stats.overdue, red: true },
          { label: "Completed",   value: stats.done,    green: true },
        ] as { label: string; value: number; red?: boolean; green?: boolean }[]).map((s, i) => (
          <div key={i} className="flex-1 px-5 py-3 flex flex-col justify-center border-r last:border-r-0">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</span>
            <span className={cn("text-lg font-semibold", s.red && "text-red-500", s.green && "text-emerald-600")}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-4 border-b flex items-center justify-between bg-card shrink-0 gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40 h-9" data-testid="filter-priority">
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
        </div>
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-auto">
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs" data-testid="tab-board">All Tasks</TabsTrigger>
            <TabsTrigger value="my" className="text-xs" data-testid="tab-my-tasks">My Tasks</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1 p-6 bg-muted/30">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : viewMode === "board" ? (
          <div className="flex gap-6 overflow-x-auto pb-4 items-start min-h-full">
            {["backlog", "todo", "in-progress", "review", "done"].map((status) => (
              <KanbanColumn 
                key={status} 
                status={status} 
                tasks={filteredTasks.filter(t => t.status === status)}
                onTaskClick={(id) => {
                  setSelectedTaskId(id);
                  setIsDetailOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <TasksListView 
            tasks={filteredTasks} 
            onTaskClick={(id) => {
              setSelectedTaskId(id);
              setIsDetailOpen(true);
            }} 
          />
        )}
      </ScrollArea>

      {/* Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog 
          task={selectedTask}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onStatusChange={(status) => {
            setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: status as SharedTask["status"] } : t));
          }}
          onSubtaskToggle={(subtaskId) => {
            setTasks(prev => prev.map(t => t.id === selectedTask.id ? {
              ...t,
              subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
            } : t));
          }}
          onAddSubtask={(title) => {
            const newSubtask: SharedTaskSubtask = {
              id: `SUB-${Date.now()}`,
              title,
              completed: false
            };
            setTasks(prev => prev.map(t => t.id === selectedTask.id ? {
              ...t,
              subtasks: [...t.subtasks, newSubtask]
            } : t));
          }}
        />
      )}

      {/* Create Dialog */}
      <FormDialog
        title="Create New Task"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={() => {
          const form = document.getElementById("create-task-form") as HTMLFormElement;
          form.requestSubmit();
        }}
        submitLabel="Create Task"
      >
        <form id="create-task-form" onSubmit={handleCreateTask} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" name="title" required placeholder="Enter task title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Describe the task..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="todo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select name="assignee" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {verticalMembers.filter(m => m.verticalId === vertical.id).map(m => (
                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" name="tags" placeholder="urgent, design, frontend" />
          </div>
        </form>
      </FormDialog>
    </PageTransition>
  );
}

function KanbanColumn({ 
  status, 
  tasks, 
  onTaskClick 
}: { 
  status: string, 
  tasks: SharedTask[], 
  onTaskClick: (id: string) => void 
}) {
  const labels: Record<string, string> = {
    backlog: "Backlog",
    todo: "To Do",
    "in-progress": "In Progress",
    review: "In Review",
    done: "Done"
  };

  const colors: Record<string, string> = {
    backlog: "bg-slate-400",
    todo: "bg-blue-400",
    "in-progress": "bg-amber-400",
    review: "bg-purple-400",
    done: "bg-emerald-400"
  };

  return (
    <div className="min-w-[280px] max-w-[320px] flex flex-col h-full" data-testid={`col-${status}`}>
      <div className="p-4 border-b flex items-center justify-between bg-card rounded-t-xl border-x border-t">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", colors[status])} />
          <span className="font-semibold text-[14px]">{labels[status]}</span>
        </div>
        <Badge variant="secondary" className="bg-muted text-muted-foreground">{tasks.length}</Badge>
      </div>
      <div className="flex-1 p-3 space-y-3 bg-muted/20 border-x border-b rounded-b-xl overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-md bg-card/50">
            No tasks
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onClick }: { task: SharedTask, onClick: () => void }) {
  const isOverdue = !task.status.includes("done") && new Date(task.dueDate) < new Date();

  return (
    <Card 
      className="cursor-pointer hover-elevate bg-card group border-none shadow-sm"
      onClick={onClick}
      data-testid={`task-card-${task.id}`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge 
            className={cn(
              "text-[10px] px-2 py-0.5 border-0 font-medium capitalize",
              task.priority === "critical" && "bg-red-50 text-red-500",
              task.priority === "high" && "bg-orange-50 text-orange-500",
              task.priority === "medium" && "bg-blue-50 text-blue-500",
              task.priority === "low" && "bg-slate-50 text-slate-500",
            )}
          >
            {task.priority}
          </Badge>
          <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-1">
          <h4 className="text-[14px] font-semibold line-clamp-2 leading-tight">{task.title}</h4>
          <p className="text-[12px] text-muted-foreground line-clamp-2">{task.description}</p>
        </div>
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded-full border text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className={cn(
            "flex items-center gap-1.5 text-[12px]",
            isOverdue ? "text-red-500" : "text-muted-foreground"
          )}>
            <Calendar className="h-3.5 w-3.5" />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <Avatar className="h-6 w-6 border shadow-sm">
            <AvatarImage src={getPersonAvatar(task.assigneeName)} />
            <AvatarFallback className="text-[10px]">{task.assigneeName.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
    </Card>
  );
}

function TasksListView({ tasks, onTaskClick }: { tasks: SharedTask[], onTaskClick: (id: string) => void }) {
  return (
    <div className="bg-card rounded-xl border overflow-hidden shadow-sm" data-testid="tab-list">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="w-10 p-4"><Checkbox /></th>
            <th className="text-left p-4 font-medium text-muted-foreground">Task Name</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Assignee</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Priority</th>
            <th className="w-10 p-4"></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => {
            const isOverdue = !task.status.includes("done") && new Date(task.dueDate) < new Date();
            return (
              <tr 
                key={task.id} 
                className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onTaskClick(task.id)}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}><Checkbox /></td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-[14px]">{task.title}</span>
                    <span className="text-[12px] text-muted-foreground line-clamp-1">{task.description}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={cn("text-[13px]", isOverdue ? "text-red-500 font-medium" : "text-muted-foreground")}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 border">
                      <AvatarImage src={getPersonAvatar(task.assigneeName)} />
                      <AvatarFallback className="text-[10px]">{task.assigneeName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-[13px]">{task.assigneeName}</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge 
                    className={cn(
                      "text-[10px] px-2 py-0.5 border-0 font-medium capitalize",
                      task.priority === "critical" && "bg-red-50 text-red-500",
                      task.priority === "high" && "bg-orange-50 text-orange-500",
                      task.priority === "medium" && "bg-blue-50 text-blue-500",
                      task.priority === "low" && "bg-slate-50 text-slate-500",
                    )}
                  >
                    {task.priority}
                  </Badge>
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TaskDetailDialog({ 
  task, 
  isOpen, 
  onOpenChange, 
  onStatusChange,
  onSubtaskToggle,
  onAddSubtask
}: { 
  task: SharedTask, 
  isOpen: boolean, 
  onOpenChange: (open: boolean) => void,
  onStatusChange: (status: string) => void,
  onSubtaskToggle: (id: string) => void,
  onAddSubtask: (title: string) => void
}) {
  const [newSubtask, setNewSubtask] = useState("");
  const isOverdue = !task.status.includes("done") && new Date(task.dueDate) < new Date();
  
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] p-0 gap-0 rounded-[20px] bg-card border h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between h-[64px] shrink-0 space-y-0">
          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-lg p-2">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <Separator orientation="vertical" className="h-6" />
            <DialogTitle className="text-sm font-medium text-muted-foreground">Task Detail</DialogTitle>
          </div>
          <DialogDescription className="sr-only">Detailed view of task {task.id}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-card">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">{task.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Description</h4>
                <p className={cn("text-sm leading-relaxed", !task.description && "italic text-muted-foreground")}>
                  {task.description || "No description provided."}
                </p>
              </div>

              <Tabs defaultValue="subtasks" className="w-full">
                <TabsList className="bg-muted p-1 rounded-lg border w-auto">
                  <TabsTrigger value="subtasks" className="text-xs">Subtasks ({completedSubtasks}/{task.subtasks.length})</TabsTrigger>
                  <TabsTrigger value="comments" className="text-xs">Comments</TabsTrigger>
                </TabsList>
                <TabsContent value="subtasks" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    {task.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-3 group">
                        <Checkbox 
                          id={subtask.id} 
                          checked={subtask.completed} 
                          onCheckedChange={() => onSubtaskToggle(subtask.id)}
                          data-testid={`subtask-${subtask.id}`}
                        />
                        <Label 
                          htmlFor={subtask.id} 
                          className={cn("text-sm cursor-pointer transition-colors", subtask.completed && "line-through text-muted-foreground")}
                        >
                          {subtask.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <PlusCircle className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Add a subtask..." 
                      className="h-8 border-none bg-transparent shadow-none focus-visible:ring-0 p-0 text-sm"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSubtask.trim()) {
                          onAddSubtask(newSubtask.trim());
                          setNewSubtask("");
                        }
                      }}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="comments" className="mt-4 space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getPersonAvatar("Sneha Patel")} />
                        <AvatarFallback>SP</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-semibold">Sneha Patel</span>
                          <span className="text-[11px] text-muted-foreground">Yesterday, 4:30 PM</span>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 text-[14px]">
                          Can we expedite this task? It's blocking the Q1 report.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <Textarea placeholder="Write a comment..." className="min-h-[100px] resize-none" />
                    <Button size="sm" className="w-full">Add Comment</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[280px] border-l p-6 space-y-6 overflow-y-auto shrink-0 bg-muted/10">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">Priority</Label>
                <div>
                  <Badge 
                    className={cn(
                      "text-[11px] px-3 py-1 border-0 font-medium capitalize",
                      task.priority === "critical" && "bg-red-50 text-red-500",
                      task.priority === "high" && "bg-orange-50 text-orange-500",
                      task.priority === "medium" && "bg-blue-50 text-blue-500",
                      task.priority === "low" && "bg-slate-50 text-slate-500",
                    )}
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">Status</Label>
                <Select value={task.status} onValueChange={onStatusChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">Assignee</Label>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getPersonAvatar(task.assigneeName)} />
                    <AvatarFallback>{task.assigneeName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{task.assigneeName}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">Due Date</Label>
                <div className={cn("flex items-center gap-2 text-sm", isOverdue ? "text-red-500 font-medium" : "text-foreground")}>
                  <Calendar className="h-4 w-4" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">Created</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(task.createdDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex gap-3 shrink-0 bg-card">
          {task.status === "done" ? (
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => onStatusChange("todo")}
            >
              Reopen Task
            </Button>
          ) : (
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" 
              onClick={() => onStatusChange("done")}
              data-testid="btn-mark-done"
            >
              Mark as Done
            </Button>
          )}
          <Button variant="outline" size="icon" className="shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
