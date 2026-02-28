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
  type LucideIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { LegalNationsLogo } from "@/components/brand/legalnations-logo";
import { UsdropAiLogo } from "@/components/brand/usdrop-ai-logo";
import { GoyoToursLogo } from "@/components/brand/goyotours-logo";
import { LbmLifestyleLogo } from "@/components/brand/lbm-lifestyle-logo";
import { DeveloperLogo } from "@/components/brand/developer-logo";
import { EazyToSellLogo } from "@/components/brand/eazytosell-logo";

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
          { title: "Task Board", url: "/hr/tasks" },
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
          { title: "Team Performance", url: "/hr/team-performance" },
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
        title: "Team",
        defaultUrl: "/admin/team",
        icon: Users,
        items: [
          { title: "Team Members", url: "/admin/team" },
        ],
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
        title: "Resources",
        defaultUrl: "/dev/resources",
        icon: BookOpen,
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
  if (location.startsWith("/hr")) return getVerticalById("hr");
  if (location.startsWith("/sales")) return getVerticalById("sales");
  if (location.startsWith("/events")) return getVerticalById("events");
  if (location.startsWith("/admin")) return getVerticalById("admin");
  if (location.startsWith("/dev")) return getVerticalById("dev");
  if (location.startsWith("/ets")) return getVerticalById("ets");
  return undefined;
}
