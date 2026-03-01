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
  getStoreCounts,
} from "./supabase";
import { fetchAllOrders, fetchAllProducts, fetchBrandProfile } from "./faire-api";

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

  // ── List stores (id + name + last_synced_at — credentials never leave the server) ─
  app.get("/api/faire/stores", async (_req, res) => {
    try {
      const stores = await listStores();
      return res.json({ stores });
    } catch {
      return res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  // ── All orders across all stores (no storeId filter) ─────────────────────
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

  // ── Full sync for a store (orders + products + brand profile) ──────────────
  app.post("/api/faire/stores/:storeId/sync", async (req, res) => {
    const { storeId } = req.params;

    const creds = await getStoreCredentials(storeId);
    if (!creds) {
      return res.status(404).json({ success: false, error: "Store not found or inactive" });
    }

    try {
      // Fetch brand profile
      let profileSynced = false;
      try {
        const profile = await fetchBrandProfile(creds);
        await updateStoreProfile(storeId, profile);
        profileSynced = true;
      } catch (err) {
        console.error(`[sync] brand profile error for ${storeId}:`, err);
      }

      // Fetch + sync orders
      const orders = await fetchAllOrders(creds);
      const ordersSynced = await syncOrders(storeId, orders);

      // Fetch + sync products
      const products = await fetchAllProducts(creds);
      const productsSynced = await syncProducts(storeId, products);

      return res.json({
        success: true,
        orders_synced: ordersSynced,
        products_synced: productsSynced,
        profile_synced: profileSynced,
      });
    } catch (err) {
      console.error(`[sync] error for store ${storeId}:`, err);
      return res.status(502).json({ success: false, error: "Sync failed — check server logs" });
    }
  });

  // ── Read synced orders from Supabase ─────────────────────────────────────
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

  // ── Read synced products from Supabase ────────────────────────────────────
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

  // ── Store counts (for dashboard / store cards) ────────────────────────────
  app.get("/api/faire/stores/:storeId/counts", async (req, res) => {
    const { storeId } = req.params;
    try {
      const counts = await getStoreCounts(storeId);
      return res.json(counts);
    } catch {
      return res.status(500).json({ error: "Failed to fetch counts" });
    }
  });

  // ── Accept order → PROCESSING ──────────────────────────────────────────────
  app.post("/api/faire/orders/:orderId/accept", async (req, res) => {
    const { orderId } = req.params;
    const { storeId } = req.body as { storeId?: string };

    if (!storeId) {
      return res.json({ success: true, state: "PROCESSING", mock: true,
        message: "Order accepted (mock mode — no store selected)" });
    }

    const creds = await getStoreCredentials(storeId);
    if (!creds) {
      return res.status(404).json({ success: false, error: "Store not found or inactive" });
    }

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

  // ── Add shipment → PRE_TRANSIT ─────────────────────────────────────────────
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
    if (!creds) {
      return res.status(404).json({ success: false, error: "Store not found or inactive" });
    }

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

  // ── Cancel order ───────────────────────────────────────────────────────────
  app.post("/api/faire/orders/:orderId/cancel", async (req, res) => {
    const { orderId } = req.params;
    const { storeId, reason } = req.body as { storeId?: string; reason?: string };

    if (!storeId) {
      return res.json({ success: true, state: "CANCELED", mock: true,
        message: "Order canceled (mock mode — no store selected)" });
    }

    const creds = await getStoreCredentials(storeId);
    if (!creds) {
      return res.status(404).json({ success: false, error: "Store not found or inactive" });
    }

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

  return httpServer;
}
