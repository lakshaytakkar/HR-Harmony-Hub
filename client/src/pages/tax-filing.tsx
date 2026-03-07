import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  FileText, IndianRupee, Users, User, Mail, Phone, Building2,
  ExternalLink, Search, Plus, Globe, Hash, Calendar,
  CheckCircle2, Circle, BookOpen, Youtube, FileCheck,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/ui/animated";
import { PageShell, StatCard } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TaxFiling {
  id: string;
  client_id: string | null;
  llc_name: string | null;
  llc_type: string | null;
  amount_received: number;
  main_entity_name: string | null;
  contact_details: string | null;
  address: string | null;
  email_address: string | null;
  status: string;
  date_of_formation: string | null;
  notes: string | null;
  bank_transactions_count: number;
  filing_done: boolean;
  ein_number: string | null;
  reference_number: string | null;
  tax_standing: string | null;
  created_at: string;
}

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  "In progress": "warning",
  "Not Started": "neutral",
  "Completed": "success",
  "Filed": "success",
  "Pending": "info",
};

const IRS_RESOURCES = [
  { title: "Form 1120-S (S-Corp Tax Return)", url: "https://www.irs.gov/forms-pubs/about-form-1120-s", type: "form" },
  { title: "Form 1065 (Partnership Return)", url: "https://www.irs.gov/forms-pubs/about-form-1065", type: "form" },
  { title: "Form 5472 (Foreign-Owned LLC)", url: "https://www.irs.gov/forms-pubs/about-form-5472", type: "form" },
  { title: "Form 1120 (Corporation Tax Return)", url: "https://www.irs.gov/forms-pubs/about-form-1120", type: "form" },
  { title: "Form 8832 (Entity Classification)", url: "https://www.irs.gov/forms-pubs/about-form-8832", type: "form" },
  { title: "How to File LLC Taxes (Single Member)", url: "https://www.youtube.com/results?search_query=how+to+file+single+member+LLC+tax+return+IRS", type: "video" },
  { title: "Form 5472 Filing Guide for Foreign LLC", url: "https://www.youtube.com/results?search_query=form+5472+filing+guide+foreign+owned+LLC", type: "video" },
  { title: "Pro Forma 1120 for Disregarded Entities", url: "https://www.youtube.com/results?search_query=pro+forma+1120+disregarded+entity+filing", type: "video" },
  { title: "LetterStream - Mail to IRS", url: "https://www.letterstream.com/", type: "service" },
  { title: "IRS Where to File Addresses", url: "https://www.irs.gov/filing/where-to-file-paper-tax-returns-with-or-without-a-payment", type: "reference" },
  { title: "Wyoming Annual Report Filing", url: "https://wyobiz.wyo.gov/Business/FilingSearch.aspx", type: "reference" },
  { title: "IRS Tax Calendar", url: "https://www.irs.gov/pub/irs-pdf/p509.pdf", type: "reference" },
];

const CROSS_SELL_TEMPLATES = {
  whatsapp: `Hi {name}! 👋\n\nThis is a reminder about your annual USA tax filing requirement for {llc_name}.\n\nAs a US LLC owner, you need to file a tax return (Pro Forma 1120 + Form 5472) with the IRS every year.\n\n💰 Our Tax Filing Service:\n• Single Member LLC: ₹15,000 + GST\n• Multi Member LLC: ₹19,000 + GST\n\nWe handle everything - form preparation, filing with IRS via certified mail, and confirmation.\n\nWould you like us to handle this for you?`,
  email_subject: `USA Tax Filing Reminder - {llc_name}`,
  email_body: `Dear {name},\n\nI hope this message finds you well.\n\nAs the tax filing season approaches, I wanted to remind you about the annual tax filing requirement for your US LLC ({llc_name}).\n\nEven if your LLC had zero transactions, the IRS requires filing a Pro Forma 1120 along with Form 5472 for foreign-owned LLCs.\n\nOur Tax Filing Service:\n- Single Member LLC: ₹15,000 + GST (₹17,700 total)\n- Multi Member LLC: ₹19,000 + GST (₹22,420 total)\n\nWhat's included:\n✓ Complete form preparation (1120 + 5472)\n✓ Review and verification\n✓ Filing via certified mail to IRS\n✓ Confirmation and tracking\n✓ Copy of all filed documents\n\nPlease let me know if you'd like to proceed.\n\nBest regards,\nLegalNations Team`,
};

