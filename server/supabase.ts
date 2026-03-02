import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — store lookups will fail");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

// ── Store credential helpers ───────────────────────────────────────────────────

export async function getStoreCredentials(storeId: string): Promise<{
  app_credentials: string;
  oauth_access_token: string;
} | null> {
  const { data, error } = await supabase.rpc("faire_get_store_credentials", {
    p_store_id: storeId,
  });
  if (error) {
    console.error("[supabase] getStoreCredentials error:", error.message);
    return null;
  }
  const rows = data as { app_credentials: string; oauth_access_token: string }[] | null;
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

export async function listStores(): Promise<{ id: string; name: string; active: boolean; last_synced_at: string | null }[]> {
  const { data, error } = await supabase.rpc("faire_list_stores");
  if (error) {
    console.error("[supabase] listStores error:", error.message);
    return [];
  }
  return (data as { id: string; name: string; active: boolean; last_synced_at: string | null }[]) ?? [];
}

// ── Sync helpers (write) ───────────────────────────────────────────────────────

export async function syncOrders(storeId: string, orders: unknown[]): Promise<number> {
  if (orders.length === 0) return 0;
  const { data, error } = await supabase.rpc("faire_sync_orders", {
    p_store_id: storeId,
    p_orders: orders,
  });
  if (error) {
    console.error("[supabase] syncOrders error:", error.message);
    return 0;
  }
  return (data as { synced?: number })?.synced ?? 0;
}

export async function syncProducts(storeId: string, products: unknown[]): Promise<number> {
  if (products.length === 0) return 0;
  const { data, error } = await supabase.rpc("faire_sync_products", {
    p_store_id: storeId,
    p_products: products,
  });
  if (error) {
    console.error("[supabase] syncProducts error:", error.message);
    return 0;
  }
  return (data as { synced?: number })?.synced ?? 0;
}

export async function updateStoreProfile(storeId: string, profile: unknown): Promise<void> {
  const { error } = await supabase.rpc("faire_update_store_profile", {
    p_store_id: storeId,
    p_brand_profile: profile,
  });
  if (error) console.error("[supabase] updateStoreProfile error:", error.message);
}

// ── Read helpers ───────────────────────────────────────────────────────────────

export async function getStoreOrders(
  storeId: string,
  opts: { limit?: number; offset?: number; state?: string } = {}
): Promise<unknown[]> {
  const { data, error } = await supabase.rpc("faire_get_store_orders", {
    p_store_id: storeId,
    p_limit: opts.limit ?? 200,
    p_offset: opts.offset ?? 0,
    p_state: opts.state ?? null,
  });
  if (error) {
    console.error("[supabase] getStoreOrders error:", error.message);
    return [];
  }
  const rows = (data as { raw_data: unknown }[]) ?? [];
  return rows.map((r) => ({ ...(r.raw_data as object), _storeId: storeId }));
}

export async function getAllOrders(
  opts: { limit?: number; offset?: number; state?: string } = {}
): Promise<unknown[]> {
  if (opts.limit !== undefined && opts.offset !== undefined) {
    const { data, error } = await supabase.rpc("faire_get_all_orders", {
      p_limit: opts.limit,
      p_offset: opts.offset,
      p_state: opts.state ?? null,
    });
    if (error) {
      console.error("[supabase] getAllOrders error:", error.message);
      return [];
    }
    const rows = (data as { raw_data: unknown; store_id: string }[]) ?? [];
    return rows.map((r) => ({ ...(r.raw_data as object), _storeId: r.store_id }));
  }
  const PAGE = 1000;
  const all: unknown[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.rpc("faire_get_all_orders", {
      p_limit: PAGE,
      p_offset: offset,
      p_state: opts.state ?? null,
    });
    if (error) {
      console.error("[supabase] getAllOrders error:", error.message);
      break;
    }
    const rows = (data as { raw_data: unknown; store_id: string }[]) ?? [];
    if (rows.length === 0) break;
    all.push(...rows.map((r) => ({ ...(r.raw_data as object), _storeId: r.store_id })));
    if (rows.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

export async function getStoreProducts(
  storeId: string,
  opts: { limit?: number; offset?: number } = {}
): Promise<unknown[]> {
  const { data, error } = await supabase.rpc("faire_get_store_products", {
    p_store_id: storeId,
    p_limit: opts.limit ?? 200,
    p_offset: opts.offset ?? 0,
  });
  if (error) {
    console.error("[supabase] getStoreProducts error:", error.message);
    return [];
  }
  const rows = (data as { raw_data: unknown }[]) ?? [];
  return rows.map((r) => ({ ...(r.raw_data as object), _storeId: storeId }));
}

export async function getAllProducts(
  opts: { limit?: number; offset?: number } = {}
): Promise<unknown[]> {
  if (opts.limit && opts.offset !== undefined) {
    const { data, error } = await supabase.rpc("faire_get_all_products", {
      p_limit: opts.limit,
      p_offset: opts.offset,
    });
    if (error) {
      console.error("[supabase] getAllProducts error:", error.message);
      return [];
    }
    const rows = (data as { raw_data: unknown; store_id: string }[]) ?? [];
    return rows.map((r) => ({ ...(r.raw_data as object), _storeId: r.store_id }));
  }
  const PAGE = 1000;
  const all: unknown[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.rpc("faire_get_all_products", {
      p_limit: PAGE,
      p_offset: offset,
    });
    if (error) {
      console.error("[supabase] getAllProducts error:", error.message);
      break;
    }
    const rows = (data as { raw_data: unknown; store_id: string }[]) ?? [];
    if (rows.length === 0) break;
    all.push(...rows.map((r) => ({ ...(r.raw_data as object), _storeId: r.store_id })));
    if (rows.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

export async function upsertRetailer(faireRetailerId: string, rawData: unknown): Promise<void> {
  const { error } = await supabase.rpc("faire_upsert_retailer", {
    p_faire_retailer_id: faireRetailerId,
    p_raw_data: rawData,
  });
  if (error) console.error("[supabase] upsertRetailer error:", error.message);
}

interface OrderForRetailer {
  retailer_id?: string;
  _storeId?: string;
  created_at?: string;
  address?: {
    name?: string;
    company_name?: string;
    city?: string;
    state?: string;
    state_code?: string;
    country?: string;
    country_code?: string;
    postal_code?: string;
    phone_number?: string;
  };
  items?: { price_cents?: number; quantity?: number }[];
}

export async function extractAndUpsertRetailersFromOrders(
  orders: unknown[]
): Promise<number> {
  const retailerMap = new Map<string, {
    id: string;
    name: string;
    company_name: string;
    city: string;
    state: string;
    state_code: string;
    country: string;
    country_code: string;
    postal_code: string;
    phone_number: string;
    total_orders: number;
    total_spent_cents: number;
    first_order_at: string | null;
    last_order_at: string | null;
    store_ids: Set<string>;
  }>();

  for (const rawOrder of orders) {
    const order = rawOrder as OrderForRetailer;
    const rid = order.retailer_id;
    if (!rid) continue;

    if (!retailerMap.has(rid)) {
      const addr = order.address ?? {};
      retailerMap.set(rid, {
        id: rid,
        name: addr.company_name || addr.name || rid,
        company_name: addr.company_name || "",
        city: addr.city || "",
        state: addr.state || "",
        state_code: addr.state_code || "",
        country: addr.country || "",
        country_code: addr.country_code || "",
        postal_code: addr.postal_code || "",
        phone_number: addr.phone_number || "",
        total_orders: 0,
        total_spent_cents: 0,
        first_order_at: null,
        last_order_at: null,
        store_ids: new Set(),
      });
    }

    const r = retailerMap.get(rid)!;
    r.total_orders++;

    const orderTotal = (order.items ?? []).reduce(
      (sum, item) => sum + (item.price_cents ?? 0) * (item.quantity ?? 1), 0
    );
    r.total_spent_cents += orderTotal;

    if (order.created_at) {
      if (!r.first_order_at || order.created_at < r.first_order_at) r.first_order_at = order.created_at;
      if (!r.last_order_at || order.created_at > r.last_order_at) r.last_order_at = order.created_at;
    }

    if (order._storeId) r.store_ids.add(order._storeId);
  }

  let upserted = 0;
  for (const [rid, r] of retailerMap) {
    const rawData = {
      id: rid,
      name: r.name,
      company_name: r.company_name,
      city: r.city,
      state: r.state,
      state_code: r.state_code,
      country: r.country,
      country_code: r.country_code,
      postal_code: r.postal_code,
      phone_number: r.phone_number,
      total_orders: r.total_orders,
      total_spent_cents: r.total_spent_cents,
      first_order_at: r.first_order_at,
      last_order_at: r.last_order_at,
      store_ids: [...r.store_ids],
    };
    await upsertRetailer(rid, rawData);
    upserted++;
  }

  console.log(`[supabase] extractAndUpsertRetailersFromOrders: upserted ${upserted} retailers from ${orders.length} orders`);
  return upserted;
}

export async function getAllRetailers(): Promise<unknown[]> {
  const { data, error } = await supabase.rpc("faire_get_all_retailers");
  if (error) {
    console.error("[supabase] getAllRetailers error:", error.message);
    return [];
  }
  const rows = (data as { raw_data: unknown; faire_retailer_id: string }[]) ?? [];
  return rows.map((r) => r.raw_data);
}

export async function getRetailer(faireRetailerId: string): Promise<unknown | null> {
  const { data, error } = await supabase.rpc("faire_get_retailer", {
    p_faire_retailer_id: faireRetailerId,
  });
  if (error) {
    console.error("[supabase] getRetailer error:", error.message);
    return null;
  }
  const rows = (data as { raw_data: unknown }[]) ?? [];
  return rows.length > 0 ? rows[0].raw_data : null;
}

export async function getStoreCounts(storeId: string): Promise<{
  total_orders: number;
  total_products: number;
  new_orders: number;
}> {
  const { data, error } = await supabase.rpc("faire_get_store_counts", {
    p_store_id: storeId,
  });
  if (error) {
    console.error("[supabase] getStoreCounts error:", error.message);
    return { total_orders: 0, total_products: 0, new_orders: 0 };
  }
  const rows = (data as { total_orders: number; total_products: number; new_orders: number }[]) ?? [];
  if (rows.length === 0) return { total_orders: 0, total_products: 0, new_orders: 0 };
  return rows[0];
}

// ── Vendor helpers ─────────────────────────────────────────────────────────────

export interface FaireVendor {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  whatsapp: string;
  is_default: boolean;
  notes: string;
  created_at: string;
}

export async function listVendors(): Promise<FaireVendor[]> {
  const { data, error } = await supabase.rpc("faire_list_vendors");
  if (error) { console.error("[supabase] listVendors error:", error.message); return []; }
  return (data as FaireVendor[]) ?? [];
}

export async function upsertVendor(vendor: {
  id?: string;
  name: string;
  contact_name: string;
  email: string;
  whatsapp: string;
  is_default: boolean;
  notes: string;
}): Promise<FaireVendor | null> {
  const { data, error } = await supabase.rpc("faire_upsert_vendor", {
    p_id: vendor.id ?? null,
    p_name: vendor.name,
    p_contact_name: vendor.contact_name,
    p_email: vendor.email,
    p_whatsapp: vendor.whatsapp,
    p_is_default: vendor.is_default,
    p_notes: vendor.notes,
  });
  if (error) { console.error("[supabase] upsertVendor error:", error.message); return null; }
  return data as FaireVendor;
}

export async function deleteVendor(id: string): Promise<void> {
  const { error } = await supabase.rpc("faire_delete_vendor", { p_id: id });
  if (error) console.error("[supabase] deleteVendor error:", error.message);
}

export async function getProductVendors(productId: string): Promise<{ vendor_id: string; vendor_name: string; is_exclusive: boolean }[]> {
  const { data, error } = await supabase.rpc("faire_get_product_vendors", { p_product_id: productId });
  if (error) { console.error("[supabase] getProductVendors error:", error.message); return []; }
  return (data as { vendor_id: string; vendor_name: string; is_exclusive: boolean }[]) ?? [];
}

export async function setProductVendor(productId: string, vendorId: string, isExclusive: boolean): Promise<void> {
  const { error } = await supabase.rpc("faire_set_product_vendor", {
    p_product_id: productId,
    p_vendor_id: vendorId,
    p_is_exclusive: isExclusive,
  });
  if (error) console.error("[supabase] setProductVendor error:", error.message);
}

export async function removeProductVendor(productId: string, vendorId: string): Promise<void> {
  const { error } = await supabase.rpc("faire_remove_product_vendor", {
    p_product_id: productId,
    p_vendor_id: vendorId,
  });
  if (error) console.error("[supabase] removeProductVendor error:", error.message);
}

// ── Transaction attachment helpers ─────────────────────────────────────────────

export interface TransactionAttachment {
  id: string;
  transaction_id: string;
  file_name: string;
  storage_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

export async function getTransactionAttachments(transactionId: string): Promise<TransactionAttachment[]> {
  const { data, error } = await supabase.rpc("faire_get_transaction_attachments", { p_transaction_id: transactionId });
  if (error) { console.error("[supabase] getTransactionAttachments error:", error.message); return []; }
  return (data as TransactionAttachment[]) ?? [];
}

export async function addTransactionAttachment(params: {
  transaction_id: string;
  file_name: string;
  storage_path: string;
  file_size_bytes: number;
  mime_type: string;
}): Promise<TransactionAttachment | null> {
  const { data, error } = await supabase.rpc("faire_add_transaction_attachment", {
    p_transaction_id: params.transaction_id,
    p_file_name: params.file_name,
    p_storage_path: params.storage_path,
    p_file_size_bytes: params.file_size_bytes,
    p_mime_type: params.mime_type,
  });
  if (error) { console.error("[supabase] addTransactionAttachment error:", error.message); return null; }
  return data as TransactionAttachment;
}

export async function uploadTransactionProof(transactionId: string, file: Buffer, fileName: string, mimeType: string): Promise<string | null> {
  const path = `${transactionId}/${Date.now()}-${fileName}`;
  const { error } = await supabase.storage.from("transaction-proofs").upload(path, file, { contentType: mimeType, upsert: false });
  if (error) { console.error("[supabase] uploadTransactionProof error:", error.message); return null; }
  return path;
}

export async function getTransactionProofUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from("transaction-proofs").createSignedUrl(storagePath, 3600);
  if (error) { console.error("[supabase] getTransactionProofUrl error:", error.message); return null; }
  return data.signedUrl;
}
