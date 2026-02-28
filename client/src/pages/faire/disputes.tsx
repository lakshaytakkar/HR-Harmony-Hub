import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireDisputes, faireStores, type DisputeStatus } from "@/lib/mock-data-faire";

const BRAND_COLOR = "#1A6B45";

const statusConfig: Record<DisputeStatus, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "#DC2626", bg: "#FEF2F2" },
  escalated: { label: "Escalated", color: "#D97706", bg: "#FFFBEB" },
  resolved: { label: "Resolved", color: "#059669", bg: "#ECFDF5" },
};

export default function FaireDisputes() {
  const isLoading = useSimulatedLoading(650);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<DisputeStatus | "all">("open");
  const [respondId, setRespondId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [markResolved, setMarkResolved] = useState(false);

  const openCount = faireDisputes.filter(d => d.status === "open").length;
  const escalatedCount = faireDisputes.filter(d => d.status === "escalated").length;
  const resolvedCount = faireDisputes.filter(d => d.status === "resolved").length;
  const totalAmount = faireDisputes.filter(d => d.status !== "resolved").reduce((s, d) => s + d.amount, 0);

  const filtered = activeTab === "all" ? faireDisputes : faireDisputes.filter(d => d.status === activeTab);

  const respondDispute = faireDisputes.find(d => d.id === respondId);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}</div>
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div>
          <h1 className="text-2xl font-bold font-heading">Disputes & Claims</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage order disputes and retailer claims</p>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Open Disputes", value: openCount, color: "#DC2626", bg: "#FEF2F2" },
            { label: "Escalated", value: escalatedCount, color: "#D97706", bg: "#FFFBEB" },
            { label: "Resolved", value: resolvedCount, color: "#059669", bg: "#ECFDF5" },
            { label: "$ In Dispute", value: `$${totalAmount}`, color: "#7C3AED", bg: "#F5F3FF" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border p-3" style={{ background: s.bg }} data-testid={`dispute-stat-${i}`}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-1">
          {(["open", "escalated", "resolved"] as DisputeStatus[]).map(s => (
            <button key={s} onClick={() => setActiveTab(s)} className={`px-4 py-1.5 text-xs rounded-lg border transition-colors font-medium ${activeTab === s ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={activeTab === s ? { background: BRAND_COLOR } : {}} data-testid={`tab-${s}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({s === "open" ? openCount : s === "escalated" ? escalatedCount : resolvedCount})
            </button>
          ))}
        </div>
      </Fade>

      {filtered.length === 0 && (
        <Fade>
          <div className="text-center py-12 text-sm text-muted-foreground">
            <AlertTriangle size={36} className="mx-auto mb-3 opacity-30" />
            No {activeTab} disputes.
          </div>
        </Fade>
      )}

      <Stagger>
        <div className="space-y-3">
          {filtered.map(dispute => {
            const store = faireStores.find(s => s.id === dispute.storeId);
            const sc = statusConfig[dispute.status];
            const isOpen = dispute.status === "open";
            const isEscalated = dispute.status === "escalated";
            return (
              <StaggerItem key={dispute.id}>
                <div className={`rounded-xl border p-4 ${isOpen ? "border-red-200" : isEscalated ? "border-amber-300" : "border-border"}`} data-testid={`dispute-card-${dispute.id}`}>
                  <div className="flex items-start gap-3">
                    <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${isOpen ? "bg-red-100" : isEscalated ? "bg-amber-100" : "bg-emerald-50"}`}>
                      <AlertTriangle size={16} className={isOpen ? "text-red-600" : isEscalated ? "text-amber-600" : "text-emerald-600"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-[9px] font-mono">{dispute.order_number}</Badge>
                        <Badge variant="outline" className="text-[10px]">{store?.name.split(" ")[0]}</Badge>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                        {dispute.priority === "high" && <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-red-100 text-red-700">HIGH PRIORITY</span>}
                      </div>
                      <p className="text-sm font-semibold">{dispute.retailer_name}</p>
                      <p className="text-xs text-muted-foreground mb-1">Reason: <span className="font-medium text-foreground">{dispute.reason}</span></p>
                      <p className="text-xs text-muted-foreground">{dispute.description}</p>
                      {dispute.amount > 0 && <p className="text-xs font-semibold mt-1">Amount disputed: ${dispute.amount}</p>}
                      {dispute.status === "resolved" && dispute.resolution && (
                        <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded text-xs">
                          <span className="font-medium text-emerald-700">Resolution: </span>
                          <span className="text-muted-foreground">{dispute.resolution}</span>
                          {dispute.resolved_at && <p className="text-[10px] text-muted-foreground mt-0.5">Resolved {new Date(dispute.resolved_at).toLocaleDateString()}</p>}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <p className="text-[10px] text-muted-foreground">{new Date(dispute.created_at).toLocaleDateString()}</p>
                      {(isOpen || isEscalated) && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setRespondId(dispute.id); setResolution(""); setMarkResolved(false); }} data-testid={`btn-respond-${dispute.id}`}>Respond</Button>
                          {isOpen && (
                            <Button size="sm" variant="outline" className="h-7 text-xs text-amber-600 border-amber-300" onClick={() => toast({ title: "Escalated", description: `Dispute ${dispute.order_number} escalated.` })} data-testid={`btn-escalate-${dispute.id}`}>Escalate</Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </div>
      </Stagger>

      <Dialog open={!!respondId} onOpenChange={() => setRespondId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Respond to Dispute — {respondDispute?.order_number}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{respondDispute?.retailer_name}</span>: {respondDispute?.description}</p>
            <div className="space-y-1.5">
              <Label>Your Resolution / Response</Label>
              <textarea className="w-full h-24 border rounded-lg px-3 py-2 text-sm resize-none" value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Describe how you're resolving this dispute..." data-testid="textarea-resolution" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={markResolved} onChange={e => setMarkResolved(e.target.checked)} className="rounded" data-testid="check-resolved" />
              <span className="text-sm">Mark as resolved</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondId(null)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: markResolved ? "Dispute Resolved" : "Response Sent", description: markResolved ? "Dispute marked as resolved." : "Your response was sent to the retailer." }); setRespondId(null); }} data-testid="btn-save-response">
              {markResolved ? "Mark Resolved" : "Send Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
