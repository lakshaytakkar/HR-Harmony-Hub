import { useState } from "react";
import { useLocation } from "wouter";
import { Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { faireRetailers, faireStores } from "@/lib/mock-data-faire";

const BRAND_COLOR = "#1A6B45";

export default function FaireRetailers() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(650);
  const [selectedStore, setSelectedStore] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");

  const filtered = faireRetailers.filter(r => {
    if (selectedStore !== "all" && !r.storeIds.includes(selectedStore)) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !r.store_name.toLowerCase().includes(search.toLowerCase()) && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRetailers = faireRetailers.length;
  const activeRetailers = faireRetailers.filter(r => r.status === "active").length;
  const avgOrderValue = Math.round(faireRetailers.reduce((s, r) => s + (r.total_orders > 0 ? r.total_spent / r.total_orders : 0), 0) / faireRetailers.length);
  const repeatRetailers = faireRetailers.filter(r => r.total_orders > 1).length;
  const repeatRate = Math.round((repeatRetailers / totalRetailers) * 100);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}</div>
        <div className="h-80 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Retailers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">All buyers across your Faire stores</p>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total Retailers", value: totalRetailers, color: BRAND_COLOR, bg: "#ECFDF5" },
            { label: "Active (last 90d)", value: activeRetailers, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Avg Order Value", value: `$${avgOrderValue}`, color: "#7C3AED", bg: "#F5F3FF" },
            { label: "Repeat Rate", value: `${repeatRate}%`, color: "#D97706", bg: "#FFFBEB" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border p-3" style={{ background: s.bg }} data-testid={`retailer-stat-${i}`}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Search retailer or store..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs h-8 text-sm" data-testid="input-search" />
          <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="h-8 text-xs border rounded-lg px-2" data-testid="select-store">
            <option value="all">All Stores</option>
            {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex gap-1">
            {(["all", "active", "inactive"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${statusFilter === s ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={statusFilter === s ? { background: BRAND_COLOR } : {}} data-testid={`filter-${s}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Fade>

      <Fade>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Retailer</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Location</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Stores</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Orders</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Total Spent</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Last Order</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(retailer => (
                    <tr key={retailer.id} className="border-b hover:bg-accent/30 cursor-pointer" onClick={() => setLocation(`/faire/retailers/${retailer.id}`)} data-testid={`retailer-row-${retailer.id}`}>
                      <td className="p-3">
                        <p className="text-xs font-semibold">{retailer.store_name}</p>
                        <p className="text-[10px] text-muted-foreground">{retailer.name}</p>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{retailer.city}, {retailer.state}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {retailer.storeIds.map(sid => {
                            const store = faireStores.find(s => s.id === sid);
                            return <Badge key={sid} variant="outline" className="text-[9px]">{store?.name.split(" ")[0]}</Badge>;
                          })}
                        </div>
                      </td>
                      <td className="p-3 text-xs font-semibold">{retailer.total_orders}</td>
                      <td className="p-3 text-xs">${retailer.total_spent.toLocaleString()}</td>
                      <td className="p-3 text-xs text-muted-foreground">{retailer.last_ordered ? new Date(retailer.last_ordered).toLocaleDateString() : "—"}</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${retailer.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{retailer.status}</span>
                      </td>
                      <td className="p-3" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <a href={`https://wa.me/?text=Hello+${encodeURIComponent(retailer.store_name)}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" data-testid={`btn-whatsapp-${retailer.id}`}><SiWhatsapp size={13} /></Button>
                          </a>
                          <a href={`mailto:${retailer.email}`}>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" data-testid={`btn-email-${retailer.id}`}><Mail size={13} /></Button>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">No retailers match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Fade>
    </PageTransition>
  );
}
