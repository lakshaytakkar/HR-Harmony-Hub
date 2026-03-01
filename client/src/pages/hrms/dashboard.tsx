import { useState } from "react";
import { useLocation } from "wouter";
import { Users, UserCheck, Clock, Briefcase, TrendingUp, CheckCircle2, AlertCircle, Gift } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import {
  employees,
  hrmsDepartments,
  leaveRequests,
} from "@/lib/mock-data-hrms";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
} from "@/components/layout";

const BRAND_COLOR = "#0EA5E9";
const BRAND_DARK = "#0284C7";

export default function HrmsDashboard() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);

  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const onLeave = employees.filter((e) => e.status === "on-leave").length;
  const openPositions = 8;
  const pendingLeaves = leaveRequests.filter((l) => l.status === "pending").length;

  const recentJoiners = [...employees]
    .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
    .slice(0, 5);

  const upcomingBirthdays = [
    { name: "Karan Joshi", date: "Mar 3", dept: "Engineering" },
    { name: "Meera Pillai", date: "Mar 8", dept: "Operations" },
    { name: "Suresh Iyer", date: "Mar 15", dept: "Finance" },
  ];

  const stats = [
    { label: "Total Employees", value: employees.length, icon: Users, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
    { label: "Active Today", value: activeEmployees, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
    { label: "On Leave", value: onLeave, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
    { label: "Open Positions", value: openPositions, icon: Briefcase, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  ];

  const maxHeadCount = Math.max(...hrmsDepartments.map((d) => d.headCount));

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-48 bg-muted rounded-2xl" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </StatGrid>
        <SectionGrid>
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </SectionGrid>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HeroBanner
        eyebrow="HRMS · People & Culture"
        headline="Good morning, Sneha 👋"
        tagline={`You have ${pendingLeaves} leave requests pending approval and 3 upcoming birthdays this week.`}
        color={BRAND_COLOR}
        colorDark={BRAND_DARK}
      />

      <StatGrid>
        <StatCard
          label="Total Employees"
          value={employees.length}
          icon={Users}
          iconBg="hsl(var(--sky-500) / 0.1)"
          iconColor="#0ea5e9"
        />
        <StatCard
          label="Active Today"
          value={activeEmployees}
          icon={UserCheck}
          iconBg="hsl(var(--emerald-500) / 0.1)"
          iconColor="#10b981"
        />
        <StatCard
          label="On Leave"
          value={onLeave}
          icon={Clock}
          iconBg="hsl(var(--amber-500) / 0.1)"
          iconColor="#f59e0b"
        />
        <StatCard
          label="Open Positions"
          value={openPositions}
          icon={Briefcase}
          iconBg="hsl(var(--violet-500) / 0.1)"
          iconColor="#7c3aed"
        />
      </StatGrid>

      <SectionGrid>
        <SectionCard title="Department Headcount">
          <div className="space-y-3">
            {hrmsDepartments.map((dept) => (
              <div key={dept.id} data-testid={`dept-bar-${dept.id}`}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{dept.name}</span>
                  <span className="text-muted-foreground">{dept.headCount} employees</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(dept.headCount / maxHeadCount) * 100}%`, background: dept.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Joiners">
          <div className="space-y-3">
            {recentJoiners.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/40 rounded-lg p-1.5 -mx-1.5 transition-colors"
                onClick={() => setLocation(`/hrms/employees/${emp.id}`)}
                data-testid={`recent-joiner-${emp.id}`}
              >
                <Avatar className="size-8">
                  <AvatarImage src={getPersonAvatar(emp.name, 32)} alt={emp.name} />
                  <AvatarFallback className="text-xs">{emp.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{emp.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{emp.designation} · {emp.department}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </SectionGrid>

      <SectionGrid>
        <SectionCard title="Upcoming Birthdays">
          <div className="space-y-2">
            {upcomingBirthdays.map((b, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={getPersonAvatar(b.name, 28)} alt={b.name} />
                    <AvatarFallback className="text-[10px]">{b.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.dept}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">{b.date}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Pending Leave Approvals">
          <div className="space-y-2">
            {leaveRequests.filter(l => l.status === "pending").slice(0, 3).map((leave) => (
              <div key={leave.id} className="flex items-center justify-between gap-2 py-1.5 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{leave.employeeName}</p>
                  <p className="text-xs text-muted-foreground">{leave.type} · {leave.days} day{leave.days > 1 ? "s" : ""}</p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700" data-testid={`approve-leave-${leave.id}`}>
                    <CheckCircle2 className="size-3 mr-1" /> Approve
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-xs mt-1 h-8" onClick={() => setLocation("/hrms/leaves")} data-testid="view-all-leaves">
              View all leave requests →
            </Button>
          </div>
        </SectionCard>
      </SectionGrid>
    </PageShell>
  );
}
