import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/hr/page-banner";
import { DataTable, type Column, type RowAction } from "@/components/hr/data-table";
import emptyCalendarImg from "@/assets/illustrations/empty-calendar.png";
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
import { leaveRequests as initialLeaveRequests, employees } from "@/lib/mock-data";
import type { LeaveRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

export default function LeaveManagement() {
  const loading = useSimulatedLoading();
  const [data, setData] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LeaveRequest | null>(null);
  const [formState, setFormState] = useState({
    employeeId: "",
    employeeName: "",
    type: "Annual" as LeaveRequest["type"],
    startDate: "",
    endDate: "",
    status: "Pending" as LeaveRequest["status"],
    reason: "",
    days: 1,
  });
  const { toast, showSuccess, showError } = useToast();

  const columns: Column<LeaveRequest>[] = [
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <img src={getPersonAvatar(item.employeeName, 28)} alt={item.employeeName} className="size-7 shrink-0 rounded-full" />
          <span className="text-sm font-medium">{item.employeeName}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Leave Type",
      render: (item) => <StatusBadge status={item.type} variant="info" />,
    },
    {
      key: "startDate",
      header: "From",
      sortable: true,
      render: (item) => <span className="text-sm">{item.startDate}</span>,
    },
    {
      key: "endDate",
      header: "To",
      render: (item) => <span className="text-sm">{item.endDate}</span>,
    },
    {
      key: "days",
      header: "Days",
      sortable: true,
      render: (item) => <span className="text-sm font-medium">{item.days}</span>,
    },
    {
      key: "reason",
      header: "Reason",
      render: (item) => (
        <span className="text-sm text-muted-foreground line-clamp-1 max-w-[180px]">{item.reason}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  const rowActions: RowAction<LeaveRequest>[] = [
    {
      label: "Approve",
      onClick: (item) => {
        setData((prev) => prev.map((l) => l.id === item.id ? { ...l, status: "Approved" as const } : l));
        showSuccess("Leave Approved", `${item.employeeName}'s leave has been approved.`);
      },
    },
    {
      label: "Reject",
      onClick: (item) => {
        setData((prev) => prev.map((l) => l.id === item.id ? { ...l, status: "Rejected" as const } : l));
        showSuccess("Leave Rejected", `${item.employeeName}'s leave has been rejected.`);
      },
    },
    {
      label: "Edit",
      onClick: (item) => {
        setEditingItem(item);
        setFormState({
          employeeId: item.employeeId,
          employeeName: item.employeeName,
          type: item.type,
          startDate: item.startDate,
          endDate: item.endDate,
          status: item.status,
          reason: item.reason,
          days: item.days,
        });
        setDialogOpen(true);
      },
    },
    {
      label: "Delete",
      variant: "destructive",
      separator: true,
      onClick: (item) => {
        setData((prev) => prev.filter((l) => l.id !== item.id));
        showSuccess("Leave Request Removed", "The leave request has been removed.");
      },
    },
  ];

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormState({
      employeeId: "",
      employeeName: "",
      type: "Annual",
      startDate: "",
      endDate: "",
      status: "Pending",
      reason: "",
      days: 1,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formState.employeeName || !formState.startDate || !formState.endDate || !formState.reason) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (editingItem) {
      setData((prev) => prev.map((l) => l.id === editingItem.id ? { ...l, ...formState } : l));
      showSuccess("Leave Updated", "Leave request has been updated.");
    } else {
      const newLeave: LeaveRequest = { id: String(Date.now()), ...formState };
      setData((prev) => [newLeave, ...prev]);
      showSuccess("Leave Requested", "New leave request has been created.");
    }
    setDialogOpen(false);
  };

  const leaveTypes: LeaveRequest["type"][] = ["Annual", "Sick", "Personal", "Maternity", "Paternity"];
  const statuses: LeaveRequest["status"][] = ["Pending", "Approved", "Rejected"];

  return (
    <div className="px-8 py-6 lg:px-12">
        <PageTransition>
        <PageBanner
          title="Leave Management"
          description="Review and manage employee leave requests and approvals."
          iconSrc="/3d-icons/leave.png"
        />
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search requests..."
            searchKey="employeeName"
            rowActions={rowActions}
            filters={[
              { label: "Status", key: "status", options: statuses },
              { label: "Type", key: "type", options: leaveTypes },
            ]}
            emptyTitle="No leave requests"
            emptyDescription="There are no leave requests to display."
            emptyIllustration={emptyCalendarImg}
            headerActions={
              <Button size="sm" onClick={openCreateDialog} data-testid="button-page-action">
                <Plus className="mr-1.5 size-3.5" />
                New Request
              </Button>
            }
          />
        )}
        </PageTransition>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Leave Request" : "New Leave Request"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Submit Request"}
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Employee *</Label>
          <Select
            value={formState.employeeId}
            onValueChange={(v) => {
              const emp = employees.find((e) => e.id === v);
              if (emp) {
                setFormState((s) => ({
                  ...s,
                  employeeId: v,
                  employeeName: `${emp.firstName} ${emp.lastName}`,
                }));
              }
            }}
          >
            <SelectTrigger className="h-8 text-sm" data-testid="select-employee">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.filter((e) => e.status === "Active").map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Leave Type</Label>
          <Select value={formState.type} onValueChange={(v) => setFormState((s) => ({ ...s, type: v as LeaveRequest["type"] }))}>
            <SelectTrigger className="h-8 text-sm" data-testid="select-leave-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {leaveTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Start Date *</Label>
            <Input
              type="date"
              value={formState.startDate}
              onChange={(e) => setFormState((s) => ({ ...s, startDate: e.target.value }))}
              className="h-8 text-sm"
              data-testid="input-leave-start"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">End Date *</Label>
            <Input
              type="date"
              value={formState.endDate}
              onChange={(e) => setFormState((s) => ({ ...s, endDate: e.target.value }))}
              className="h-8 text-sm"
              data-testid="input-leave-end"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Number of Days</Label>
          <Input
            type="number"
            min={1}
            value={formState.days}
            onChange={(e) => setFormState((s) => ({ ...s, days: parseInt(e.target.value) || 1 }))}
            className="h-8 text-sm"
            data-testid="input-leave-days"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Reason *</Label>
          <Textarea
            value={formState.reason}
            onChange={(e) => setFormState((s) => ({ ...s, reason: e.target.value }))}
            placeholder="Reason for leave"
            className="min-h-[80px] text-sm resize-none"
            data-testid="input-leave-reason"
          />
        </div>
      </FormDialog>
    </div>
  );
}
