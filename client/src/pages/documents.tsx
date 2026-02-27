import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column, type RowAction } from "@/components/hr/data-table";
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
import { documents as initialDocuments } from "@/lib/mock-data";
import type { HRDocument } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";

const fileTypeIcons: Record<string, string> = {
  PDF: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  DOCX: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  XLSX: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
};

export default function Documents() {
  const [data, setData] = useState<HRDocument[]>(initialDocuments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HRDocument | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    category: "Policy" as HRDocument["category"],
    uploadedBy: "",
    uploadDate: "",
    fileSize: "",
    fileType: "PDF",
    status: "Active" as HRDocument["status"],
  });
  const { toast } = useToast();

  const columns: Column<HRDocument>[] = [
    {
      key: "title",
      header: "Document",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${fileTypeIcons[item.fileType] || "bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400"}`}>
            <FileText className="size-3.5" />
          </div>
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.fileType} - {item.fileSize}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item) => <StatusBadge status={item.category} />,
    },
    {
      key: "uploadedBy",
      header: "Uploaded By",
      sortable: true,
      render: (item) => <span className="text-sm">{item.uploadedBy}</span>,
    },
    {
      key: "uploadDate",
      header: "Upload Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.uploadDate}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  const rowActions: RowAction<HRDocument>[] = [
    {
      label: "Download",
      onClick: (item) => {
        toast({ title: "Download Started", description: `Downloading ${item.title}` });
      },
    },
    {
      label: "Edit",
      onClick: (item) => {
        setEditingItem(item);
        setFormState({
          title: item.title,
          category: item.category,
          uploadedBy: item.uploadedBy,
          uploadDate: item.uploadDate,
          fileSize: item.fileSize,
          fileType: item.fileType,
          status: item.status,
        });
        setDialogOpen(true);
      },
    },
    {
      label: "Archive",
      onClick: (item) => {
        setData((prev) => prev.map((d) => d.id === item.id ? { ...d, status: "Archived" as const } : d));
        toast({ title: "Document Archived", description: `${item.title} has been archived.` });
      },
    },
    {
      label: "Delete",
      variant: "destructive",
      separator: true,
      onClick: (item) => {
        setData((prev) => prev.filter((d) => d.id !== item.id));
        toast({ title: "Document Removed", description: `${item.title} has been removed.` });
      },
    },
  ];

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormState({
      title: "",
      category: "Policy",
      uploadedBy: "Sneha Patel",
      uploadDate: new Date().toISOString().split("T")[0],
      fileSize: "",
      fileType: "PDF",
      status: "Active",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formState.title || !formState.category) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (editingItem) {
      setData((prev) => prev.map((d) => d.id === editingItem.id ? { ...d, ...formState } : d));
      toast({ title: "Document Updated", description: `${formState.title} has been updated.` });
    } else {
      const newDoc: HRDocument = { id: String(Date.now()), ...formState };
      setData((prev) => [newDoc, ...prev]);
      toast({ title: "Document Added", description: `${formState.title} has been added.` });
    }
    setDialogOpen(false);
  };

  const categories: HRDocument["category"][] = ["Policy", "Contract", "Certificate", "Report", "Other"];

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Documents" subtitle="HR document management" />
      <div className="flex-1 overflow-auto p-6">
        <PageHeader
          title="All Documents"
          description={`${data.length} documents`}
          actionLabel="Upload Document"
          onAction={openCreateDialog}
        />
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search documents..."
          searchKey="title"
          rowActions={rowActions}
          filters={[
            { label: "Category", key: "category", options: categories },
            { label: "Status", key: "status", options: ["Active", "Archived"] },
          ]}
          emptyTitle="No documents found"
          emptyDescription="Upload your first HR document."
        />
      </div>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Document" : "Upload Document"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Upload"}
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Document Title *</Label>
          <Input
            value={formState.title}
            onChange={(e) => setFormState((s) => ({ ...s, title: e.target.value }))}
            placeholder="e.g. Employee Handbook 2025"
            className="h-8 text-sm"
            data-testid="input-doc-title"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Category *</Label>
            <Select value={formState.category} onValueChange={(v) => setFormState((s) => ({ ...s, category: v as HRDocument["category"] }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-doc-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">File Type</Label>
            <Select value={formState.fileType} onValueChange={(v) => setFormState((s) => ({ ...s, fileType: v }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-doc-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="DOCX">DOCX</SelectItem>
                <SelectItem value="XLSX">XLSX</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">File Size</Label>
            <Input
              value={formState.fileSize}
              onChange={(e) => setFormState((s) => ({ ...s, fileSize: e.target.value }))}
              placeholder="e.g. 2.4 MB"
              className="h-8 text-sm"
              data-testid="input-doc-size"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={formState.status} onValueChange={(v) => setFormState((s) => ({ ...s, status: v as HRDocument["status"] }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-doc-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
