import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, ClipboardList, CheckCircle2, Clock, AlertTriangle, XCircle,
  FileText, BookOpen, PlayCircle, ExternalLink, Search,
} from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  PageShell, PageHeader, StatGrid, StatCard,
  DataTableContainer, DataTH, DataTD, DataTR, DetailModal,
} from "@/components/layout";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const BRAND_COLOR = "#1A6B45";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  drafting:     { label: "Drafting",      bg: "bg-slate-100",  text: "text-slate-700",  icon: Clock },
  applied:      { label: "Applied",       bg: "bg-blue-100",   text: "text-blue-700",   icon: ClipboardList },
  pending_docs: { label: "Pending Docs",  bg: "bg-amber-100",  text: "text-amber-700",  icon: AlertTriangle },
  approved:     { label: "Approved",      bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle2 },
  rejected:     { label: "Rejected",      bg: "bg-red-100",    text: "text-red-700",    icon: XCircle },
};

const STRATEGY_LABEL: Record<string, string> = {
  etsy: "Etsy", website: "Website", both: "Both",
};

interface SellerApplication {
  id: string;
  brand_name: string;
  category: string | null;
  email_id: string | null;
  status: string;
  marketplace_strategy: string | null;
  num_products_listed: number | null;
  application_date: string | null;
  created_at: string | null;
}

const SOP_STEPS = [
  {
    n: 1, title: "Decide Brand Identity",
    body: "Choose a brand name, product category, and write a compelling brand story. Create/procure a logo and banner image. These must be ready before starting the Faire registration.",
    warn: "Brand name must be unique and not conflict with existing Faire sellers."
  },
  {
    n: 2, title: "Set Up Brand Email",
    body: "Create a dedicated email for the brand — either a branded email (name@domain.com) or a free Gmail/Outlook. Branded email significantly increases approval chances.",
    warn: "Use a professional-looking email. Avoid random strings or numbers."
  },
  {
    n: 3, title: "Purchase Domain & Build Website OR Create Etsy Store",
    body: "Faire requires evidence of an established brand. You can either: (A) Purchase a domain, build a simple website and deploy it, OR (B) Create an Etsy store with your products listed. Both options work; using Etsy is faster but option A looks more professional.",
    warn: "Etsy store must have at least 10–15 active product listings before applying."
  },
  {
    n: 4, title: "Scrape & List Products",
    body: "Identify a reference store (competitor or brand you'll model after). Use the internal scraping process to extract ~15 products with images, titles, and descriptions. List them on Etsy via CSV upload, Shopify sync, or manual entry. Save the CSV file for records.",
    warn: "Product listings must match Faire's category and not violate any IP rights."
  },
  {
    n: 5, title: "Prepare Legal Documents",
    body: "Have the following ready to upload: (1) EIN (Employer Identification Number) — get from IRS.gov. (2) Articles of Organization — state-issued LLC formation document. These may be requested during review.",
    warn: "EIN must match the business name used in the Faire application."
  },
  {
    n: 6, title: "Submit Faire Application",
    body: "Go to the Faire brand registration page (link in Quick Links). Fill in all brand details, upload logo, write brand story, set MOQ and pricing. Submit and record the application date.",
    warn: "Do not leave any required fields blank. Incomplete applications are auto-rejected."
  },
  {
    n: 7, title: "Follow Up & Monitor",
    body: "Faire typically responds within 1–4 weeks. Log all communication in the Follow-up Timeline. If Faire requests additional documents (common for new brands), upload and respond promptly. Change status to 'Pending Docs' when this happens.",
    warn: "Responding to doc requests within 48 hours significantly improves approval rates."
  },
  {
    n: 8, title: "Approval / Rejection",
    body: "If approved: Use 'Promote to Store' to move this application to the Stores section and connect credentials. If rejected: Document the reason, address issues, and reapply after 90 days. Update status accordingly.",
  },
];

