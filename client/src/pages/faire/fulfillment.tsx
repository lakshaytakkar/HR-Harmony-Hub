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
import { faireOrders, faireStores, faireRetailers } from "@/lib/mock-data-faire";

const BRAND_COLOR = "#1A6B45";
const CARRIERS = ["UPS", "FedEx", "USPS", "DHL"];
const SHIP_TYPES = [
  { value: "SHIP_ON_YOUR_OWN", label: "Ship on your own" },
  { value: "FAIRE_SHIPPING_LABEL", label: "Faire shipping label" },
];

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
  const [makerCostDollars, setMakerCostDollars] = useState("");
  const [shipType, setShipType] = useState("SHIP_ON_YOUR_OWN");

  const queue = faireOrders
    .filter(o => o.state === "NEW" || o.state === "PROCESSING")
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
          <div className="rounded-xl border px-4 py-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <p className="text-lg font-bold text-blue-700">{queue.filter(o => o.state === "NEW").length}</p>
            <p className="text-xs text-muted-foreground">New — To Accept</p>
          </div>
          <div className="rounded-xl border px-4 py-3 bg-violet-50 dark:bg-violet-950/20 border-violet-200">
            <p className="text-lg font-bold text-violet-700">{queue.filter(o => o.state === "PROCESSING").length}</p>
            <p className="text-xs text-muted-foreground">Processing — To Pack</p>
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
            const retailer = faireRetailers.find(r => r.id === order.retailer_id);
            const isNew = order.state === "NEW";
            const itemsTotal = order.items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
            return (
              <StaggerItem key={order.id}>
                <div className={`rounded-xl border p-4 flex items-start gap-4 ${isNew ? "border-blue-300 bg-blue-50/40 dark:bg-blue-950/10" : "border-violet-300 bg-violet-50/40 dark:bg-violet-950/10"}`} data-testid={`fulfillment-card-${order.id}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-[9px] font-mono">{order.display_id}</Badge>
                      <Badge variant="outline" className="text-[10px]">{store?.name.split(" ")[0]}</Badge>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isNew ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
                        {isNew ? "New — Accept First" : "Processing — Pack Now"}
                      </span>
                      {order.has_pending_retailer_cancellation_request && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">Cancel Requested</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold">{retailer?.store_name ?? order.retailer_id}</p>
                    <p className="text-xs text-muted-foreground">{retailer?.city}, {retailer?.state}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                      <span className="font-semibold text-foreground">${(itemsTotal / 100).toFixed(2)}</span>
                      <span>Ordered {getAge(order.created_at)}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {order.items.map(item => (
                        <p key={item.id} className="text-[10px] text-muted-foreground">• {item.product_name} — {item.variant_name} × {item.quantity}</p>
                      ))}
                    </div>
                    {order.notes && (
                      <p className="text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-950/20 rounded px-2 py-1 mt-2">Note: {order.notes}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    style={{ background: BRAND_COLOR }}
                    className="text-white hover:opacity-90 shrink-0"
                    onClick={() => { setShipOrderId(order.id); setCarrier("UPS"); setTracking(""); setMakerCostDollars(""); setShipType("SHIP_ON_YOUR_OWN"); }}
                    data-testid={`btn-ship-${order.id}`}
                  >
                    <Truck size={13} className="mr-1.5" /> Record Shipment
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
              <Label>Tracking Code</Label>
              <Input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking code..." data-testid="input-tracking" />
            </div>
            <div className="space-y-1.5">
              <Label>Shipping Cost ($)</Label>
              <Input type="number" value={makerCostDollars} onChange={e => setMakerCostDollars(e.target.value)} placeholder="e.g. 18.50" data-testid="input-maker-cost" />
            </div>
            <div className="space-y-1.5">
              <Label>Shipping Type</Label>
              <select value={shipType} onChange={e => setShipType(e.target.value)} className="w-full h-9 border rounded-lg px-3 text-sm" data-testid="select-ship-type">
                {SHIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
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
