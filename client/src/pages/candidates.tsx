import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { PageBanner } from "@/components/hr/page-banner";
import { DataTable, type Column, type RowAction } from "@/components/hr/data-table";
import emptyPeopleImg from "@/assets/illustrations/empty-people.png";
import { StatusBadge } from "@/components/hr/status-badge";
import { FormDialog } from "@/components/hr/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { candidates as initialCandidates } from "@/lib/mock-data";
import type { Candidate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

export default function Candidates() {
  const loading = useSimulatedLoading();
  const [data, setData] = useState<Candidate[]>(initialCandidates);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Candidate | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    stage: "Applied" as Candidate["stage"],
    appliedDate: "",
    source: "",
    rating: 3,
  });
  const { toast, showSuccess, showError } = useToast();

  const columns: Column<Candidate>[] = [
    {
      key: "name",
      header: "Candidate",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <img src={getPersonAvatar(item.name, 28)} alt={item.name} className="size-7 shrink-0 rounded-full" />
          <div>
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "position",
      header: "Applied For",
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-sm">{item.position}</p>
          <p className="text-xs text-muted-foreground">{item.department}</p>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (item) => <span className="text-sm">{item.source}</span>,
    },
    {
      key: "appliedDate",
      header: "Applied Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.appliedDate}</span>,
    },
    {
      key: "rating",
      header: "Rating",
      render: (item) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`size-3 ${i < (item.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      render: (item) => <StatusBadge status={item.stage} />,
    },
  ];

  const rowActions: RowAction<Candidate>[] = [
    {
      label: "View Profile",
      onClick: (item) => {
        showSuccess("View Candidate", `Viewing ${item.name}`);
      },
    },
    {
      label: "Move to Next Stage",
      onClick: (item) => {
        const stages: Candidate["stage"][] = ["Applied", "Screening", "Interview", "Offer", "Hired"];
        const currentIdx = stages.indexOf(item.stage);
        if (currentIdx < stages.length - 1) {
          const nextStage = stages[currentIdx + 1];
          setData((prev) => prev.map((c) => c.id === item.id ? { ...c, stage: nextStage } : c));
          showSuccess("Stage Updated", `${item.name} moved to ${nextStage}`);
        }
      },
    },
    {
      label: "Edit",
      onClick: (item) => {
        setEditingItem(item);
        setFormState({
          name: item.name,
          email: item.email,
          phone: item.phone,
          position: item.position,
          department: item.department,
          stage: item.stage,
          appliedDate: item.appliedDate,
          source: item.source,
          rating: item.rating || 3,
        });
        setDialogOpen(true);
      },
    },
    {
      label: "Reject",
      variant: "destructive",
      separator: true,
      onClick: (item) => {
        setData((prev) => prev.map((c) => c.id === item.id ? { ...c, stage: "Rejected" as const } : c));
        showSuccess("Candidate Rejected", `${item.name} has been rejected.`);
      },
    },
  ];

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormState({
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      stage: "Applied",
      appliedDate: new Date().toISOString().split("T")[0],
      source: "",
      rating: 3,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formState.name || !formState.email || !formState.position || !formState.department) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (editingItem) {
      setData((prev) => prev.map((c) => c.id === editingItem.id ? { ...c, ...formState } : c));
      showSuccess("Candidate Updated", `${formState.name} has been updated.`);
    } else {
      const newCandidate: Candidate = {
        id: String(Date.now()),
        ...formState,
      };
      setData((prev) => [newCandidate, ...prev]);
      showSuccess("Candidate Added", `${formState.name} has been added.`);
    }
    setDialogOpen(false);
  };

  const stages: Candidate["stage"][] = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];
  const sources = [...new Set(data.map((c) => c.source))];

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Candidates" subtitle="Track your recruitment pipeline" />
      <div className="flex-1 overflow-auto p-6">
        <PageTransition>
        <PageBanner
          title="Recruitment Pipeline"
          description="Track candidates from application to hire across all open positions."
          iconSrc="/3d-icons/candidates.png"
        />
        <PageHeader
          title="All Candidates"
          description={`${data.length} candidates in pipeline`}
          actionLabel="Add Candidate"
          onAction={openCreateDialog}
        />
        {loading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search candidates..."
            searchKey="name"
            rowActions={rowActions}
            filters={[
              { label: "Stage", key: "stage", options: stages },
              { label: "Source", key: "source", options: sources },
            ]}
            emptyTitle="No candidates found"
            emptyDescription="Start building your talent pipeline."
            emptyIllustration={emptyPeopleImg}
          />
        )}
        </PageTransition>
      </div>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Candidate" : "Add New Candidate"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Add Candidate"}
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Full Name *</Label>
          <Input
            value={formState.name}
            onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
            placeholder="Enter full name"
            className="h-8 text-sm"
            data-testid="input-name"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Email *</Label>
            <Input
              type="email"
              value={formState.email}
              onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
              placeholder="email@example.com"
              className="h-8 text-sm"
              data-testid="input-email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Phone</Label>
            <Input
              value={formState.phone}
              onChange={(e) => setFormState((s) => ({ ...s, phone: e.target.value }))}
              placeholder="+91 99876 54321"
              className="h-8 text-sm"
              data-testid="input-phone"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Position *</Label>
            <Input
              value={formState.position}
              onChange={(e) => setFormState((s) => ({ ...s, position: e.target.value }))}
              placeholder="e.g. Frontend Developer"
              className="h-8 text-sm"
              data-testid="input-position"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Department *</Label>
            <Input
              value={formState.department}
              onChange={(e) => setFormState((s) => ({ ...s, department: e.target.value }))}
              placeholder="e.g. Engineering"
              className="h-8 text-sm"
              data-testid="input-department"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Stage</Label>
            <Select value={formState.stage} onValueChange={(v) => setFormState((s) => ({ ...s, stage: v as Candidate["stage"] }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Source</Label>
            <Input
              value={formState.source}
              onChange={(e) => setFormState((s) => ({ ...s, source: e.target.value }))}
              placeholder="e.g. LinkedIn"
              className="h-8 text-sm"
              data-testid="input-source"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Applied Date</Label>
          <Input
            type="date"
            value={formState.appliedDate}
            onChange={(e) => setFormState((s) => ({ ...s, appliedDate: e.target.value }))}
            className="h-8 text-sm"
            data-testid="input-applied-date"
          />
        </div>
      </FormDialog>
    </div>
  );
}
