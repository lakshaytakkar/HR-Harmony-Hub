import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "success" | "error" | "warning" | "neutral" | "info";

const variantMap: Record<string, StatusVariant> = {
  Active: "success",
  Inactive: "error",
  "On Leave": "warning",
  Present: "success",
  Absent: "error",
  Late: "warning",
  "Half Day": "info",
  Approved: "success",
  Rejected: "error",
  Pending: "warning",
  Open: "success",
  Closed: "error",
  Draft: "neutral",
  Applied: "info",
  Screening: "warning",
  Interview: "info",
  Offer: "success",
  Hired: "success",
  "Full-time": "neutral",
  "Part-time": "info",
  Contract: "warning",
  Internship: "neutral",
  Policy: "info",
  Certificate: "success",
  Report: "warning",
  Other: "neutral",
  Archived: "neutral",
};

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  error: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant || variantMap[status] || "neutral";
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-0 text-[11px] font-medium px-2 py-0.5",
        variantStyles[resolvedVariant],
        className
      )}
      data-testid={`badge-status-${status.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {status}
    </Badge>
  );
}
