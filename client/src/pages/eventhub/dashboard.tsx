import { CalendarDays, Users, Briefcase, TrendingUp, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { hubEvents, hubVendors, hubAttendees } from "@/lib/mock-data-eventhub";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const statusVariantMap: Record<string, "info" | "success" | "neutral" | "error"> = {
  upcoming: "info",
  live: "success",
  completed: "neutral",
  cancelled: "error",
};

const typeColorMap: Record<string, string> = {
  Seminar: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Workshop: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Conference: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Investor Meet": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Launch Event": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Roundtable: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
};

export default function HubDashboard() {
  const loading = useSimulatedLoading();

  const upcomingEvents = hubEvents.filter((e) => e.status === "upcoming");
  const completedEvents = hubEvents.filter((e) => e.status === "completed");
  const activeVendors = hubVendors.filter((v) => v.status === "active").length;
  const totalAttendees = hubEvents.reduce((sum, e) => sum + e.totalAttendees, 0);
  const totalPlanned = hubEvents.reduce((sum, e) => sum + e.budget, 0);
  const totalActual = hubEvents.reduce((sum, e) => sum + e.actualSpend, 0);
  const budgetUtilized = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisWeekEvents = hubEvents.filter((e) => {
    const d = new Date(e.date);
    return d >= now && d <= sevenDaysFromNow;
  });

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground" data-testid="hub-dashboard-title">Event Hub</h1>
          <p className="text-sm text-muted-foreground">Networking events overview</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Upcoming Events"
                value={upcomingEvents.length}
                change={`${hubEvents.length} total events`}
                changeType="neutral"
                icon={<CalendarDays className="size-5" />}
                sparkline={{ values: [2, 3, 4, 3, 5, 6, 7], color: "#7C3AED" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Attendees"
                value={totalAttendees}
                change="Across all events"
                changeType="positive"
                icon={<Users className="size-5" />}
                sparkline={{ values: [80, 120, 200, 280, 350, 480, 609], color: "#7C3AED" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Active Vendors"
                value={activeVendors}
                change={`${hubVendors.length} total vendors`}
                changeType="positive"
                icon={<Briefcase className="size-5" />}
                sparkline={{ values: [3, 4, 5, 6, 7, 7, 7], color: "#7C3AED" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Budget Utilized"
                value={`${budgetUtilized}%`}
                change={`${formatCurrency(totalActual)} of ${formatCurrency(totalPlanned)}`}
                changeType="neutral"
                icon={<TrendingUp className="size-5" />}
                sparkline={{ values: [0, 10, 20, 30, 40, 50, budgetUtilized], color: "#7C3AED" }}
              />
            </StaggerItem>
          </Stagger>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {loading ? (
              <Card>
                <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                </CardContent>
              </Card>
            ) : (
              <Fade>
                <Card data-testid="upcoming-events-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
                    <Link href="/hub/events">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer" data-testid="link-view-all-events">
                        View all <ArrowRight className="size-3" />
                      </span>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingEvents.slice(0, 5).map((event) => (
                      <Link key={event.id} href={`/hub/events/${event.id}`}>
                        <div
                          className="group flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                          data-testid={`card-event-${event.id}`}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <CalendarDays className="size-5 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="truncate text-sm font-medium text-foreground" data-testid={`text-event-name-${event.id}`}>{event.name}</p>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColorMap[event.type] || ""}`} data-testid={`badge-event-type-${event.id}`}>{event.type}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="size-3" />{event.venue}, {event.city}</span>
                              <span className="flex items-center gap-1"><Users className="size-3" />{event.totalAttendees}</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground" data-testid={`text-event-date-${event.id}`}>
                              {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <StatusBadge status={event.status} variant={statusVariantMap[event.status]} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </Fade>
            )}

            {loading ? (
              <Card className="mt-6">
                <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </CardContent>
              </Card>
            ) : (
              <Fade delay={0.1}>
                <Card className="mt-6" data-testid="completed-events-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Recently Completed</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {completedEvents.map((event) => {
                      const rate = event.totalAttendees > 0 ? Math.round((event.checkedIn / event.totalAttendees) * 100) : 0;
                      return (
                        <div key={event.id} className="space-y-1" data-testid={`row-completed-${event.id}`}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">{event.name}</span>
                            <span className="text-muted-foreground text-xs">{event.checkedIn}/{event.totalAttendees} checked in</span>
                          </div>
                          <Progress value={rate} className="h-1.5" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </Fade>
            )}
          </div>

          <div className="space-y-6">
            {loading ? (
              <>
                <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
              </>
            ) : (
              <>
                <Fade delay={0.15}>
                  <Card data-testid="this-week-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {thisWeekEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No events this week</p>
                      ) : (
                        <div className="space-y-3">
                          {thisWeekEvents.map((event) => {
                            const diff = Math.ceil((new Date(event.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                            return (
                              <div key={event.id} className="flex items-center justify-between" data-testid={`row-week-event-${event.id}`}>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{event.name}</p>
                                  <p className="text-xs text-muted-foreground">{event.city}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0 text-xs border-violet-300 text-violet-700 dark:text-violet-400">
                                  {diff === 0 ? "Today" : `in ${diff}d`}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Fade>

                <Fade delay={0.2}>
                  <Card data-testid="vendor-status-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <CardTitle className="text-base font-semibold">Vendor Status</CardTitle>
                      <Link href="/hub/vendors">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer" data-testid="link-vendors">
                          All <ArrowRight className="size-3" />
                        </span>
                      </Link>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {hubVendors.slice(0, 5).map((vendor) => (
                        <div key={vendor.id} className="flex items-center justify-between" data-testid={`row-vendor-${vendor.id}`}>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{vendor.name}</p>
                            <p className="text-xs text-muted-foreground">{vendor.category}</p>
                          </div>
                          <StatusBadge
                            status={vendor.status}
                            variant={vendor.status === "active" ? "success" : vendor.status === "pending" ? "warning" : "neutral"}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </Fade>

                <Fade delay={0.25}>
                  <Card data-testid="organizer-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">Organizers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Array.from(new Set(hubEvents.map((e) => e.organizer))).map((organizer) => {
                        const count = hubEvents.filter((e) => e.organizer === organizer).length;
                        return (
                          <div key={organizer} className="flex items-center gap-3" data-testid={`row-organizer-${organizer.replace(/\s+/g, "-").toLowerCase()}`}>
                            <img
                              src={getPersonAvatar(organizer)}
                              alt={organizer}
                              className="size-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">{organizer}</p>
                              <p className="text-xs text-muted-foreground">{count} event{count !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </Fade>
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
