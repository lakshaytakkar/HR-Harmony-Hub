import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/hr/page-banner";
import { DataTable, type Column, type RowAction } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
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
import { employees as initialEmployees } from "@/lib/mock-data";
import type { Employee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

export default function Employees() {
  const loading = useSimulatedLoading();
  const [data, setData] = useState<Employee[]>(initialEmployees);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Employee | null>(null);
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    status: "Active" as Employee["status"],
    joinDate: "",
  });
  const { toast, showSuccess, showError } = useToast();

  const columns: Column<Employee>[] = [
    {
      key: "employeeId",
      header: "Employee ID",
      sortable: true,
      render: (item) => (
        <span className="text-xs font-medium text-muted-foreground">{item.employeeId}</span>
      ),
    },
    {
      key: "firstName",
      header: "Name",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <img src={getPersonAvatar(`${item.firstName} ${item.lastName}`, 28)} alt={`${item.firstName[0]}${item.lastName[0]}`} className="size-7 shrink-0 rounded-full" />
          <div>
            <p className="text-sm font-medium">{item.firstName} {item.lastName}</p>
            <p className="text-xs text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      sortable: true,
      render: (item) => <span className="text-sm">{item.department}</span>,
    },
    {
      key: "position",
      header: "Position",
      render: (item) => <span className="text-sm">{item.position}</span>,
    },
    {
      key: "joinDate",
      header: "Join Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.joinDate}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  const rowActions: RowAction<Employee>[] = [
    {
      label: "View Details",
      onClick: (item) => {
        showSuccess("View Employee", `Viewing ${item.firstName} ${item.lastName}`);
      },
    },
    {
      label: "Edit",
      onClick: (item) => {
        setEditingItem(item);
        setFormState({
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          phone: item.phone,
          department: item.department,
          position: item.position,
          status: item.status,
          joinDate: item.joinDate,
        });
        setDialogOpen(true);
      },
    },
    {
      label: "Delete",
      variant: "destructive",
      separator: true,
      onClick: (item) => {
        setData((prev) => prev.filter((e) => e.id !== item.id));
        showSuccess("Employee Removed", `${item.firstName} ${item.lastName} has been removed.`);
      },
    },
  ];

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formState.firstName || !formState.lastName || !formState.email || !formState.department || !formState.position) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (editingItem) {
      setData((prev) =>
        prev.map((e) =>
          e.id === editingItem.id
            ? { ...e, ...formState }
            : e
        )
      );
      showSuccess("Employee Updated", `${formState.firstName} ${formState.lastName} has been updated.`);
    } else {
      const newEmployee: Employee = {
        id: String(Date.now()),
        employeeId: `EMP-${String(data.length + 1).padStart(3, "0")}`,
        ...formState,
      };
      setData((prev) => [newEmployee, ...prev]);
      showSuccess("Employee Added", `${formState.firstName} ${formState.lastName} has been added.`);
    }
    setDialogOpen(false);
  };

  const departments = [...new Set(data.map((e) => e.department))];
  const statuses: Employee["status"][] = ["Active", "Inactive", "On Leave"];

  return (
    <div className="px-8 py-6 lg:px-12">
        <PageTransition>
        <PageBanner
          title="Employee Directory"
          description="View, manage, and organize your entire workforce in one place."
          iconSrc="/3d-icons/employees.png"
        />
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search employees..."
            rowActions={rowActions}
            filters={[
              { label: "Department", key: "department", options: departments },
              { label: "Status", key: "status", options: statuses },
            ]}
            emptyTitle="No employees found"
            emptyDescription="Get started by adding your first team member."
            emptyIllustration={emptyPeopleImg}
            headerActions={
              <Button size="sm" onClick={openCreateDialog} data-testid="button-page-action">
                <Plus className="mr-1.5 size-3.5" />
                Add Employee
              </Button>
            }
          />
        )}
        </PageTransition>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Employee" : "Add New Employee"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Add Employee"}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">First Name *</Label>
            <Input
              value={formState.firstName}
              onChange={(e) => setFormState((s) => ({ ...s, firstName: e.target.value }))}
              placeholder="Enter first name"
              className="h-8 text-sm"
              data-testid="input-first-name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Last Name *</Label>
            <Input
              value={formState.lastName}
              onChange={(e) => setFormState((s) => ({ ...s, lastName: e.target.value }))}
              placeholder="Enter last name"
              className="h-8 text-sm"
              data-testid="input-last-name"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Email *</Label>
          <Input
            type="email"
            value={formState.email}
            onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
            placeholder="email@company.com"
            className="h-8 text-sm"
            data-testid="input-email"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Phone</Label>
          <Input
            value={formState.phone}
            onChange={(e) => setFormState((s) => ({ ...s, phone: e.target.value }))}
            placeholder="+91 98765 43210"
            className="h-8 text-sm"
            data-testid="input-phone"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Department *</Label>
            <Select value={formState.department} onValueChange={(v) => setFormState((s) => ({ ...s, department: v }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={formState.status} onValueChange={(v) => setFormState((s) => ({ ...s, status: v as Employee["status"] }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-status">
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
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Position *</Label>
          <Input
            value={formState.position}
            onChange={(e) => setFormState((s) => ({ ...s, position: e.target.value }))}
            placeholder="e.g. Senior Developer"
            className="h-8 text-sm"
            data-testid="input-position"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Join Date</Label>
          <Input
            type="date"
            value={formState.joinDate}
            onChange={(e) => setFormState((s) => ({ ...s, joinDate: e.target.value }))}
            className="h-8 text-sm"
            data-testid="input-join-date"
          />
        </div>
      </FormDialog>
    </div>
  );
}
