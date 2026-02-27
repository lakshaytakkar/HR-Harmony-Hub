import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  Briefcase,
  CalendarDays,
  Clock,
  FileText,
  Palette,
  Component,
  Grid3X3,
} from "lucide-react";
import { TeamSyncMascot } from "@/components/brand/teamsync-mascot";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Fade, motion } from "@/components/ui/animated";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Candidates", url: "/candidates", icon: UserPlus },
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "Job Postings", url: "/job-postings", icon: Briefcase },
  { title: "Leave Management", url: "/leave", icon: CalendarDays },
  { title: "Attendance", url: "/attendance", icon: Clock },
  { title: "Documents", url: "/documents", icon: FileText },
];

const designNavItems = [
  { title: "Style Guide", url: "/dev/style-guide", icon: Palette },
  { title: "Components", url: "/dev/components", icon: Component },
  { title: "Icons", url: "/dev/icons", icon: Grid3X3 },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const navItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  const navContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Fade delay={0.05}>
          <div className="flex items-center gap-3">
            <TeamSyncMascot size={36} className="shrink-0" />
            {!isCollapsed && (
              <span className="text-xl font-bold font-heading tracking-tight" data-testid="text-brand-name">TeamSync</span>
            )}
          </div>
        </Fade>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <motion.div
                variants={navContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {mainNavItems.map((item) => {
                  const isActive = item.url === "/" ? location === "/" : location.startsWith(item.url);
                  return (
                    <motion.div key={item.title} variants={navItemVariants}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-primary"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                      </SidebarMenuItem>
                    </motion.div>
                  );
                })}
              </motion.div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Design System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <motion.div
                variants={navContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {designNavItems.map((item) => {
                  const isActive = location.startsWith(item.url);
                  return (
                    <motion.div key={item.title} variants={navItemVariants}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-primary"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                      </SidebarMenuItem>
                    </motion.div>
                  );
                })}
              </motion.div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}
