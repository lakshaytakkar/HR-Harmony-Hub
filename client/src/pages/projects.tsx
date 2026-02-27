import { useState } from "react";
import { useLocation } from "wouter";
import { PageBanner } from "@/components/hr/page-banner";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/hr/stats-card";
import { StatusBadge } from "@/components/hr/status-badge";
import { FormDialog } from "@/components/hr/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projects as initialProjects } from "@/lib/mock-data";
import type { Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Plus,
} from "lucide-react";

export default function Projects() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();
  const [data, setData] = useState<Project[]>(initialProjects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    status: "Active" as Project["status"],
    startDate: "",
    endDate: "",
    priority: "Medium" as Project["priority"],
    teamSize: 1,
  });
  const { showSuccess, showError } = useToast();

  const totalProjects = data.length;
  const completedProjects = data.filter((p) => p.status === "Completed").length;
  const inProgressProjects = data.filter((p) => p.status === "Active").length;
  const overdueProjects = data.filter((p) => p.status === "Overdue").length;

  const openCreateDialog = () => {
    setFormState({
      name: "",
      description: "",
      status: "Active",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      priority: "Medium",
      teamSize: 1,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formState.name || !formState.description || !formState.startDate || !formState.endDate) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...formState,
      progress: 0,
    };
    setData((prev) => [newProject, ...prev]);
    showSuccess("Project Created", `${formState.name} has been created.`);
    setDialogOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const priorityDotColor: Record<Project["priority"], string> = {
    High: "bg-red-500",
    Medium: "bg-amber-500",
    Low: "bg-slate-400",
  };

  return (
    <div className="px-8 py-6 lg:px-12">
        <PageTransition>
          <PageBanner
            title="Project Management"
            description="Track progress, manage tasks, and collaborate across teams."
            iconSrc="/3d-icons/departments.webp"
          />

          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StaggerItem>
              <StatsCard
                title="Total Projects"
                value={totalProjects}
                icon={<FolderKanban className="size-5" />}
                change={`${totalProjects} total`}
                changeType="neutral"
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Completed"
                value={completedProjects}
                icon={<CheckCircle2 className="size-5" />}
                change={`${Math.round((completedProjects / totalProjects) * 100)}% completion rate`}
                changeType="positive"
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="In Progress"
                value={inProgressProjects}
                icon={<Clock className="size-5" />}
                change={`${inProgressProjects} active`}
                changeType="neutral"
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Overdue"
                value={overdueProjects}
                icon={<AlertTriangle className="size-5" />}
                change={overdueProjects > 0 ? `${overdueProjects} need attention` : "All on track"}
                changeType={overdueProjects > 0 ? "negative" : "positive"}
              />
            </StaggerItem>
          </Stagger>

          <div className="flex items-center justify-end pb-4">
            <Button size="sm" onClick={openCreateDialog} data-testid="button-page-action">
              <Plus className="mr-1.5 size-3.5" />
              New Project
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Fade direction="up" distance={8} delay={0.1}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((project) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer overflow-visible hover-elevate p-5"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    data-testid={`card-project-${project.id}`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-sm font-semibold truncate"
                            data-testid={`text-project-name-${project.id}`}
                          >
                            {project.name}
                          </h3>
                          <p
                            className="mt-0.5 text-xs text-muted-foreground line-clamp-2"
                            data-testid={`text-project-desc-${project.id}`}
                          >
                            {project.description}
                          </p>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium" data-testid={`text-progress-${project.id}`}>
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} className="h-1.5" />
                      </div>

                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`size-2 rounded-full ${priorityDotColor[project.priority]}`} />
                            <span className="text-xs text-muted-foreground" data-testid={`text-priority-${project.id}`}>
                              {project.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="size-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground" data-testid={`text-team-${project.id}`}>
                              {project.teamSize}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground" data-testid={`text-due-${project.id}`}>
                            {formatDate(project.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Fade>
          )}
        </PageTransition>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create New Project"
        onSubmit={handleSubmit}
        submitLabel="Create Project"
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Project Name *</Label>
          <Input
            value={formState.name}
            onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
            placeholder="Enter project name"
            className="h-8 text-sm"
            data-testid="input-project-name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Description *</Label>
          <Textarea
            value={formState.description}
            onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
            placeholder="Describe the project"
            className="resize-none text-sm"
            rows={3}
            data-testid="input-project-description"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Priority</Label>
            <Select value={formState.priority} onValueChange={(v) => setFormState((s) => ({ ...s, priority: v as Project["priority"] }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Team Size</Label>
            <Input
              type="number"
              min={1}
              value={formState.teamSize}
              onChange={(e) => setFormState((s) => ({ ...s, teamSize: parseInt(e.target.value) || 1 }))}
              className="h-8 text-sm"
              data-testid="input-team-size"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Start Date *</Label>
            <Input
              type="date"
              value={formState.startDate}
              onChange={(e) => setFormState((s) => ({ ...s, startDate: e.target.value }))}
              className="h-8 text-sm"
              data-testid="input-start-date"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">End Date *</Label>
            <Input
              type="date"
              value={formState.endDate}
              onChange={(e) => setFormState((s) => ({ ...s, endDate: e.target.value }))}
              className="h-8 text-sm"
              data-testid="input-end-date"
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
