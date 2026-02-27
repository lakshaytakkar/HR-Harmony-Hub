import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/hr/page-banner";
import { DataTable, type Column, type RowAction } from "@/components/hr/data-table";
import emptyDepartmentsImg from "@/assets/illustrations/empty-departments.png";
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
import { departments as initialDepartments } from "@/lib/mock-data";
import type { Department } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getThingAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

export default function Departments() {
  const loading = useSimulatedLoading();
  const [data, setData] = useState<Department[]>(initialDepartments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Department | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    head: "",
    employeeCount: 0,
    description: "",
    status: "Active" as Department["status"],
  });
  const { toast, showSuccess, showError } = useToast();

  const columns: Column<Department>[] = [
    {
      key: "name",
      header: "Department",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <img src={getThingAvatar(item.name, 32)} alt={item.name} className="size-8 shrink-0 rounded-lg" />
          <div>
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "head",
      header: "Department Head",
      sortable: true,
      render: (item) => <span className="text-sm">{item.head}</span>,
    },
    {
      key: "employeeCount",
      header: "Employees",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium">{item.employeeCount}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  const rowActions: RowAction<Department>[] = [
    {
      label: "View Details",
      onClick: (item) => {
        showSuccess("View Department", `Viewing ${item.name}`);
      },
    },
    {
      label: "Edit",
      onClick: (item) => {
        setEditingItem(item);
        setFormState({
          name: item.name,
          head: item.head,
          employeeCount: item.employeeCount,
          description: item.description,
          status: item.status,
        });
        setDialogOpen(true);
      },
    },
    {
      label: "Delete",
      variant: "destructive",
      separator: true,
      onClick: (item) => {
        setData((prev) => prev.filter((d) => d.id !== item.id));
        showSuccess("Department Removed", `${item.name} has been removed.`);
      },
    },
  ];

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormState({ name: "", head: "", employeeCount: 0, description: "", status: "Active" });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formState.name || !formState.head || !formState.description) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (editingItem) {
      setData((prev) => prev.map((d) => d.id === editingItem.id ? { ...d, ...formState } : d));
      showSuccess("Department Updated", `${formState.name} has been updated.`);
    } else {
      const newDept: Department = { id: String(Date.now()), ...formState };
      setData((prev) => [newDept, ...prev]);
      showSuccess("Department Added", `${formState.name} has been added.`);
    }
    setDialogOpen(false);
  };

  return (
    <div className="px-8 py-6 lg:px-12">
        <PageTransition>
        <PageBanner
          title="Department Overview"
          description="Manage your organizational structure and department details."
          iconSrc="/3d-icons/departments.png"
        />
        {loading ? (
          <TableSkeleton rows={8} columns={4} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search departments..."
            searchKey="name"
            rowActions={rowActions}
            filters={[
              { label: "Status", key: "status", options: ["Active", "Inactive"] },
            ]}
            emptyTitle="No departments found"
            emptyDescription="Create your first department to organize your team."
            emptyIllustration={emptyDepartmentsImg}
            headerActions={
              <Button size="sm" onClick={openCreateDialog} data-testid="button-page-action">
                <Plus className="mr-1.5 size-3.5" />
                Add Department
              </Button>
            }
          />
        )}
        </PageTransition>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Department" : "Add New Department"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Add Department"}
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Department Name *</Label>
          <Input
            value={formState.name}
            onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
            placeholder="e.g. Engineering"
            className="h-8 text-sm"
            data-testid="input-dept-name"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Department Head *</Label>
            <Input
              value={formState.head}
              onChange={(e) => setFormState((s) => ({ ...s, head: e.target.value }))}
              placeholder="Head name"
              className="h-8 text-sm"
              data-testid="input-dept-head"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={formState.status} onValueChange={(v) => setFormState((s) => ({ ...s, status: v as Department["status"] }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-dept-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Description *</Label>
          <Textarea
            value={formState.description}
            onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
            placeholder="Brief description of the department"
            className="min-h-[80px] text-sm resize-none"
            data-testid="input-dept-description"
          />
        </div>
      </FormDialog>
    </div>
  );
}
