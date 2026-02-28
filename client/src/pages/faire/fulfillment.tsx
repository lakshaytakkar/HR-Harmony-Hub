import { useState } from "react";
import { Printer, Truck } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireOrders, faireStores } from "@/lib/mock-data-faire";

const BRAND_COLOR = "#1A6B45";
const CARRIERS = ["UPS", "FedEx", "USPS", "DHL"];

function getAge(dateStr: string) {
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

export default function FaireFulfillment() {
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [shipOrderId, setShipOrderId] = useState<string | null>(null);
  const [carrier, setCarrier] = useState("UPS");
  const [tracking, setTracking] = useState("");
  const [packageCount, setPackageCount] = useState("1");
  const [weight, setWeight] = useState("");

  const queue = faireOrders
    .filter(o => o.state === "NEW" || o.state === "PRE_TRANSIT")
    .filter(o => selectedStore === "all" || o.storeId === selectedStore)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Fulfillment Queue</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Orders ready to pack and ship — sorted oldest first</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="h-8 text-xs border rounded-lg px-2" data-testid="select-store">
              <option value="all">All Stores</option>
              {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Packing Slips", description: "Printing all packing slips..." })} data-testid="btn-print-all">
              <Printer size={13} className="mr-1.5" /> Print All Packing Slips
            </Button>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-4">
          <div className="rounded-xl border px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
            <p className="text-lg font-bold text-amber-700">{queue.filter(o => o.state === "NEW").length}</p>
            <p className="text-xs text-muted-foreground">To Pack</p>
          </div>
          <div className="rounded-xl border px-4 py-3 bg-violet-50 dark:bg-violet-950/20 border-violet-200">
            <p className="text-lg font-bold text-violet-700">{queue.filter(o => o.state === "PRE_TRANSIT").length}</p>
            <p className="text-xs text-muted-foreground">Awaiting Pickup</p>
          </div>
        </div>
      </Fade>

      {queue.length === 0 && (
        <Fade>
          <div className="text-center py-16 text-muted-foreground">
            <Truck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Fulfillment queue is empty. All orders are shipped!</p>
          </div>
        </Fade>
      )}

      <Stagger>
        <div className="space-y-3">
          {queue.map(order => {
            const store = faireStores.find(s => s.id === order.storeId);
            const isNew = order.state === "NEW";
            return (
              <StaggerItem key={order.id}>
                <div className={`rounded-xl border p-4 flex items-start gap-4 ${isNew ? "border-amber-300 bg-amber-50/40 dark:bg-amber-950/10" : "border-violet-300 bg-violet-50/40 dark:bg-violet-950/10"}`} data-testid={`fulfillment-card-${order.id}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-[9px] font-mono">{order.order_number}</Badge>
                      <Badge variant="outline" className="text-[10px]">{store?.name.split(" ")[0]}</Badge>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isNew ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700"}`}>
                        {isNew ? "New — Pack Now" : "Pre-Transit — Awaiting Pickup"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold">{order.retailer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.retailer_city}, {order.retailer_state}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                      <span className="font-semibold text-foreground">${order.total}</span>
                      <span>Ordered {getAge(order.created_at)}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {order.items.map(item => (
                        <p key={item.id} className="text-[10px] text-muted-foreground">• {item.product_name} — {item.variant_name} × {item.quantity}</p>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    style={{ background: BRAND_COLOR }}
                    className="text-white hover:opacity-90 shrink-0"
                    onClick={() => { setShipOrderId(order.id); setCarrier("UPS"); setTracking(""); setPackageCount("1"); setWeight(""); }}
                    data-testid={`btn-ship-${order.id}`}
                  >
                    <Truck size={13} className="mr-1.5" /> Mark as Shipped
                  </Button>
                </div>
              </StaggerItem>
            );
          })}
        </div>
      </Stagger>

      <Dialog open={!!shipOrderId} onOpenChange={() => setShipOrderId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Shipment</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Carrier</Label>
              <select value={carrier} onChange={e => setCarrier(e.target.value)} className="w-full h-9 border rounded-lg px-3 text-sm" data-testid="select-carrier">
                {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Tracking Number</Label>
              <Input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking number..." data-testid="input-tracking" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Package Count</Label>
                <Input type="number" value={packageCount} onChange={e => setPackageCount(e.target.value)} min="1" data-testid="input-packages" />
              </div>
              <div className="space-y-1.5">
                <Label>Weight (oz)</Label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 48" data-testid="input-weight" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipOrderId(null)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Shipment Recorded", description: `${carrier} — ${tracking || "No tracking"}. Order moved to In-Transit.` }); setShipOrderId(null); }} data-testid="btn-confirm-ship">Record Shipment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
