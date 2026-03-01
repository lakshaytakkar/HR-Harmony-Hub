import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Star, CheckCircle, AlertTriangle, XCircle, Send,
  ExternalLink, Package, Truck, MessageSquare,
} from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatUSD, DualCurrency, DualCurrencyInline } from "@/lib/faire-currency";
import {
  faireQuotations, faireFulfillers, type FaireQuotation, type QuotationStatus,
} from "@/lib/mock-data-faire-ops";
import { DetailModal } from "@/components/layout";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const BRAND_COLOR = "#1A6B45";

const STATUS_CONFIG: Record<QuotationStatus, { label: string; color: string; bg: string }> = {
  DRAFT:          { label: "Draft",          color: "#6B7280", bg: "#F9FAFB" },
  SENT:           { label: "Sent",           color: "#2563EB", bg: "#EFF6FF" },
  QUOTE_RECEIVED: { label: "Quote Received", color: "#D97706", bg: "#FFFBEB" },
  ACCEPTED:       { label: "Accepted",       color: "#059669", bg: "#ECFDF5" },
  CHALLENGED:     { label: "Challenged",     color: "#EA580C", bg: "#FFF7ED" },
  SENT_ELSEWHERE: { label: "Sent Elsewhere", color: "#64748B", bg: "#F1F5F9" },
};

const STATUS_STEPS: QuotationStatus[] = ["DRAFT", "SENT", "QUOTE_RECEIVED"];


function StepTimeline({ status }: { status: QuotationStatus }) {
  const steps = ["DRAFT", "SENT", "QUOTE_RECEIVED"];
  const terminalIndex = ["ACCEPTED", "CHALLENGED", "SENT_ELSEWHERE"].includes(status) ? 3 : steps.indexOf(status);
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((step, i) => {
        const sc = STATUS_CONFIG[step as QuotationStatus];
        const done = i < terminalIndex || (i === 2 && ["ACCEPTED", "CHALLENGED", "SENT_ELSEWHERE"].includes(status));
        const active = steps.indexOf(status) === i;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
                style={{
                  background: done || active ? sc.bg : "#F3F4F6",
                  borderColor: done || active ? sc.color : "#D1D5DB",
                  color: done || active ? sc.color : "#9CA3AF",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className="text-xs mt-1 font-medium" style={{ color: done || active ? sc.color : "#9CA3AF" }}>
                {sc.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 mb-5" style={{ background: i < terminalIndex ? BRAND_COLOR : "#E5E7EB" }} />
            )}
          </div>
        );
      })}
      <div className="flex items-center flex-1">
        <div className="flex-1 h-0.5 mx-1 mb-5" style={{ background: ["ACCEPTED", "CHALLENGED", "SENT_ELSEWHERE"].includes(status) ? BRAND_COLOR : "#E5E7EB" }} />
        <div className="flex flex-col items-center">
          {(["ACCEPTED", "CHALLENGED", "SENT_ELSEWHERE"] as QuotationStatus[]).includes(status) ? (
            <>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
                style={{ background: STATUS_CONFIG[status].bg, borderColor: STATUS_CONFIG[status].color, color: STATUS_CONFIG[status].color }}
              >✓</div>
              <span className="text-xs mt-1 font-medium" style={{ color: STATUS_CONFIG[status].color }}>
                {STATUS_CONFIG[status].label}
              </span>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 border-dashed border-slate-300 text-slate-400">4</div>
              <span className="text-xs mt-1 text-slate-400">Decision</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className="h-3.5 w-3.5" fill={i <= Math.round(rating) ? "#F59E0B" : "none"} stroke={i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"} />
      ))}
      <span className="text-xs text-slate-500 ml-1">{rating}</span>
    </div>
  );
}

