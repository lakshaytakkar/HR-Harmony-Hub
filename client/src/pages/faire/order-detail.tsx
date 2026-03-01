import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Printer, Truck, CheckCircle, XCircle, Zap, AlertTriangle } from "lucide-react";
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
const SHIP_TYPES = [
  { value: "SHIP_ON_YOUR_OWN", label: "Ship on your own" },
  { value: "FAIRE_SHIPPING_LABEL", label: "Faire shipping label" },
];
const CANCEL_REASONS = [
  { value: "REQUESTED_BY_RETAILER", label: "Requested by retailer" },
  { value: "RETAILER_NOT_GOOD_FIT", label: "Retailer not a good fit" },
  { value: "CHANGE_REPLACE_ORDER", label: "Change / replace order" },
  { value: "ITEM_OUT_OF_STOCK", label: "Item out of stock" },
  { value: "INCORRECT_PRICING", label: "Incorrect pricing" },
  { value: "ORDER_TOO_SMALL", label: "Order too small" },
  { value: "REJECT_INTERNATIONAL_ORDER", label: "Reject international order" },
  { value: "OTHER", label: "Other" },
];

const stateConfig: Record<OrderState, { label: string; color: string; bg: string }> = {
  NEW: { label: "New", color: "#2563EB", bg: "#EFF6FF" },
  PROCESSING: { label: "Processing", color: "#7C3AED", bg: "#F5F3FF" },
  PRE_TRANSIT: { label: "Pre-Transit", color: "#9333EA", bg: "#FAF5FF" },
  IN_TRANSIT: { label: "In Transit", color: "#D97706", bg: "#FFFBEB" },
  DELIVERED: { label: "Delivered", color: "#059669", bg: "#ECFDF5" },
  PENDING_RETAILER_CONFIRMATION: { label: "Pending Confirmation", color: "#EA580C", bg: "#FFF7ED" },
  BACKORDERED: { label: "Backordered", color: "#DC4A26", bg: "#FFF1EE" },
  CANCELED: { label: "Canceled", color: "#6B7280", bg: "#F9FAFB" },
};

const TIMELINE_STATES: OrderState[] = ["NEW", "PROCESSING", "PRE_TRANSIT", "IN_TRANSIT", "DELIVERED"];

