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
import { SocialLogo } from "@/components/brand/social-logo";
import { FaireLogo } from "@/components/brand/faire-logo";

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
}

export const verticals: Vertical[] = [
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
        defaultUrl: "/hr",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/hr/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/hr/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/hr/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/hr/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Clients",
        defaultUrl: "/hr/clients",
        icon: Briefcase,
        items: [
          { title: "All Clients", url: "/hr/clients" },
          { title: "Client Intake", url: "/hr/intake" },
          { title: "Stage Overview", url: "/hr/stages" },
        ],
      },
      {
        title: "Operations",
        defaultUrl: "/hr/pipeline",
        icon: GitBranch,
        items: [
          { title: "Formation Pipeline", url: "/hr/pipeline" },
          { title: "Task Board", url: "/hr/task-board" },
          { title: "Escalations", url: "/hr/escalations" },
        ],
      },
      {
        title: "Documents",
        defaultUrl: "/hr/documents",
        icon: FileText,
        items: [
          { title: "Document Vault", url: "/hr/documents" },
          { title: "Templates", url: "/hr/templates" },
        ],
      },
      {
        title: "Compliance",
        defaultUrl: "/hr/compliance",
        icon: Shield,
        items: [
          { title: "Compliance Tracker", url: "/hr/compliance" },
          { title: "Annual Reports", url: "/hr/annual-reports" },
        ],
      },
      {
        title: "Analytics",
        defaultUrl: "/hr/analytics",
        icon: BarChart3,
        items: [
          { title: "Formation Analytics", url: "/hr/analytics" },
        ],
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
        defaultUrl: "/sales",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/sales/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/sales/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/sales/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/sales/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Products & Catalog",
        defaultUrl: "/sales/products",
        icon: Package,
        items: [
          { title: "Products", url: "/sales/products" },
          { title: "Categories", url: "/sales/categories" },
          { title: "Suppliers", url: "/sales/suppliers" },
          { title: "Winning Products", url: "/sales/winning-products" },
        ],
      },
      {
        title: "Users & Subscriptions",
        defaultUrl: "/sales/users",
        icon: Users,
        items: [
          { title: "Users", url: "/sales/users" },
          { title: "Leads", url: "/sales/leads" },
          { title: "Plans", url: "/sales/plans" },
          { title: "Subscriptions", url: "/sales/subscriptions" },
        ],
      },
      {
        title: "Operations",
        defaultUrl: "/sales/stores",
        icon: Store,
        items: [
          { title: "Shopify Stores", url: "/sales/stores" },
          { title: "Fulfillment", url: "/sales/fulfillment" },
          { title: "Competitor Stores", url: "/sales/competitors" },
        ],
      },
      {
        title: "Support & Learning",
        defaultUrl: "/sales/tickets",
        icon: Headphones,
        items: [
          { title: "Support Tickets", url: "/sales/tickets" },
          { title: "Courses", url: "/sales/courses" },
          { title: "Help Center", url: "/sales/help-center" },
        ],
      },
      {
        title: "Analytics",
        defaultUrl: "/sales/revenue",
        icon: LineChart,
        items: [
          { title: "Revenue Analytics", url: "/sales/revenue" },
          { title: "User Analytics", url: "/sales/user-analytics" },
          { title: "Product Performance", url: "/sales/product-performance" },
        ],
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
    tagline: "Service & Experiences",
    description: "Tour packages, events & venue management",
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/events",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/events/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/events/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/events/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/events/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Events",
        defaultUrl: "/events/list",
        icon: CalendarCheck,
        items: [
          { title: "All Events", url: "/events/list" },
          { title: "Check-in", url: "/events/checkin" },
        ],
      },
      {
        title: "Venues",
        defaultUrl: "/events/venues",
        icon: MapPin,
        items: [
          { title: "Venues", url: "/events/venues" },
        ],
      },
    ],
  },
  {
    id: "eventhub",
    name: "Event Hub",
    shortName: "Event Hub",
    icon: CalendarCheck,
    logo: EventHubLogo,
    color: "#7C3AED",
    tagline: "Networking Events",
    description: "Networking events & engagement platform",
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/hub",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/hub/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/hub/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/hub/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/hub/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Events",
        defaultUrl: "/hub/events",
        icon: CalendarDays,
        items: [
          { title: "All Events", url: "/hub/events" },
        ],
      },
      {
        title: "Attendees",
        defaultUrl: "/hub/attendees",
        icon: Users,
        items: [
          { title: "All Attendees", url: "/hub/attendees" },
          { title: "Live Check-in", url: "/hub/checkin" },
        ],
      },
      {
        title: "Venues",
        defaultUrl: "/hub/venues",
        icon: MapPin,
        items: [],
      },
      {
        title: "Vendors",
        defaultUrl: "/hub/vendors",
        icon: Briefcase,
        items: [],
      },
      {
        title: "Operations",
        defaultUrl: "/hub/budget",
        icon: BarChart3,
        items: [
          { title: "Budget Tracker", url: "/hub/budget" },
          { title: "Analytics", url: "/hub/analytics" },
        ],
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
        defaultUrl: "/admin",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Chat",
        defaultUrl: "/admin/chat",
        icon: MessageCircle,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/admin/team",
        icon: UserRound,
        items: [],
      },
      {
        title: "Resources",
        defaultUrl: "/admin/resources",
        icon: FolderOpen,
        items: [],
      },
      {
        title: "Tasks",
        defaultUrl: "/admin/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "System",
        defaultUrl: "/admin/settings",
        icon: Settings,
        items: [
          { title: "Settings", url: "/admin/settings" },
          { title: "Reports", url: "/admin/reports" },
        ],
      },
    ],
  },
  {
    id: "dev",
    name: "Developer",
    shortName: "Developer",
    icon: Code2,
    logo: DeveloperLogo,
    color: "#10B981",
    tagline: "Internal Tools",
    description: "Developer hub, design system & internal resources",
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
        title: "Design System",
        defaultUrl: "/dev/style-guide",
        icon: Palette,
        items: [
          { title: "Style Guide", url: "/dev/style-guide" },
          { title: "Components", url: "/dev/components" },
          { title: "Icons", url: "/dev/icons" },
        ],
      },
      {
        title: "Prompts",
        defaultUrl: "/dev/prompts",
        icon: MessageSquare,
        items: [],
      },
      {
        title: "Knowledge Base",
        defaultUrl: "/dev/knowledge-base",
        icon: BookOpen,
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
        title: "Dev Board",
        defaultUrl: "/dev/board",
        icon: CheckSquare,
        items: [],
      },
      {
        title: "Toolkit",
        defaultUrl: "/dev/toolkit",
        icon: Wrench,
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
        title: "Tasks",
        defaultUrl: "/faire/tasks",
        icon: ListChecks,
        items: [],
      },
      {
        title: "Stores",
        defaultUrl: "/faire/stores",
        icon: Store,
        items: [],
      },
      {
        title: "Products & Catalog",
        defaultUrl: "/faire/products",
        icon: Package,
        items: [
          { title: "All Products", url: "/faire/products" },
          { title: "Inventory", url: "/faire/inventory" },
          { title: "Pricing & Prepacks", url: "/faire/pricing" },
        ],
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
        title: "Retailers",
        defaultUrl: "/faire/retailers",
        icon: Users,
        items: [],
      },
      {
        title: "Campaigns",
        defaultUrl: "/faire/campaigns",
        icon: Target,
        items: [],
      },
      {
        title: "Disputes",
        defaultUrl: "/faire/disputes",
        icon: AlertTriangle,
        items: [],
      },
      {
        title: "Analytics",
        defaultUrl: "/faire/analytics",
        icon: BarChart3,
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
    ],
  },
  {
    id: "social",
    name: "SocialDesk",
    shortName: "SocialDesk",
    icon: BarChart3,
    logo: SocialLogo,
    color: "#0D9488",
    tagline: "Content & Brand",
    description: "Social media ops, scheduling & analytics",
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
  if (location.startsWith("/faire")) return getVerticalById("faire");
  if (location.startsWith("/hrms")) return getVerticalById("hrms");
  if (location.startsWith("/ats")) return getVerticalById("ats");
  if (location.startsWith("/social")) return getVerticalById("social");
  if (location.startsWith("/hr")) return getVerticalById("hr");
  if (location.startsWith("/sales")) return getVerticalById("sales");
  if (location.startsWith("/events")) return getVerticalById("events");
  if (location.startsWith("/hub")) return getVerticalById("eventhub");
  if (location.startsWith("/admin")) return getVerticalById("admin");
  if (location.startsWith("/dev")) return getVerticalById("dev");
  if (location.startsWith("/ets")) return getVerticalById("ets");
  return undefined;
}
