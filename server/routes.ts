import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  getStoreCredentials,
  listStores,
  syncOrders,
  syncProducts,
  updateStoreProfile,
  getStoreOrders,
  getAllOrders,
  getStoreProducts,
  getAllProducts,
  getStoreCounts,
  upsertRetailer,
  getAllRetailers,
  getRetailer,
  extractAndUpsertRetailersFromOrders,
} from "./supabase";
import { fetchAllOrders, fetchAllProducts, fetchBrandProfile, fetchRetailerProfile, updateVariantInventory } from "./faire-api";

const FAIRE_API_BASE = "https://www.faire.com/external-api/v2";

async function faireRequest(
  method: string,
  path: string,
  oauthToken: string,
  appCredentials: string,
  body?: object
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(`${FAIRE_API_BASE}${path}`, {
    method,
    headers: {
      "X-FAIRE-OAUTH-ACCESS-TOKEN": oauthToken,
      "X-FAIRE-APP-CREDENTIALS": appCredentials,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: unknown = null;
  try { data = await res.json(); } catch { data = null; }
  return { ok: res.ok, status: res.status, data };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/faire/stores", async (_req, res) => {
    try {
      const stores = await listStores();
      return res.json({ stores });
    } catch {
      return res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  app.get("/api/faire/orders", async (req, res) => {
    const state = req.query.state as string | undefined;
    const limit = parseInt(req.query.limit as string) || 500;
    const offset = parseInt(req.query.offset as string) || 0;
    try {
      const orders = await getAllOrders({
        state: state && state !== "all" ? state : undefined,
        limit,
        offset,
      });
      return res.json({ orders });
    } catch {
      return res.status(500).json({ error: "Failed to fetch all orders" });
    }
  });

  app.get("/api/faire/products", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 5000;
    const offset = parseInt(req.query.offset as string) || 0;
    const slim = req.query.slim !== undefined;
    try {
      const products = await getAllProducts({ limit, offset });
      if (slim) {
        const slimProducts = products.map((p: Record<string, unknown>) => {
          const images = (p.images as { url: string }[]) ?? [];
          const thumbUrl = images[0]?.url ?? null;
          return {
            id: p.id,
            name: p.name,
            lifecycle_state: p.lifecycle_state,
            sale_state: p.sale_state,
            taxonomy_type: p.taxonomy_type,
            minimum_order_quantity: p.minimum_order_quantity,
            unit_multiplier: p.unit_multiplier,
            _storeId: p._storeId,
            thumb_url: thumbUrl,
            variants: ((p.variants as Record<string, unknown>[]) ?? []).map((v) => ({
              id: v.id,
              sku: v.sku,
              name: v.name,
              wholesale_price_cents: v.wholesale_price_cents,
              retail_price_cents: v.retail_price_cents,
              available_quantity: v.available_quantity,
              options: v.options,
              lifecycle_state: v.lifecycle_state,
              sale_state: v.sale_state,
            })),
          };
        });
        return res.json({ products: slimProducts });
      }
      return res.json({ products });
    } catch {
      return res.status(500).json({ error: "Failed to fetch all products" });
    }
  });

  app.get("/api/faire/retailers", async (_req, res) => {
    try {
      const retailers = await getAllRetailers();
      return res.json({ retailers });
    } catch {
      return res.status(500).json({ error: "Failed to fetch retailers" });
    }
  });

  app.get("/api/faire/retailers/:retailerId", async (req, res) => {
    const { retailerId } = req.params;
    try {
      const retailer = await getRetailer(retailerId);
      if (!retailer) return res.status(404).json({ error: "Retailer not found" });
      return res.json(retailer);
    } catch {
      return res.status(500).json({ error: "Failed to fetch retailer" });
    }
  });

  app.post("/api/faire/stores/:storeId/sync", async (req, res) => {
    const { storeId } = req.params;

    const creds = await getStoreCredentials(storeId);
    if (!creds) {
      return res.status(404).json({ success: false, error: "Store not found or inactive" });
    }

    try {
      let profileSynced = false;
      try {
        const profile = await fetchBrandProfile(creds);
        await updateStoreProfile(storeId, profile);
        profileSynced = true;
      } catch (err) {
        console.error(`[sync] brand profile error for ${storeId}:`, err);
      }

      const orders = await fetchAllOrders(creds);
      const ordersSynced = await syncOrders(storeId, orders);

      const products = await fetchAllProducts(creds);
      const productsSynced = await syncProducts(storeId, products);

      const allStoreOrders = await getStoreOrders(storeId, { limit: 5000 });
      const retailersSynced = await extractAndUpsertRetailersFromOrders(allStoreOrders);

      return res.json({
        success: true,
        orders_synced: ordersSynced,
        products_synced: productsSynced,
        retailers_synced: retailersSynced,
        profile_synced: profileSynced,
      });
    } catch (err) {
      console.error(`[sync] error for store ${storeId}:`, err);
      return res.status(502).json({ success: false, error: "Sync failed — check server logs" });
    }
  });

  app.post("/api/faire/stores/:storeId/sync-retailers", async (req, res) => {
    const { storeId } = req.params;
    try {
      const orders = await getStoreOrders(storeId, { limit: 5000 });
      const synced = await extractAndUpsertRetailersFromOrders(orders);
      return res.json({ success: true, retailers_synced: synced, total_unique: synced });
    } catch (err) {
      console.error(`[sync-retailers] error:`, err);
      return res.status(502).json({ success: false, error: "Retailer sync failed" });
    }
  });

  app.post("/api/faire/populate-retailers", async (_req, res) => {
    try {
      const allOrders = await getAllOrders();
      const synced = await extractAndUpsertRetailersFromOrders(allOrders);
      return res.json({ success: true, retailers_synced: synced });
    } catch (err) {
      console.error(`[populate-retailers] error:`, err);
      return res.status(502).json({ success: false, error: "Populate retailers failed" });
    }
  });

  app.get("/api/faire/stores/:storeId/orders", async (req, res) => {
    const { storeId } = req.params;
    const state = req.query.state as string | undefined;
    const limit = parseInt(req.query.limit as string) || 200;
    const offset = parseInt(req.query.offset as string) || 0;
    try {
      const orders = await getStoreOrders(storeId, {
        state: state && state !== "all" ? state : undefined,
        limit,
        offset,
      });
      return res.json({ orders, store_id: storeId });
    } catch {
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/faire/stores/:storeId/products", async (req, res) => {
    const { storeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 200;
    const offset = parseInt(req.query.offset as string) || 0;
    try {
      const products = await getStoreProducts(storeId, { limit, offset });
      return res.json({ products, store_id: storeId });
    } catch {
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/faire/stores/:storeId/counts", async (req, res) => {
    const { storeId } = req.params;
    try {
      const counts = await getStoreCounts(storeId);
      return res.json(counts);
    } catch {
      return res.status(500).json({ error: "Failed to fetch counts" });
    }
  });

  app.post("/api/faire/orders/:orderId/accept", async (req, res) => {
    const { orderId } = req.params;
    const { storeId } = req.body as { storeId?: string };
    if (!storeId) {
      return res.json({ success: true, state: "PROCESSING", mock: true,
        message: "Order accepted (mock mode — no store selected)" });
    }
    const creds = await getStoreCredentials(storeId);
    if (!creds) return res.status(404).json({ success: false, error: "Store not found or inactive" });
    try {
      const result = await faireRequest("POST", `/orders/${orderId}/processing`,
        creds.oauth_access_token, creds.app_credentials);
      if (result.ok) {
        const d = result.data as Record<string, unknown> | null;
        return res.json({ success: true, state: d?.state ?? "PROCESSING", mock: false });
      }
      const d = result.data as Record<string, unknown> | null;
      return res.status(result.status).json({
        success: false, error: d?.message ?? `Faire API returned ${result.status}`, mock: false,
      });
    } catch {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  app.post("/api/faire/orders/:orderId/shipments", async (req, res) => {
    const { orderId } = req.params;
    const { storeId, carrier, tracking_code, maker_cost_cents, shipping_type } =
      req.body as { storeId?: string; carrier?: string; tracking_code?: string; maker_cost_cents?: number; shipping_type?: string };
    if (!storeId) {
      return res.json({
        success: true,
        shipment: { id: `s_mock_${Date.now()}`, order_id: orderId, carrier: carrier ?? "UPS",
          tracking_code: tracking_code ?? "MOCK_TRACKING", maker_cost_cents: maker_cost_cents ?? 0,
          shipping_type: shipping_type ?? "SHIP_ON_YOUR_OWN", created_at: new Date().toISOString() },
        mock: true,
      });
    }
    const creds = await getStoreCredentials(storeId);
    if (!creds) return res.status(404).json({ success: false, error: "Store not found or inactive" });
    try {
      const result = await faireRequest("POST", `/orders/${orderId}/shipments`,
        creds.oauth_access_token, creds.app_credentials,
        { shipments: [{ carrier: carrier ?? "UPS", tracking_code, maker_cost_cents: maker_cost_cents ?? 0, shipping_type: shipping_type ?? "SHIP_ON_YOUR_OWN" }] });
      if (result.ok) {
        const d = result.data as Record<string, unknown> | null;
        const shipments = (d?.shipments as unknown[]) ?? [];
        return res.json({ success: true, shipment: shipments[0] ?? null, mock: false });
      }
      const d = result.data as Record<string, unknown> | null;
      return res.status(result.status).json({
        success: false, error: d?.message ?? `Faire API returned ${result.status}`, mock: false,
      });
    } catch {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  app.post("/api/faire/orders/:orderId/cancel", async (req, res) => {
    const { orderId } = req.params;
    const { storeId, reason } = req.body as { storeId?: string; reason?: string };
    if (!storeId) {
      return res.json({ success: true, state: "CANCELED", mock: true,
        message: "Order canceled (mock mode — no store selected)" });
    }
    const creds = await getStoreCredentials(storeId);
    if (!creds) return res.status(404).json({ success: false, error: "Store not found or inactive" });
    try {
      const result = await faireRequest("POST", `/orders/${orderId}/cancel`,
        creds.oauth_access_token, creds.app_credentials, { reason });
      if (result.ok) {
        const d = result.data as Record<string, unknown> | null;
        return res.json({ success: true, state: d?.state ?? "CANCELED", mock: false });
      }
      const d = result.data as Record<string, unknown> | null;
      return res.status(result.status).json({
        success: false, error: d?.message ?? `Faire API returned ${result.status}`, mock: false,
      });
    } catch {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  app.post("/api/faire/stores/:storeId/set-inventory", async (req, res) => {
    const { storeId } = req.params;
    const { quantity } = req.body as { quantity?: number };
    const targetQty = quantity ?? 10000;
    const creds = await getStoreCredentials(storeId);
    if (!creds) return res.status(404).json({ success: false, error: "Store not found or inactive" });

    try {
      const products = await getStoreProducts(storeId);
      let updated = 0;
      let failed = 0;
      for (const rawProduct of products) {
        const product = rawProduct as { id: string; variants?: { id: string; available_quantity?: number }[] };
        for (const variant of product.variants ?? []) {
          if (variant.available_quantity === targetQty) continue;
          const result = await updateVariantInventory(
            { oauth_access_token: creds.oauth_access_token, app_credentials: creds.app_credentials },
            product.id,
            variant.id,
            targetQty
          );
          if (result.ok) {
            updated++;
          } else {
            failed++;
            console.error(`[faire] Failed to update inventory for ${product.id}/${variant.id}: ${result.status}`);
          }
        }
      }
      return res.json({ success: true, updated, failed, target_quantity: targetQty });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return res.status(500).json({ success: false, error: msg });
    }
  });

  return httpServer;
}
