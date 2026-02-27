import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/hr/status-badge";
import { ChevronLeft, ChevronRight, Download, FileText, FileSpreadsheet, File, Award, X } from "lucide-react";
import type { HRDocument } from "@shared/schema";
import { documentPreviews, type DocumentPreview } from "@/lib/mock-data";

const fileTypeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  DOCX: File,
  XLSX: FileSpreadsheet,
};

const fileTypeColors: Record<string, string> = {
  PDF: "text-red-500",
  DOCX: "text-blue-500",
  XLSX: "text-emerald-500",
};

interface DocumentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: HRDocument | null;
  documents: HRDocument[];
  onNavigate: (doc: HRDocument) => void;
}

function PolicyPreview({ preview }: { preview: DocumentPreview }) {
  return (
    <div className="flex flex-col gap-5">
      {preview.sections?.map((section, idx) => (
        <div key={idx} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{section.heading}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
        </div>
      ))}
    </div>
  );
}

function ContractPreview({ preview }: { preview: DocumentPreview }) {
  return (
    <div className="flex flex-col gap-5">
      {preview.sections?.map((section, idx) => (
        <div key={idx} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{section.heading}</h3>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {section.content.split(/(\[.*?\])/).map((part, i) =>
              part.startsWith("[") && part.endsWith("]") ? (
                <span key={i} className="inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary mx-0.5">
                  {part}
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SpreadsheetPreview({ preview }: { preview: DocumentPreview }) {
  if (!preview.tableData) return null;
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            {preview.tableData.headers.map((header, idx) => (
              <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preview.tableData.rows.map((row, rIdx) => (
            <tr key={rIdx} className="border-b last:border-b-0">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CertificatePreview({ preview }: { preview: DocumentPreview }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <Award className="size-16 text-primary" />
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-lg font-semibold">{preview.certificateTitle}</h3>
        <p className="text-sm text-muted-foreground">This is to certify that</p>
        <p className="text-base font-medium text-primary">{preview.certificateRecipient}</p>
        <p className="max-w-md text-sm text-muted-foreground leading-relaxed">{preview.certificateBody}</p>
      </div>
      <div className="flex flex-col items-center gap-1 pt-4 border-t w-48">
        <p className="text-xs text-muted-foreground">{preview.certificateDate}</p>
        <p className="text-xs font-medium">{preview.certificateIssuer}</p>
      </div>
    </div>
  );
}

function PreviewContent({ document }: { document: HRDocument }) {
  const preview = documentPreviews[document.id];

  if (!preview) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <FileText className="size-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No preview available for this document.</p>
      </div>
    );
  }

  switch (preview.type) {
    case "policy":
      return <PolicyPreview preview={preview} />;
    case "contract":
      return <ContractPreview preview={preview} />;
    case "spreadsheet":
      return <SpreadsheetPreview preview={preview} />;
    case "certificate":
      return <CertificatePreview preview={preview} />;
    default:
      return <PolicyPreview preview={preview} />;
  }
}

export function DocumentPreviewModal({
  open,
  onOpenChange,
  document,
  documents,
  onNavigate,
}: DocumentPreviewModalProps) {
  if (!document) return null;

  const currentIndex = documents.findIndex((d) => d.id === document.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < documents.length - 1;

  const handlePrev = () => {
    if (hasPrev) onNavigate(documents[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onNavigate(documents[currentIndex + 1]);
  };

  const IconComponent = fileTypeIcons[document.fileType] || FileText;
  const iconColor = fileTypeColors[document.fileType] || "text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0" data-testid="document-preview-modal">
        <DialogHeader className="flex flex-row flex-wrap items-center gap-3 border-b px-6 py-4">
          <IconComponent className={`size-5 shrink-0 ${iconColor}`} />
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base truncate" data-testid="text-preview-title">
              {document.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {document.fileType} &middot; {document.fileSize} &middot; Uploaded by {document.uploadedBy}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={document.category} />
            <StatusBadge status={document.status} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 py-4" data-testid="preview-content">
          <PreviewContent document={document} />
        </div>

        <DialogFooter className="flex flex-row flex-wrap items-center justify-between gap-3 border-t px-6 py-3">
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="outline"
              disabled={!hasPrev}
              onClick={handlePrev}
              data-testid="button-preview-prev"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2" data-testid="text-preview-position">
              {currentIndex + 1} of {documents.length}
            </span>
            <Button
              size="icon"
              variant="outline"
              disabled={!hasNext}
              onClick={handleNext}
              data-testid="button-preview-next"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button variant="default" size="sm" data-testid="button-preview-download">
            <Download className="size-3.5 mr-1.5" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
