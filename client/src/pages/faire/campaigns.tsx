import { useState } from "react";
import { Plus } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireCampaigns, faireStores, type CampaignType, type CampaignStatus } from "@/lib/mock-data-faire";

const BRAND_COLOR = "#1A6B45";

const typeConfig: Record<CampaignType, { label: string; color: string; bg: string }> = {
  sale: { label: "Sale", color: "#DC2626", bg: "#FEF2F2" },
  featured: { label: "Featured", color: "#7C3AED", bg: "#F5F3FF" },
  new_arrival: { label: "New Arrival", color: "#2563EB", bg: "#EFF6FF" },
  custom: { label: "Custom", color: "#D97706", bg: "#FFFBEB" },
};

const statusConfig: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#059669", bg: "#ECFDF5" },
  scheduled: { label: "Scheduled", color: "#2563EB", bg: "#EFF6FF" },
  ended: { label: "Ended", color: "#6B7280", bg: "#F9FAFB" },
  draft: { label: "Draft", color: "#D97706", bg: "#FFFBEB" },
};

export default function FaireCampaigns() {
  const isLoading = useSimulatedLoading(650);
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<CampaignType>("sale");
  const [newStore, setNewStore] = useState(faireStores[0].id);
  const [newDiscount, setNewDiscount] = useState("");
  const [newMinOrder, setNewMinOrder] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const filtered = faireCampaigns.filter(c => {
    if (selectedStore !== "all" && c.storeId !== selectedStore) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const activeCampaigns = faireCampaigns.filter(c => c.status === "active").length;
  const scheduledCampaigns = faireCampaigns.filter(c => c.status === "scheduled").length;
  const totalRevenue = faireCampaigns.reduce((s, c) => s + c.revenue_attributed, 0);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}</div>
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Campaigns & Promotions</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Faire promotional campaigns across all stores</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" data-testid="btn-create-campaign">
            <Plus size={15} className="mr-1.5" /> Create Campaign
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active Campaigns", value: activeCampaigns, color: BRAND_COLOR, bg: "#ECFDF5" },
            { label: "Scheduled", value: scheduledCampaigns, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Revenue Attributed", value: `$${totalRevenue.toLocaleString()}`, color: "#7C3AED", bg: "#F5F3FF" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border p-3" style={{ background: s.bg }} data-testid={`campaign-stat-${i}`}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-2">
          <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="h-8 text-xs border rounded-lg px-2" data-testid="select-store">
            <option value="all">All Stores</option>
            {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex gap-1">
            {(["all", "active", "scheduled", "ended", "draft"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${statusFilter === s ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={statusFilter === s ? { background: BRAND_COLOR } : {}} data-testid={`filter-${s}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Fade>

      <Stagger>
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(campaign => {
            const store = faireStores.find(s => s.id === campaign.storeId);
            const tc = typeConfig[campaign.type];
            const sc = statusConfig[campaign.status];
            return (
              <StaggerItem key={campaign.id}>
                <Card className="h-full" data-testid={`campaign-card-${campaign.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{campaign.name}</h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium ml-2 shrink-0" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </div>
                    <div className="flex gap-1.5 mb-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
                      <Badge variant="outline" className="text-[10px]">{store?.name.split(" ")[0]}</Badge>
                    </div>
                    {campaign.discount_percent && (
                      <p className="text-xs text-muted-foreground mb-2">{campaign.discount_percent}% off {campaign.discount_min_order ? `· Min order $${campaign.discount_min_order}` : ""}</p>
                    )}
                    <p className="text-xs text-muted-foreground mb-3">{campaign.description}</p>
                    <div className="text-[10px] text-muted-foreground mb-3">
                      {new Date(campaign.start_date).toLocaleDateString()} → {new Date(campaign.end_date).toLocaleDateString()}
                    </div>
                    {campaign.impressions > 0 && (
                      <div className="grid grid-cols-4 gap-1 pt-2 border-t">
                        {[
                          { label: "Impr.", value: campaign.impressions.toLocaleString() },
                          { label: "Clicks", value: campaign.clicks.toLocaleString() },
                          { label: "Orders", value: campaign.orders_attributed },
                          { label: "Revenue", value: `$${campaign.revenue_attributed.toLocaleString()}` },
                        ].map((m, i) => (
                          <div key={i} className="text-center">
                            <p className="text-xs font-bold">{m.value}</p>
                            <p className="text-[9px] text-muted-foreground">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-sm text-muted-foreground">No campaigns match your filters.</div>
          )}
        </div>
      </Stagger>

      <Dialog open={createOpen} onOpenChange={() => setCreateOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Campaign Name</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Spring Sale 2026" data-testid="input-name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Type</Label>
                <select value={newType} onChange={e => setNewType(e.target.value as CampaignType)} className="w-full h-9 border rounded-lg px-3 text-sm" data-testid="select-type">
                  <option value="sale">Sale</option><option value="featured">Featured</option><option value="new_arrival">New Arrival</option><option value="custom">Custom</option>
                </select>
              </div>
              <div className="space-y-1.5"><Label>Store</Label>
                <select value={newStore} onChange={e => setNewStore(e.target.value)} className="w-full h-9 border rounded-lg px-3 text-sm" data-testid="select-store-create">
                  {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Discount % (optional)</Label><Input type="number" value={newDiscount} onChange={e => setNewDiscount(e.target.value)} placeholder="e.g. 15" data-testid="input-discount" /></div>
              <div className="space-y-1.5"><Label>Min Order $ (optional)</Label><Input type="number" value={newMinOrder} onChange={e => setNewMinOrder(e.target.value)} placeholder="e.g. 200" data-testid="input-min-order" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Start Date</Label><Input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} data-testid="input-start" /></div>
              <div className="space-y-1.5"><Label>End Date</Label><Input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} data-testid="input-end" /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><textarea className="w-full h-16 border rounded-lg px-3 py-2 text-sm resize-none" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Describe the campaign..." data-testid="input-desc" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Campaign Created", description: newName }); setCreateOpen(false); setNewName(""); setNewDiscount(""); setNewMinOrder(""); setNewStart(""); setNewEnd(""); setNewDesc(""); }} data-testid="btn-save-campaign">Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
