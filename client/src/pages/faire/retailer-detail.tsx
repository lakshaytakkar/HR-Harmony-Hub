import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Mail, Globe, Instagram } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { faireRetailers, faireOrders, faireStores, type OrderState } from "@/lib/mock-data-faire";

const BRAND_COLOR = "#1A6B45";

const stateConfig: Record<OrderState, { label: string; color: string; bg: string }> = {
  NEW: { label: "New", color: "#2563EB", bg: "#EFF6FF" },
  PROCESSING: { label: "Processing", color: "#7C3AED", bg: "#F5F3FF" },
  PRE_TRANSIT: { label: "Pre-Transit", color: "#9333EA", bg: "#FAF5FF" },
  IN_TRANSIT: { label: "In Transit", color: "#D97706", bg: "#FFFBEB" },
  DELIVERED: { label: "Delivered", color: "#059669", bg: "#ECFDF5" },
  PENDING_RETAILER_CONFIRMATION: { label: "Pending", color: "#EA580C", bg: "#FFF7ED" },
  BACKORDERED: { label: "Backordered", color: "#DC4A26", bg: "#FFF1EE" },
  CANCELED: { label: "Canceled", color: "#6B7280", bg: "#F9FAFB" },
};

export default function FaireRetailerDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/faire/retailers/:id");
  const isLoading = useSimulatedLoading(600);

  const retailer = faireRetailers.find(r => r.id === params?.id) ?? faireRetailers[0];
  const retailerOrders = faireOrders.filter(o => o.retailer_id === retailer.id);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-5 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  const avgOrderValue = retailer.total_orders > 0 ? Math.round(retailer.total_spent / retailer.total_orders) : 0;
  const firstOrder = retailerOrders.length > 0 ? retailerOrders.reduce((a, b) => a.created_at < b.created_at ? a : b) : null;

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/faire/retailers")} data-testid="btn-back">
              <ArrowLeft size={15} className="mr-1.5" /> Retailers
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-heading">{retailer.store_name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${retailer.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{retailer.status}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{retailer.name} · {retailer.city}, {retailer.state}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`https://wa.me/?text=Hello+${encodeURIComponent(retailer.store_name)}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50" data-testid="btn-whatsapp">
                <SiWhatsapp size={13} className="mr-1.5" /> WhatsApp
              </Button>
            </a>
            <a href={`mailto:${retailer.email}`}>
              <Button size="sm" variant="outline" data-testid="btn-email">
                <Mail size={13} className="mr-1.5" /> Email
              </Button>
            </a>
          </div>
        </div>
      </Fade>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Retailer Info</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Store Name</p><p className="text-sm">{retailer.store_name}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Contact</p><p className="text-sm">{retailer.name}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Email</p><p className="text-sm">{retailer.email}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Location</p><p className="text-sm">{retailer.city}, {retailer.state}, {retailer.country}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Member Since</p><p className="text-sm">{new Date(retailer.created_at).toLocaleDateString()}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Retailer Token</p><p className="text-xs font-mono text-muted-foreground truncate">{retailer.retailer_token}</p></div>
                </div>
                {retailer.description && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">{retailer.description}</p>}
                <div className="flex gap-2 mt-2">
                  {retailer.website && <a href={retailer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><Globe size={11} /> Website</a>}
                  {retailer.instagram && <a href={`https://instagram.com/${retailer.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-pink-600 hover:underline"><Instagram size={11} /> {retailer.instagram}</a>}
                </div>
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Order History</CardTitle></CardHeader>
              <CardContent className="p-0">
                {retailerOrders.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No orders from this retailer yet.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-muted-foreground text-xs">Display ID</th>
                        <th className="text-left p-3 font-medium text-muted-foreground text-xs">Store</th>
                        <th className="text-left p-3 font-medium text-muted-foreground text-xs">Date</th>
                        <th className="text-left p-3 font-medium text-muted-foreground text-xs">Total</th>
                        <th className="text-left p-3 font-medium text-muted-foreground text-xs">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retailerOrders.map(order => {
                        const store = faireStores.find(s => s.id === order.storeId);
                        const cfg = stateConfig[order.state];
                        const itemsTotal = order.items.reduce((s, i) => s + i.price_cents * i.quantity, 0);
                        return (
                          <tr key={order.id} className="border-b hover:bg-accent/30 cursor-pointer" onClick={() => setLocation(`/faire/orders/${order.id}`)} data-testid={`order-history-row-${order.id}`}>
                            <td className="p-3"><Badge variant="outline" className="text-[9px] font-mono">{order.display_id}</Badge></td>
                            <td className="p-3"><Badge variant="outline" className="text-[10px]">{store?.name.split(" ")[0]}</Badge></td>
                            <td className="p-3 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="p-3 text-xs font-semibold">${(itemsTotal / 100).toFixed(2)}</td>
                            <td className="p-3"><span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </Fade>
        </div>

        <div className="space-y-4">
          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Lifetime Stats</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Total Orders", value: retailer.total_orders },
                  { label: "Total Spent", value: `$${retailer.total_spent.toLocaleString()}` },
                  { label: "Avg Order Value", value: `$${avgOrderValue}` },
                  { label: "First Order", value: firstOrder ? new Date(firstOrder.created_at).toLocaleDateString() : "—" },
                  { label: "Last Order", value: retailer.last_ordered ? new Date(retailer.last_ordered).toLocaleDateString() : "—" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <span className="text-sm font-semibold">{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Orders From</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {retailer.storeIds.map(sid => {
                    const store = faireStores.find(s => s.id === sid);
                    return <Badge key={sid} variant="outline" style={{ borderColor: `${BRAND_COLOR}40`, color: BRAND_COLOR }}>{store?.name}</Badge>;
                  })}
                </div>
              </CardContent>
            </Card>
          </Fade>
        </div>
      </div>
    </PageTransition>
  );
}
