import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Printer, Truck, CheckCircle, XCircle } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireOrders, faireStores, faireRetailers, type OrderState } from "@/lib/mock-data-faire";

const BRAND_COLOR = "#1A6B45";
const CARRIERS = ["UPS", "FedEx", "USPS", "DHL"];

const stateConfig: Record<OrderState, { label: string; color: string; bg: string }> = {
  NEW: { label: "New", color: "#2563EB", bg: "#EFF6FF" },
  PRE_TRANSIT: { label: "Pre-Transit", color: "#7C3AED", bg: "#F5F3FF" },
  IN_TRANSIT: { label: "In Transit", color: "#D97706", bg: "#FFFBEB" },
  DELIVERED: { label: "Delivered", color: "#059669", bg: "#ECFDF5" },
  CLOSED: { label: "Closed", color: "#6B7280", bg: "#F9FAFB" },
  CANCELLED: { label: "Cancelled", color: "#DC2626", bg: "#FEF2F2" },
  BACK_ORDERED: { label: "Backordered", color: "#EA580C", bg: "#FFF7ED" },
};

const TIMELINE_STATES: OrderState[] = ["NEW", "PRE_TRANSIT", "IN_TRANSIT", "DELIVERED"];

export default function FaireOrderDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/faire/orders/:id");
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();

  const order = faireOrders.find(o => o.id === params?.id) ?? faireOrders[0];
  const store = faireStores.find(s => s.id === order.storeId);
  const retailer = faireRetailers.find(r => r.id === order.retailer_id);

  const [addShipOpen, setAddShipOpen] = useState(false);
  const [carrier, setCarrier] = useState("UPS");
  const [tracking, setTracking] = useState("");
  const [packageCount, setPackageCount] = useState("1");
  const [weight, setWeight] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  const cfg = stateConfig[order.state];
  const timelineIdx = TIMELINE_STATES.indexOf(order.state as OrderState);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-5 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="grid grid-cols-5 gap-5"><div className="col-span-3 space-y-3"><div className="h-48 bg-muted rounded-xl" /><div className="h-32 bg-muted rounded-xl" /></div><div className="col-span-2 space-y-3"><div className="h-32 bg-muted rounded-xl" /><div className="h-24 bg-muted rounded-xl" /></div></div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/faire/orders")} data-testid="btn-back">
              <ArrowLeft size={15} className="mr-1.5" /> Orders
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-heading">{order.order_number}</h1>
                <span className="text-sm px-2.5 py-0.5 rounded-full font-semibold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                <Badge variant="outline" className="text-xs">{store?.name}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Placed {new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex items-center gap-0">
          {TIMELINE_STATES.map((state, i) => {
            const stateCfg = stateConfig[state];
            const isActive = i <= timelineIdx && timelineIdx >= 0;
            const isCurrent = TIMELINE_STATES[timelineIdx] === state;
            return (
              <div key={state} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isActive ? "text-white border-transparent" : "text-muted-foreground border-muted"}`} style={isActive ? { background: BRAND_COLOR } : {}}>
                    {i + 1}
                  </div>
                  <p className={`text-[10px] mt-1 font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>{stateCfg.label}</p>
                </div>
                {i < TIMELINE_STATES.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 ${i < timelineIdx && timelineIdx >= 0 ? "" : "bg-muted"}`} style={i < timelineIdx && timelineIdx >= 0 ? { background: BRAND_COLOR } : {}} />
                )}
              </div>
            );
          })}
        </div>
      </Fade>

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 space-y-4">
          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Order Items</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Product</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">SKU</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Qty</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Unit Price</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Total</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => {
                      const isBackordered = item.state === "BACKORDERED";
                      return (
                        <tr key={item.id} className={`border-b ${isBackordered ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}`} data-testid={`item-row-${item.id}`}>
                          <td className="p-3">
                            <p className="text-xs font-medium">{item.product_name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.variant_name}</p>
                            {item.backordered_until && <p className="text-[9px] text-amber-600">Backorder until {new Date(item.backordered_until).toLocaleDateString()}</p>}
                          </td>
                          <td className="p-3 text-xs font-mono text-muted-foreground">{item.sku}</td>
                          <td className="p-3 text-xs">{item.quantity}</td>
                          <td className="p-3 text-xs">${item.wholesale_price}</td>
                          <td className="p-3 text-xs font-semibold">${item.total_price}</td>
                          <td className="p-3">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${isBackordered ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{item.state}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Shipping Address</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm">{order.shipping_address.name}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_address.address1}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_address.country}</p>
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Pricing Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {[
                    { label: "Subtotal", value: `$${order.subtotal}` },
                    { label: "Shipping", value: order.shipping === 0 ? "Free" : `$${order.shipping}` },
                    { label: "Taxes", value: order.taxes > 0 ? `$${order.taxes}` : "—" },
                    ...(order.discount_amount > 0 ? [{ label: "Discount", value: `-$${order.discount_amount}` }] : []),
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1.5 flex items-center justify-between">
                    <span className="font-bold text-sm">Total</span>
                    <span className="font-bold text-sm">${order.total}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Your Payout</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">${order.payout_amount}</span>
                  </div>
                  {order.free_shipping_reason && (
                    <div className="mt-1 text-[10px] text-muted-foreground">Free shipping reason: {order.free_shipping_reason}</div>
                  )}
                  {order.notes && (
                    <div className="mt-2 p-2 bg-muted/40 rounded text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Notes: </span>{order.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Fade>
        </div>

        <div className="col-span-2 space-y-4">
          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Retailer</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm font-semibold">{order.retailer_name}</p>
                <p className="text-xs text-muted-foreground">{order.retailer_city}, {order.retailer_state}</p>
                {retailer && (
                  <>
                    <p className="text-xs text-muted-foreground mt-0.5">{retailer.store_name}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="bg-muted/40 rounded p-2 text-center">
                        <p className="text-sm font-bold">{retailer.total_orders}</p>
                        <p className="text-[10px] text-muted-foreground">Lifetime Orders</p>
                      </div>
                      <div className="bg-muted/40 rounded p-2 text-center">
                        <p className="text-sm font-bold">${(retailer.total_spent / 1000).toFixed(1)}K</p>
                        <p className="text-[10px] text-muted-foreground">Total Spent</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-2 text-xs" onClick={() => setLocation(`/faire/retailers/${retailer.id}`)} data-testid="btn-view-retailer">View Retailer Profile</Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Shipments</CardTitle>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setAddShipOpen(true); setCarrier("UPS"); setTracking(""); setPackageCount("1"); setWeight(""); }} data-testid="btn-add-shipment">+ Add</Button>
                </div>
              </CardHeader>
              <CardContent>
                {order.shipments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No shipments yet.</p>
                ) : (
                  <div className="space-y-2">
                    {order.shipments.map(ship => (
                      <div key={ship.id} className="rounded-lg bg-muted/40 p-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{ship.carrier}</span>
                          <span className="text-muted-foreground font-mono">{ship.tracking_number}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                          <span>Shipped {new Date(ship.shipped_at).toLocaleDateString()}</span>
                          <span>·</span>
                          <span className={`font-medium ${ship.status === "delivered" ? "text-emerald-600" : ship.status === "in_transit" ? "text-amber-600" : "text-blue-600"}`}>{ship.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {order.state === "NEW" && (
                  <Button className="w-full text-sm" style={{ background: BRAND_COLOR }} onClick={() => toast({ title: "Order Accepted", description: "Moved to Pre-Transit." })} data-testid="btn-accept">
                    <CheckCircle size={14} className="mr-2" /> Accept Order
                  </Button>
                )}
                <Button variant="outline" className="w-full text-sm" onClick={() => toast({ title: "Printing Packing Slip..." })} data-testid="btn-print">
                  <Printer size={14} className="mr-2" /> Print Packing Slip
                </Button>
                {(order.state === "NEW" || order.state === "PRE_TRANSIT") && (
                  <Button variant="outline" className="w-full text-sm text-red-500 hover:text-red-600" onClick={() => setCancelOpen(true)} data-testid="btn-cancel">
                    <XCircle size={14} className="mr-2" /> Cancel Order
                  </Button>
                )}
              </CardContent>
            </Card>
          </Fade>
        </div>
      </div>

      <Dialog open={addShipOpen} onOpenChange={() => setAddShipOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Shipment</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Carrier</Label><select value={carrier} onChange={e => setCarrier(e.target.value)} className="w-full h-9 border rounded-lg px-3 text-sm" data-testid="select-carrier">{CARRIERS.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="space-y-1.5"><Label>Tracking Number</Label><Input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking number..." data-testid="input-tracking" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Package Count</Label><Input type="number" value={packageCount} onChange={e => setPackageCount(e.target.value)} min="1" data-testid="input-packages" /></div>
              <div className="space-y-1.5"><Label>Weight (oz)</Label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="48" data-testid="input-weight" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddShipOpen(false)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Shipment Added", description: `${carrier} — ${tracking || "No tracking"}` }); setAddShipOpen(false); }} data-testid="btn-save-shipment">Add Shipment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={() => setCancelOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Order {order.order_number}?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action will cancel the order and notify the retailer. It cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep Order</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Order Cancelled" }); setCancelOpen(false); }} data-testid="btn-confirm-cancel">Cancel Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
