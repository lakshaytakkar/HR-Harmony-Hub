import { useState } from "react";
import { useLocation } from "wouter";
import { Filter, MessageSquare, Phone } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { faireRetailerLeads, type RetailerLeadStage } from "@/lib/mock-data-faire";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";

const BRAND_COLOR = "#1A6B45";

export default function FaireLeads() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(600);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<RetailerLeadStage | "All">("All");

  const filtered = faireRetailerLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                          lead.storeType.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "All" || lead.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </StatGrid>
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  const stages: (RetailerLeadStage | "All")[] = ["All", "Prospect", "Outreach", "Demo Scheduled", "Proposal Sent", "Partner Signed"];

  const stats = [
    { label: "Total Leads", value: faireRetailerLeads.length },
    { label: "New Leads", value: faireRetailerLeads.filter(l => l.stage === "Prospect").length },
    { label: "Conversion Rate", value: `${Math.round((faireRetailerLeads.filter(l => l.stage === "Partner Signed").length / faireRetailerLeads.length) * 100)}%` },
    { label: "Pipeline Value", value: `$${(faireRetailerLeads.reduce((acc, curr) => acc + curr.dealValue, 0) / 1000).toFixed(1)}k` },
  ];

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Retailer Leads"
          subtitle="Prospective retail partners in the acquisition funnel"
          actions={
            <Button style={{ backgroundColor: BRAND_COLOR }} className="text-white hover-elevate" data-testid="button-add-lead">
              Add New Lead
            </Button>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              label={stat.label}
              value={stat.value}
              icon={Filter}
              iconBg="rgba(26, 107, 69, 0.1)"
              iconColor={BRAND_COLOR}
            />
          ))}
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search retailers..."
          color={BRAND_COLOR}
          filters={stages.map(s => ({ value: s, label: s }))}
          activeFilter={stageFilter}
          onFilter={(v) => setStageFilter(v as any)}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Retailer</DataTH>
                <DataTH>Location</DataTH>
                <DataTH>Source</DataTH>
                <DataTH>Stage</DataTH>
                <DataTH>Last Contact</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((lead) => (
                <DataTR key={lead.id} className="group">
                  <DataTD>
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-xs text-muted-foreground">{lead.storeType}</div>
                  </DataTD>
                  <DataTD className="text-muted-foreground">{lead.location}</DataTD>
                  <DataTD>
                    <Badge variant="outline" className="font-normal">{lead.source}</Badge>
                  </DataTD>
                  <DataTD>
                    <Badge 
                      className="font-medium"
                      style={{ 
                        backgroundColor: lead.stage === "Partner Signed" ? BRAND_COLOR : "transparent",
                        color: lead.stage === "Partner Signed" ? "white" : "inherit",
                        border: lead.stage === "Partner Signed" ? "none" : "1px solid currentColor"
                      }}
                    >
                      {lead.stage}
                    </Badge>
                  </DataTD>
                  <DataTD className="text-muted-foreground">{lead.lastContact}</DataTD>
                  <DataTD align="right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8" data-testid={`button-view-pipeline-${lead.id}`} onClick={() => setLocation("/faire/pipeline")}>
                        <Filter size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" data-testid={`button-contact-${lead.id}`}>
                        <Phone size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" data-testid={`button-message-${lead.id}`}>
                        <MessageSquare size={14} />
                      </Button>
                    </div>
                  </DataTD>
                </DataTR>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>
    </PageShell>
  );
}
