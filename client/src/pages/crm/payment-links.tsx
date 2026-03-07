import { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  CreditCard, 
  QrCode, 
  Building2, 
  ArrowRight,
  ChevronRight,
  Upload,
  ExternalLink,
  MoreHorizontal
} from "lucide-react";
import QRCode from "qrcode";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getPersonAvatar } from "@/lib/avatars";
import { CRM_COLOR } from "@/lib/crm-config";
import { PageShell } from "@/components/layout";

const MOCK_UPI_ID = "payments@supransbiz";

interface PaymentLink {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  description: string;
  methods: string[];
  status: "pending" | "paid" | "expired";
  createdAt: string;
  paidAt?: string;
  upiQr?: string;
}

const initialPaymentLinks: PaymentLink[] = [
  {
    id: "PL-1001",
    customerName: "Rajesh Kumar",
    customerEmail: "rajesh.k@gmail.com",
    customerPhone: "+91 98765 43210",
    amount: 15000,
    description: "Legal Consultation Fee",
    methods: ["UPI", "Bank Transfer"],
    status: "paid",
    createdAt: "2024-02-15T10:30:00Z",
    paidAt: "2024-02-16T14:20:00Z"
  },
  {
    id: "PL-1002",
    customerName: "Anita Sharma",
    customerEmail: "anita.s@outlook.com",
    customerPhone: "+91 91234 56789",
    amount: 45000,
    description: "Company Incorporation Advance",
    methods: ["UPI"],
    status: "pending",
    createdAt: "2024-02-28T09:15:00Z"
  },
  {
    id: "PL-1003",
    customerName: "Vikram Singh",
    customerEmail: "vikram.v@techstart.in",
    customerPhone: "+91 99887 76655",
    amount: 12500,
    description: "Document Verification Service",
    methods: ["Bank Transfer"],
    status: "expired",
    createdAt: "2024-02-01T11:00:00Z"
  },
  {
    id: "PL-1004",
    customerName: "Siddharth Malhotra",
    customerEmail: "sid.m@retailhub.com",
    customerPhone: "+91 98989 89898",
    amount: 85000,
    description: "E-commerce Setup Package",
    methods: ["UPI", "Bank Transfer"],
    status: "pending",
    createdAt: "2024-03-01T15:45:00Z"
  },
  {
    id: "PL-1005",
    customerName: "Meera Iyer",
    customerEmail: "meera.iyer@lifestyle.in",
    customerPhone: "+91 97654 32109",
    amount: 22000,
    description: "Brand Registration Fee",
    methods: ["UPI"],
    status: "paid",
    createdAt: "2024-02-20T12:00:00Z",
    paidAt: "2024-02-20T16:30:00Z"
  },
  {
    id: "PL-1006",
    customerName: "Arjun Reddy",
    customerEmail: "arjun.r@venture.com",
    customerPhone: "+91 95544 33221",
    amount: 150000,
    description: "Retainer Fee - Q1",
    methods: ["Bank Transfer"],
    status: "pending",
    createdAt: "2024-03-02T10:00:00Z"
  },
  {
    id: "PL-1007",
    customerName: "Priyanka Chopra",
    customerEmail: "priyanka.c@global.com",
    customerPhone: "+91 94433 22110",
    amount: 35000,
    description: "GST Filing Assistance",
    methods: ["UPI", "Bank Transfer"],
    status: "pending",
    createdAt: "2024-03-02T11:30:00Z"
  },
  {
    id: "PL-1008",
    customerName: "Karan Johar",
    customerEmail: "karan.j@productions.in",
    customerPhone: "+91 93322 11009",
    amount: 5000,
    description: "Agreement Drafting",
    methods: ["UPI"],
    status: "paid",
    createdAt: "2024-01-15T09:00:00Z",
    paidAt: "2024-01-15T11:45:00Z"
  }
];

