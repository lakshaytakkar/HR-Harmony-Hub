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
import { VerticalSwitcher } from "./vertical-switcher";
import { useVertical } from "@/lib/vertical-store";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { NavCategory } from "@/lib/verticals-config";

function getActiveCategory(location: string, categories: NavCategory[]): NavCategory | null {
  for (const cat of categories) {
    if (cat.items.length === 0 && location === cat.defaultUrl) return cat;
    for (const item of cat.items) {
      if (location === item.url || location.startsWith(item.url + "/")) {
        return cat;
      }
    }
  }
  if (categories.length > 0 && location === categories[0].defaultUrl) {
    return categories[0];
  }
  return null;
}

function isItemActive(location: string, itemUrl: string): boolean {
  return location === itemUrl || location.startsWith(itemUrl + "/");
}

export function TopNavigation() {
  const [location] = useLocation();
  const { currentVertical } = useVertical();
  const navCategories = currentVertical.navCategories;
  const activeCategory = getActiveCategory(location, navCategories);
  const showSubNav = activeCategory && activeCategory.items.length > 1;

  return (
    <div className="shrink-0 overflow-y-hidden px-16 lg:px-24 pt-3 space-y-2">
      <header
        className="flex h-14 items-center justify-between gap-2 rounded-xl border bg-background px-5 overflow-hidden overflow-y-hidden"
        data-testid="topbar-main"
      >
        <div className="flex items-center gap-6 min-w-0">
          <VerticalSwitcher />

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
                    "relative whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat.title}
                  {isActive && (
                    <motion.div
                      layoutId="nav-l1-indicator"
                      className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-primary"
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
                  <span className="text-[13px] text-muted-foreground">HR Manager</span>
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
        <div
          className="flex items-center gap-1 rounded-xl bg-primary px-5 py-2 overflow-x-auto overflow-y-hidden scrollbar-hide"
          data-testid="nav-level-2"
        >
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
                    ? "bg-white/20 text-white font-semibold"
                    : "text-white/70 font-medium hover:text-white hover:bg-white/10"
                )}
              >
                <span className="text-white/50 mr-1.5">{index + 1})</span>
                {item.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
