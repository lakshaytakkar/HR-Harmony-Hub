import { useLocation } from "wouter";
import {
  TrendingUp, Users, DollarSign, Target, Award, BarChart2,
  Phone, Mail, MessageCircle, CalendarCheck, CheckSquare, FileText,
  ChevronRight, ArrowUpRight, Circle,
} from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import {
  crmDeals, crmActivities, teamPerformance, ALL_VERTICALS_IN_CRM,
  type CrmDeal, type CrmActivity,
} from "@/lib/mock-data-crm";

const BRAND = "#0369A1";

const stageOrder = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"] as const;
const stageLabels: Record<string, string> = {
  new: "New Lead", contacted: "Contacted", qualified: "Qualified",
  proposal: "Proposal Sent", negotiation: "Negotiation", won: "Won", lost: "Lost",
};
const stageCounts = stageOrder.map(s => ({ stage: s, count: crmDeals.filter(d => d.stage === s).length }));

const activityIcons: Record<string, { icon: typeof Phone; color: string; bg: string }> = {
  call: { icon: Phone, color: "text-blue-600", bg: "bg-blue-50" },
  email: { icon: Mail, color: "text-slate-600", bg: "bg-slate-50" },
  whatsapp: { icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  meeting: { icon: CalendarCheck, color: "text-amber-600", bg: "bg-amber-50" },
  task: { icon: CheckSquare, color: "text-violet-600", bg: "bg-violet-50" },
  note: { icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
};

function formatINR(v: number, currency?: string) {
  if (currency === "USD") return `$${(v / 1000).toFixed(0)}K`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${(v / 1000).toFixed(0)}K`;
}

const wonDeals = crmDeals.filter(d => d.stage === "won");
const activeDeals = crmDeals.filter(d => !["won", "lost"].includes(d.stage));
const totalPipeline = activeDeals.reduce((sum, d) => sum + (d.currency === "INR" ? d.value : d.value * 83), 0);
const totalWon = wonDeals.reduce((sum, d) => sum + (d.currency === "INR" ? d.value : d.value * 83), 0);
const allWon = crmDeals.filter(d => d.stage === "won").length;
const allLost = crmDeals.filter(d => d.stage === "lost").length;
const winRate = Math.round((allWon / (allWon + allLost)) * 100);
const avgDeal = Math.round(totalWon / (wonDeals.length || 1));

const topDeals: CrmDeal[] = activeDeals
  .sort((a, b) => {
    const av = a.currency === "INR" ? a.value : a.value * 83;
    const bv = b.currency === "INR" ? b.value : b.value * 83;
    return bv - av;
  })
  .slice(0, 5);

const recentActivities: CrmActivity[] = [...crmActivities]
  .sort((a, b) => {
    const ta = a.completedAt || a.scheduledAt || "";
    const tb = b.completedAt || b.scheduledAt || "";
    return tb.localeCompare(ta);
  })
  .slice(0, 8);

const topPerformers = [...teamPerformance].sort((a, b) => a.rank - b.rank).slice(0, 3);

const stageBadgeColor: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-sky-100 text-sky-700",
  qualified: "bg-amber-100 text-amber-700",
  proposal: "bg-blue-100 text-blue-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

const verticalLeadCount = ALL_VERTICALS_IN_CRM.map(v => ({
  ...v,
  count: crmDeals.filter(d => d.vertical === v.id).length,
})).filter(v => v.count > 0);

export default function CrmDashboard() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-36 bg-muted rounded-2xl" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>
        <div className="grid grid-cols-2 gap-6"><div className="h-48 bg-muted rounded-xl" /><div className="h-48 bg-muted rounded-xl" /></div>
        <div className="grid grid-cols-3 gap-6"><div className="h-64 bg-muted rounded-xl col-span-2" /><div className="h-64 bg-muted rounded-xl" /></div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div
          className="relative rounded-2xl overflow-hidden p-8"
          style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #0284C7 60%, #38BDF8 100%)` }}
        >
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1">Sales CRM · Cross-Vertical</p>
            <h1 className="text-3xl font-bold text-white mb-2">Sales Dashboard</h1>
            <p className="text-white/70 text-sm max-w-lg">
              <span className="text-white font-semibold">{activeDeals.length} active deals</span> worth{" "}
              <span className="text-white font-semibold">{formatINR(totalPipeline)}</span> across all verticals.{" "}
              <span className="text-white font-semibold">{wonDeals.length} deals won</span> totalling{" "}
              <span className="text-white font-semibold">{formatINR(totalWon)}</span> this quarter.
            </p>
            <div className="flex gap-3 mt-4">
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full"
                onClick={() => setLocation("/crm/pipeline")}
                data-testid="btn-view-pipeline"
              >
                View Pipeline
              </Button>
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full"
                onClick={() => setLocation("/crm/leads")}
                data-testid="btn-view-leads"
              >
                All Leads
              </Button>
            </div>
          </div>
          <div className="absolute right-8 top-6 opacity-10">
            <TrendingUp className="size-32 text-white" />
          </div>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Leads", value: crmDeals.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Active Deals", value: activeDeals.length, icon: TrendingUp, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
          { label: "Pipeline Value", value: formatINR(totalPipeline), icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
          { label: "Won This Quarter", value: wonDeals.length, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Win Rate", value: `${winRate}%`, icon: Award, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
          { label: "Avg Deal Size", value: formatINR(avgDeal), icon: BarChart2, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950" },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Fade className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Pipeline Funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {stageCounts.map(({ stage, count }) => {
                const pct = Math.round((count / crmDeals.length) * 100);
                const barColors: Record<string, string> = {
                  new: "bg-slate-400", contacted: "bg-sky-400", qualified: "bg-amber-400",
                  proposal: "bg-blue-500", negotiation: "bg-orange-400", won: "bg-emerald-500", lost: "bg-red-400",
                };
                return (
                  <div key={stage} className="flex items-center gap-3" data-testid={`funnel-stage-${stage}`}>
                    <span className="text-xs text-muted-foreground w-28 shrink-0">{stageLabels[stage]}</span>
                    <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColors[stage]}`}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-5 text-right">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Top Performers</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7 rounded-full px-3" onClick={() => setLocation("/crm/performance")} data-testid="btn-all-performance">
                  View all <ChevronRight className="size-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPerformers.map((rep, i) => (
                <div key={rep.id} className="flex items-center gap-3" data-testid={`performer-${rep.id}`}>
                  <span className="text-lg">{["🥇", "🥈", "🥉"][i]}</span>
                  <img src={getPersonAvatar(rep.name, 32)} alt={rep.name} className="size-8 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{rep.name}</p>
                    <p className="text-xs text-muted-foreground">{rep.dealsWon} won · {formatINR(rep.revenue)}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">{rep.winRate}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Fade className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Top Open Deals</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7 rounded-full px-3" onClick={() => setLocation("/crm/deals")} data-testid="btn-all-deals">
                  All deals <ChevronRight className="size-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topDeals.map((deal) => {
                  const vert = ALL_VERTICALS_IN_CRM.find(v => v.id === deal.vertical);
                  return (
                    <div
                      key={deal.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setLocation("/crm/deals")}
                      data-testid={`deal-row-${deal.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">{deal.companyName} · {deal.assignedTo}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {vert && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                            style={{ backgroundColor: vert.color }}
                          >
                            {vert.name}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadgeColor[deal.stage]}`}>
                          {stageLabels[deal.stage]}
                        </span>
                        <span className="text-sm font-bold text-foreground min-w-[60px] text-right">
                          {formatINR(deal.value, deal.currency)}
                        </span>
                        <span className="text-xs text-muted-foreground w-8 text-right">{deal.probability}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Vertical Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {verticalLeadCount.map((v) => (
                <div key={v.id} className="flex items-center gap-2.5" data-testid={`vertical-count-${v.id}`}>
                  <Circle className="size-2.5 shrink-0" style={{ fill: v.color, color: v.color }} />
                  <span className="text-xs text-muted-foreground flex-1 truncate">{v.name}</span>
                  <span className="text-xs font-semibold">{v.count} deals</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>
      </div>

      <Fade>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Activities</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7 rounded-full px-3" onClick={() => setLocation("/crm/activities")} data-testid="btn-all-activities">
                All activities <ChevronRight className="size-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((act) => {
                const cfg = activityIcons[act.type] ?? activityIcons.note;
                const Icon = cfg.icon;
                return (
                  <div key={act.id} className="flex items-start gap-3" data-testid={`activity-${act.id}`}>
                    <div className={`size-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`size-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{act.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {act.contactName} · by {act.performedBy}
                        {act.outcome && (
                          <span className="text-emerald-600 ml-1">· {act.outcome.split(".")[0]}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        act.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                        act.status === "overdue" ? "bg-red-50 text-red-700" :
                        "bg-sky-50 text-sky-700"
                      }`}>
                        {act.status}
                      </span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </Fade>
    </PageTransition>
  );
}