export default function PaymentLinksPage() {
  const isLoading = useSimulatedLoading(800);
  const { toast } = useToast();
  const [links, setLinks] = useState<PaymentLink[]>(initialPaymentLinks);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMarkAsPaidOpen, setIsMarkAsPaidOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    amount: "",
    description: "",
    methods: ["UPI"] as string[]
  });

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          link.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || link.status === filter;
    return matchesSearch && matchesFilter;
  });

  const generateQRCode = async (amount: string, description: string) => {
    try {
      // upi://pay?pa=address&pn=name&am=amount&tn=transaction_note&cu=INR
      const upiUrl = `upi://pay?pa=${MOCK_UPI_ID}&pn=Suprans%20Biz&am=${amount}&tn=${encodeURIComponent(description)}&cu=INR`;
      const url = await QRCode.toDataURL(upiUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLink = () => {
    if (currentStep === 1) {
      if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
        toast({ title: "Error", description: "Please fill in all customer details", variant: "destructive" });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.amount || !formData.description || formData.methods.length === 0) {
        toast({ title: "Error", description: "Please fill in payment details", variant: "destructive" });
        return;
      }
      generateQRCode(formData.amount, formData.description);
      setCurrentStep(3);
    } else {
      const newLink: PaymentLink = {
        id: `PL-${1000 + links.length + 1}`,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        amount: parseFloat(formData.amount),
        description: formData.description,
        methods: formData.methods,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      setLinks([newLink, ...links]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Payment link created successfully" });
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      amount: "",
      description: "",
      methods: ["UPI"]
    });
    setCurrentStep(1);
    setQrCodeUrl("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Payment link copied to clipboard" });
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.download = `qr-${formData.customerName.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleMarkAsPaid = (linkId: string) => {
    setLinks(links.map(l => l.id === linkId ? { ...l, status: "paid", paidAt: new Date().toISOString() } : l));
    setIsMarkAsPaidOpen(false);
    toast({ title: "Payment Confirmed", description: "Payment has been marked as paid." });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 flex items-center gap-1"><CheckCircle2 className="size-3" /> Paid</Badge>;
      case "pending": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 flex items-center gap-1"><Clock className="size-3" /> Pending</Badge>;
      case "expired": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 flex items-center gap-1"><AlertCircle className="size-3" /> Expired</Badge>;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-4 bg-muted rounded w-64" />
          </div>
          <div className="h-10 bg-muted rounded w-32" />
        </div>
        <div className="h-10 bg-muted rounded w-full" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl w-full" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-heading">Payment Links</h1>
            <p className="text-muted-foreground">Generate and track payment links for your clients</p>
          </div>
          <Button 
            className="rounded-full h-10 px-6 gap-2"
            style={{ backgroundColor: CRM_COLOR }}
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="button-create-payment-link"
          >
            <Plus className="size-4" /> Create Payment Link
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              className="pl-10 h-10 rounded-xl"
              placeholder="Search by customer or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-payments"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-muted rounded-full w-full md:w-auto overflow-x-auto no-scrollbar">
            {["all", "pending", "paid", "expired"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize whitespace-nowrap ${
                  filter === s 
                    ? "text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={filter === s ? { backgroundColor: CRM_COLOR } : {}}
                data-testid={`pill-status-${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Fade>

      <Stagger className="space-y-3">
        {filteredLinks.map((link) => (
          <StaggerItem key={link.id}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-full flex items-center justify-center text-white font-bold text-sm`} style={{ backgroundColor: CRM_COLOR }}>
                    {link.customerName.charAt(0)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{link.customerName}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">{link.id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{link.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Amount</p>
                    <p className="font-bold text-sm">₹{link.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Created On</p>
                    <p className="text-sm">{new Date(link.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Status</p>
                    {getStatusBadge(link.status)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full h-8 px-3 gap-1 text-xs"
                    onClick={() => copyToClipboard(`https://pay.suprans.com/${link.id}`)}
                    data-testid={`button-copy-${link.id}`}
                  >
                    <Copy className="size-3" /> Copy Link
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {link.status === "pending" && (
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedLink(link);
                            setIsMarkAsPaidOpen(true);
                          }}
                          className="text-emerald-600 focus:text-emerald-600"
                        >
                          <CheckCircle2 className="size-4 mr-2" /> Mark as Paid
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <ExternalLink className="size-4 mr-2" /> View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}

        {filteredLinks.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="bg-muted size-12 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <CreditCard className="size-6" />
            </div>
            <p className="text-muted-foreground text-sm">No payment links found matching your search.</p>
          </div>
        )}
      </Stagger>

      {/* Create Payment Link Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Payment Link</DialogTitle>
            <DialogDescription>
              Step {currentStep} of 3: {currentStep === 1 ? "Customer Details" : currentStep === 2 ? "Payment Info" : "Preview & Share"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input 
                    id="customerName"
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input 
                    id="customerEmail"
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input 
                    id="customerPhone"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (INR)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                    <Input 
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description"
                    placeholder="e.g. Service charge for Feb"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-3 pt-2">
                  <Label>Payment Methods</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="method-upi" 
                        checked={formData.methods.includes("UPI")}
                        onCheckedChange={(checked) => {
                          if (checked) setFormData({...formData, methods: [...formData.methods, "UPI"]});
                          else setFormData({...formData, methods: formData.methods.filter(m => m !== "UPI")});
                        }}
                      />
                      <label htmlFor="method-upi" className="text-sm font-medium leading-none cursor-pointer">UPI</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="method-bank" 
                        checked={formData.methods.includes("Bank Transfer")}
                        onCheckedChange={(checked) => {
                          if (checked) setFormData({...formData, methods: [...formData.methods, "Bank Transfer"]});
                          else setFormData({...formData, methods: formData.methods.filter(m => m !== "Bank Transfer")});
                        }}
                      />
                      <label htmlFor="method-bank" className="text-sm font-medium leading-none cursor-pointer">Bank Transfer</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 flex flex-col items-center">
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Payment Request to</p>
                  <p className="text-lg font-bold">{formData.customerName}</p>
                  <p className="text-2xl font-bold text-emerald-600">₹{parseFloat(formData.amount).toLocaleString('en-IN')}</p>
                </div>

                <div className="w-full space-y-4">
                  <div className="p-4 bg-muted/50 rounded-xl border-dashed border-2 flex flex-col items-center gap-4">
                    <p className="text-xs font-semibold text-muted-foreground">Scan QR to Pay via UPI</p>
                    {qrCodeUrl && (
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <img src={qrCodeUrl} alt="UPI QR Code" className="size-40" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={downloadQR}>
                        <Download className="size-3 mr-1" /> Download
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => copyToClipboard(MOCK_UPI_ID)}>
                        <Copy className="size-3 mr-1" /> Copy VPA
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Building2 className="size-3" /> Bank Transfer Details
                    </p>
                    <div className="text-sm grid grid-cols-2 gap-y-1">
                      <span className="text-muted-foreground">Bank:</span>
                      <span className="font-medium">HDFC Bank</span>
                      <span className="text-muted-foreground">A/C Number:</span>
                      <span className="font-medium">XXXX XXXX 1234</span>
                      <span className="text-muted-foreground">IFSC Code:</span>
                      <span className="font-medium">HDFC0001234</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Generated Link</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        readOnly 
                        value={`https://pay.suprans.com/PL-${1000 + links.length + 1}`}
                        className="h-9 text-xs"
                      />
                      <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={() => copyToClipboard(`https://pay.suprans.com/PL-${1000 + links.length + 1}`)}>
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row items-center justify-between sm:justify-between">
            {currentStep > 1 ? (
              <Button variant="ghost" onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button 
              onClick={handleCreateLink}
              style={{ backgroundColor: CRM_COLOR }}
              className="px-6 rounded-full"
            >
              {currentStep < 3 ? "Continue" : "Finish & Save"}
              {currentStep < 3 && <ChevronRight className="size-4 ml-1" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark As Paid Dialog */}
      <Dialog open={isMarkAsPaidOpen} onOpenChange={setIsMarkAsPaidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Marking payment for {selectedLink?.customerName} as paid.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center gap-2">
              <p className="text-muted-foreground text-sm uppercase font-bold tracking-wider">Amount Received</p>
              <p className="text-4xl font-black">₹{selectedLink?.amount.toLocaleString('en-IN')}</p>
            </div>

            <div className="space-y-4">
              <Label>Payment Proof (Optional)</Label>
              <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-2 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click to upload screenshot</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or PDF up to 5MB</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsMarkAsPaidOpen(false)}>Cancel</Button>
            <Button 
              style={{ backgroundColor: CRM_COLOR }}
              onClick={() => selectedLink && handleMarkAsPaid(selectedLink.id)}
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
