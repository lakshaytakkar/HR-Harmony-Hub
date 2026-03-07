import {
  LayoutDashboard,
  Users,
  UserPlus,
  Briefcase,
  CalendarDays,
  Clock,
  FileText,
  DollarSign,
  FolderKanban,
  TrendingUp,
  Phone,
  CheckSquare,
  CalendarCheck,
  MapPin,
  Ticket,
  Settings,
  Shield,
  BarChart3,
  Package,
  Store,
  Headphones,
  LineChart,
  GitBranch,
  Code2,
  Palette,
  MessageSquare,
  BookOpen,
  Wrench,
  ShoppingBag,
  Calculator,
  Truck,
  FileSpreadsheet,
  MessageCircle,
  UserRound,
  FolderOpen,
  ListChecks,
  Building2,
  UserCheck,
  Award,
  ClipboardList,
  Star,
  Target,
  ShieldCheck,
  FileImage,
  AlertTriangle,
  Landmark,
  Receipt,
  CreditCard,
  BookMarked,
  Tag,
  RotateCcw,
  Blocks,
  Kanban,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { LegalNationsLogo } from "@/components/brand/legalnations-logo";
import { UsdropAiLogo } from "@/components/brand/usdrop-ai-logo";
import { GoyoToursLogo } from "@/components/brand/goyotours-logo";
import { LbmLifestyleLogo } from "@/components/brand/lbm-lifestyle-logo";
import { DeveloperLogo } from "@/components/brand/developer-logo";
import { EazyToSellLogo } from "@/components/brand/eazytosell-logo";
import { EventHubLogo } from "@/components/brand/eventhub-logo";
import { HrmsLogo } from "@/components/brand/hrms-logo";
import { AtsLogo } from "@/components/brand/ats-logo";
import { CrmLogo } from "@/components/brand/crm-logo";
import { FinanceLogo } from "@/components/brand/finance-logo";
import { OmsLogo } from "@/components/brand/oms-logo";
import { SocialLogo } from "@/components/brand/social-logo";
import { FaireLogo } from "@/components/brand/faire-logo";
import { SupransLogo } from "@/components/brand/suprans-logo";
import { VendorPortalLogo } from "@/components/brand/vendor-portal-logo";

export interface NavItem {
  title: string;
  url: string;
}

export interface NavCategory {
  title: string;
  defaultUrl: string;
  icon: LucideIcon;
  items: NavItem[];
}

export interface Vertical {
  id: string;
  name: string;
  shortName: string;
  icon: LucideIcon;
  logo: ComponentType<{ size?: number; className?: string }>;
  color: string;
  tagline: string;
  description: string;
  navCategories: NavCategory[];
  isDepartment?: boolean;
  isPortal?: boolean;
}

export const verticals: Vertical[] = [
  {
    id: "suprans",
    name: "Suprans Business Services",
    shortName: "Suprans",
    icon: Target,
    logo: SupransLogo,
    color: "#3730A3",
    tagline: "Lead Source & Identity",
    description: "Primary lead intake, enrichment, and routing hub for all business verticals",
    isDepartment: false,
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/suprans",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/suprans/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/suprans/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/suprans/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/suprans/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/suprans/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Leads Inbox",
        defaultUrl: "/suprans/inbound",
        icon: UserPlus,
        items: [
          { title: "Inbound", url: "/suprans/inbound" },
          { title: "Enrichment", url: "/suprans/enrichment" },
          { title: "Assignments", url: "/suprans/assignments" },
        ],
      },
      {
        title: "Reports",
        defaultUrl: "/suprans/reports",
        icon: BarChart3,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/suprans/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/suprans/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/suprans/user-management" },
          { title: "User Groups", url: "/suprans/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/suprans/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "hr",
    name: "LegalNations",
    shortName: "LegalNations",
    icon: Users,
    logo: LegalNationsLogo,
    color: "#225AEA",
    tagline: "B2B SaaS",
    description: "US company formation & compliance operations",
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/legalnations",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/legalnations/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/legalnations/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/legalnations/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/legalnations/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/legalnations/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Clients",
        defaultUrl: "/legalnations/clients",
        icon: Briefcase,
        items: [
          { title: "All Clients", url: "/legalnations/clients" },
          { title: "Client Intake", url: "/legalnations/intake" },
          { title: "Stage Overview", url: "/legalnations/stages" },
        ],
      },
      {
        title: "Operations",
        defaultUrl: "/legalnations/pipeline",
        icon: GitBranch,
        items: [
          { title: "Formation Pipeline", url: "/legalnations/pipeline" },
          { title: "Task Board", url: "/legalnations/task-board" },
          { title: "Escalations", url: "/legalnations/escalations" },
        ],
      },
      {
        title: "Documents",
        defaultUrl: "/legalnations/documents",
        icon: FileText,
        items: [
          { title: "Document Vault", url: "/legalnations/documents" },
          { title: "Templates", url: "/legalnations/templates" },
        ],
      },
      {
        title: "Compliance",
        defaultUrl: "/legalnations/compliance",
        icon: Shield,
        items: [
          { title: "Compliance Tracker", url: "/legalnations/compliance" },
          { title: "Annual Reports", url: "/legalnations/annual-reports" },
        ],
      },
      {
        title: "Analytics",
        defaultUrl: "/legalnations/analytics",
        icon: BarChart3,
        items: [
          { title: "Formation Analytics", url: "/legalnations/analytics" },
        ],
      },
      {
        title: "Reports",
        defaultUrl: "/legalnations/reports",
        icon: FileText,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/legalnations/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/legalnations/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/legalnations/user-management" },
          { title: "User Groups", url: "/legalnations/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/legalnations/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "sales",
    name: "USDrop AI",
    shortName: "USDrop AI",
    icon: TrendingUp,
    logo: UsdropAiLogo,
    color: "#F34147",
    tagline: "D2C Dropshipping",
    description: "AI-powered dropshipping & sales automation",
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/usdrop",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Pipeline",
        defaultUrl: "/usdrop/leads",
        icon: Kanban,
        items: [],
      },
      {
        title: "Clients",
        defaultUrl: "/usdrop/clients",
        icon: Users,
        items: [
          { title: "All Clients", url: "/usdrop/clients" },
          { title: "LLC Tracker", url: "/usdrop/llc" },
        ],
      },
      {
        title: "Users & Subscriptions",
        defaultUrl: "/usdrop/users",
        icon: UserCheck,
        items: [
          { title: "All Users", url: "/usdrop/users" },
          { title: "Leads", url: "/usdrop/leads" },
          { title: "Plans", url: "/usdrop/plans" },
          { title: "Subscriptions", url: "/usdrop/subscriptions" },
        ],
      },
      {
        title: "Products & Catalog",
        defaultUrl: "/usdrop/products",
        icon: Package,
        items: [
          { title: "Products", url: "/usdrop/products" },
          { title: "Categories", url: "/usdrop/categories" },
          { title: "Suppliers", url: "/usdrop/suppliers" },
          { title: "Winning Products", url: "/usdrop/winning-products" },
        ],
      },
      {
        title: "Content Management",
        defaultUrl: "/usdrop/courses",
        icon: GraduationCap,
        items: [
          { title: "Courses", url: "/usdrop/courses" },
          { title: "Free Learning", url: "/usdrop/content/free-learning" },
          { title: "Mentorship Sessions", url: "/usdrop/content/sessions" },
        ],
      },
      {
        title: "Operations",
        defaultUrl: "/usdrop/stores",
        icon: Store,
        items: [
          { title: "Shopify Stores", url: "/usdrop/stores" },
          { title: "Fulfillment", url: "/usdrop/fulfillment" },
          { title: "Competitor Stores", url: "/usdrop/competitors" },
        ],
      },
      {
        title: "Support",
        defaultUrl: "/usdrop/tickets",
        icon: Headphones,
        items: [
          { title: "Tickets", url: "/usdrop/tickets" },
          { title: "Help Center", url: "/usdrop/help-center" },
        ],
      },
      {
        title: "Analytics",
        defaultUrl: "/usdrop/revenue",
        icon: LineChart,
        items: [
          { title: "Revenue Analytics", url: "/usdrop/revenue" },
          { title: "User Analytics", url: "/usdrop/user-analytics" },
          { title: "Product Performance", url: "/usdrop/product-performance" },
        ],
      },
      {
        title: "Chat",
        defaultUrl: "/usdrop/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/usdrop/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/usdrop/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/usdrop/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Reports",
        defaultUrl: "/usdrop/reports",
        icon: FileText,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/usdrop/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/usdrop/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/usdrop/user-management" },
          { title: "User Groups", url: "/usdrop/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/usdrop/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "events",
    name: "GoyoTours",
    shortName: "GoyoTours",
    icon: Ticket,
    logo: GoyoToursLogo,
    color: "#E91E63",
    tagline: "China B2B Travel",
    description: "Tour packages, lead management & China travel operations",
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/goyotours",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/goyotours/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/goyotours/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/goyotours/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/goyotours/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/goyotours/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Tour Packages",
        defaultUrl: "/goyotours/packages",
        icon: Package,
        items: [
          { title: "All Packages", url: "/goyotours/packages" },
        ],
      },
      {
        title: "Leads & Pipeline",
        defaultUrl: "/goyotours/leads",
        icon: UserPlus,
        items: [],
      },
      {
        title: "Bookings",
        defaultUrl: "/goyotours/bookings",
        icon: ClipboardList,
        items: [
          { title: "All Bookings", url: "/goyotours/bookings" },
          { title: "Calendar", url: "/goyotours/calendar" },
        ],
      },
      {
        title: "Hotels",
        defaultUrl: "/goyotours/hotels",
        icon: Building2,
        items: [],
      },
      {
        title: "Vendors",
        defaultUrl: "/goyotours/vendors",
        icon: Wrench,
        items: [],
      },
      {
        title: "Reports",
        defaultUrl: "/goyotours/reports",
        icon: FileText,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/goyotours/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Analytics",
        defaultUrl: "/goyotours/analytics",
        icon: BarChart3,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/goyotours/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/goyotours/user-management" },
          { title: "User Groups", url: "/goyotours/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/goyotours/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "eventhub",
    name: "Event Management",
    shortName: "Events",
    icon: CalendarCheck,
    logo: EventHubLogo,
    color: "#7C3AED",
    tagline: "Events & Networking",
    description: "Networking events, venue management & attendee engagement",
    isDepartment: true,
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/eventhub",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/eventhub/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/eventhub/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/eventhub/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/eventhub/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/eventhub/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Events",
        defaultUrl: "/eventhub/events",
        icon: CalendarDays,
        items: [
          { title: "All Events", url: "/eventhub/events" },
        ],
      },
      {
        title: "Attendees",
        defaultUrl: "/eventhub/attendees",
        icon: Users,
        items: [
          { title: "All Attendees", url: "/eventhub/attendees" },
          { title: "Live Check-in", url: "/eventhub/checkin" },
        ],
      },
      {
        title: "Venues",
        defaultUrl: "/eventhub/venues",
        icon: MapPin,
        items: [],
      },
      {
        title: "Vendors",
        defaultUrl: "/eventhub/vendors",
        icon: Briefcase,
        items: [],
      },
      {
        title: "Sales",
        defaultUrl: "/eventhub/leads",
        icon: UserPlus,
        items: [
          { title: "Inquiries", url: "/eventhub/leads" },
        ],
      },
      {
        title: "Operations",
        defaultUrl: "/eventhub/budget",
        icon: BarChart3,
        items: [
          { title: "Budget Tracker", url: "/eventhub/budget" },
          { title: "Analytics", url: "/eventhub/analytics" },
        ],
      },
      {
        title: "Reports",
        defaultUrl: "/eventhub/reports",
        icon: FileText,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/eventhub/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/eventhub/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/eventhub/user-management" },
          { title: "User Groups", url: "/eventhub/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/eventhub/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "admin",
    name: "LBM Lifestyle",
    shortName: "LBM Lifestyle",
    icon: Shield,
    logo: LbmLifestyleLogo,
    color: "#673AB7",
    tagline: "B2B Ecommerce",
    description: "Lifestyle brand wholesale & trade platform",
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/lbm",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/lbm/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/lbm/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/lbm/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/lbm/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/lbm/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "System",
        defaultUrl: "/lbm/settings",
        icon: Settings,
        items: [
          { title: "Settings", url: "/lbm/settings" },
          { title: "Reports", url: "/lbm/reports" },
        ],
      },
      {
        title: "Team Reports",
        defaultUrl: "/lbm/team-reports",
        icon: FileText,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/lbm/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/lbm/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/lbm/user-management" },
          { title: "User Groups", url: "/lbm/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/lbm/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "dev",
    name: "Developer",
    shortName: "Dev",
    icon: Code2,
    logo: DeveloperLogo,
    color: "#10B981",
    tagline: "Internal Tools",
    description: "Developer hub, design system & internal resources",
    isDepartment: true,
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/dev",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/dev/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/dev/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/dev/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/dev/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/dev/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Design System",
        defaultUrl: "/dev/design-system",
        icon: Palette,
        items: [],
      },
      {
        title: "Prompts",
        defaultUrl: "/dev/prompts",
        icon: MessageSquare,
        items: [],
      },
      {
        title: "Projects",
        defaultUrl: "/dev/projects",
        icon: FolderKanban,
        items: [
          { title: "All Projects", url: "/dev/projects" },
        ],
      },
      {
        title: "Reports",
        defaultUrl: "/dev/reports",
        icon: FileText,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/dev/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/dev/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/dev/user-management" },
          { title: "User Groups", url: "/dev/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/dev/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "ets",
    name: "EazyToSell",
    shortName: "EazyToSell",
    icon: ShoppingBag,
    logo: EazyToSellLogo,
    color: "#F97316",
    tagline: "Retail Franchise Ops",
    description: "China-to-India value retail franchise command center",
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/ets",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/ets/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/ets/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/ets/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/ets/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/ets/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Clients",
        defaultUrl: "/ets/pipeline",
        icon: Users,
        items: [
          { title: "Client Pipeline", url: "/ets/pipeline" },
        ],
      },
      {
        title: "Catalog",
        defaultUrl: "/ets/products",
        icon: Package,
        items: [
          { title: "Products", url: "/ets/products" },
          { title: "Price Calculator", url: "/ets/calculator" },
        ],
      },
      {
        title: "Orders",
        defaultUrl: "/ets/orders",
        icon: Truck,
        items: [
          { title: "Order Tracker", url: "/ets/orders" },
          { title: "Payments", url: "/ets/payments" },
        ],
      },
      {
        title: "Tools",
        defaultUrl: "/ets/proposals",
        icon: FileSpreadsheet,
        items: [
          { title: "Proposal Generator", url: "/ets/proposals" },
          { title: "Templates", url: "/ets/templates" },
        ],
      },
      {
        title: "Settings",
        defaultUrl: "/ets/settings",
        icon: Settings,
        items: [],
      },
      {
        title: "Reports",
        defaultUrl: "/ets/reports",
        icon: FileText,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/ets/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/ets/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/ets/user-management" },
          { title: "User Groups", url: "/ets/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/ets/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "faire",
    name: "FaireDesk",
    shortName: "Faire",
    icon: Store,
    logo: FaireLogo,
    color: "#1A6B45",
    tagline: "Faire Marketplace",
    description: "Multi-brand Faire wholesale marketplace management for 6 storefronts",
    isDepartment: false,
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/faire",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Orders",
        defaultUrl: "/faire/orders",
        icon: ShoppingBag,
        items: [
          { title: "All Orders", url: "/faire/orders" },
          { title: "Fulfillment Queue", url: "/faire/fulfillment" },
          { title: "Shipments", url: "/faire/shipments" },
        ],
      },
      {
        title: "Products",
        defaultUrl: "/faire/products",
        icon: Package,
        items: [
          { title: "All Products", url: "/faire/products" },
          { title: "Pricing & Prepacks", url: "/faire/pricing" },
          { title: "Inventory", url: "/faire/inventory" },
        ],
      },
      {
        title: "Retailers",
        defaultUrl: "/faire/retailers",
        icon: Users,
        items: [],
      },
      {
        title: "Stores",
        defaultUrl: "/faire/stores",
        icon: Store,
        items: [],
      },
      {
        title: "Applications",
        defaultUrl: "/faire/applications",
        icon: ClipboardList,
        items: [
          { title: "All Applications", url: "/faire/applications" },
        ],
      },
      {
        title: "Quotations",
        defaultUrl: "/faire/quotations",
        icon: FileText,
        items: [
          { title: "All Quotations", url: "/faire/quotations" },
          { title: "Vendors", url: "/faire/vendors" },
        ],
      },
      {
        title: "Finance",
        defaultUrl: "/faire/ledger",
        icon: Landmark,
        items: [
          { title: "Ledger", url: "/faire/ledger" },
          { title: "Bank Transactions", url: "/faire/bank-transactions" },
        ],
      },
      {
        title: "Analytics",
        defaultUrl: "/faire/analytics",
        icon: BarChart3,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/faire/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/faire/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/faire/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/faire/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/faire/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Reports",
        defaultUrl: "/faire/reports",
        icon: FileText,
        items: [],
      },
      {
        title: "Contacts",
        defaultUrl: "/faire/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/faire/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/faire/user-management" },
          { title: "User Groups", url: "/faire/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/faire/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "vendor-portal",
    name: "Vendor Portal",
    shortName: "Vendors",
    icon: Briefcase,
    logo: VendorPortalLogo,
    color: "#7C3AED",
    tagline: "Supplier Quoting Portal",
    description: "Submit quotes for requested items and view payment history",
    isDepartment: false,
    isPortal: true,
    navCategories: [
      {
        title: "Quotations",
        defaultUrl: "/vendor/quotations",
        icon: FileText,
        items: [],
      },
      {
        title: "Ledger",
        defaultUrl: "/vendor/ledger",
        icon: Landmark,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/vendor/tickets",
        icon: Ticket,
        items: [],
      },
    ],
  },
  {
    id: "hrms",
    name: "HR / HRMS",
    shortName: "HRMS",
    icon: UserCheck,
    logo: HrmsLogo,
    color: "#0EA5E9",
    tagline: "People & Culture",
    description: "Employee management, payroll, attendance & performance",
    isDepartment: true,
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/hrms",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/hrms/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/hrms/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/hrms/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/hrms/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/hrms/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Employees",
        defaultUrl: "/hrms/employees",
        icon: Users,
        items: [
          { title: "All Employees", url: "/hrms/employees" },
          { title: "Onboarding", url: "/hrms/onboarding" },
        ],
      },
      {
        title: "Organization",
        defaultUrl: "/hrms/org",
        icon: Building2,
        items: [
          { title: "Org Chart", url: "/hrms/org" },
          { title: "Departments", url: "/hrms/departments" },
        ],
      },
      {
        title: "Attendance",
        defaultUrl: "/hrms/attendance",
        icon: Clock,
        items: [
          { title: "Attendance Log", url: "/hrms/attendance" },
          { title: "Leave Requests", url: "/hrms/leaves" },
          { title: "Holidays", url: "/hrms/holidays" },
        ],
      },
      {
        title: "Payroll",
        defaultUrl: "/hrms/payroll",
        icon: DollarSign,
        items: [
          { title: "Payroll Run", url: "/hrms/payroll" },
          { title: "Payslips", url: "/hrms/payslips" },
        ],
      },
      {
        title: "Performance",
        defaultUrl: "/hrms/performance",
        icon: Award,
        items: [
          { title: "Reviews", url: "/hrms/performance" },
          { title: "Goals & OKRs", url: "/hrms/goals" },
        ],
      },
      {
        title: "Policies",
        defaultUrl: "/hrms/policies",
        icon: Shield,
        items: [],
      },
      {
        title: "Reports",
        defaultUrl: "/hrms/reports",
        icon: FileText,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/hrms/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/hrms/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/hrms/user-management" },
          { title: "User Groups", url: "/hrms/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/hrms/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "ats",
    name: "ATS / Recruitment",
    shortName: "ATS",
    icon: ClipboardList,
    logo: AtsLogo,
    color: "#8B5CF6",
    tagline: "Recruitment",
    description: "Candidates, openings, interviews, evaluations & offers",
    isDepartment: true,
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/ats",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/ats/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/ats/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/ats/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/ats/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/ats/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Jobs",
        defaultUrl: "/ats/jobs",
        icon: Briefcase,
        items: [
          { title: "All Openings", url: "/ats/jobs" },
        ],
      },
      {
        title: "Candidates",
        defaultUrl: "/ats/candidates",
        icon: UserPlus,
        items: [
          { title: "Pipeline", url: "/ats/candidates" },
          { title: "Talent Pool", url: "/ats/pool" },
        ],
      },
      {
        title: "Applications",
        defaultUrl: "/ats/applications",
        icon: ClipboardList,
        items: [],
      },
      {
        title: "Interviews",
        defaultUrl: "/ats/interviews",
        icon: CalendarCheck,
        items: [],
      },
      {
        title: "Evaluations",
        defaultUrl: "/ats/evaluations",
        icon: Star,
        items: [],
      },
      {
        title: "Offers",
        defaultUrl: "/ats/offers",
        icon: FileText,
        items: [],
      },
      {
        title: "Analytics",
        defaultUrl: "/ats/analytics",
        icon: BarChart3,
        items: [],
      },
      {
        title: "Reports",
        defaultUrl: "/ats/reports",
        icon: FileText,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/ats/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/ats/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/ats/user-management" },
          { title: "User Groups", url: "/ats/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/ats/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "crm",
    name: "Sales CRM",
    shortName: "CRM",
    icon: TrendingUp,
    logo: CrmLogo,
    color: "#0369A1",
    tagline: "Cross-Vertical Sales",
    description: "Leads, deals, pipeline, contacts & team performance across all verticals",
    isDepartment: true,
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/crm",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/crm/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/crm/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/crm/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/crm/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/crm/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Leads",
        defaultUrl: "/crm/leads",
        icon: Users,
        items: [
          { title: "All Leads", url: "/crm/leads" },
          { title: "Prospects", url: "/crm/prospects" },
        ],
      },
      {
        title: "Pipeline",
        defaultUrl: "/crm/pipeline",
        icon: FolderKanban,
        items: [],
      },
      {
        title: "Contacts",
        defaultUrl: "/crm/contacts",
        icon: Building2,
        items: [
          { title: "People", url: "/crm/contacts" },
          { title: "Companies", url: "/crm/contacts?tab=companies" },
        ],
      },
      {
        title: "Deals",
        defaultUrl: "/crm/deals",
        icon: DollarSign,
        items: [],
      },
      {
        title: "Activities",
        defaultUrl: "/crm/activities",
        icon: CalendarCheck,
        items: [],
      },
      {
        title: "Appointments",
        defaultUrl: "/crm/appointments",
        icon: CalendarDays,
        items: [],
      },
      {
        title: "Performance",
        defaultUrl: "/crm/performance",
        icon: Target,
        items: [
          { title: "Team Performance", url: "/crm/performance" },
          { title: "Payment Links", url: "/crm/payment-links" },
        ],
      },
      {
        title: "Templates",
        defaultUrl: "/crm/templates",
        icon: FileText,
        items: [],
      },
      {
        title: "Reports",
        defaultUrl: "/crm/reports",
        icon: BarChart3,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/crm/contacts-important",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/crm/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/crm/user-management" },
          { title: "User Groups", url: "/crm/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/crm/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "finance",
    name: "Finance & Accounts",
    shortName: "Finance",
    icon: Landmark,
    logo: FinanceLogo,
    color: "#B45309",
    tagline: "Multi-Entity Accounting",
    description: "Ledgers, compliance, payments & reports across 4 legal entities",
    isDepartment: true,
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/finance",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/finance/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/finance/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/finance/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/finance/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/finance/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Ledger",
        defaultUrl: "/finance/ledger",
        icon: BookMarked,
        items: [],
      },
      {
        title: "Transactions",
        defaultUrl: "/finance/transactions",
        icon: Receipt,
        items: [],
      },
      {
        title: "Journal Entries",
        defaultUrl: "/finance/journal",
        icon: BookOpen,
        items: [],
      },
      {
        title: "Inter-Company",
        defaultUrl: "/finance/intercompany",
        icon: GitBranch,
        items: [],
      },
      {
        title: "Payments",
        defaultUrl: "/finance/payments",
        icon: CreditCard,
        items: [],
      },
      {
        title: "Shared Expenses",
        defaultUrl: "/finance/shared-expenses",
        icon: Calculator,
        items: [],
      },
      {
        title: "Cash Book",
        defaultUrl: "/finance/cashbook",
        icon: DollarSign,
        items: [],
      },
      {
        title: "Compliance",
        defaultUrl: "/finance/compliance",
        icon: ShieldCheck,
        items: [],
      },
      {
        title: "Reports",
        defaultUrl: "/finance/reports",
        icon: BarChart3,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/finance/contacts-important",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/finance/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/finance/user-management" },
          { title: "User Groups", url: "/finance/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/finance/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "oms",
    name: "Order & Fulfillment",
    shortName: "OMS",
    icon: Package,
    logo: OmsLogo,
    color: "#0891B2",
    tagline: "Orders · WMS · B2B · B2C",
    description: "B2B/B2C order fulfillment, inventory management & India logistics",
    isDepartment: true,
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/oms",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/oms/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/oms/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/oms/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/oms/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/oms/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Orders",
        defaultUrl: "/oms/orders",
        icon: ShoppingBag,
        items: [],
      },
      {
        title: "Inventory",
        defaultUrl: "/oms/inventory",
        icon: Package,
        items: [],
      },
      {
        title: "Products",
        defaultUrl: "/oms/products",
        icon: Tag,
        items: [],
      },
      {
        title: "Shipments",
        defaultUrl: "/oms/shipments",
        icon: Truck,
        items: [],
      },
      {
        title: "Purchase Orders",
        defaultUrl: "/oms/purchase-orders",
        icon: ClipboardList,
        items: [],
      },
      {
        title: "Suppliers",
        defaultUrl: "/oms/suppliers",
        icon: Building2,
        items: [],
      },
      {
        title: "Returns",
        defaultUrl: "/oms/returns",
        icon: RotateCcw,
        items: [],
      },
      {
        title: "Locations",
        defaultUrl: "/oms/locations",
        icon: MapPin,
        items: [],
      },
      {
        title: "Reports",
        defaultUrl: "/oms/reports",
        icon: BarChart3,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/oms/contacts-important",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/oms/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/oms/user-management" },
          { title: "User Groups", url: "/oms/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/oms/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
  {
    id: "social",
    name: "SMM",
    shortName: "SMM",
    icon: BarChart3,
    logo: SocialLogo,
    color: "#0D9488",
    tagline: "Social Media Marketing",
    description: "Social media ops, content scheduling & brand analytics",
    isDepartment: true,
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/social",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/social/chat",
        icon: MessageSquare,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/social/team",
        icon: Users,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/social/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/social/tasks",
        icon: CheckSquare,
        items: [],
      },
      {
        title: "Tickets",
        defaultUrl: "/social/tickets",
        icon: Ticket,
        items: [],
      },
      {
        title: "Content",
        defaultUrl: "/social/posts",
        icon: FileImage,
        items: [
          { title: "Post Library", url: "/social/posts" },
          { title: "Composer", url: "/social/composer" },
          { title: "Calendar", url: "/social/calendar" },
          { title: "Media Library", url: "/social/media" },
        ],
      },
      {
        title: "Campaigns",
        defaultUrl: "/social/campaigns",
        icon: Target,
        items: [],
      },
      {
        title: "Approvals",
        defaultUrl: "/social/approvals",
        icon: ShieldCheck,
        items: [],
      },
      {
        title: "Assignments",
        defaultUrl: "/social/assignments",
        icon: ClipboardList,
        items: [],
      },
      {
        title: "Analytics",
        defaultUrl: "/social/analytics",
        icon: BarChart3,
        items: [],
      },
      {
        title: "Reports",
        defaultUrl: "/social/reports",
        icon: FileText,
        items: [],
      },
      {
        title: "Important Contacts",
        defaultUrl: "/social/contacts",
        icon: Phone,
        items: [],
      },
      {
        title: "Users & Access",
        defaultUrl: "/social/user-management",
        icon: Shield,
        items: [
          { title: "Users", url: "/social/user-management" },
          { title: "User Groups", url: "/social/user-groups" },
        ],
      },
      {
        title: "Apps",
        defaultUrl: "/social/apps",
        icon: Blocks,
        items: [],
      },
    ],
  },
];

export function getVerticalById(id: string): Vertical | undefined {
  return verticals.find((v) => v.id === id);
}

export function getDefaultVertical(): Vertical {
  return verticals[0];
}

export function getAllNavUrls(vertical: Vertical): string[] {
  const urls: string[] = [];
  for (const cat of vertical.navCategories) {
    urls.push(cat.defaultUrl);
    for (const item of cat.items) {
      urls.push(item.url);
    }
  }
  return urls;
}

export function detectVerticalFromUrl(location: string): Vertical | undefined {
  if (location.startsWith("/suprans")) return getVerticalById("suprans");
  if (location.startsWith("/vendor")) return getVerticalById("vendor-portal");
  if (location.startsWith("/faire")) return getVerticalById("faire");
  if (location.startsWith("/hrms")) return getVerticalById("hrms");
  if (location.startsWith("/ats")) return getVerticalById("ats");
  if (location.startsWith("/crm")) return getVerticalById("crm");
  if (location.startsWith("/finance")) return getVerticalById("finance");
  if (location.startsWith("/oms")) return getVerticalById("oms");
  if (location.startsWith("/social")) return getVerticalById("social");
  if (location.startsWith("/legalnations")) return getVerticalById("hr");
  if (location.startsWith("/usdrop")) return getVerticalById("sales");
  if (location.startsWith("/goyotours")) return getVerticalById("events");
  if (location.startsWith("/eventhub")) return getVerticalById("eventhub");
  if (location.startsWith("/lbm")) return getVerticalById("admin");
  if (location.startsWith("/dev")) return getVerticalById("dev");
  if (location.startsWith("/ets")) return getVerticalById("ets");
  return undefined;
}
