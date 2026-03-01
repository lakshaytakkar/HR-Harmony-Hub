import { useState } from "react";
import { useLocation } from "wouter";
import { Mail, Users } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { faireRetailers, faireStores } from "@/lib/mock-data-faire";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";

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
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </StatGrid>
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Retailers"
          subtitle="All buyers across your Faire stores"
          actions={
            <select 
              value={selectedStore} 
              onChange={e => setSelectedStore(e.target.value)} 
              className="h-9 text-sm border rounded-lg px-3 bg-background font-medium" 
              data-testid="select-store"
            >
              <option value="all">All Stores</option>
              {faireStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          {[
            { label: "Total Retailers", value: totalRetailers, color: BRAND_COLOR, bg: "rgba(26, 107, 69, 0.1)" },
            { label: "Active (90d)", value: activeRetailers, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Avg Order Value", value: `$${avgOrderValue}`, color: "#7C3AED", bg: "#F5F3FF" },
            { label: "Repeat Rate", value: `${repeatRate}%`, color: "#D97706", bg: "#FFFBEB" },
          ].map((s, i) => (
            <StatCard
              key={i}
              label={s.label}
              value={s.value}
              icon={Users}
              iconBg={s.bg}
              iconColor={s.color}
            />
          ))}
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search retailer or store..."
          color={BRAND_COLOR}
          filters={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          activeFilter={statusFilter}
          onFilter={(v) => setStatusFilter(v as any)}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Retailer</DataTH>
                <DataTH>Location</DataTH>
                <DataTH>Stores</DataTH>
                <DataTH align="center">Orders</DataTH>
                <DataTH>Total Spent</DataTH>
                <DataTH>Last Order</DataTH>
                <DataTH>Status</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(retailer => (
                <DataTR key={retailer.id} onClick={() => setLocation(`/faire/retailers/${retailer.id}`)} data-testid={`retailer-row-${retailer.id}`}>
                  <DataTD>
                    <p className="font-semibold text-sm">{retailer.store_name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{retailer.name}</p>
                  </DataTD>
                  <DataTD className="text-muted-foreground font-medium">{retailer.city}, {retailer.state}</DataTD>
                  <DataTD>
                    <div className="flex flex-wrap gap-1">
                      {retailer.storeIds.map(sid => {
                        const store = faireStores.find(s => s.id === sid);
                        return <Badge key={sid} variant="outline" className="text-[9px] font-medium">{store?.name.split(" ")[0]}</Badge>;
                      })}
                    </div>
                  </DataTD>
                  <DataTD align="center" className="font-bold">{retailer.total_orders}</DataTD>
                  <DataTD className="font-bold text-foreground/80">${retailer.total_spent.toLocaleString()}</DataTD>
                  <DataTD className="text-muted-foreground font-medium">{retailer.last_ordered ? new Date(retailer.last_ordered).toLocaleDateString() : "—"}</DataTD>
                  <DataTD>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${retailer.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{retailer.status}</span>
                  </DataTD>
                  <DataTD align="right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <a href={`https://wa.me/?text=Hello+${encodeURIComponent(retailer.store_name)}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600" data-testid={`btn-whatsapp-${retailer.id}`}><SiWhatsapp size={14} /></Button>
                      </a>
                      <a href={`mailto:${retailer.email}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" data-testid={`btn-email-${retailer.id}`}><Mail size={14} /></Button>
                      </a>
                    </div>
                  </DataTD>
                </DataTR>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-sm text-muted-foreground font-medium">No retailers match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>
    </PageShell>
  );
}
