import { useState, useMemo } from "react";
import { PageBanner } from "@/components/hr/page-banner";
import { DataTable, type Column, type RowAction } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatsCard } from "@/components/hr/stats-card";
import { StatusBadge } from "@/components/hr/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { payrollRuns, payrollEntries as initialEntries } from "@/lib/mock-data";
import type { PayrollEntry, PayrollRun } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { DollarSign, TrendingDown, Users, Download, Play, Wallet, CreditCard } from "lucide-react";

export default function Payroll() {
  const loading = useSimulatedLoading();
  const { showSuccess } = useToast();
  const [selectedRunId, setSelectedRunId] = useState<string>(payrollRuns[0].id);
  const [entries, setEntries] = useState<PayrollEntry[]>(initialEntries);
  const [runPayrollOpen, setRunPayrollOpen] = useState(false);

  const selectedRun = payrollRuns.find((r) => r.id === selectedRunId) || payrollRuns[0];

  const currentEntries = useMemo(
    () => entries.filter((e) => e.payrollRunId === selectedRunId),
    [entries, selectedRunId]
  );

  const totalPayroll = currentEntries.reduce((sum, e) => sum + e.baseSalary + e.bonus, 0);
  const totalNet = currentEntries.reduce((sum, e) => sum + e.netPay, 0);
  const totalDeductions = currentEntries.reduce((sum, e) => sum + e.deductions, 0);
  const employeesPaid = currentEntries.filter((e) => e.status === "Paid").length;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat("en-IN").format(amount);
  };

  const formatTableCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const columns: Column<PayrollEntry>[] = [
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <img
            src={getPersonAvatar(item.employeeName, 28)}
            alt={item.employeeName}
            className="size-7 shrink-0 rounded-full"
          />
          <div>
            <p className="text-sm font-medium">{item.employeeName}</p>
            <p className="text-xs text-muted-foreground">{item.employeeId}</p>
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
      key: "baseSalary",
      header: "Base Salary",
      sortable: true,
      render: (item) => <span className="text-sm">{formatTableCurrency(item.baseSalary)}</span>,
    },
    {
      key: "bonus",
      header: "Bonus",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-emerald-600 dark:text-emerald-400">
          {item.bonus > 0 ? `+${formatTableCurrency(item.bonus)}` : "-"}
        </span>
      ),
    },
    {
      key: "deductions",
      header: "Deductions",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-red-600 dark:text-red-400">
          -{formatTableCurrency(item.deductions)}
        </span>
      ),
    },
    {
      key: "netPay",
      header: "Net Pay",
      sortable: true,
      render: (item) => <span className="text-sm font-medium">{formatTableCurrency(item.netPay)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  const rowActions: RowAction<PayrollEntry>[] = [
    {
      label: "View Payslip",
      onClick: (item) => {
        showSuccess("Payslip", `Viewing payslip for ${item.employeeName}`);
      },
    },
    {
      label: "Retry Payment",
      onClick: (item) => {
        setEntries((prev) =>
          prev.map((e) => (e.id === item.id ? { ...e, status: "Paid" as const } : e))
        );
        showSuccess("Payment Retried", `Payment for ${item.employeeName} has been retried.`);
      },
    },
  ];

  const departments = [...new Set(currentEntries.map((e) => e.department))];
  const statuses: PayrollEntry["status"][] = ["Paid", "Pending", "Failed"];

  const handleRunPayroll = () => {
    setRunPayrollOpen(false);
    showSuccess("Payroll Initiated", `Payroll for ${selectedRun.period} has been submitted for processing.`);
  };

  const handleExport = () => {
    showSuccess("Export Started", "Payroll data is being exported to CSV.");
  };

  return (
    <div className="px-8 py-6 lg:px-12">
        <PageTransition>
          <PageBanner
            title="Payroll Management"
            description="Process salaries, review compensation, and manage employee payments."
            iconSrc="/3d-icons/employees.webp"
          />

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StaggerItem>
              <StatsCard
                title="Total Payroll"
                value={`\u20B9${formatCurrency(totalPayroll)}`}
                change={selectedRun.status === "Completed" ? "Processed" : selectedRun.status}
                changeType={selectedRun.status === "Completed" ? "positive" : "neutral"}
                icon={<Wallet className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Net Pay"
                value={`\u20B9${formatCurrency(totalNet)}`}
                change="After deductions"
                changeType="neutral"
                icon={<CreditCard className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Deductions"
                value={`\u20B9${formatCurrency(totalDeductions)}`}
                change={`${((totalDeductions / (totalPayroll || 1)) * 100).toFixed(1)}% of gross`}
                changeType="negative"
                icon={<TrendingDown className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Employees Paid"
                value={`${employeesPaid}/${currentEntries.length}`}
                change={employeesPaid === currentEntries.length ? "All cleared" : "In progress"}
                changeType={employeesPaid === currentEntries.length ? "positive" : "neutral"}
                icon={<Users className="size-5" />}
              />
            </StaggerItem>
          </Stagger>

          <Fade delay={0.15}>
            {loading ? (
              <TableSkeleton rows={8} columns={7} />
            ) : (
              <DataTable
                data={currentEntries}
                columns={columns}
                searchPlaceholder="Search employees..."
                rowActions={rowActions}
                filters={[
                  { label: "Department", key: "department", options: departments },
                  { label: "Status", key: "status", options: statuses },
                ]}
                emptyTitle="No payroll entries"
                emptyDescription="No payroll entries found for this period."
                headerActions={
                  <>
                    <Select value={selectedRunId} onValueChange={setSelectedRunId}>
                      <SelectTrigger className="h-8 w-auto min-w-[180px] text-xs" data-testid="select-payroll-run">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {payrollRuns.map((run) => (
                          <SelectItem key={run.id} value={run.id}>
                            {run.period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-payroll">
                      <Download className="mr-1.5 size-3.5" />
                      Export
                    </Button>
                    <Button size="sm" onClick={() => setRunPayrollOpen(true)} data-testid="button-run-payroll">
                      <Play className="mr-1.5 size-3.5" />
                      Run Payroll
                    </Button>
                  </>
                }
              />
            )}
          </Fade>
        </PageTransition>

      <AlertDialog open={runPayrollOpen} onOpenChange={setRunPayrollOpen}>
        <AlertDialogContent data-testid="dialog-run-payroll">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-run-payroll-title">Run Payroll</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-run-payroll-description">
              You are about to process payroll for <strong>{selectedRun.period}</strong> covering{" "}
              <strong>{currentEntries.length} employees</strong>. This will initiate salary disbursement
              to all eligible employees. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-run-payroll-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRunPayroll} data-testid="button-run-payroll-confirm">
              Confirm & Process
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
