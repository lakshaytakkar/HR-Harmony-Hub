import { BookOpen, Users, BarChart3, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/hr/status-badge";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { courses } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";

export default function CoursesPage() {
  const loading = useSimulatedLoading();

  const totalEnrolled = courses.reduce((s, c) => s + c.enrolled, 0);
  const publishedCount = courses.filter((c) => c.status === "published").length;
  const avgCompletion = Math.round(
    courses.filter((c) => c.status === "published").reduce((s, c) => s + c.completionRate, 0) / publishedCount
  );
  const totalLessons = courses.reduce((s, c) => s + c.lessons, 0);

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
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
                title="Total Courses"
                value={courses.length}
                change={`${publishedCount} published`}
                changeType="neutral"
                icon={<BookOpen className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Enrolled"
                value={totalEnrolled.toLocaleString()}
                change="+18% this month"
                changeType="positive"
                icon={<Users className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Avg Completion"
                value={`${avgCompletion}%`}
                change="+5% improvement"
                changeType="positive"
                icon={<BarChart3 className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Lessons"
                value={totalLessons}
                change={`${courses.length} courses`}
                changeType="neutral"
                icon={<GraduationCap className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-background p-5">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Fade direction="up" delay={0.15} className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="p-5 hover-elevate"
                  data-testid={`card-course-${course.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate" data-testid={`text-course-title-${course.id}`}>
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{course.instructor}</p>
                    </div>
                    <StatusBadge
                      status={course.status === "published" ? "Published" : "Draft"}
                      variant={course.status === "published" ? "success" : "neutral"}
                    />
                  </div>
                  <div className="mt-3">
                    <Badge variant="secondary" className="text-xs">
                      {course.category}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold" data-testid={`text-lessons-${course.id}`}>
                        {course.lessons}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Lessons</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold" data-testid={`text-enrolled-${course.id}`}>
                        {course.enrolled.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Enrolled</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold" data-testid={`text-completion-${course.id}`}>
                        {course.completionRate}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">Completion</span>
                    </div>
                  </div>
                  {course.status === "published" && (
                    <div className="mt-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Fade>
        )}
      </PageTransition>
    </div>
  );
}