const SOURCE_LABELS: Record<string, string> = {
  MARKETPLACE: "Marketplace",
  FAIRE_DIRECT: "Faire Direct",
  TRADESHOW: "Tradeshow",
};

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
  const [makerCostDollars, setMakerCostDollars] = useState("");
  const [shipType, setShipType] = useState("SHIP_ON_YOUR_OWN");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("REQUESTED_BY_RETAILER");

  const cfg = stateConfig[order.state];
  const timelineIdx = TIMELINE_STATES.indexOf(order.state as OrderState);
  const itemsTotal = order.items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
  const commissionAmt = order.payout_costs.commission_cents;
  const payout = itemsTotal - commissionAmt - order.payout_costs.payout_fee_cents;

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
      {order.has_pending_retailer_cancellation_request && (
        <Fade>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            <AlertTriangle size={15} className="shrink-0" />
            <span className="font-medium">Retailer has requested cancellation of this order.</span>
          </div>
        </Fade>
      )}

      <Fade>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/faire/orders")} data-testid="btn-back">
              <ArrowLeft size={15} className="mr-1.5" /> Orders
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-heading font-mono">#{order.display_id}</h1>
                <span className="text-sm px-2.5 py-0.5 rounded-full font-semibold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                <Badge variant="outline" className="text-xs">{store?.name}</Badge>
                <Badge variant="outline" className="text-xs">{SOURCE_LABELS[order.source]}</Badge>
                {order.is_free_shipping && (
                  <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium"><Zap size={10} /> Free Ship</span>
                )}
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
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Line Total</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => {
                      const isBackordered = item.state === "BACKORDERED";
                      const lineTotal = (item.price_cents * item.quantity / 100).toFixed(2);
                      return (
                        <tr key={item.id} className={`border-b ${isBackordered ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}`} data-testid={`item-row-${item.id}`}>
                          <td className="p-3">
                            <p className="text-xs font-medium">{item.product_name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.variant_name}</p>
                            {item.includes_tester && <span className="text-[9px] bg-blue-50 text-blue-600 rounded px-1 font-medium">Tester</span>}
                            {item.discounts.length > 0 && (
                              <div className="mt-0.5">
                                {item.discounts.map(d => (
                                  <span key={d.id} className="text-[9px] bg-emerald-50 text-emerald-600 rounded px-1 font-medium mr-1">{d.code}</span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-xs font-mono text-muted-foreground">{item.sku}</td>
                          <td className="p-3 text-xs">{item.quantity}</td>
                          <td className="p-3 text-xs">${(item.price_cents / 100).toFixed(2)}</td>
                          <td className="p-3 text-xs font-semibold">${lineTotal}</td>
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
              <CardHeader className="pb-2"><CardTitle className="text-sm">Delivery Address</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{order.address.name}</p>
                {order.address.company_name && <p className="text-sm text-muted-foreground">{order.address.company_name}</p>}
                <p className="text-sm text-muted-foreground">{order.address.address1}</p>
                {order.address.address2 && <p className="text-sm text-muted-foreground">{order.address.address2}</p>}
                <p className="text-sm text-muted-foreground">{order.address.city}, {order.address.state_code ?? order.address.state} {order.address.postal_code}</p>
                <p className="text-sm text-muted-foreground">{order.address.country}</p>
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Payout Costs</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {[
                    { label: "Items Total", value: `$${(itemsTotal / 100).toFixed(2)}` },
                    { label: `Commission (${(order.payout_costs.commission_bps / 100).toFixed(0)}%)`, value: `-$${(commissionAmt / 100).toFixed(2)}` },
                    { label: "Platform Fee", value: order.payout_costs.payout_fee_cents > 0 ? `-$${(order.payout_costs.payout_fee_cents / 100).toFixed(2)}` : "—" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1.5 flex items-center justify-between">
                    <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Estimated Payout</span>
                    <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">${(payout / 100).toFixed(2)}</span>
                  </div>
                  {order.is_free_shipping && order.free_shipping_reason && (
                    <div className="text-[10px] text-muted-foreground">Free shipping: {order.free_shipping_reason.replace(/_/g, " ")}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Fade>

          {order.brand_discounts.length > 0 && (
            <Fade>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Brand Discounts</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {order.brand_discounts.map(d => (
                    <div key={d.id} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5">{d.code}</span>
                      <span className="text-xs text-muted-foreground">
                        {d.discount_type === "PERCENTAGE" ? `${d.discount_percentage}% off` : "Flat discount"}
                        {d.includes_free_shipping && " + Free ship"}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </Fade>
          )}
        </div>

        <div className="col-span-2 space-y-4">
          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Retailer</CardTitle></CardHeader>
              <CardContent>
                {retailer ? (
                  <>
                    <p className="text-sm font-semibold">{retailer.store_name}</p>
                    <p className="text-xs text-muted-foreground">{retailer.city}, {retailer.state}</p>
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
                ) : (
                  <p className="text-xs text-muted-foreground">{order.retailer_id}</p>
                )}
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Order Details</CardTitle></CardHeader>
              <CardContent className="space-y-1.5 text-xs">
                {[
                  { label: "Source", value: SOURCE_LABELS[order.source] },
                  ...(order.purchase_order_number ? [{ label: "PO Number", value: order.purchase_order_number }] : []),
                  ...(order.sales_rep_name ? [{ label: "Sales Rep", value: order.sales_rep_name }] : []),
                  ...(order.ship_after ? [{ label: "Ship After", value: new Date(order.ship_after).toLocaleDateString() }] : []),
                  ...(order.estimated_payout_at ? [{ label: "Est. Payout", value: new Date(order.estimated_payout_at).toLocaleDateString() }] : []),
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium">{row.value}</span>
                  </div>
                ))}
                {order.notes && (
                  <div className="mt-2 p-2 bg-muted/40 rounded text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Notes: </span>{order.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Shipments</CardTitle>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setAddShipOpen(true); setCarrier("UPS"); setTracking(""); setMakerCostDollars(""); setShipType("SHIP_ON_YOUR_OWN"); }} data-testid="btn-add-shipment">+ Add</Button>
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
                          <span className="text-muted-foreground font-mono text-[10px]">{ship.tracking_code}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                          <span>Shipped {new Date(ship.shipped_at).toLocaleDateString()}</span>
                          <span>·</span>
                          <span className="font-medium text-foreground">${(ship.maker_cost_cents / 100).toFixed(2)}</span>
                          <span>·</span>
                          <span>{ship.shipping_type === "SHIP_ON_YOUR_OWN" ? "Own Label" : "Faire Label"}</span>
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
                  <Button className="w-full text-sm" style={{ background: BRAND_COLOR }} onClick={() => toast({ title: "Order Accepted", description: "Moved to Processing." })} data-testid="btn-accept">
                    <CheckCircle size={14} className="mr-2" /> Accept → Processing
                  </Button>
                )}
                <Button variant="outline" className="w-full text-sm" onClick={() => toast({ title: "Printing Packing Slip..." })} data-testid="btn-print">
                  <Printer size={14} className="mr-2" /> Print Packing Slip
                </Button>
                {(order.state === "NEW" || order.state === "PROCESSING" || order.state === "PRE_TRANSIT") && (
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
            <div className="space-y-1.5"><Label>Tracking Code</Label><Input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking code..." data-testid="input-tracking" /></div>
            <div className="space-y-1.5"><Label>Shipping Cost ($)</Label><Input type="number" value={makerCostDollars} onChange={e => setMakerCostDollars(e.target.value)} placeholder="e.g. 18.50" data-testid="input-maker-cost" /></div>
            <div className="space-y-1.5"><Label>Shipping Type</Label><select value={shipType} onChange={e => setShipType(e.target.value)} className="w-full h-9 border rounded-lg px-3 text-sm" data-testid="select-ship-type">{SHIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddShipOpen(false)}>Cancel</Button>
            <Button style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Shipment Added", description: `${carrier} — ${tracking || "No tracking"}` }); setAddShipOpen(false); }} data-testid="btn-save-shipment">Add Shipment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={() => setCancelOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Order #{order.display_id}?</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">This action will cancel the order and notify the retailer. It cannot be undone.</p>
            <div className="space-y-1.5">
              <Label>Cancellation Reason</Label>
              <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full h-9 border rounded-lg px-3 text-sm" data-testid="select-cancel-reason">
                {CANCEL_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep Order</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Order Canceled" }); setCancelOpen(false); }} data-testid="btn-confirm-cancel">Cancel Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
