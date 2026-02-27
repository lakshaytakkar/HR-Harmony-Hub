import { useLocation, Link } from "wouter";
import { Search, Bell, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getPersonAvatar } from "@/lib/avatars";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TeamSyncMascot } from "@/components/brand/teamsync-mascot";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
}

interface NavCategory {
  title: string;
  items: NavItem[];
  defaultUrl: string;
}

const navCategories: NavCategory[] = [
  {
    title: "Dashboard",
    defaultUrl: "/",
    items: [],
  },
  {
    title: "People",
    defaultUrl: "/employees",
    items: [
      { title: "Employees", url: "/employees" },
      { title: "Departments", url: "/departments" },
    ],
  },
  {
    title: "Recruitment",
    defaultUrl: "/candidates",
    items: [
      { title: "Candidates", url: "/candidates" },
      { title: "Job Postings", url: "/job-postings" },
    ],
  },
  {
    title: "Operations",
    defaultUrl: "/leave",
    items: [
      { title: "Leave Management", url: "/leave" },
      { title: "Attendance", url: "/attendance" },
      { title: "Documents", url: "/documents" },
    ],
  },
  {
    title: "Finance",
    defaultUrl: "/payroll",
    items: [
      { title: "Payroll", url: "/payroll" },
    ],
  },
  {
    title: "Projects",
    defaultUrl: "/projects",
    items: [
      { title: "Projects", url: "/projects" },
    ],
  },
  {
    title: "Design System",
    defaultUrl: "/dev/style-guide",
    items: [
      { title: "Style Guide", url: "/dev/style-guide" },
      { title: "Components", url: "/dev/components" },
      { title: "Icons", url: "/dev/icons" },
    ],
  },
];

function getActiveCategory(location: string): NavCategory | null {
  if (location === "/") return navCategories[0];
  for (const cat of navCategories) {
    for (const item of cat.items) {
      if (location === item.url || location.startsWith(item.url + "/")) {
        return cat;
      }
    }
  }
  return null;
}

function isItemActive(location: string, itemUrl: string): boolean {
  return location === itemUrl || location.startsWith(itemUrl + "/");
}

export function TopNavigation() {
  const [location] = useLocation();
  const activeCategory = getActiveCategory(location);
  const showSubNav = activeCategory && activeCategory.items.length > 1;

  return (
    <div className="shrink-0 overflow-hidden">
      <header className="flex h-14 items-center justify-between gap-2 border-b bg-background px-6 lg:px-10 overflow-hidden">
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" data-testid="nav-brand">
            <TeamSyncMascot size={30} />
            <span className="text-lg font-bold font-heading tracking-tight hidden sm:inline" data-testid="text-brand-name">
              TeamSync
            </span>
          </Link>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <nav className="flex items-center gap-0.5 overflow-x-auto overflow-y-hidden scrollbar-hide" data-testid="nav-level-1">
            {navCategories.map((cat) => {
              const isActive = activeCategory?.title === cat.title;
              return (
                <Link
                  key={cat.title}
                  href={cat.defaultUrl}
                  data-testid={`nav-l1-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "relative whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {cat.title}
                  {isActive && (
                    <motion.div
                      layoutId="nav-l1-indicator"
                      className="absolute bottom-[-13px] left-2 right-2 h-[2px] rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-9 w-56 pl-8 text-sm"
              data-testid="input-global-search"
            />
          </div>

          <Button size="icon" variant="ghost" className="relative" data-testid="button-notifications">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive animate-pulse" />
          </Button>

          <Separator orientation="vertical" className="h-5" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-user-menu">
                <img src={getPersonAvatar("Sneha Patel", 32)} alt="SP" className="size-8 rounded-full" />
                <div className="hidden flex-col items-start md:flex">
                  <span className="text-sm font-medium">Sneha Patel</span>
                  <span className="text-xs text-muted-foreground">HR Manager</span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="text-sm" data-testid="menu-item-profile">My Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-sm" data-testid="menu-item-settings">Account Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm" data-testid="menu-item-logout">Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {showSubNav && (
        <div className="flex items-center gap-1 border-b bg-muted/30 px-6 py-2 lg:px-10 overflow-x-auto overflow-y-hidden scrollbar-hide" data-testid="nav-level-2">
          {activeCategory.items.map((item, index) => {
            const isActive = isItemActive(location, item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                data-testid={`nav-l2-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "relative whitespace-nowrap px-4 py-1.5 text-sm rounded-lg transition-all",
                  isActive
                    ? "bg-background text-foreground font-semibold shadow-sm border border-border/60"
                    : "text-muted-foreground font-medium hover:text-foreground hover:bg-background/60"
                )}
              >
                <span className="text-muted-foreground mr-1.5">{index + 1})</span>
                {item.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