export default function FaireQuotationDetail() {
  const [, params] = useRoute("/faire/quotations/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const id = params?.id ?? "";

  const { data: ordersData } = useQuery<{ orders: any[] }>({
    queryKey: ['/api/faire/orders'],
    queryFn: async () => {
      const res = await fetch('/api/faire/orders', { headers: { 'Cache-Control': 'no-cache' } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });
  const allOrders = ordersData?.orders ?? [];

  const [quotations, setQuotations] = useState(faireQuotations);
  const quotation = quotations.find(q => q.id === id);

  const [ourNotes, setOurNotes] = useState(quotation?.our_notes ?? "");
  const [challengeDialog, setChallengeDialog] = useState(false);
  const [challengeText, setChallengeText] = useState("");
  const [elsewhereDialog, setElsewhereDialog] = useState(false);
  const [elsewhereFulfillerId, setElsewhereFulfillerId] = useState("");

  if (!quotation) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Quotation not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/faire/quotations")}>
          Back to Quotations
        </Button>
      </div>
    );
  }

  const order = allOrders.find((o: any) => o.id === quotation.order_id);
  const fulfiller = faireFulfillers.find(f => f.id === quotation.fulfiller_id);

  const grossOrderValue = order ? order.items.reduce((s: number, i: any) => s + i.price_cents * i.quantity, 0) : 0;
  const commission = order?.payout_costs?.commission_cents ?? 0;
  const fairePayout = grossOrderValue - commission;

  const itemsCost = quotation.items.reduce((s, i) => s + i.fulfiller_unit_cost_cents * i.ordered_quantity, 0);
  const fulfillerTotal = itemsCost + quotation.fulfiller_shipping_cost_cents;
  const netMargin = fairePayout - fulfillerTotal;
  const marginPct = fairePayout > 0 ? Math.round((netMargin / fairePayout) * 100) : 0;
  const marginColor = marginPct > 30 ? "#059669" : marginPct >= 15 ? "#D97706" : "#DC2626";

  function transition(newStatus: QuotationStatus, extra?: Partial<FaireQuotation>) {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: newStatus, our_notes: ourNotes, ...extra } : q));
  }

  function handleSend() {
    transition("SENT", { sent_at: new Date().toISOString() });
    toast({ title: "Sent to fulfiller", description: `Quote request sent to ${fulfiller?.name}` });
  }

  function handleMarkReceived() {
    transition("QUOTE_RECEIVED", { received_at: new Date().toISOString() });
    toast({ title: "Marked as received", description: "Quote received from fulfiller" });
  }

  function handleAccept() {
    transition("ACCEPTED", { accepted_at: new Date().toISOString() });
    toast({ title: "Quote accepted!", description: `Proceed to fulfillment for order #${order?.display_id}` });
  }

  function handleChallenge() {
    transition("CHALLENGED", { challenged_at: new Date().toISOString() });
    setChallengeDialog(false);
    toast({ title: "Quote challenged", description: "Fulfiller notified of counter-offer request" });
  }

  function handleSendElsewhere() {
    if (!elsewhereFulfillerId) return;
    transition("SENT_ELSEWHERE");
    setElsewhereDialog(false);
    toast({ title: "Sent to another fulfiller", description: "New draft quotation created" });
    setLocation("/faire/quotations");
  }

  const sc = STATUS_CONFIG[quotation.status];

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/faire/quotations")} data-testid="button-back-quotations">
          <ArrowLeft className="h-4 w-4 mr-1" /> Quotations
        </Button>
        <span className="text-slate-300">/</span>
        <span className="font-mono text-sm font-medium">{quotation.id}</span>
        <Badge style={{ background: sc.bg, color: sc.color }} className="border-0 ml-2">{sc.label}</Badge>
      </div>

      <div className="grid grid-cols-10 gap-6">
        {/* LEFT: Order Context (30%) */}
        <div className="col-span-3 space-y-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-sm text-slate-700">Order Context</span>
            </div>

            {order ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    className="font-mono text-sm px-2 py-0.5 rounded font-bold hover:opacity-80"
                    style={{ background: "#EFF6FF", color: "#2563EB" }}
                    onClick={() => setLocation(`/faire/orders/${order.id}`)}
                    data-testid="link-order"
                  >
                    #{order.display_id}
                  </button>
                  <Badge style={{ background: "#F3F4F6", color: "#374151" }} className="border-0 text-xs">{order.state}</Badge>
                </div>

                <div className="text-sm text-slate-600 mb-4">
                  <div className="font-medium">{order.address.name}</div>
                  <div className="text-slate-400 text-xs">{order.address.city}, {order.address.state_code}</div>
                </div>

                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Items Ordered</div>
                <div className="space-y-3">
                  {order.items.map((oi: any) => {
                    const qi = quotation.items.find(i => i.order_item_id === oi.id);
                    return (
                      <div key={oi.id} className="flex gap-2">
                        {qi?.image_url ? (
                          <img
                            src={qi.image_url}
                            alt={oi.product_name}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 text-slate-300" />
                          </div>
                        )}
                        <div className="text-xs">
                          <div className="font-medium text-slate-700">{oi.product_name}</div>
                          <div className="text-slate-400">{oi.variant_name}</div>
                          <div className="text-slate-500">Qty: {oi.quantity} × <DualCurrencyInline cents={oi.price_cents} /></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t text-xs space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Gross Order</span>
                    <span className="font-medium text-slate-700"><DualCurrency cents={grossOrderValue} /></span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Commission ({((commission / grossOrderValue) * 100).toFixed(1)}%)</span>
                    <span className="font-medium text-red-500">−<DualCurrency cents={commission} /></span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-semibold text-slate-700">
                    <span>Net Payout</span>
                    <span style={{ color: BRAND_COLOR }}><DualCurrency cents={fairePayout} /></span>
                  </div>
                </div>
              </>
            ) : <p className="text-sm text-slate-400">Order not found</p>}
          </div>
        </div>

        {/* CENTER: Quotation (40%) */}
        <div className="col-span-4 space-y-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="font-semibold text-sm text-slate-700 mb-4">Quote Status</div>
            <StepTimeline status={quotation.status} />
          </div>

          {/* Fulfiller card */}
          {fulfiller && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: BRAND_COLOR }}>
                  {fulfiller.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold">{fulfiller.name}</div>
                  <div className="text-xs text-slate-400">{fulfiller.country} · {fulfiller.contact_name}</div>
                  <div className="text-xs text-slate-400">{fulfiller.email}</div>
                  <div className="mt-1"><StarRating rating={fulfiller.rating} /></div>
                  <div className="text-xs text-slate-500 mt-1">Avg lead: {fulfiller.avg_lead_days} days</div>
                </div>
              </div>
            </div>
          )}

          {/* Line items */}
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="font-semibold text-sm text-slate-700 mb-3">Quote Line Items</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 text-slate-500 font-medium">Item</th>
                  <th className="text-right py-1 text-slate-500 font-medium">Qty</th>
                  <th className="text-right py-1 text-slate-500 font-medium">Unit Cost</th>
                  <th className="text-right py-1 text-slate-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.product_name} className="w-8 h-8 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                            <Package className="h-3 w-3 text-slate-300" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-slate-400">
                            {item.variant_options.map(o => `${o.name}: ${o.value}`).join(", ")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-right">{item.ordered_quantity}</td>
                    <td className="py-2 text-right">
                      {item.fulfiller_unit_cost_cents > 0 ? <DualCurrency cents={item.fulfiller_unit_cost_cents} /> : "—"}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {item.fulfiller_unit_cost_cents > 0 ? <DualCurrency cents={item.fulfiller_unit_cost_cents * item.ordered_quantity} /> : "—"}
                    </td>
                  </tr>
                ))}
                <tr className="text-slate-500">
                  <td colSpan={3} className="py-1.5 text-right">Shipping</td>
                  <td className="py-1.5 text-right">
                    {quotation.fulfiller_shipping_cost_cents > 0 ? <DualCurrency cents={quotation.fulfiller_shipping_cost_cents} /> : "—"}
                  </td>
                </tr>
                {quotation.lead_days > 0 && (
                  <tr className="text-slate-500">
                    <td colSpan={3} className="py-1.5 text-right">Lead Time</td>
                    <td className="py-1.5 text-right">{quotation.lead_days} days</td>
                  </tr>
                )}
                <tr className="font-semibold border-t">
                  <td colSpan={3} className="py-1.5 text-right">Total</td>
                  <td className="py-1.5 text-right" style={{ color: BRAND_COLOR }}>
                    {fulfillerTotal > 0 ? <DualCurrency cents={fulfillerTotal} /> : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {quotation.fulfiller_notes && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1 font-semibold text-sm text-slate-700 mb-2">
                <MessageSquare className="h-4 w-4" /> Fulfiller Notes
              </div>
              <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{quotation.fulfiller_notes}</p>
            </div>
          )}

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="font-semibold text-sm text-slate-700 mb-2">Our Notes</div>
            <Textarea
              value={ourNotes}
              onChange={e => setOurNotes(e.target.value)}
              placeholder="Add internal notes…"
              data-testid="textarea-our-notes"
              className="text-sm"
            />
          </div>
        </div>

        {/* RIGHT: Decision panel (30%) */}
        <div className="col-span-3 space-y-4">
          {/* Financial summary */}
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="font-semibold text-sm text-slate-700 mb-3">Financial Summary</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Faire Net Payout</span>
                <span className="font-medium" style={{ color: BRAND_COLOR }}><DualCurrency cents={fairePayout} /></span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fulfiller Total</span>
                <span className="font-medium text-slate-700">{fulfillerTotal > 0 ? <DualCurrency cents={fulfillerTotal} /> : "—"}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-slate-700">Net Margin</span>
                <div className="text-right">
                  <div className="font-bold text-lg" style={{ color: marginColor }}>
                    {fulfillerTotal > 0 ? <DualCurrency cents={netMargin} /> : "—"}
                  </div>
                  {fulfillerTotal > 0 && (
                    <div className="text-xs font-medium" style={{ color: marginColor }}>{marginPct}%</div>
                  )}
                </div>
              </div>
            </div>
            {fulfillerTotal > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Margin health</span>
                  <span>{marginPct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(marginPct, 100)}%`, background: marginColor }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-300 mt-1">
                  <span>0%</span><span>15%</span><span>30%</span><span>50%+</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="font-semibold text-sm text-slate-700 mb-3">Actions</div>

            {quotation.status === "DRAFT" && (
              <Button
                className="w-full text-white"
                style={{ background: BRAND_COLOR }}
                onClick={handleSend}
                data-testid="button-send-to-fulfiller"
              >
                <Send className="h-4 w-4 mr-2" /> Send to Fulfiller
              </Button>
            )}

            {quotation.status === "SENT" && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-3">Waiting for fulfiller to respond. Mark manually when received.</p>
                <Button variant="outline" className="w-full" onClick={handleMarkReceived} data-testid="button-mark-received">
                  Mark Quote Received
                </Button>
              </div>
            )}

            {quotation.status === "QUOTE_RECEIVED" && (
              <div className="space-y-2">
                <Button
                  className="w-full text-white"
                  style={{ background: BRAND_COLOR }}
                  onClick={handleAccept}
                  data-testid="button-accept-quote"
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Accept Quote
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                  onClick={() => setChallengeDialog(true)}
                  data-testid="button-challenge-quote"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" /> Challenge
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-300 text-slate-600"
                  onClick={() => setElsewhereDialog(true)}
                  data-testid="button-send-elsewhere"
                >
                  <XCircle className="h-4 w-4 mr-2" /> Send Elsewhere
                </Button>
              </div>
            )}

            {quotation.status === "ACCEPTED" && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700 font-medium">Quote accepted on {quotation.accepted_at ? new Date(quotation.accepted_at).toLocaleDateString() : "—"}</span>
                </div>
                {order && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation(`/faire/orders/${order.id}`)}
                    data-testid="button-go-to-fulfillment"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" /> Go to Fulfillment
                  </Button>
                )}
              </div>
            )}

            {quotation.status === "CHALLENGED" && (
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <AlertTriangle className="h-4 w-4 text-orange-500 mb-1" />
                <p className="text-sm text-orange-700 font-medium">Quote challenged</p>
                <p className="text-xs text-orange-500 mt-1">Awaiting revised quote from fulfiller.</p>
              </div>
            )}

            {quotation.status === "SENT_ELSEWHERE" && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-600 font-medium">Sent to another fulfiller</p>
                <p className="text-xs text-slate-400 mt-1">A new quotation was created with the selected fulfiller.</p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="rounded-xl border bg-white p-4 shadow-sm text-xs text-slate-500 space-y-1.5">
            <div className="font-semibold text-slate-600 text-sm mb-2">Timeline</div>
            <div className="flex justify-between">
              <span>Created</span>
              <span>{new Date(quotation.created_at).toLocaleDateString()}</span>
            </div>
            {quotation.sent_at && <div className="flex justify-between"><span>Sent</span><span>{new Date(quotation.sent_at).toLocaleDateString()}</span></div>}
            {quotation.received_at && <div className="flex justify-between"><span>Received</span><span>{new Date(quotation.received_at).toLocaleDateString()}</span></div>}
            {quotation.accepted_at && <div className="flex justify-between"><span>Accepted</span><span>{new Date(quotation.accepted_at).toLocaleDateString()}</span></div>}
            {quotation.challenged_at && <div className="flex justify-between"><span>Challenged</span><span>{new Date(quotation.challenged_at).toLocaleDateString()}</span></div>}
          </div>
        </div>
      </div>

      {/* Challenge dialog */}
      <DetailModal
        open={challengeDialog}
        onClose={() => setChallengeDialog(false)}
        title="Challenge Quote"
        subtitle="Provide counter-offer details or reasons for the challenge."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setChallengeDialog(false)}>Cancel</Button>
            <Button
              onClick={handleChallenge}
              className="text-white"
              style={{ background: "#EA580C" }}
              data-testid="button-confirm-challenge"
            >
              Send Challenge
            </Button>
          </div>
        }
      >
        <div>
          <Label>Counter-Offer / Notes</Label>
          <Textarea
            value={challengeText}
            onChange={e => setChallengeText(e.target.value)}
            placeholder="Describe the counter-offer or reason for challenge…"
            data-testid="textarea-challenge"
          />
        </div>
      </DetailModal>

      {/* Send Elsewhere dialog */}
      <DetailModal
        open={elsewhereDialog}
        onClose={() => setElsewhereDialog(false)}
        title="Send to Another Fulfiller"
        subtitle="Select a different fulfiller. A new draft quotation will be created."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setElsewhereDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSendElsewhere}
              style={{ background: BRAND_COLOR }}
              className="text-white"
              data-testid="button-confirm-elsewhere"
            >
              Create New Draft
            </Button>
          </div>
        }
      >
        <div>
          <Label>Select Fulfiller</Label>
          <Select value={elsewhereFulfillerId} onValueChange={setElsewhereFulfillerId}>
            <SelectTrigger data-testid="select-elsewhere-fulfiller">
              <SelectValue placeholder="Select fulfiller…" />
            </SelectTrigger>
            <SelectContent>
              {faireFulfillers.filter(f => f.id !== quotation.fulfiller_id).map(f => (
                <SelectItem key={f.id} value={f.id}>{f.name} ({f.country})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DetailModal>
    </div>
  );
}
