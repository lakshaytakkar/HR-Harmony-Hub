import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, CheckCircle2, AlertTriangle, Package, ShoppingCart, Clock } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const BRAND_COLOR = "#1A6B45";

interface FaireStore {
  id: string;
  name: string;
  active: boolean;
  last_synced_at: string | null;
}

interface StoreCounts {
  total_orders: number;
  total_products: number;
  new_orders: number;
}

interface SyncResult {
  success: boolean;
  orders_synced: number;
  products_synced: number;
  profile_synced: boolean;
  error?: string;
}

function getLastSyncLabel(ts: string | null): string {
  if (!ts) return "Never synced";
  const diff = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 2) return "Just now";
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

function StoreCounts({ storeId }: { storeId: string }) {
  const { data } = useQuery<StoreCounts>({
    queryKey: ["/api/faire/stores", storeId, "counts"],
  });
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {[
        { label: "Orders", value: data?.total_orders ?? "—", icon: ShoppingCart },
        { label: "Products", value: data?.total_products ?? "—", icon: Package },
        { label: "New", value: data?.new_orders ?? "—", icon: AlertTriangle },
      ].map((m, i) => (
        <div key={i} className="bg-muted/40 rounded-lg p-2 text-center">
          <p className="text-sm font-bold">{m.value}</p>
          <p className="text-[9px] text-muted-foreground">{m.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function FaireStores() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const { data: storesData, isLoading } = useQuery<{ stores: FaireStore[] }>({
    queryKey: ["/api/faire/stores"],
  });

  const stores = storesData?.stores ?? [];

  const syncMutation = useMutation({
    mutationFn: async (storeId: string) => {
      const res = await apiRequest("POST", `/api/faire/stores/${storeId}/sync`);
      return res.json() as Promise<SyncResult>;
    },
    onSuccess: (data, storeId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", storeId, "counts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", storeId, "orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", storeId, "products"] });
      setSyncingId(null);
      if (data.success) {
        toast({
          title: "Sync Complete",
          description: `${data.orders_synced} orders · ${data.products_synced} products synced`,
        });
      } else {
        toast({ title: "Sync Failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    },
    onError: () => {
      setSyncingId(null);
      toast({ title: "Sync Error", description: "Could not reach server", variant: "destructive" });
    },
  });

  const handleSync = (store: FaireStore) => {
    setSyncingId(store.id);
    syncMutation.mutate(store.id);
  };

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Store Management</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{stores.length} Faire brand accounts</p>
          </div>
        </div>
      </Fade>

      <Stagger>
        <div className="grid grid-cols-2 gap-5">
          {stores.map(store => {
            const isSyncing = syncingId === store.id;
            return (
              <StaggerItem key={store.id}>
                <Card data-testid={`store-card-${store.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">{store.name}</h3>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${store.active ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-600" : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 text-gray-500"}`}>
                        {store.active ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                        {store.active ? "Connected" : "Inactive"}
                      </div>
                    </div>

                    <StoreCounts storeId={store.id} />

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock size={11} />
                        Last synced: {getLastSyncLabel(store.last_synced_at)}
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {store.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSync(store)}
                      disabled={isSyncing}
                      data-testid={`btn-sync-${store.id}`}
                    >
                      <RefreshCw size={13} className={`mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                      {isSyncing ? "Syncing..." : "Sync Now"}
                    </Button>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </div>
      </Stagger>
    </PageTransition>
  );
}
