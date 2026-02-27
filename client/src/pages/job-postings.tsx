import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { PageBanner } from "@/components/hr/page-banner";
import { DataTable, type Column, type RowAction } from "@/components/hr/data-table";
import emptyJobsImg from "@/assets/illustrations/empty-jobs.png";
import { StatusBadge } from "@/components/hr/status-badge";
import { FormDialog } from "@/components/hr/form-dialog";
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
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { jobPostings as initialJobPostings } from "@/lib/mock-data";
import type { JobPosting } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";

export default function JobPostings() {
  const loading = useSimulatedLoading();
  const [data, setData] = useState<JobPosting[]>(initialJobPostings);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JobPosting | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time" as JobPosting["type"],
    status: "Draft" as JobPosting["status"],
    postedDate: "",
    closingDate: "",
    applicants: 0,
    description: "",
    salaryRange: "",
    experience: "",
  });
  const { toast, showSuccess, showError } = useToast();

  const columns: Column<JobPosting>[] = [
    {
      key: "title",
      header: "Position",
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.department}</p>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin className="size-3 text-muted-foreground" />
          {item.location}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item) => <StatusBadge status={item.type} />,
    },
    {
      key: "applicants",
      header: "Applicants",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Users className="size-3 text-muted-foreground" />
          {item.applicants}
        </div>
      ),
    },
    {
      key: "salaryRange",
      header: "Salary",
      render: (item) => <span className="text-sm">{item.salaryRange || "--"}</span>,
    },
    {
      key: "postedDate",
      header: "Posted",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.postedDate}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  const rowActions: RowAction<JobPosting>[] = [
    {
      label: "View Details",
      onClick: (item) => {
        showSuccess("View Job", `Viewing ${item.title}`);
      },
    },
    {
      label: "Edit",
      onClick: (item) => {
        setEditingItem(item);
        setFormState({
          title: item.title,
          department: item.department,
          location: item.location,
          type: item.type,
          status: item.status,
          postedDate: item.postedDate,
          closingDate: item.closingDate || "",
          applicants: item.applicants,
          description: item.description,
          salaryRange: item.salaryRange || "",
          experience: item.experience || "",
        });
        setDialogOpen(true);
      },
    },
    {
      label: "Close Position",
      onClick: (item) => {
        setData((prev) => prev.map((j) => j.id === item.id ? { ...j, status: "Closed" as const } : j));
        showSuccess("Position Closed", `${item.title} has been closed.`);
      },
    },
    {
      label: "Delete",
      variant: "destructive",
      separator: true,
      onClick: (item) => {
        setData((prev) => prev.filter((j) => j.id !== item.id));
        showSuccess("Job Posting Removed", `${item.title} has been removed.`);
      },
    },
  ];

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormState({
      title: "",
      department: "",
      location: "",
      type: "Full-time",
      status: "Draft",
      postedDate: new Date().toISOString().split("T")[0],
      closingDate: "",
      applicants: 0,
      description: "",
      salaryRange: "",
      experience: "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formState.title || !formState.department || !formState.location || !formState.description) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (editingItem) {
      setData((prev) => prev.map((j) => j.id === editingItem.id ? { ...j, ...formState } : j));
      showSuccess("Job Updated", `${formState.title} has been updated.`);
    } else {
      const newJob: JobPosting = { id: String(Date.now()), ...formState };
      setData((prev) => [newJob, ...prev]);
      showSuccess("Job Posted", `${formState.title} has been created.`);
    }
    setDialogOpen(false);
  };

  const types: JobPosting["type"][] = ["Full-time", "Part-time", "Contract", "Internship"];
  const statuses: JobPosting["status"][] = ["Open", "Closed", "Draft"];
  const departments = [...new Set(data.map((j) => j.department))];

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Job Postings" subtitle="Manage open positions" />
      <div className="flex-1 overflow-auto p-6">
        <PageBanner
          title="Job Postings"
          description="Create, manage, and track open positions across departments."
          iconSrc="/3d-icons/job-postings.png"
        />
        <PageHeader
          title="All Job Postings"
          description={`${data.length} positions`}
          actionLabel="Create Posting"
          onAction={openCreateDialog}
        />
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search positions..."
            searchKey="title"
            rowActions={rowActions}
            filters={[
              { label: "Status", key: "status", options: statuses },
              { label: "Type", key: "type", options: types },
              { label: "Department", key: "department", options: departments },
            ]}
            emptyTitle="No job postings found"
            emptyDescription="Create your first job posting to start hiring."
            emptyIllustration={emptyJobsImg}
          />
        )}
      </div>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Job Posting" : "Create Job Posting"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Create Posting"}
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Job Title *</Label>
          <Input
            value={formState.title}
            onChange={(e) => setFormState((s) => ({ ...s, title: e.target.value }))}
            placeholder="e.g. Senior Frontend Developer"
            className="h-8 text-sm"
            data-testid="input-job-title"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Department *</Label>
            <Input
              value={formState.department}
              onChange={(e) => setFormState((s) => ({ ...s, department: e.target.value }))}
              placeholder="e.g. Engineering"
              className="h-8 text-sm"
              data-testid="input-job-department"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Location *</Label>
            <Input
              value={formState.location}
              onChange={(e) => setFormState((s) => ({ ...s, location: e.target.value }))}
              placeholder="e.g. Bangalore"
              className="h-8 text-sm"
              data-testid="input-job-location"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Employment Type</Label>
            <Select value={formState.type} onValueChange={(v) => setFormState((s) => ({ ...s, type: v as JobPosting["type"] }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-job-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={formState.status} onValueChange={(v) => setFormState((s) => ({ ...s, status: v as JobPosting["status"] }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-job-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Salary Range</Label>
            <Input
              value={formState.salaryRange}
              onChange={(e) => setFormState((s) => ({ ...s, salaryRange: e.target.value }))}
              placeholder="e.g. 15-22 LPA"
              className="h-8 text-sm"
              data-testid="input-job-salary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Experience</Label>
            <Input
              value={formState.experience}
              onChange={(e) => setFormState((s) => ({ ...s, experience: e.target.value }))}
              placeholder="e.g. 3-5 years"
              className="h-8 text-sm"
              data-testid="input-job-experience"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Posted Date</Label>
            <Input
              type="date"
              value={formState.postedDate}
              onChange={(e) => setFormState((s) => ({ ...s, postedDate: e.target.value }))}
              className="h-8 text-sm"
              data-testid="input-job-posted"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Closing Date</Label>
            <Input
              type="date"
              value={formState.closingDate}
              onChange={(e) => setFormState((s) => ({ ...s, closingDate: e.target.value }))}
              className="h-8 text-sm"
              data-testid="input-job-closing"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Description *</Label>
          <Textarea
            value={formState.description}
            onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
            placeholder="Job description and requirements"
            className="min-h-[80px] text-sm resize-none"
            data-testid="input-job-description"
          />
        </div>
      </FormDialog>
    </div>
  );
}
