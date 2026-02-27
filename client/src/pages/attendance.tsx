import { useState } from "react";
import { PageBanner } from "@/components/hr/page-banner";
import { DataTable, type Column, type RowAction } from "@/components/hr/data-table";
import emptyAttendanceImg from "@/assets/illustrations/empty-attendance.png";
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
import { attendanceRecords as initialAttendance, employees } from "@/lib/mock-data";
import type { AttendanceRecord } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getPersonAvatar } from "@/lib/avatars";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { CheckCircle2, Clock, AlertCircle, CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

export default function Attendance() {
  const loading = useSimulatedLoading();
  const [data, setData] = useState<AttendanceRecord[]>(initialAttendance);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AttendanceRecord | null>(null);
  const [formState, setFormState] = useState({
    employeeId: "",
    employeeName: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "Present" as AttendanceRecord["status"],
    department: "",
    workHours: "",
  });
  const { toast, showSuccess, showError } = useToast();

  const present = data.filter((a) => a.status === "Present").length;
  const late = data.filter((a) => a.status === "Late").length;
  const absent = data.filter((a) => a.status === "Absent").length;
  const halfDay = data.filter((a) => a.status === "Half Day").length;

  const columns: Column<AttendanceRecord>[] = [
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <img src={getPersonAvatar(item.employeeName, 28)} alt={item.employeeName} className="size-7 shrink-0 rounded-full" />
          <div>
            <p className="text-sm font-medium">{item.employeeName}</p>
            <p className="text-xs text-muted-foreground">{item.department}</p>
          </div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (item) => <span className="text-sm">{item.date}</span>,
    },
    {
      key: "checkIn",
      header: "Check In",
      render: (item) => (
        <span className={`text-sm ${item.checkIn === "--:--" ? "text-muted-foreground" : ""}`}>
          {item.checkIn}
        </span>
      ),
    },
    {
      key: "checkOut",
      header: "Check Out",
      render: (item) => (
        <span className={`text-sm ${item.checkOut === "--:--" ? "text-muted-foreground" : ""}`}>
          {item.checkOut}
        </span>
      ),
    },
    {
      key: "workHours",
      header: "Work Hours",
      render: (item) => <span className="text-sm font-medium">{item.workHours}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  const rowActions: RowAction<AttendanceRecord>[] = [
    {
      label: "Edit",
      onClick: (item) => {
        setEditingItem(item);
        setFormState({
          employeeId: item.employeeId,
          employeeName: item.employeeName,
          date: item.date,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          status: item.status,
          department: item.department,
          workHours: item.workHours,
        });
        setDialogOpen(true);
      },
    },
    {
      label: "Delete",
      variant: "destructive",
      separator: true,
      onClick: (item) => {
        setData((prev) => prev.filter((a) => a.id !== item.id));
        showSuccess("Record Removed", "Attendance record has been removed.");
      },
    },
  ];

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormState({
      employeeId: "",
      employeeName: "",
      date: new Date().toISOString().split("T")[0],
      checkIn: "",
      checkOut: "",
      status: "Present",
      department: "",
      workHours: "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formState.employeeName || !formState.date) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (editingItem) {
      setData((prev) => prev.map((a) => a.id === editingItem.id ? { ...a, ...formState } : a));
      showSuccess("Record Updated", "Attendance record has been updated.");
    } else {
      const newRecord: AttendanceRecord = { id: String(Date.now()), ...formState };
      setData((prev) => [newRecord, ...prev]);
      showSuccess("Record Added", "Attendance record has been added.");
    }
    setDialogOpen(false);
  };

  const statuses: AttendanceRecord["status"][] = ["Present", "Absent", "Late", "Half Day"];
  const departments = [...new Set(data.map((a) => a.department))];

  return (
    <div className="px-8 py-6 lg:px-12">
        <PageTransition>
        <PageBanner
          title="Attendance Tracker"
          description="Monitor daily check-ins, work hours, and attendance patterns."
          iconSrc="/3d-icons/attendance.png"
        />
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
              title="Present"
              value={present}
              icon={<CheckCircle2 className="size-5" />}
              changeType="positive"
              change={`${Math.round((present / data.length) * 100)}% attendance`}
            />
            <StatsCard
              title="Late"
              value={late}
              icon={<Clock className="size-5" />}
              changeType="warning"
              change={`${Math.round((late / data.length) * 100)}% of total`}
            />
            <StatsCard
              title="Absent"
              value={absent}
              icon={<AlertCircle className="size-5" />}
              changeType="negative"
              change={`${Math.round((absent / data.length) * 100)}% of total`}
            />
            <StatsCard
              title="Half Day"
              value={halfDay}
              icon={<CalendarDays className="size-5" />}
              changeType="neutral"
              change={`${Math.round((halfDay / data.length) * 100)}% of total`}
            />
          </div>
        )}

        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search employees..."
            searchKey="employeeName"
            rowActions={rowActions}
            filters={[
              { label: "Status", key: "status", options: statuses },
              { label: "Department", key: "department", options: departments },
            ]}
            emptyTitle="No attendance records"
            emptyDescription="No attendance data available for this date."
            emptyIllustration={emptyAttendanceImg}
            headerActions={
              <Button size="sm" onClick={openCreateDialog} data-testid="button-page-action">
                <Plus className="mr-1.5 size-3.5" />
                Add Record
              </Button>
            }
          />
        )}
        </PageTransition>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Attendance" : "Add Attendance Record"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Add Record"}
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
                  department: emp.department,
                }));
              }
            }}
          >
            <SelectTrigger className="h-8 text-sm" data-testid="select-att-employee">
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
          <Label className="text-xs">Date *</Label>
          <Input
            type="date"
            value={formState.date}
            onChange={(e) => setFormState((s) => ({ ...s, date: e.target.value }))}
            className="h-8 text-sm"
            data-testid="input-att-date"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Check In</Label>
            <Input
              type="time"
              value={formState.checkIn}
              onChange={(e) => setFormState((s) => ({ ...s, checkIn: e.target.value }))}
              className="h-8 text-sm"
              data-testid="input-att-checkin"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Check Out</Label>
            <Input
              type="time"
              value={formState.checkOut}
              onChange={(e) => setFormState((s) => ({ ...s, checkOut: e.target.value }))}
              className="h-8 text-sm"
              data-testid="input-att-checkout"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={formState.status} onValueChange={(v) => setFormState((s) => ({ ...s, status: v as AttendanceRecord["status"] }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-att-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Work Hours</Label>
            <Input
              value={formState.workHours}
              onChange={(e) => setFormState((s) => ({ ...s, workHours: e.target.value }))}
              placeholder="e.g. 9h 0m"
              className="h-8 text-sm"
              data-testid="input-att-hours"
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
