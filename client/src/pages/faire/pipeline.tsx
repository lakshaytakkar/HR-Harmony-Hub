import { useState } from "react";
import { Plus, MoreHorizontal, DollarSign, Calendar } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { faireRetailerLeads, type RetailerLeadStage } from "@/lib/mock-data-faire";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DetailModal,
} from "@/components/layout";

const BRAND_COLOR = "#1A6B45";

const stages: RetailerLeadStage[] = ["Prospect", "Outreach", "Demo Scheduled", "Proposal Sent", "Partner Signed"];

export default function FairePipeline() {
  const isLoading = useSimulatedLoading(600);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 bg-muted rounded w-full" />
              <div className="h-32 bg-muted rounded-xl w-full" />
              <div className="h-32 bg-muted rounded-xl w-full" />
            </div>
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="overflow-hidden flex flex-col h-full">
      <Fade>
        <PageHeader
          title="Retailer Pipeline"
          subtitle="Manage the acquisition funnel for new retail partners"
          actions={
            <Button 
              style={{ backgroundColor: BRAND_COLOR }} 
              className="text-white hover-elevate" 
              data-testid="button-add-pipeline-lead"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
          }
        />
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Filter by retailer name..."
          color={BRAND_COLOR}
        />
      </Fade>

      <Fade className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px] h-full">
          {stages.map((stage) => {
            const stageLeads = faireRetailerLeads.filter(l => 
              l.stage === stage && 
              (search === "" || l.name.toLowerCase().includes(search.toLowerCase()))
            );
            const stageTotalValue = stageLeads.reduce((acc, curr) => acc + curr.dealValue, 0);

            return (
              <div key={stage} className="flex-1 flex flex-col min-w-[240px]">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{stage}</h3>
                    <Badge variant="secondary" className="rounded-full h-5 px-1.5 text-[10px]">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Value: ${stageTotalValue.toLocaleString()}</p>
                </div>

                <div className="bg-muted/30 rounded-xl p-2 flex-1 flex flex-col gap-3 min-h-[500px]">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="hover-elevate cursor-grab active:cursor-grabbing" data-testid={`lead-card-${lead.id}`}>
                      <CardContent className="p-3 space-y-3">
                        <div>
                          <p className="font-bold text-sm leading-tight">{lead.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{lead.storeType}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center text-[10px] text-emerald-600 font-bold">
                            <DollarSign size={10} className="mr-0.5" />
                            {lead.dealValue.toLocaleString()}
                          </div>
                          <div className="flex items-center text-[10px] text-muted-foreground">
                            <Calendar size={10} className="mr-1" />
                            {lead.daysInStage}d
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-muted">
                          <Badge variant="outline" className="text-[9px] font-normal py-0">
                            {lead.source}
                          </Badge>
                          <Button size="icon" variant="ghost" className="h-6 w-6">
                            <MoreHorizontal size={12} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Fade>

      <DetailModal
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Add New Retailer Lead"
        subtitle="Create a prospective partner entry"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => setIsAddDialogOpen(false)} data-testid="btn-create-lead">Create Lead</Button>
          </>
        }
      >
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Retailer</Label>
            <Input placeholder="Store Name" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Store Type</Label>
            <Input placeholder="Boutique, Gift Shop, etc." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deal Value</Label>
            <Input type="number" placeholder="5000" />
          </div>
        </div>
      </DetailModal>
    </PageShell>
  );
}
