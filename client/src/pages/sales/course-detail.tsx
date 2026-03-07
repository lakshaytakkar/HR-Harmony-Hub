import { useParams } from "wouter";
import { BookOpen, Users, Clock, Star, GraduationCap, Globe, BarChart3, Calendar, Video, FileText, HelpCircle, Dumbbell, ThumbsUp, ArrowLeft, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageShell } from "@/components/layout";
import { PageTransition } from "@/components/ui/animated";
import {
  DetailBanner,
  InfoPropertyGrid,
  TabContainer,
  ExpandableList,
  StackedList,
} from "@/components/blocks";
import type { ExpandableListItem, StackedListItem } from "@/components/blocks";
import { getCourseDetail } from "@/lib/mock-data-lms";
import { SALES_COLOR } from "@/lib/sales-config";
import { useLocation } from "wouter";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  const iconSize = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";

  return (
    <div className="flex items-center gap-0.5" data-testid="star-rating">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i < full
              ? "fill-yellow-400 text-yellow-400"
              : i === full && partial > 0
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function LessonTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "video":
      return <Video className="h-3.5 w-3.5 text-blue-500" />;
    case "quiz":
      return <HelpCircle className="h-3.5 w-3.5 text-orange-500" />;
    case "article":
      return <FileText className="h-3.5 w-3.5 text-green-500" />;
    case "exercise":
      return <Dumbbell className="h-3.5 w-3.5 text-purple-500" />;
    default:
      return <Play className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const course = getCourseDetail(params.id || "");

  if (!course) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="course-not-found">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">Course not found</h2>
          <p className="text-sm text-muted-foreground mt-1">The course you are looking for does not exist.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/usdrop/courses")} data-testid="button-back-courses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </PageShell>
    );
  }

  const overviewProperties = [
    { label: "Category", value: course.category, icon: BookOpen },
    { label: "Level", value: course.level, icon: BarChart3 },
    { label: "Duration", value: course.duration, icon: Clock },
    { label: "Language", value: course.language, icon: Globe },
    { label: "Lessons", value: `${course.lessonsCount} lessons`, icon: GraduationCap },
    { label: "Last Updated", value: course.lastUpdated, icon: Calendar },
    { label: "Price", value: `$${course.price.toFixed(2)}`, icon: Star },
    { label: "Enrolled", value: course.enrolled.toLocaleString(), icon: Users },
  ];

  const curriculumItems: ExpandableListItem[] = course.modules.map((mod) => ({
    id: mod.id,
    icon: BookOpen,
    iconBg: `${SALES_COLOR}15`,
    iconColor: SALES_COLOR,
    title: mod.title,
    subtitle: `${mod.lessonsCount} lessons · ${mod.duration}`,
    badge: (
      <Badge variant="secondary" className="text-[10px]">
        {mod.lessonsCount} lessons
      </Badge>
    ),
    content: (
      <div className="space-y-1">
        {mod.lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between gap-3 py-2 px-2 rounded-md hover-elevate"
            data-testid={`lesson-row-${lesson.id}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <LessonTypeIcon type={lesson.type} />
              <span className="text-sm truncate">{lesson.title}</span>
              {lesson.isPreview && (
                <Badge variant="outline" className="text-[10px] shrink-0">
                  Preview
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{lesson.duration}</span>
          </div>
        ))}
      </div>
    ),
  }));

  const studentItems: StackedListItem[] = course.students.map((s) => ({
    id: s.id,
    title: s.name,
    subtitle: s.email,
    fallback: s.name.slice(0, 2).toUpperCase(),
    meta: (
      <div className="flex items-center gap-3">
        <div className="w-24">
          <Progress value={s.progress} className="h-1.5" />
        </div>
        <span className="text-xs font-medium w-10 text-right">{s.progress}%</span>
      </div>
    ),
    actions: (
      <span className="text-xs text-muted-foreground">{s.lastActive}</span>
    ),
  }));

  const reviewItems: StackedListItem[] = course.reviews.map((r) => ({
    id: r.id,
    title: r.studentName,
    fallback: r.studentName.slice(0, 2).toUpperCase(),
    subtitle: r.date,
    meta: (
      <div className="flex items-center gap-2">
        <StarRating rating={r.rating} />
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {r.helpful}
        </span>
      </div>
    ),
    actions: (
      <p className="text-xs text-muted-foreground max-w-xs truncate">{r.comment}</p>
    ),
  }));

  const avgRating = course.rating;
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = course.reviews.filter((r) => r.rating === stars).length;
    return { stars, count, pct: course.reviews.length > 0 ? Math.round((count / course.reviews.length) * 100) : 0 };
  });

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <InfoPropertyGrid properties={overviewProperties} columns={4} />
          <div data-testid="course-description">
            <h3 className="text-sm font-semibold mb-2">About this course</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
          </div>
        </div>
      ),
    },
    {
      value: "curriculum",
      label: "Curriculum",
      icon: GraduationCap,
      badge: course.modules.length,
      content: (
        <ExpandableList
          items={curriculumItems}
          defaultOpen={[course.modules[0]?.id || ""]}
        />
      ),
    },
    {
      value: "students",
      label: "Students",
      icon: Users,
      badge: course.enrolled,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              Showing {course.students.length} of {course.enrolled.toLocaleString()} enrolled students
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Avg completion:</span>
              <span className="font-medium">{course.completionRate}%</span>
            </div>
          </div>
          <StackedList items={studentItems} />
        </div>
      ),
    },
    {
      value: "reviews",
      label: "Reviews",
      icon: Star,
      badge: course.reviewCount,
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-8 flex-wrap">
            <div className="text-center" data-testid="rating-summary">
              <div className="text-4xl font-bold">{avgRating}</div>
              <StarRating rating={avgRating} size="md" />
              <p className="text-xs text-muted-foreground mt-1">{course.reviewCount} reviews</p>
            </div>
            <div className="flex-1 min-w-48 space-y-2">
              {ratingDistribution.map((d) => (
                <div key={d.stars} className="flex items-center gap-2" data-testid={`rating-bar-${d.stars}`}>
                  <span className="text-xs w-3 text-right">{d.stars}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <StackedList items={reviewItems} />
        </div>
      ),
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate("/usdrop/courses")} data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>

        <DetailBanner
          title={course.title}
          subtitle={`by ${course.instructor}`}
          avatarFallback={course.title.slice(0, 2)}
          badges={[
            { label: course.status === "published" ? "Published" : "Draft", variant: course.status === "published" ? "default" : "secondary" },
            { label: course.category, variant: "outline" },
            { label: course.level, variant: "secondary" },
          ]}
          chips={[
            { label: "Enrolled", value: course.enrolled.toLocaleString(), icon: Users },
            { label: "Completion", value: `${course.completionRate}%`, icon: BarChart3 },
            { label: "Rating", value: `${course.rating} / 5`, icon: Star },
            { label: "Duration", value: course.duration, icon: Clock },
          ]}
        />

        <div className="mt-6">
          <TabContainer tabs={tabs} defaultTab="overview" />
        </div>
      </PageTransition>
    </PageShell>
  );
}
