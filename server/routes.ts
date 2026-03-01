import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const FAIRE_API_BASE = "https://www.faire.com/external-api/v2";

function isMockToken(token: string | undefined | null): boolean {
  if (!token) return true;
  const t = token.toLowerCase();
  return t.includes("mock") || t.startsWith("b_") === false;
}

async function faireRequest(
  method: string,
  path: string,
  brandToken: string,
  body?: object
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(`${FAIRE_API_BASE}${path}`, {
    method,
    headers: {
      "X-FAIRE-ACCESS-TOKEN": brandToken,
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

  // ── Accept order → PROCESSING ──────────────────────────────────────────────
  app.post("/api/faire/orders/:orderId/accept", async (req, res) => {
    const { orderId } = req.params;
    const { brandToken } = req.body as { brandToken?: string };

    if (isMockToken(brandToken)) {
      return res.json({ success: true, state: "PROCESSING", mock: true,
        message: "Order accepted (mock mode — no real API key configured)" });
    }

    try {
      const result = await faireRequest("POST", `/orders/${orderId}/processing`, brandToken!);
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
    } catch (err) {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  // ── Add shipment → PRE_TRANSIT ─────────────────────────────────────────────
  app.post("/api/faire/orders/:orderId/shipments", async (req, res) => {
    const { orderId } = req.params;
    const { brandToken, carrier, tracking_code, maker_cost_cents, shipping_type } =
      req.body as {
        brandToken?: string;
        carrier?: string;
        tracking_code?: string;
        maker_cost_cents?: number;
        shipping_type?: string;
      };

    if (isMockToken(brandToken)) {
      const mockShipment = {
        id: `s_mock_${Date.now()}`,
        order_id: orderId,
        carrier: carrier ?? "UPS",
        tracking_code: tracking_code ?? "MOCK_TRACKING",
        maker_cost_cents: maker_cost_cents ?? 0,
        shipping_type: shipping_type ?? "SHIP_ON_YOUR_OWN",
        created_at: new Date().toISOString(),
      };
      return res.json({ success: true, shipment: mockShipment, mock: true,
        message: "Shipment added to Faire (mock mode — no real API key configured)" });
    }

    try {
      const result = await faireRequest("POST", `/orders/${orderId}/shipments`, brandToken!, {
        shipments: [{
          carrier: carrier ?? "UPS",
          tracking_code,
          maker_cost_cents: maker_cost_cents ?? 0,
          shipping_type: shipping_type ?? "SHIP_ON_YOUR_OWN",
        }],
      });
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
    } catch (err) {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  // ── Cancel order ───────────────────────────────────────────────────────────
  app.post("/api/faire/orders/:orderId/cancel", async (req, res) => {
    const { orderId } = req.params;
    const { brandToken, reason } = req.body as { brandToken?: string; reason?: string };

    if (isMockToken(brandToken)) {
      return res.json({ success: true, state: "CANCELED", mock: true,
        message: "Order canceled (mock mode — no real API key configured)" });
    }

    try {
      const result = await faireRequest("POST", `/orders/${orderId}/cancel`, brandToken!, { reason });
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
    } catch (err) {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  return httpServer;
}