export default function TaxFilingPage() {
  const { toast } = useToast();
  const [selectedFiling, setSelectedFiling] = useState<TaxFiling | null>(null);

  const { data: filingsData, isLoading } = useQuery<{ filings: TaxFiling[]; total: number }>({
    queryKey: ["/api/legalnations/tax-filings"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await apiRequest("PATCH", `/api/legalnations/tax-filings/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legalnations/tax-filings"] });
      toast({ title: "Filing updated" });
    },
  });

  const filings = filingsData?.filings || [];
  const singleCount = filings.filter(f => f.llc_type === "Single Member").length;
  const multiCount = filings.filter(f => f.llc_type === "Multi Member").length;
  const totalRevenue = filings.reduce((sum, f) => sum + (f.amount_received || 0), 0);
  const completedCount = filings.filter(f => f.filing_done).length;

  const formatCurrency = (val: number) => val ? `₹${val.toLocaleString("en-IN")}` : "—";

  const columns: Column<TaxFiling>[] = [
    {
      key: "llc_name",
      header: "LLC Name",
      sortable: true,
      render: (item) => (
        <div>
          <span className="text-sm font-medium" data-testid={`text-llc-${item.id}`}>{item.llc_name || "—"}</span>
          {item.main_entity_name && (
            <span className="block text-xs text-muted-foreground">{item.main_entity_name}</span>
          )}
        </div>
      ),
    },
    {
      key: "llc_type",
      header: "Type",
      render: (item) => (
        <StatusBadge
          status={item.llc_type || "—"}
          variant={item.llc_type === "Multi Member" ? "info" : "neutral"}
        />
      ),
    },
    {
      key: "amount_received",
      header: "Amount",
      sortable: true,
      render: (item) => <span className="text-sm font-medium">{formatCurrency(item.amount_received)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge status={item.status} variant={statusVariant[item.status] || "neutral"} />
      ),
    },
    {
      key: "bank_transactions_count",
      header: "Bank Txns",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-center block">{item.bank_transactions_count}</span>
      ),
    },
    {
      key: "date_of_formation",
      header: "Formation Date",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.date_of_formation || "—"}</span>
      ),
    },
    {
      key: "filing_done",
      header: "Filed",
      render: (item) => item.filing_done ? (
        <CheckCircle2 className="size-4 text-green-600" />
      ) : (
        <Circle className="size-4 text-muted-foreground" />
      ),
    },
    {
      key: "notes",
      header: "Notes",
      render: (item) => (
        <span className="text-xs text-muted-foreground max-w-[200px] truncate block">{item.notes || "—"}</span>
      ),
    },
    {
      key: "_actions",
      header: "",
      render: (item) => (
        <div className="flex items-center gap-1">
          {item.contact_details && (
            <a href={`https://wa.me/${item.contact_details.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="icon" className="size-7 text-green-600">
                <SiWhatsapp className="size-3.5" />
              </Button>
            </a>
          )}
          {item.email_address && (
            <a href={`mailto:${item.email_address}`}>
              <Button variant="ghost" size="icon" className="size-7">
                <Mail className="size-3.5" />
              </Button>
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100">USA Tax Filing Service</h2>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Annual tax filing for US LLCs (Pro Forma 1120 + Form 5472)</p>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Single Member</div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100">₹15,000<span className="text-xs font-normal">+GST</span></div>
                    <div className="text-xs text-muted-foreground">(₹17,700)</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Multi Member</div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100">₹19,000<span className="text-xs font-normal">+GST</span></div>
                    <div className="text-xs text-muted-foreground">(₹22,420)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Filings" value={filings.length} icon={FileText} iconBg="#EFF6FF" iconColor="#2563EB" />
            <StatCard label="Single Member" value={singleCount} icon={User} iconBg="#F0FDF4" iconColor="#16A34A" />
            <StatCard label="Multi Member" value={multiCount} icon={Users} iconBg="#FFF7ED" iconColor="#EA580C" />
            <StatCard label="Revenue" value={formatCurrency(totalRevenue)} icon={IndianRupee} iconBg="#FAF5FF" iconColor="#9333EA" />
          </div>

          <Tabs defaultValue="filings" data-testid="tax-tabs">
            <TabsList>
              <TabsTrigger value="filings" data-testid="tab-filings">Active Filings</TabsTrigger>
              <TabsTrigger value="resources" data-testid="tab-resources">Resources & Forms</TabsTrigger>
              <TabsTrigger value="crosssell" data-testid="tab-crosssell">Cross-Sell Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="filings" className="mt-4">
              {isLoading ? (
                <TableSkeleton rows={8} columns={8} />
              ) : (
                <DataTable
                  data={filings}
                  columns={columns}
                  searchPlaceholder="Search by LLC name, entity name, or email..."
                  onRowClick={(item) => setSelectedFiling(item)}
                  filters={[
                    { label: "Type", key: "llc_type", options: ["Single Member", "Multi Member"] },
                    { label: "Status", key: "status", options: ["In progress", "Not Started", "Completed"] },
                  ]}
                />
              )}
            </TabsContent>

            <TabsContent value="resources" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCheck className="size-4 text-blue-600" /> IRS Forms & Filing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {IRS_RESOURCES.filter(r => r.type === "form").map((r) => (
                      <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted transition-colors">
                        <FileText className="size-4 text-red-500 shrink-0" />
                        <span className="text-sm flex-1">{r.title}</span>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </a>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Youtube className="size-4 text-red-600" /> Video Guides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {IRS_RESOURCES.filter(r => r.type === "video").map((r) => (
                      <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted transition-colors">
                        <Youtube className="size-4 text-red-500 shrink-0" />
                        <span className="text-sm flex-1">{r.title}</span>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </a>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="size-4 text-green-600" /> Services & References
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {IRS_RESOURCES.filter(r => r.type === "service" || r.type === "reference").map((r) => (
                      <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted transition-colors">
                        <BookOpen className="size-4 text-blue-500 shrink-0" />
                        <span className="text-sm flex-1">{r.title}</span>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </a>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Filing Procedure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2 text-sm">
                      {[
                        "Collect client documents (PAN/Aadhar, Bank Statements, EIN Letter)",
                        "Verify EIN number and LLC formation details",
                        "Prepare Pro Forma 1120 (Corporation Return)",
                        "Prepare Form 5472 (Foreign-Owned Disclosure)",
                        "Review all forms for accuracy",
                        "Print and prepare mailing package",
                        "Send via LetterStream certified mail to IRS",
                        "Track delivery and get fax confirmation",
                        "Store confirmation and update client records",
                        "Send filed copies to client",
                      ].map((step, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="size-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="crosssell" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <SiWhatsapp className="size-4 text-green-600" /> WhatsApp Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg font-sans">
                      {CROSS_SELL_TEMPLATES.whatsapp}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => { navigator.clipboard.writeText(CROSS_SELL_TEMPLATES.whatsapp); toast({ title: "Template copied" }); }}
                      data-testid="btn-copy-wa-template"
                    >
                      Copy Template
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="size-4 text-blue-600" /> Email Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground">Subject:</span>
                      <p className="text-sm font-medium">{CROSS_SELL_TEMPLATES.email_subject}</p>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg font-sans max-h-[400px] overflow-y-auto">
                      {CROSS_SELL_TEMPLATES.email_body}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => { navigator.clipboard.writeText(CROSS_SELL_TEMPLATES.email_body); toast({ title: "Template copied" }); }}
                      data-testid="btn-copy-email-template"
                    >
                      Copy Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </PageShell>
  );
}
