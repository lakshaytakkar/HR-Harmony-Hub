import { useState, useMemo, useCallback } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface RowAction<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  separator?: boolean;
  confirmMessage?: string;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: string;
  rowActions?: RowAction<T>[];
  onRowClick?: (item: T) => void;
  filters?: { label: string; key: string; options: string[] }[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIllustration?: string;
  headerActions?: React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchKey,
  rowActions,
  onRowClick,
  filters,
  pageSize = 10,
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display.",
  emptyIllustration,
  headerActions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search && searchKey) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((item) => {
        const val = (item as Record<string, unknown>)[searchKey];
        if (typeof val === "string") return val.toLowerCase().includes(lowerSearch);
        return false;
      });
    } else if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((item) =>
        Object.values(item as Record<string, unknown>).some(
          (val) => typeof val === "string" && val.toLowerCase().includes(lowerSearch)
        )
      );
    }

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => (item as Record<string, unknown>)[key] === value);
      }
    });

    if (sortKey) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey];
        const bVal = (b as Record<string, unknown>)[sortKey];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    return result;
  }, [data, search, searchKey, sortKey, sortDir, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const allSelected = paginatedData.length > 0 && paginatedData.every((item) => selectedIds.has(item.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((item) => item.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleAction = useCallback((action: RowAction<T>, item: T) => {
    if (action.variant === "destructive") {
      const itemName = (item as Record<string, unknown>)["name"] || (item as Record<string, unknown>)["title"] || "";
      setConfirmDialog({
        open: true,
        title: action.confirmMessage ? action.label : `${action.label} Record`,
        description: action.confirmMessage || `Are you sure you want to ${action.label.toLowerCase()}${itemName ? ` "${itemName}"` : " this record"}? This action cannot be undone.`,
        onConfirm: () => {
          action.onClick(item);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    } else {
      action.onClick(item);
    }
  }, []);

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredData.length);

  return (
    <div className="flex flex-col rounded-lg border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8 w-60 pl-8 text-xs"
            data-testid="input-table-search"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {headerActions}
          {filters?.map((filter) => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || "all"}
              onValueChange={(val) => {
                setActiveFilters((prev) => ({ ...prev, [filter.key]: val }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger
                className="h-8 w-auto min-w-[120px] text-xs"
                data-testid={`filter-${filter.key}`}
              >
                <Filter className="mr-1.5 size-3 text-muted-foreground" />
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="data-table">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="w-10 px-3 py-2.5">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  data-testid="checkbox-select-all"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-3 py-2.5 text-left text-xs font-medium text-muted-foreground",
                    col.width
                  )}
                >
                  {col.sortable ? (
                    <button
                      className="inline-flex items-center gap-1"
                      onClick={() => handleSort(col.key)}
                      data-testid={`sort-${col.key}`}
                    >
                      {col.header}
                      <ArrowUpDown className="size-3" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {rowActions && rowActions.length > 0 && (
                <th className="w-10 px-3 py-2.5" />
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActions ? 2 : 1)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-4" data-testid="empty-state">
                    {emptyIllustration && (
                      <img
                        src={emptyIllustration}
                        alt=""
                        className="size-28 object-contain"
                        draggable={false}
                      />
                    )}
                    <div className="flex flex-col items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
                      <p className="max-w-xs text-xs text-muted-foreground">{emptyDescription}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b last:border-b-0 transition-colors",
                    selectedIds.has(item.id) && "bg-primary/5",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                  data-testid={`row-${item.id}`}
                >
                  <td className="w-10 px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleOne(item.id)}
                      aria-label={`Select row ${item.id}`}
                      data-testid={`checkbox-row-${item.id}`}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-3 py-3", col.width)}>
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                  {rowActions && rowActions.length > 0 && (
                    <td className="w-10 px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            data-testid={`button-row-actions-${item.id}`}
                          >
                            <MoreHorizontal className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          {rowActions.map((action, idx) => (
                            <div key={action.label}>
                              {action.separator && idx > 0 && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                onClick={() => handleAction(action, item)}
                                className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
                                data-testid={`action-${action.label.toLowerCase().replace(/\s+/g, "-")}-${item.id}`}
                              >
                                {action.label}
                              </DropdownMenuItem>
                            </div>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
          <p className="text-xs text-muted-foreground" data-testid="text-pagination-info">
            Showing {startIndex} - {endIndex} of {filteredData.length} results
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              data-testid="button-page-prev"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  size="icon"
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  className="size-7 text-xs"
                  onClick={() => setCurrentPage(pageNum)}
                  data-testid={`button-page-${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              data-testid="button-page-next"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent data-testid="confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-confirm-title">{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-confirm-description">{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-confirm-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog.onConfirm}
              className={cn(buttonVariants({ variant: "destructive" }))}
              data-testid="button-confirm-action"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
