import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getStoreCredentials, listStores } from "./supabase";

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
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── List stores (id + name only — credentials never leave the server) ───────
  app.get("/api/faire/stores", async (_req, res) => {
    try {
      const stores = await listStores();
      return res.json({ stores });
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  // ── Accept order → PROCESSING ──────────────────────────────────────────────
  app.post("/api/faire/orders/:orderId/accept", async (req, res) => {
    const { orderId } = req.params;
    const { storeId } = req.body as { storeId?: string };

    if (!storeId) {
      return res.json({
        success: true, state: "PROCESSING", mock: true,
        message: "Order accepted (mock mode — no store selected)",
      });
    }

    const creds = await getStoreCredentials(storeId);
    if (!creds) {
      return res.status(404).json({ success: false, error: "Store not found or inactive" });
    }

    try {
      const result = await faireRequest(
        "POST", `/orders/${orderId}/processing`,
        creds.oauth_access_token, creds.app_credentials
      );
      if (result.ok) {
        const d = result.data as Record<string, unknown> | null;
        return res.json({ success: true, state: d?.state ?? "PROCESSING", mock: false });
      } else {
        const d = result.data as Record<string, unknown> | null;
        return res.status(result.status).json({
          success: false,
          error: d?.message ?? `Faire API returned ${result.status}`,
          mock: false,
        });
      }
    } catch {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  // ── Add shipment → PRE_TRANSIT ─────────────────────────────────────────────
  app.post("/api/faire/orders/:orderId/shipments", async (req, res) => {
    const { orderId } = req.params;
    const { storeId, carrier, tracking_code, maker_cost_cents, shipping_type } =
      req.body as {
        storeId?: string;
        carrier?: string;
        tracking_code?: string;
        maker_cost_cents?: number;
        shipping_type?: string;
      };

    if (!storeId) {
      const mockShipment = {
        id: `s_mock_${Date.now()}`,
        order_id: orderId,
        carrier: carrier ?? "UPS",
        tracking_code: tracking_code ?? "MOCK_TRACKING",
        maker_cost_cents: maker_cost_cents ?? 0,
        shipping_type: shipping_type ?? "SHIP_ON_YOUR_OWN",
        created_at: new Date().toISOString(),
      };
      return res.json({
        success: true, shipment: mockShipment, mock: true,
        message: "Shipment added (mock mode — no store selected)",
      });
    }

    const creds = await getStoreCredentials(storeId);
    if (!creds) {
      return res.status(404).json({ success: false, error: "Store not found or inactive" });
    }

    try {
      const result = await faireRequest(
        "POST", `/orders/${orderId}/shipments`,
        creds.oauth_access_token, creds.app_credentials,
        {
          shipments: [{
            carrier: carrier ?? "UPS",
            tracking_code,
            maker_cost_cents: maker_cost_cents ?? 0,
            shipping_type: shipping_type ?? "SHIP_ON_YOUR_OWN",
          }],
        }
      );
      if (result.ok) {
        const d = result.data as Record<string, unknown> | null;
        const shipments = (d?.shipments as unknown[]) ?? [];
        return res.json({ success: true, shipment: shipments[0] ?? null, mock: false });
      } else {
        const d = result.data as Record<string, unknown> | null;
        return res.status(result.status).json({
          success: false,
          error: d?.message ?? `Faire API returned ${result.status}`,
          mock: false,
        });
      }
    } catch {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  // ── Cancel order ───────────────────────────────────────────────────────────
  app.post("/api/faire/orders/:orderId/cancel", async (req, res) => {
    const { orderId } = req.params;
    const { storeId, reason } = req.body as { storeId?: string; reason?: string };

    if (!storeId) {
      return res.json({
        success: true, state: "CANCELED", mock: true,
        message: "Order canceled (mock mode — no store selected)",
      });
    }

    const creds = await getStoreCredentials(storeId);
    if (!creds) {
      return res.status(404).json({ success: false, error: "Store not found or inactive" });
    }

    try {
      const result = await faireRequest(
        "POST", `/orders/${orderId}/cancel`,
        creds.oauth_access_token, creds.app_credentials,
        { reason }
      );
      if (result.ok) {
        const d = result.data as Record<string, unknown> | null;
        return res.json({ success: true, state: d?.state ?? "CANCELED", mock: false });
      } else {
        const d = result.data as Record<string, unknown> | null;
        return res.status(result.status).json({
          success: false,
          error: d?.message ?? `Faire API returned ${result.status}`,
          mock: false,
        });
      }
    } catch {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  return httpServer;
}
