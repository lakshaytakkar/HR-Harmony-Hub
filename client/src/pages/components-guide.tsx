import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/hr/status-badge";
import { getPersonAvatar, getThingAvatar } from "@/lib/avatars";
import logoImg from "@/assets/logo.png";
import {
  Plus,
  Download,
  Trash2,
  Edit,
  ArrowRight,
  User,
  Mail,
  Phone,
  MousePointer2,
  Hand,
  Move,
  Crosshair,
  Type,
  ZoomIn,
  GripHorizontal,
} from "lucide-react";

function SectionTitle({ children }: { children: string }) {
  return <p className="text-lg font-semibold text-[#0D0D12] mb-4">{children}</p>;
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-[#666D80]">{title}</p>
      {children}
    </div>
  );
}

function ButtonsTab() {
  const variants = [
    { label: "Primary", variant: "default" as const },
    { label: "Secondary", variant: "secondary" as const },
    { label: "Outline", variant: "outline" as const },
    { label: "Ghost", variant: "ghost" as const },
    { label: "Destructive", variant: "destructive" as const },
  ];

  const sizes = [
    { label: "Large", size: "lg" as const },
    { label: "Default", size: "default" as const },
    { label: "Small", size: "sm" as const },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Button Variants</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="grid grid-cols-5 gap-4 mb-3">
            {["Default", "Hover", "Focused", "Disabled", ""].map((h, i) => (
              <p key={i} className="text-xs font-medium text-[#666D80] text-center">{h}</p>
            ))}
          </div>
          <div className="flex flex-col gap-6">
            {variants.map((v) => (
              <div key={v.label}>
                <p className="text-xs font-medium text-[#36394A] mb-3">{v.label}</p>
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="flex justify-center">
                    <Button variant={v.variant} data-testid={`btn-${v.label.toLowerCase()}-default`}>
                      <Plus className="size-4 mr-1.5" /> Button
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button variant={v.variant} data-testid={`btn-${v.label.toLowerCase()}-hover`}>
                      <Plus className="size-4 mr-1.5" /> Hover
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button variant={v.variant} className="ring-2 ring-primary/30 ring-offset-2" data-testid={`btn-${v.label.toLowerCase()}-focused`}>
                      <Plus className="size-4 mr-1.5" /> Focused
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button variant={v.variant} disabled data-testid={`btn-${v.label.toLowerCase()}-disabled`}>
                      <Plus className="size-4 mr-1.5" /> Disabled
                    </Button>
                  </div>
                  <div />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Button Sizes</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="flex items-end gap-6">
            {sizes.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-3">
                <Button size={s.size} data-testid={`btn-size-${s.label.toLowerCase()}`}>
                  <Plus className="size-4 mr-1.5" /> {s.label}
                </Button>
                <p className="text-xs text-[#666D80]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Icon-Only Buttons</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="flex items-center gap-4">
            {[
              { icon: Plus, label: "Add" },
              { icon: Edit, label: "Edit" },
              { icon: Trash2, label: "Delete" },
              { icon: Download, label: "Download" },
              { icon: ArrowRight, label: "Next" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <Button variant="outline" size="icon" data-testid={`btn-icon-${item.label.toLowerCase()}`}>
                  <item.icon className="size-4" />
                </Button>
                <span className="text-[10px] text-[#666D80]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormsTab() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Text Input</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="grid grid-cols-3 gap-8">
            <SubSection title="Default">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="you@example.com" className="pl-9" data-testid="input-form-default" />
                </div>
              </div>
            </SubSection>
            <SubSection title="Filled">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value="john@example.com" readOnly className="pl-9" data-testid="input-form-filled" />
                </div>
              </div>
            </SubSection>
            <SubSection title="Disabled">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input placeholder="you@example.com" disabled className="pl-9" data-testid="input-form-disabled" />
                </div>
              </div>
            </SubSection>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-8">
            <SubSection title="Error">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-destructive" />
                  <Input
                    placeholder="you@example.com"
                    className="pl-9 border-destructive focus-visible:ring-destructive"
                    data-testid="input-form-error"
                  />
                </div>
                <p className="text-xs text-destructive">Please enter a valid email address.</p>
              </div>
            </SubSection>
            <SubSection title="With Icon (Phone)">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="+91 98765 43210" className="pl-9" data-testid="input-form-phone" />
                </div>
              </div>
            </SubSection>
            <SubSection title="With Icon (User)">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Enter full name" className="pl-9" data-testid="input-form-user" />
                </div>
              </div>
            </SubSection>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Dropdown / Select</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="grid grid-cols-3 gap-8">
            <SubSection title="Default">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select data-testid="select-form-default">
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SubSection>
            <SubSection title="Filled">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select defaultValue="engineering">
                  <SelectTrigger data-testid="select-form-filled">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SubSection>
            <SubSection title="Disabled">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Department</Label>
                <Select disabled>
                  <SelectTrigger data-testid="select-form-disabled">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SubSection>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Checkbox, Radio & Toggle</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="grid grid-cols-3 gap-8">
            <SubSection title="Checkbox">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="cb1" data-testid="checkbox-default" />
                  <Label htmlFor="cb1" className="text-sm">Unchecked</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="cb2" defaultChecked data-testid="checkbox-checked" />
                  <Label htmlFor="cb2" className="text-sm">Checked</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="cb3" disabled data-testid="checkbox-disabled" />
                  <Label htmlFor="cb3" className="text-sm text-muted-foreground">Disabled</Label>
                </div>
              </div>
            </SubSection>
            <SubSection title="Toggle / Switch">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Switch id="sw1" data-testid="switch-off" />
                  <Label htmlFor="sw1" className="text-sm">Off</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="sw2" defaultChecked data-testid="switch-on" />
                  <Label htmlFor="sw2" className="text-sm">On</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="sw3" disabled data-testid="switch-disabled" />
                  <Label htmlFor="sw3" className="text-sm text-muted-foreground">Disabled</Label>
                </div>
              </div>
            </SubSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentsTab() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Table Cell Types</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-[#F8FAFB]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#666D80]">Avatar with Text</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#666D80]">Title + Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#666D80]">Badge</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#666D80]">Button</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#666D80]">Plain Text</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b" data-testid="table-cell-row-primary">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">RP</div>
                      <div>
                        <p className="text-sm font-medium text-[#0D0D12]">Rahul Patel</p>
                        <p className="text-xs text-[#666D80]">Engineering</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#0D0D12]">Senior Developer</p>
                    <p className="text-xs text-[#666D80]">Full Stack</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status="Active" /></td>
                  <td className="px-4 py-3"><Button variant="outline" size="sm" data-testid="btn-view-primary">View</Button></td>
                  <td className="px-4 py-3 text-[#36394A]">₹12,50,000</td>
                </tr>
                <tr className="border-b" data-testid="table-cell-row-default">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">AS</div>
                      <div>
                        <p className="text-sm font-medium text-[#0D0D12]">Anita Sharma</p>
                        <p className="text-xs text-[#666D80]">Design</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#0D0D12]">Lead Designer</p>
                    <p className="text-xs text-[#666D80]">UI/UX</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status="On Leave" /></td>
                  <td className="px-4 py-3"><Button variant="outline" size="sm" data-testid="btn-view-default">View</Button></td>
                  <td className="px-4 py-3 text-[#36394A]">₹10,80,000</td>
                </tr>
                <tr data-testid="table-cell-row-inactive">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-red-50 text-xs font-semibold text-red-700">VK</div>
                      <div>
                        <p className="text-sm font-medium text-[#0D0D12]">Vikram Kumar</p>
                        <p className="text-xs text-[#666D80]">Marketing</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#0D0D12]">Marketing Head</p>
                    <p className="text-xs text-[#666D80]">Digital</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status="Inactive" /></td>
                  <td className="px-4 py-3"><Button variant="outline" size="sm" data-testid="btn-view-inactive">View</Button></td>
                  <td className="px-4 py-3 text-[#36394A]">₹11,20,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Table Header Styles</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-[#F8FAFB]" data-testid="table-header-example">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#666D80]">
                    <div className="flex items-center gap-1.5">
                      <Checkbox className="size-4" data-testid="checkbox-header" />
                      <span>Name</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#666D80]">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#666D80]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#666D80]">Role</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#666D80]">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-sm text-[#36394A]">
                  <td className="px-4 py-3" colSpan={5}>
                    <span className="text-xs text-muted-foreground">Table rows go here...</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogosCursorsTab() {
  const cursors = [
    { name: "Default", css: "cursor-default", icon: MousePointer2 },
    { name: "Pointer", css: "cursor-pointer", icon: Hand },
    { name: "Move", css: "cursor-move", icon: Move },
    { name: "Crosshair", css: "cursor-crosshair", icon: Crosshair },
    { name: "Text", css: "cursor-text", icon: Type },
    { name: "Zoom In", css: "cursor-zoom-in", icon: ZoomIn },
    { name: "Grab", css: "cursor-grab", icon: GripHorizontal },
    { name: "Not Allowed", css: "cursor-not-allowed", icon: null },
    { name: "Col Resize", css: "cursor-col-resize", icon: null },
    { name: "Row Resize", css: "cursor-row-resize", icon: null },
    { name: "EW Resize", css: "cursor-ew-resize", icon: null },
    { name: "NS Resize", css: "cursor-ns-resize", icon: null },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Brand Logo</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-[0px_1px_2px_rgba(13,13,18,0.06)]" data-testid="logo-primary">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="TeamSync" className="size-10 object-contain" />
                <span className="text-xl font-semibold tracking-tight">TeamSync</span>
              </div>
              <p className="text-xs text-[#666D80]">Primary Logo</p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-xl bg-[#0D0D12] p-8 shadow-[0px_1px_2px_rgba(13,13,18,0.06)]" data-testid="logo-dark">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="TeamSync" className="size-10 object-contain" />
                <span className="text-xl font-semibold tracking-tight text-white">TeamSync</span>
              </div>
              <p className="text-xs text-[#818898]">Dark Background</p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-[0px_1px_2px_rgba(13,13,18,0.06)]" data-testid="logo-icon">
              <img src={logoImg} alt="TeamSync" className="size-12 object-contain" />
              <p className="text-xs text-[#666D80]">Icon Only</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Cursors</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="grid grid-cols-4 gap-4">
            {cursors.map((c) => (
              <div
                key={c.name}
                className={`flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-6 border border-border/60 ${c.css}`}
                data-testid={`cursor-${c.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {c.icon ? (
                  <c.icon className="size-6 text-[#36394A]" />
                ) : (
                  <div className="flex size-6 items-center justify-center text-lg text-[#36394A]">
                    ↔
                  </div>
                )}
                <p className="text-xs font-medium text-[#36394A]">{c.name}</p>
                <p className="text-[10px] text-[#818898]">{c.css}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgesTab() {
  const badgeColors = [
    {
      label: "Neutral",
      fill: { bg: "#ECEFF3", text: "#0D0D12", border: "#C1C7D0" },
      statuses: ["Draft", "Archived", "Contract"],
    },
    {
      label: "Primary",
      fill: { bg: "#F0EBFE", text: "#412294", border: "#D3C4FC" },
      statuses: ["Interview", "Screening", "Notice Period"],
    },
    {
      label: "Green",
      fill: { bg: "#E2F7E7", text: "#0C5C27", border: "#A8E6B8" },
      statuses: ["Active", "Present", "Approved"],
    },
    {
      label: "Yellow",
      fill: { bg: "#FEF3CD", text: "#7A5600", border: "#FADA7A" },
      statuses: ["Pending", "On Leave", "Half Day"],
    },
    {
      label: "Red",
      fill: { bg: "#FDE1E1", text: "#A30D05", border: "#F5A3A3" },
      statuses: ["Inactive", "Absent", "Rejected"],
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Badge Variants by Color</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="flex flex-col gap-8">
            {badgeColors.map((group) => (
              <div key={group.label} data-testid={`badge-group-${group.label.toLowerCase()}`}>
                <p className="text-sm font-medium text-[#36394A] mb-4">{group.label}</p>
                <div className="flex flex-wrap items-center gap-3">
                  {group.statuses.map((status) => (
                    <StatusBadge key={status} status={status} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Badge Sizes</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="flex flex-col gap-6">
            <SubSection title="Large (default)">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: "#ECEFF3", color: "#0D0D12" }}>
                  Large
                </span>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: "#F0EBFE", color: "#412294" }}>
                  Large
                </span>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: "#E2F7E7", color: "#0C5C27" }}>
                  Large
                </span>
              </div>
            </SubSection>
            <SubSection title="Medium">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "#ECEFF3", color: "#0D0D12" }}>
                  Medium
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "#F0EBFE", color: "#412294" }}>
                  Medium
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "#E2F7E7", color: "#0C5C27" }}>
                  Medium
                </span>
              </div>
            </SubSection>
            <SubSection title="Small">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight" style={{ backgroundColor: "#ECEFF3", color: "#0D0D12" }}>
                  Small
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight" style={{ backgroundColor: "#F0EBFE", color: "#412294" }}>
                  Small
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight" style={{ backgroundColor: "#E2F7E7", color: "#0C5C27" }}>
                  Small
                </span>
              </div>
            </SubSection>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Badge Styles</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="grid grid-cols-2 gap-8">
            <SubSection title="Fill">
              <div className="flex items-center gap-3">
                {badgeColors.map((g) => (
                  <span key={g.label} className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: g.fill.bg, color: g.fill.text }}>
                    {g.label}
                  </span>
                ))}
              </div>
            </SubSection>
            <SubSection title="Outlined">
              <div className="flex items-center gap-3">
                {badgeColors.map((g) => (
                  <span key={g.label} className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium" style={{ borderColor: g.fill.border, color: g.fill.text, backgroundColor: "transparent" }}>
                    {g.label}
                  </span>
                ))}
              </div>
            </SubSection>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Badge Types</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="grid grid-cols-3 gap-8">
            <SubSection title="Default">
              <div className="flex items-center gap-3">
                <StatusBadge status="Active" />
                <StatusBadge status="Pending" />
                <StatusBadge status="Rejected" />
              </div>
            </SubSection>
            <SubSection title="With Dot">
              <div className="flex items-center gap-3">
                {[
                  { label: "Online", dotColor: "#22C55E" },
                  { label: "Away", dotColor: "#EAB308" },
                  { label: "Offline", dotColor: "#94A3B8" },
                ].map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full bg-[#ECEFF3] px-3 py-1 text-sm font-medium text-[#0D0D12]">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: item.dotColor }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </SubSection>
            <SubSection title="With Close Icon">
              <div className="flex items-center gap-3">
                {["Engineering", "Design", "Marketing"].map((label) => (
                  <span key={label} className="inline-flex items-center gap-1 rounded-full bg-[#F0EBFE] px-3 py-1 text-sm font-medium text-[#412294]">
                    {label}
                    <button className="ml-0.5 rounded-full p-0.5 hover:bg-[#412294]/10">
                      <svg className="size-3" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            </SubSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvatarTab() {
  const sizes = [
    { label: "3XL", size: 72, text: "text-2xl" },
    { label: "2XL", size: 64, text: "text-xl" },
    { label: "XL", size: 56, text: "text-lg" },
    { label: "LG", size: 48, text: "text-base" },
    { label: "MD", size: 40, text: "text-sm" },
    { label: "SM", size: 32, text: "text-xs" },
    { label: "XS", size: 24, text: "text-[10px]" },
  ];

  const statusIndicators = [
    { label: "Online", color: "#22C55E" },
    { label: "Offline", color: "#94A3B8" },
    { label: "Busy", color: "#EF4444" },
    { label: "Away", color: "#EAB308" },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Avatar Sizes</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="flex items-end gap-6">
            {sizes.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-3" data-testid={`avatar-size-${s.label.toLowerCase()}`}>
                <img
                  src={getPersonAvatar("Rahul Patel", s.size)}
                  alt="RP"
                  className="rounded-full"
                  style={{ width: s.size, height: s.size }}
                />
                <p className="text-xs text-[#666D80]">{s.label} ({s.size}px)</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Avatar Types</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="grid grid-cols-3 gap-8">
            <SubSection title="Micah (People)">
              <div className="flex items-center gap-4">
                {["Rahul Patel", "Ananya Sharma", "Vikram Kumar", "Priya Mehta"].map((name) => (
                  <img key={name} src={getPersonAvatar(name, 40)} alt={name} className="size-10 rounded-full" />
                ))}
              </div>
            </SubSection>
            <SubSection title="Glass (Things)">
              <div className="flex items-center gap-4">
                {["Engineering", "Marketing", "Finance"].map((name) => (
                  <img key={name} src={getThingAvatar(name, 40)} alt={name} className="size-10 rounded-lg" />
                ))}
              </div>
            </SubSection>
            <SubSection title="With Status">
              <div className="flex items-center gap-4">
                {statusIndicators.map((si, i) => (
                  <div key={si.label} className="relative" data-testid={`avatar-status-${si.label.toLowerCase()}`}>
                    <img src={getPersonAvatar(["Rahul Patel", "Ananya Sharma", "Vikram Kumar", "Priya Mehta"][i], 40)} alt={si.label} className="size-10 rounded-full" />
                    <span
                      className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white"
                      style={{ backgroundColor: si.color }}
                    />
                  </div>
                ))}
              </div>
            </SubSection>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Avatar Group (Stacked)</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FB] p-8">
          <div className="flex flex-col gap-6">
            <SubSection title="Overlapping Stack">
              <div className="flex -space-x-2">
                {["Rahul Patel", "Ananya Sharma", "Vikram Kumar", "Priya Mehta", "Neha Kapoor"].map((name, i) => (
                  <img
                    key={name}
                    src={getPersonAvatar(name, 36)}
                    alt={name}
                    className="size-9 rounded-full border-2 border-white"
                    style={{ zIndex: 5 - i }}
                  />
                ))}
                <div className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-[#ECEFF3] text-[10px] font-medium text-[#666D80]">
                  +3
                </div>
              </div>
            </SubSection>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComponentsGuide() {
  return (
    <div className="flex h-full flex-col" data-testid="page-components-guide">
      <Topbar title="Components" />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6">
          <PageHeader
            title="Components"
            description="TeamSync UI component library — buttons, forms, badges, avatars, and more."
          />
          <div className="mt-6">
            <Tabs defaultValue="buttons" data-testid="tabs-components">
              <TabsList data-testid="tabs-list-components">
                <TabsTrigger value="buttons" data-testid="tab-buttons">Buttons</TabsTrigger>
                <TabsTrigger value="forms" data-testid="tab-forms">Forms</TabsTrigger>
                <TabsTrigger value="components" data-testid="tab-components">Components</TabsTrigger>
                <TabsTrigger value="logos" data-testid="tab-logos">Logos & Cursors</TabsTrigger>
                <TabsTrigger value="badges" data-testid="tab-badges">Badges</TabsTrigger>
                <TabsTrigger value="avatar" data-testid="tab-avatar">Avatar</TabsTrigger>
              </TabsList>
              <div className="mt-8">
                <TabsContent value="buttons"><ButtonsTab /></TabsContent>
                <TabsContent value="forms"><FormsTab /></TabsContent>
                <TabsContent value="components"><ComponentsTab /></TabsContent>
                <TabsContent value="logos"><LogosCursorsTab /></TabsContent>
                <TabsContent value="badges"><BadgesTab /></TabsContent>
                <TabsContent value="avatar"><AvatarTab /></TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
