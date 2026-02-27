import { Users, UserPlus, Briefcase, CalendarDays, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import emptyCalendarImg from "@/assets/illustrations/empty-calendar.png";
import { StatsCard } from "@/components/hr/stats-card";
import { StatusBadge } from "@/components/hr/status-badge";
import { employees, candidates, jobPostings, leaveRequests, attendanceRecords } from "@/lib/mock-data";
import { getPersonAvatar } from "@/lib/avatars";

export default function Dashboard() {
  const activeEmployees = employees.filter((e) => e.status === "Active").length;
  const onLeave = employees.filter((e) => e.status === "On Leave").length;
  const openJobs = jobPostings.filter((j) => j.status === "Open").length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === "Pending").length;
  const todayPresent = attendanceRecords.filter((a) => a.status === "Present").length;
  const activeCandidates = candidates.filter((c) => !["Hired", "Rejected"].includes(c.stage)).length;

  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5);

  const pendingLeavesList = leaveRequests.filter((l) => l.status === "Pending").slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Dashboard" subtitle="Welcome back, Sneha" />
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Employees"
            value={employees.length}
            change={`${activeEmployees} active`}
            changeType="positive"
            icon={<Users className="size-5" />}
          />
          <StatsCard
            title="Open Positions"
            value={openJobs}
            change={`${jobPostings.reduce((a, j) => a + j.applicants, 0)} total applicants`}
            changeType="neutral"
            icon={<Briefcase className="size-5" />}
          />
          <StatsCard
            title="Active Candidates"
            value={activeCandidates}
            change={`${candidates.filter((c) => c.stage === "Interview").length} in interviews`}
            changeType="positive"
            icon={<UserPlus className="size-5" />}
          />
          <StatsCard
            title="Pending Leaves"
            value={pendingLeaves}
            change={`${onLeave} currently on leave`}
            changeType="warning"
            icon={<CalendarDays className="size-5" />}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border bg-background">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold">Recent Candidates</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Latest applications received</p>
              </div>
              <StatusBadge status={`${activeCandidates} active`} variant="info" />
            </div>
            <div className="divide-y">
              {recentCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between px-5 py-3"
                  data-testid={`card-candidate-${candidate.id}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={getPersonAvatar(candidate.name, 32)} alt={candidate.name} className="size-8 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground">{candidate.position}</p>
                    </div>
                  </div>
                  <StatusBadge status={candidate.stage} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-background">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold">Pending Leave Requests</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Requires your approval</p>
              </div>
              <StatusBadge status={`${pendingLeaves} pending`} variant="warning" />
            </div>
            <div className="divide-y">
              {pendingLeavesList.length > 0 ? (
                pendingLeavesList.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between px-5 py-3"
                    data-testid={`card-leave-${leave.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={getPersonAvatar(leave.employeeName, 32)} alt={leave.employeeName} className="size-8 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{leave.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {leave.type} &middot; {leave.days} day{leave.days > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{leave.startDate}</p>
                      <p className="text-xs text-muted-foreground">to {leave.endDate}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-3 py-6">
                  <img src={emptyCalendarImg} alt="" className="size-20 object-contain" draggable={false} />
                  <p className="text-sm font-medium text-foreground">All caught up</p>
                  <p className="text-xs text-muted-foreground">No pending leave requests to review</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border bg-background">
            <div className="border-b px-5 py-4">
              <h3 className="text-sm font-semibold">Today's Attendance</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Feb 27, 2025</p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-lg font-semibold">{todayPresent}</span>
                  <span className="text-[10px] text-muted-foreground">Present</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex size-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950">
                    <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-lg font-semibold">
                    {attendanceRecords.filter((a) => a.status === "Late").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Late</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex size-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
                    <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-lg font-semibold">
                    {attendanceRecords.filter((a) => a.status === "Absent").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Absent</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
                    <TrendingUp className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-lg font-semibold">
                    {attendanceRecords.filter((a) => a.status === "Half Day").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Half Day</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-background lg:col-span-2">
            <div className="border-b px-5 py-4">
              <h3 className="text-sm font-semibold">Department Overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Team distribution</p>
            </div>
            <div className="divide-y">
              {[
                { name: "Engineering", count: 6, color: "bg-blue-500" },
                { name: "Design", count: 2, color: "bg-purple-500" },
                { name: "HR", count: 2, color: "bg-emerald-500" },
                { name: "Marketing", count: 2, color: "bg-amber-500" },
                { name: "Sales", count: 1, color: "bg-pink-500" },
                { name: "Finance", count: 1, color: "bg-indigo-500" },
                { name: "Product", count: 1, color: "bg-teal-500" },
              ].map((dept) => (
                <div key={dept.name} className="flex items-center gap-3 px-5 py-2.5" data-testid={`card-dept-${dept.name.toLowerCase()}`}>
                  <div className={`size-2 rounded-full ${dept.color}`} />
                  <span className="flex-1 text-sm">{dept.name}</span>
                  <span className="text-sm font-medium">{dept.count}</span>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${dept.color}`}
                      style={{ width: `${(dept.count / employees.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
