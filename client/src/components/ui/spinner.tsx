import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeMap = {
  xs: "size-3",
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-12",
} as const;

interface SpinnerProps {
  size?: keyof typeof sizeMap;
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeMap[size], className)}
      data-testid="spinner"
    />
  );
}

interface PageSpinnerProps {
  label?: string;
  size?: keyof typeof sizeMap;
}

export function PageSpinner({ label, size = "lg" }: PageSpinnerProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-3 p-8"
      data-testid="page-spinner"
    >
      <Spinner size={size} />
      {label && (
        <p className="text-sm text-muted-foreground" data-testid="text-spinner-label">
          {label}
        </p>
      )}
    </div>
  );
}

interface InlineSpinnerProps {
  size?: keyof typeof sizeMap;
  className?: string;
}

export function InlineSpinner({ size = "xs", className }: InlineSpinnerProps) {
  return (
    <Spinner
      size={size}
      className={cn("inline-block", className)}
    />
  );
}