export default function FaireApplications() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ applications: SellerApplication[] }>({
    queryKey: ["/api/faire/applications"],
    queryFn: async () => {
      const res = await fetch("/api/faire/applications", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const apps = data?.applications ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [sopOpen, setSopOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const [fBrandName, setFBrandName] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [fBrandStory, setFBrandStory] = useState("");
  const [fEmailId, setFEmailId] = useState("");
  const [fEmailType, setFEmailType] = useState("basic");
  const [fStrategy, setFStrategy] = useState("website");
  const [fDomain, setFDomain] = useState("");
  const [fWebsite, setFWebsite] = useState("");
  const [fEtsy, setFEtsy] = useState("");
  const [fNotes, setFNotes] = useState("");

  function openAdd() {
    setFBrandName(""); setFCategory(""); setFBrandStory(""); setFEmailId("");
    setFEmailType("basic"); setFStrategy("website"); setFDomain("");
    setFWebsite(""); setFEtsy(""); setFNotes("");
    setFormOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!fBrandName.trim()) throw new Error("Brand name is required");
      return apiRequest("POST", "/api/faire/applications", {
        brand_name: fBrandName.trim(),
        category: fCategory.trim() || null,
        brand_story: fBrandStory.trim() || null,
        email_id: fEmailId.trim() || null,
        email_type: fEmailType,
        marketplace_strategy: fStrategy,
        domain_name: fDomain.trim() || null,
        website_url: fWebsite.trim() || null,
        etsy_store_url: fEtsy.trim() || null,
        notes: fNotes.trim() || null,
        status: "drafting",
      });
    },
    onSuccess: async (res: Response) => {
      const json = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/faire/applications"] });
      setFormOpen(false);
      toast({ title: "Application created" });
      setLocation(`/faire/applications/${json.application.id}`);
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const filtered = apps.filter(a => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const s = search.toLowerCase();
    const matchSearch = !s || a.brand_name.toLowerCase().includes(s) || (a.email_id ?? "").toLowerCase().includes(s) || (a.category ?? "").toLowerCase().includes(s);
    return matchStatus && matchSearch;
  });

  const counts = {
    total: apps.length,
    drafting: apps.filter(a => a.status === "drafting").length,
    applied: apps.filter(a => a.status === "applied").length,
    pending_docs: apps.filter(a => a.status === "pending_docs").length,
    approved: apps.filter(a => a.status === "approved").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };

  return (
    <PageShell>
      <PageHeader
        title="Seller Applications"
        subtitle="Manage Faire wholesale seller account applications from start to approval"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSopOpen(true)} data-testid="btn-open-sop">
              <BookOpen size={14} className="mr-1.5" /> SOP
            </Button>
            <Button variant="outline" size="sm" onClick={() => setVideoOpen(true)} data-testid="btn-open-video">
              <PlayCircle size={14} className="mr-1.5" /> Tutorial
            </Button>
            <Button onClick={openAdd} style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" data-testid="btn-new-application">
              <Plus size={15} className="mr-1.5" /> New Application
            </Button>
          </div>
        }
      />

      <Fade>
        <StatGrid cols={3}>
          <StatCard label="Total Applications" value={String(counts.total)} icon={ClipboardList} iconBg="#F0FDF4" iconColor={BRAND_COLOR} />
          <StatCard label="Drafting" value={String(counts.drafting)} icon={Clock} iconBg="#F8FAFC" iconColor="#64748B" />
          <StatCard label="Applied" value={String(counts.applied)} icon={ClipboardList} iconBg="#EFF6FF" iconColor="#2563EB" />
        </StatGrid>
        <StatGrid cols={3}>
          <StatCard label="Pending Docs" value={String(counts.pending_docs)} icon={AlertTriangle} iconBg="#FFFBEB" iconColor="#D97706" />
          <StatCard label="Approved" value={String(counts.approved)} icon={CheckCircle2} iconBg="#F0FDF4" iconColor="#16A34A" />
          <StatCard label="Rejected" value={String(counts.rejected)} icon={XCircle} iconBg="#FEF2F2" iconColor="#DC2626" />
        </StatGrid>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by brand name, email, category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
              data-testid="input-search-applications"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9" data-testid="select-status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="drafting">Drafting</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="pending_docs">Pending Docs</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTableContainer>
          {isLoading && <div className="h-48 animate-pulse bg-muted/30 rounded" />}
          {!isLoading && filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {apps.length === 0
                ? "No applications yet. Click 'New Application' to start tracking your first Faire seller account."
                : "No applications match your filters."}
            </div>
          )}
          {!isLoading && filtered.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <DataTH>Brand Name</DataTH>
                  <DataTH>Category</DataTH>
                  <DataTH>Status</DataTH>
                  <DataTH>Email</DataTH>
                  <DataTH>Strategy</DataTH>
                  <DataTH>Products</DataTH>
                  <DataTH>Applied Date</DataTH>
                  <DataTH>Created</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(a => {
                  const sc = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.drafting;
                  const Icon = sc.icon;
                  return (
                    <DataTR key={a.id} onClick={() => setLocation(`/faire/applications/${a.id}`)} data-testid={`row-application-${a.id}`}>
                      <DataTD>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: BRAND_COLOR }}>
                            {a.brand_name.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium">{a.brand_name}</p>
                        </div>
                      </DataTD>
                      <DataTD className="text-muted-foreground">{a.category ?? "—"}</DataTD>
                      <DataTD>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <Icon size={11} /> {sc.label}
                        </span>
                      </DataTD>
                      <DataTD className="text-muted-foreground text-xs">{a.email_id ?? "—"}</DataTD>
                      <DataTD>
                        <span className="text-xs text-muted-foreground">{STRATEGY_LABEL[a.marketplace_strategy ?? "website"] ?? "—"}</span>
                      </DataTD>
                      <DataTD className="text-muted-foreground text-xs">{a.num_products_listed ?? 0}</DataTD>
                      <DataTD className="text-muted-foreground text-xs">
                        {a.application_date ? new Date(a.application_date).toLocaleDateString() : "—"}
                      </DataTD>
                      <DataTD className="text-muted-foreground text-xs">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}
                      </DataTD>
                    </DataTR>
                  );
                })}
              </tbody>
            </table>
          )}
        </DataTableContainer>
      </Fade>

      {/* New Application Modal */}
      <DetailModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Seller Application"
        subtitle="Start tracking a new Faire wholesale seller account application"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} style={{ background: BRAND_COLOR }} className="text-white" disabled={createMutation.isPending} data-testid="btn-create-application">
              {createMutation.isPending ? "Creating…" : "Create Application"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Brand Name *</Label>
              <Input value={fBrandName} onChange={e => setFBrandName(e.target.value)} placeholder="e.g. Buddha Candles" data-testid="input-brand-name" />
            </div>
            <div>
              <Label>Product Category</Label>
              <Input value={fCategory} onChange={e => setFCategory(e.target.value)} placeholder="e.g. Home & Living" data-testid="input-category" />
            </div>
            <div>
              <Label>Email ID</Label>
              <Input value={fEmailId} onChange={e => setFEmailId(e.target.value)} placeholder="brand@domain.com" data-testid="input-email-id" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email Type</Label>
              <Select value={fEmailType} onValueChange={setFEmailType}>
                <SelectTrigger data-testid="select-email-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="branded">Branded (name@domain.com)</SelectItem>
                  <SelectItem value="basic">Basic (Gmail / Outlook)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Marketplace Strategy</Label>
              <Select value={fStrategy} onValueChange={setFStrategy}>
                <SelectTrigger data-testid="select-strategy"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website Only</SelectItem>
                  <SelectItem value="etsy">Etsy Store</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Domain Name</Label>
              <Input value={fDomain} onChange={e => setFDomain(e.target.value)} placeholder="buddhacandles.com" data-testid="input-domain" />
            </div>
            <div>
              <Label>Website URL</Label>
              <Input value={fWebsite} onChange={e => setFWebsite(e.target.value)} placeholder="https://buddhacandles.com" data-testid="input-website-url" />
            </div>
          </div>
          {(fStrategy === "etsy" || fStrategy === "both") && (
            <div>
              <Label>Etsy Store URL</Label>
              <Input value={fEtsy} onChange={e => setFEtsy(e.target.value)} placeholder="https://www.etsy.com/shop/buddhacandles" data-testid="input-etsy-url" />
            </div>
          )}
          <div>
            <Label>Brand Story</Label>
            <Textarea value={fBrandStory} onChange={e => setFBrandStory(e.target.value)} placeholder="Describe the brand's story, mission, and what makes it unique…" rows={3} data-testid="input-brand-story" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Any additional notes about this application…" rows={2} data-testid="input-notes" />
          </div>
        </div>
      </DetailModal>

      {/* SOP Modal */}
      <Dialog open={sopOpen} onOpenChange={setSopOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen size={18} style={{ color: BRAND_COLOR }} /> Faire Seller Account Application — SOP
            </DialogTitle>
            <DialogDescription>
              Standard Operating Procedure for getting a new Faire wholesale seller account approved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {SOP_STEPS.map(step => (
              <div key={step.n} className="flex gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={{ background: BRAND_COLOR }}>
                  {step.n}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                  {step.warn && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {step.warn}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="border-t pt-3 flex items-center gap-2">
              <a
                href="https://www.faire.com/brand-portal/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                style={{ color: BRAND_COLOR }}
              >
                <ExternalLink size={13} /> Open Faire Registration Page
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Tutorial Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle size={18} style={{ color: BRAND_COLOR }} /> Faire Seller Account — Video Tutorial
            </DialogTitle>
            <DialogDescription>
              Step-by-step walkthrough of the entire application process.
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center mt-2">
            <div className="text-center text-muted-foreground">
              <PlayCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Tutorial video coming soon</p>
              <p className="text-xs mt-1">Upload a Loom or YouTube link to embed here.</p>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm" onClick={() => setVideoOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
