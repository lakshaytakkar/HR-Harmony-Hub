import { useState } from "react";
import { RefreshCw, Star, CheckCircle2, AlertTriangle, WifiOff } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { faireStores, type FaireStore } from "@/lib/mock-data-faire";

const BRAND_COLOR = "#1A6B45";

const statusConfig = {
  connected: { label: "Connected", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200" },
  disconnected: { label: "Disconnected", icon: WifiOff, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-900/20 border-gray-200" },
  error: { label: "API Error", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20 border-red-200" },
};

export default function FaireStores() {
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();
  const [apiKeyStore, setApiKeyStore] = useState<FaireStore | null>(null);
  const [apiToken, setApiToken] = useState("");
  const [brandToken, setBrandToken] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const totalRevenue = faireStores.reduce((s, st) => s + st.monthlyRevenue, 0);
  const totalProducts = faireStores.reduce((s, st) => s + st.totalProducts, 0);
  const totalOrders = faireStores.reduce((s, st) => s + st.totalOrders, 0);

  const handleSync = async (store: FaireStore) => {
    setSyncingId(store.id);
    await new Promise(r => setTimeout(r, 1400));
    setSyncingId(null);
    toast({ title: "Sync Complete", description: `${store.name} synced successfully. ${store.todayOrders} new orders fetched.` });
  };

  const handleSaveKey = () => {
    toast({ title: "Credentials Saved", description: `API key for ${apiKeyStore?.name} saved. Next sync will use new credentials.` });
    setApiKeyStore(null);
    setApiToken("");
    setBrandToken("");
  };

  const getLastSyncLabel = (lastSync: string) => {
    const diff = Math.round((Date.now() - new Date(lastSync).getTime()) / 60000);
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
    return `${Math.round(diff / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-5">{[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Store Management</h1>
            <p className="text-muted-foreground text-sm mt-0.5">6 Faire brand accounts</p>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Revenue MTD", value: `$${(totalRevenue / 1000).toFixed(0)}K` },
            { label: "Total Products", value: totalProducts },
            { label: "Total All-Time Orders", value: totalOrders },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border bg-card p-4" data-testid={`store-stat-${i}`}>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Fade>

      <Stagger>
        <div className="grid grid-cols-2 gap-5">
          {faireStores.map(store => {
            const status = statusConfig[store.status];
            const StatusIcon = status.icon;
            const isSyncing = syncingId === store.id;
            return (
              <StaggerItem key={store.id}>
                <Card data-testid={`store-card-${store.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">{store.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{store.category}</Badge>
                          <span className="text-xs text-muted-foreground">{store.city}, {store.state}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon size={11} />
                        {status.label}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { label: "Products", value: store.totalProducts },
                        { label: "Revenue MTD", value: `$${(store.monthlyRevenue / 1000).toFixed(0)}K` },
                        { label: "Retailers", value: store.activeRetailers },
                        { label: "Avg Order", value: `$${store.avgOrderValue}` },
                      ].map((m, i) => (
                        <div key={i} className="bg-muted/40 rounded-lg p-2 text-center">
                          <p className="text-sm font-bold">{m.value}</p>
                          <p className="text-[9px] text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < Math.floor(store.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">{store.rating}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[11px] text-muted-foreground">Last synced: {getLastSyncLabel(store.lastSync)}</p>
                      <div className={`flex items-center gap-1 text-[11px] font-medium ${store.apiKeyConfigured ? "text-emerald-600" : "text-amber-600"}`}>
                        {store.apiKeyConfigured ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                        {store.apiKeyConfigured ? "API Key ✓" : "API Key Missing"}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleSync(store)}
                        disabled={isSyncing}
                        data-testid={`btn-sync-${store.id}`}
                      >
                        <RefreshCw size={13} className={`mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setApiKeyStore(store); setApiToken(""); setBrandToken(""); }}
                        data-testid={`btn-api-key-${store.id}`}
                      >
                        Manage API Key
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </div>
      </Stagger>

      <Dialog open={!!apiKeyStore} onOpenChange={() => setApiKeyStore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage API Key — {apiKeyStore?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">Enter your Faire brand API credentials. These are stored securely and used for order sync and product updates.</p>
            <div className="space-y-1.5">
              <Label>Faire API Token</Label>
              <Input
                type="password"
                value={apiToken}
                onChange={e => setApiToken(e.target.value)}
                placeholder="faire_api_key_..."
                data-testid="input-api-token"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Brand Token</Label>
              <Input
                type="password"
                value={brandToken}
                onChange={e => setBrandToken(e.target.value)}
                placeholder="b_..."
                data-testid="input-brand-token"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiKeyStore(null)}>Cancel</Button>
            <Button onClick={handleSaveKey} data-testid="btn-save-api-key" style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90">
              Save Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
