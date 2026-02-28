import { CalendarDays, Users, Building2, IndianRupee, MapPin, CheckCircle2 } from "lucide-react";

import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { events, venues, attendees } from "@/lib/mock-data-events";
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

export default function EventsDashboard() {
  const loading = useSimulatedLoading();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const completedEvents = events.filter((e) => e.status === "completed");
  const upcomingCount = upcomingEvents.length;
  const totalAttendees = events.reduce((sum, e) => sum + e.totalAttendees, 0);
  const venuesBooked = venues.filter((v) => v.status === "booked").length;
  const totalBudget = events.reduce((sum, e) => sum + e.budget, 0);

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div
            className="rounded-2xl px-8 py-7 mb-6 relative overflow-hidden"
            data-testid="section-welcome"
            style={{ background: "linear-gradient(135deg, #E91E63 0%, #c21553 100%)" }}
          >
            <div className="relative z-10">
              <p className="text-white/75 text-sm font-medium mb-2">👋 {greeting}, Sneha Patel</p>
              <h1 className="text-3xl font-bold text-white font-heading tracking-tight">GoyoTours</h1>
              <p className="text-white/70 text-sm mt-1.5 max-w-2xl">China-to-India tour packages, vendor management & event coordination platform</p>
            </div>
          </div>
        </Fade>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Upcoming Events"
                value={upcomingCount}
                change={`${events.length} total events`}
                changeType="neutral"
                icon={<CalendarDays className="size-5" />}
                sparkline={{ values: [2, 3, 4, 3, 5, 4, 5], color: "#3b82f6" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Attendees"
                value={totalAttendees}
                change={`Across all events`}
                changeType="positive"
                icon={<Users className="size-5" />}
                sparkline={{ values: [100, 150, 200, 180, 250, 300, 320], color: "#10b981" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Venues Booked"
                value={venuesBooked}
                change={`${venues.length} total venues`}
                changeType="neutral"
                icon={<Building2 className="size-5" />}
                sparkline={{ values: [1, 2, 2, 3, 2, 2, 2], color: "#6366f1" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Budget"
                value={formatCurrency(totalBudget)}
                change="All events combined"
                changeType="neutral"
                icon={<IndianRupee className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="mt-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border bg-background p-5">
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.15} className="mt-6">
            <h3 className="text-base font-semibold font-heading mb-4" data-testid="text-upcoming-title">Upcoming Events</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border bg-background p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  data-testid={`card-event-${event.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 className="text-sm font-semibold" data-testid={`text-event-name-${event.id}`}>{event.name}</h4>
                    <StatusBadge status={event.type} variant="info" />
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 shrink-0" />
                      <span data-testid={`text-event-date-${event.id}`}>
                        {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {event.endDate !== event.date && ` - ${new Date(event.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" />
                      <span data-testid={`text-event-venue-${event.id}`}>{event.venue}, {event.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="size-3.5 shrink-0" />
                      <span data-testid={`text-event-attendees-${event.id}`}>{event.totalAttendees} attendees</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t pt-3">
                    <img
                      src={getPersonAvatar(event.organizer, 24)}
                      alt={event.organizer}
                      className="size-6 rounded-full"
                    />
                    <span className="text-xs font-medium" data-testid={`text-event-organizer-${event.id}`}>{event.organizer}</span>
                  </div>
                </div>
              ))}
            </div>
          </Fade>
        )}

        {loading ? (
          <div className="mt-6">
            <Skeleton className="h-5 w-48 mb-4" />
            <div className="rounded-lg border bg-background p-5">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.25} className="mt-6">
            <h3 className="text-base font-semibold font-heading mb-4" data-testid="text-completed-title">Recently Completed</h3>
            <div className="rounded-lg border bg-background">
              <div className="divide-y">
                {completedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/30"
                    data-testid={`card-completed-${event.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium" data-testid={`text-completed-name-${event.id}`}>{event.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground" data-testid={`text-checkin-ratio-${event.id}`}>
                        {event.checkedIn}/{event.totalAttendees} checked in
                      </span>
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${(event.checkedIn / event.totalAttendees) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Fade>
        )}
      </PageTransition>
    </div>
  );
}
