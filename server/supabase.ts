import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — store lookups will fail");
}

export const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
  : null as any;

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
  country: string;
  rating: number;
  avg_lead_days: number;
  specialties: string[];
  completed_orders: number;
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

// ── Seller Application helpers ─────────────────────────────────────────────────

export interface SellerApplication {
  id: string;
  brand_name: string;
  category: string | null;
  brand_story: string | null;
  logo_url: string | null;
  banner_url: string | null;
  email_id: string | null;
  email_type: string | null;
  application_date: string | null;
  status: string;
  marketplace_strategy: string | null;
  domain_name: string | null;
  website_url: string | null;
  etsy_store_url: string | null;
  reference_store_url: string | null;
  num_products_listed: number | null;
  listing_method: string | null;
  csv_storage_path: string | null;
  ein_storage_path: string | null;
  articles_storage_path: string | null;
  faire_reg_url: string | null;
  notes: string | null;
  linked_store_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ApplicationFollowup {
  id: string;
  application_id: string;
  followup_date: string;
  followup_type: string;
  note: string | null;
  created_at: string | null;
}

export interface ApplicationLink {
  id: string;
  application_id: string;
  label: string;
  url: string;
  link_type: string;
  created_at: string | null;
}

export async function listSellerApplications(): Promise<SellerApplication[]> {
  const { data, error } = await supabase.rpc("faire_list_applications");
  if (error) { console.error("[supabase] listSellerApplications error:", error.message); return []; }
  return (data as SellerApplication[]) ?? [];
}

export async function getSellerApplication(id: string): Promise<(SellerApplication & { followups: ApplicationFollowup[]; links: ApplicationLink[] }) | null> {
  const { data, error } = await supabase.rpc("faire_get_application", { p_id: id });
  if (error) { console.error("[supabase] getSellerApplication error:", error.message); return null; }
  return data as (SellerApplication & { followups: ApplicationFollowup[]; links: ApplicationLink[] }) | null;
}

export async function upsertSellerApplication(params: {
  id?: string | null;
  brand_name: string;
  category?: string | null;
  brand_story?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  email_id?: string | null;
  email_type?: string | null;
  application_date?: string | null;
  status?: string;
  marketplace_strategy?: string | null;
  domain_name?: string | null;
  website_url?: string | null;
  etsy_store_url?: string | null;
  reference_store_url?: string | null;
  num_products_listed?: number | null;
  listing_method?: string | null;
  csv_storage_path?: string | null;
  ein_storage_path?: string | null;
  articles_storage_path?: string | null;
  faire_reg_url?: string | null;
  notes?: string | null;
  linked_store_id?: string | null;
}): Promise<SellerApplication | null> {
  const { data, error } = await supabase.rpc("faire_upsert_application", {
    p_id: params.id ?? null,
    p_brand_name: params.brand_name,
    p_category: params.category ?? null,
    p_brand_story: params.brand_story ?? null,
    p_logo_url: params.logo_url ?? null,
    p_banner_url: params.banner_url ?? null,
    p_email_id: params.email_id ?? null,
    p_email_type: params.email_type ?? "basic",
    p_application_date: params.application_date ?? null,
    p_status: params.status ?? "drafting",
    p_marketplace_strategy: params.marketplace_strategy ?? "website",
    p_domain_name: params.domain_name ?? null,
    p_website_url: params.website_url ?? null,
    p_etsy_store_url: params.etsy_store_url ?? null,
    p_reference_store_url: params.reference_store_url ?? null,
    p_num_products_listed: params.num_products_listed ?? 0,
    p_listing_method: params.listing_method ?? "manual",
    p_csv_storage_path: params.csv_storage_path ?? null,
    p_ein_storage_path: params.ein_storage_path ?? null,
    p_articles_storage_path: params.articles_storage_path ?? null,
    p_faire_reg_url: params.faire_reg_url ?? "https://www.faire.com/brand-portal/signup",
    p_notes: params.notes ?? null,
    p_linked_store_id: params.linked_store_id ?? null,
  });
  if (error) { console.error("[supabase] upsertSellerApplication error:", error.message); return null; }
  return data as SellerApplication;
}

export async function deleteSellerApplication(id: string): Promise<void> {
  const { error } = await supabase.rpc("faire_delete_application", { p_id: id });
  if (error) console.error("[supabase] deleteSellerApplication error:", error.message);
}

export async function addApplicationFollowup(params: {
  application_id: string;
  followup_date: string;
  followup_type: string;
  note?: string | null;
}): Promise<ApplicationFollowup | null> {
  const { data, error } = await supabase.rpc("faire_add_followup", {
    p_application_id: params.application_id,
    p_followup_date: params.followup_date,
    p_followup_type: params.followup_type,
    p_note: params.note ?? null,
  });
  if (error) { console.error("[supabase] addApplicationFollowup error:", error.message); return null; }
  return data as ApplicationFollowup;
}

export async function deleteApplicationFollowup(id: string): Promise<void> {
  const { error } = await supabase.rpc("faire_delete_followup", { p_id: id });
  if (error) console.error("[supabase] deleteApplicationFollowup error:", error.message);
}

export async function upsertApplicationLink(params: {
  id?: string | null;
  application_id: string;
  label: string;
  url: string;
  link_type?: string;
}): Promise<ApplicationLink | null> {
  const { data, error } = await supabase.rpc("faire_upsert_link", {
    p_id: params.id ?? null,
    p_application_id: params.application_id,
    p_label: params.label,
    p_url: params.url,
    p_link_type: params.link_type ?? "other",
  });
  if (error) { console.error("[supabase] upsertApplicationLink error:", error.message); return null; }
  return data as ApplicationLink;
}

export async function deleteApplicationLink(id: string): Promise<void> {
  const { error } = await supabase.rpc("faire_delete_link", { p_id: id });
  if (error) console.error("[supabase] deleteApplicationLink error:", error.message);
}

export interface RetailerEnrichment {
  retailer_id: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  store_address: string | null;
  business_type: string | null;
  store_type: string | null;
  website: string | null;
  instagram: string | null;
  notes: string | null;
  enriched_by: string | null;
  enriched_at: string | null;
  updated_at: string | null;
}

export async function getRetailerEnrichment(retailerId: string): Promise<RetailerEnrichment | null> {
  const { data, error } = await supabase.rpc("faire_get_retailer_enrichment", {
    p_retailer_id: retailerId,
  });
  if (error) { console.error("[supabase] getRetailerEnrichment error:", error.message); return null; }
  const rows = data as RetailerEnrichment[];
  return rows?.[0] ?? null;
}

export async function upsertRetailerEnrichment(params: {
  retailer_id: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  store_address?: string | null;
  business_type?: string | null;
  store_type?: string | null;
  website?: string | null;
  instagram?: string | null;
  notes?: string | null;
  enriched_by?: string | null;
}): Promise<RetailerEnrichment | null> {
  const { data, error } = await supabase.rpc("faire_upsert_retailer_enrichment", {
    p_retailer_id: params.retailer_id,
    p_contact_name: params.contact_name ?? null,
    p_contact_email: params.contact_email ?? null,
    p_contact_phone: params.contact_phone ?? null,
    p_store_address: params.store_address ?? null,
    p_business_type: params.business_type ?? null,
    p_store_type: params.store_type ?? null,
    p_website: params.website ?? null,
    p_instagram: params.instagram ?? null,
    p_notes: params.notes ?? null,
    p_enriched_by: params.enriched_by ?? null,
  });
  if (error) { console.error("[supabase] upsertRetailerEnrichment error:", error.message); return null; }
  const rows = data as RetailerEnrichment[];
  return rows?.[0] ?? null;
}

// ── Bank Transactions ──────────────────────────────────────────────────────────

export interface BankTxRow {
  id: string;
  source: string;
  entity: string | null;
  bank_name: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  amount_usd: number | null;
  type: string;
  category: string | null;
  is_business: boolean;
  tags: string[];
  reference: string | null;
  faire_order_id: string | null;
  reconciled: boolean;
  notes: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function getBankTransactions(filters: {
  source?: string;
  entity?: string;
  type?: string;
  search?: string;
  is_business?: boolean;
  page?: number;
  limit?: number;
} = {}): Promise<{ transactions: BankTxRow[]; total: number }> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 100;
  const offset = (page - 1) * limit;

  let q = supabase.from("bank_transactions").select("*", { count: "exact" });
  if (filters.source) q = q.eq("source", filters.source);
  if (filters.entity) q = q.eq("entity", filters.entity);
  if (filters.type) q = q.eq("type", filters.type);
  if (filters.is_business !== undefined) q = q.eq("is_business", filters.is_business);
  if (filters.search) q = q.ilike("description", `%${filters.search}%`);
  q = q.order("date", { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) {
    console.error("[supabase] getBankTransactions error:", error.message);
    return { transactions: [], total: 0 };
  }
  return { transactions: (data ?? []) as BankTxRow[], total: count ?? 0 };
}

export async function updateBankTransaction(id: string, patch: {
  is_business?: boolean;
  category?: string;
  notes?: string;
  reconciled?: boolean;
  tags?: string[];
  faire_order_id?: string | null;
}): Promise<BankTxRow | null> {
  const { data, error } = await supabase.rpc("bank_update_transaction", {
    p_id: id,
    p_is_business: patch.is_business ?? null,
    p_category: patch.category ?? null,
    p_notes: patch.notes ?? null,
    p_reconciled: patch.reconciled ?? null,
    p_tags: patch.tags ?? null,
    p_faire_order_id: patch.faire_order_id !== undefined ? patch.faire_order_id : null,
  });
  if (error) {
    console.error("[supabase] updateBankTransaction error:", error.message);
    return null;
  }
  const rows = data as BankTxRow[];
  return rows?.[0] ?? null;
}

export async function addBankTransaction(tx: {
  source: string;
  entity?: string;
  bank_name: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  amount_usd?: number;
  type: string;
  category?: string;
  is_business?: boolean;
  tags?: string[];
  reference?: string;
  faire_order_id?: string;
  reconciled?: boolean;
  notes?: string;
}): Promise<BankTxRow | null> {
  const { data, error } = await supabase
    .from("bank_transactions")
    .insert([{ ...tx, is_business: tx.is_business ?? true, tags: tx.tags ?? [], reconciled: tx.reconciled ?? false }])
    .select()
    .single();
  if (error) {
    console.error("[supabase] addBankTransaction error:", error.message);
    return null;
  }
  return data as BankTxRow;
}

// ── Ledger Parties ─────────────────────────────────────────────────────────────

export interface LedgerParty {
  id: string;
  name: string;
  type: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  currency: string;
  credit_limit: number | null;
  credit_days: number | null;
  tags: string[];
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LedgerPartyTx {
  id: string;
  party_id: string;
  type: string;
  direction: string;
  date: string;
  due_date: string | null;
  amount: number;
  currency: string;
  amount_usd: number | null;
  reference: string | null;
  description: string;
  faire_order_id: string | null;
  bank_transaction_id: string | null;
  status: string;
  paid_amount: number;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function listLedgerParties(): Promise<LedgerParty[]> {
  const { data, error } = await supabase
    .from("ledger_parties")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) { console.error("[supabase] listLedgerParties error:", error.message); return []; }
  return (data ?? []) as LedgerParty[];
}

export async function getLedgerParty(id: string): Promise<LedgerParty | null> {
  const { data, error } = await supabase
    .from("ledger_parties")
    .select("*")
    .eq("id", id)
    .single();
  if (error) { console.error("[supabase] getLedgerParty error:", error.message); return null; }
  return data as LedgerParty;
}

export async function upsertLedgerParty(party: Partial<LedgerParty> & { name: string; type: string }): Promise<LedgerParty | null> {
  const { data, error } = party.id
    ? await supabase.from("ledger_parties").update({ ...party, updated_at: new Date().toISOString() }).eq("id", party.id).select().single()
    : await supabase.from("ledger_parties").insert([{ ...party, currency: party.currency ?? "USD", is_active: true }]).select().single();
  if (error) { console.error("[supabase] upsertLedgerParty error:", error.message); return null; }
  return data as LedgerParty;
}

export async function getLedgerPartyTransactions(partyId: string): Promise<LedgerPartyTx[]> {
  const { data, error } = await supabase
    .from("ledger_party_transactions")
    .select("*")
    .eq("party_id", partyId)
    .order("date", { ascending: false });
  if (error) { console.error("[supabase] getLedgerPartyTransactions error:", error.message); return []; }
  return (data ?? []) as LedgerPartyTx[];
}

export async function addLedgerPartyTransaction(tx: Partial<LedgerPartyTx> & {
  party_id: string;
  type: string;
  direction: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
}): Promise<LedgerPartyTx | null> {
  const { data, error } = await supabase
    .from("ledger_party_transactions")
    .insert([{ ...tx, status: tx.status ?? "pending", paid_amount: tx.paid_amount ?? 0, amount_usd: tx.amount_usd ?? tx.amount }])
    .select()
    .single();
  if (error) { console.error("[supabase] addLedgerPartyTransaction error:", error.message); return null; }
  return data as LedgerPartyTx;
}

export async function updateLedgerPartyTransaction(id: string, patch: Partial<LedgerPartyTx>): Promise<LedgerPartyTx | null> {
  const { data, error } = await supabase
    .from("ledger_party_transactions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[supabase] updateLedgerPartyTransaction error:", error.message); return null; }
  return data as LedgerPartyTx;
}

export async function getPartyBalance(partyId: string): Promise<number> {
  const { data, error } = await supabase.rpc("get_party_balance", { p_party_id: partyId });
  if (error) { console.error("[supabase] getPartyBalance error:", error.message); return 0; }
  return Number(data ?? 0);
}

// ── Task Activity (comments, attachments, links) ───────────────────────────────

export interface TaskActivityItem {
  id: string;
  task_id: string;
  type: "comment" | "attachment" | "link";
  content: string | null;
  author: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  link_url: string | null;
  link_title: string | null;
  created_at: string;
}

export async function getTaskActivity(taskId: string): Promise<TaskActivityItem[]> {
  const { data, error } = await supabase
    .from("task_activity")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  if (error) { console.error("[supabase] getTaskActivity error:", error.message); return []; }
  return (data ?? []) as TaskActivityItem[];
}

export async function addTaskComment(taskId: string, content: string, author: string): Promise<TaskActivityItem | null> {
  const { data, error } = await supabase
    .from("task_activity")
    .insert([{ task_id: taskId, type: "comment", content, author }])
    .select()
    .single();
  if (error) { console.error("[supabase] addTaskComment error:", error.message); return null; }
  return data as TaskActivityItem;
}

export async function addTaskLink(taskId: string, url: string, title: string, author: string): Promise<TaskActivityItem | null> {
  const { data, error } = await supabase
    .from("task_activity")
    .insert([{ task_id: taskId, type: "link", link_url: url, link_title: title || url, author }])
    .select()
    .single();
  if (error) { console.error("[supabase] addTaskLink error:", error.message); return null; }
  return data as TaskActivityItem;
}

export async function uploadTaskFile(
  taskId: string,
  buffer: Buffer,
  filename: string,
  mimeType: string,
  author: string
): Promise<TaskActivityItem | null> {
  const ext = filename.split(".").pop() ?? "bin";
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${taskId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("task-attachments")
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (uploadError) {
    console.error("[supabase] uploadTaskFile storage error:", uploadError.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from("task-attachments").getPublicUrl(path);
  const fileUrl = urlData?.publicUrl ?? "";

  const { data, error } = await supabase
    .from("task_activity")
    .insert([{
      task_id: taskId,
      type: "attachment",
      author,
      file_url: fileUrl,
      file_name: filename,
      file_size: buffer.length,
    }])
    .select()
    .single();

  if (error) { console.error("[supabase] uploadTaskFile insert error:", error.message); return null; }
  return data as TaskActivityItem;
}

export async function deleteTaskActivity(id: string): Promise<boolean> {
  const { data: row } = await supabase
    .from("task_activity")
    .select("type, file_url")
    .eq("id", id)
    .single();

  if (row?.type === "attachment" && row?.file_url) {
    const url: string = row.file_url;
    const match = url.match(/task-attachments\/(.+)$/);
    if (match?.[1]) {
      await supabase.storage.from("task-attachments").remove([decodeURIComponent(match[1])]);
    }
  }

  const { error } = await supabase.from("task_activity").delete().eq("id", id);
  if (error) { console.error("[supabase] deleteTaskActivity error:", error.message); return false; }
  return true;
}

// ── CORE: Verticals ────────────────────────────────────────────────────────────

export interface CoreVertical {
  id: string;
  name: string;
  short_name: string | null;
  color: string;
  tagline: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getVerticals(): Promise<CoreVertical[]> {
  const { data, error } = await supabase.from("verticals").select("*").order("name");
  if (error) { console.error("[supabase] getVerticals error:", error.message); return []; }
  return (data as CoreVertical[]) ?? [];
}

export async function getVertical(id: string): Promise<CoreVertical | null> {
  const { data, error } = await supabase.from("verticals").select("*").eq("id", id).single();
  if (error) { console.error("[supabase] getVertical error:", error.message); return null; }
  return data as CoreVertical;
}

// ── CORE: Users ────────────────────────────────────────────────────────────────

export interface CoreUser {
  id: string;
  employee_code: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: string | null;
  department: string | null;
  designation: string | null;
  employment_type: string | null;
  status: string;
  location: string | null;
  skills: string[];
  avatar_initials: string | null;
  avatar_url: string | null;
  salary: number | null;
  reporting_manager_id: string | null;
  joined_date: string | null;
  created_at: string;
}

export async function getUsers(verticalId?: string): Promise<CoreUser[]> {
  if (verticalId) {
    const { data, error } = await supabase
      .from("user_verticals")
      .select("users(*)")
      .eq("vertical_id", verticalId);
    if (error) { console.error("[supabase] getUsers error:", error.message); return []; }
    return ((data ?? []) as { users: CoreUser }[]).map((r) => r.users);
  }
  const { data, error } = await supabase.from("users").select("*").order("name");
  if (error) { console.error("[supabase] getUsers error:", error.message); return []; }
  return (data as CoreUser[]) ?? [];
}

export async function getUser(id: string): Promise<CoreUser | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
  if (error) { console.error("[supabase] getUser error:", error.message); return null; }
  return data as CoreUser;
}

// ── CORE: Tasks ────────────────────────────────────────────────────────────────

export interface CoreTask {
  id: string;
  task_code: string | null;
  vertical_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_id: string | null;
  assignee_name: string | null;
  due_date: string | null;
  tags: string[];
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoreTaskInput {
  vertical_id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee_id?: string;
  assignee_name?: string;
  due_date?: string;
  tags?: string[];
  created_by?: string;
  created_by_name?: string;
}

export async function getCoreTasksByVertical(verticalId?: string): Promise<CoreTask[]> {
  let q = supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (verticalId) q = q.eq("vertical_id", verticalId);
  const { data, error } = await q;
  if (error) { console.error("[supabase] getCoreTasksByVertical error:", error.message); return []; }
  return (data as CoreTask[]) ?? [];
}

export async function getCoreTask(id: string): Promise<CoreTask | null> {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (error) { console.error("[supabase] getCoreTask error:", error.message); return null; }
  return data as CoreTask;
}

export async function createCoreTask(input: CoreTaskInput): Promise<CoreTask | null> {
  const { data, error } = await supabase.from("tasks").insert([input]).select().single();
  if (error) { console.error("[supabase] createCoreTask error:", error.message); return null; }
  return data as CoreTask;
}

export async function updateCoreTask(id: string, patch: Partial<CoreTaskInput>): Promise<CoreTask | null> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[supabase] updateCoreTask error:", error.message); return null; }
  return data as CoreTask;
}

export async function deleteCoreTask(id: string): Promise<boolean> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) { console.error("[supabase] deleteCoreTask error:", error.message); return false; }
  return true;
}

// ── CORE: Task Subtasks ────────────────────────────────────────────────────────

export interface CoreSubtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
}

export async function getCoreSubtasks(taskId: string): Promise<CoreSubtask[]> {
  const { data, error } = await supabase
    .from("task_subtasks")
    .select("*")
    .eq("task_id", taskId)
    .order("sort_order");
  if (error) { console.error("[supabase] getCoreSubtasks error:", error.message); return []; }
  return (data as CoreSubtask[]) ?? [];
}

export async function upsertCoreSubtask(input: {
  id?: string;
  task_id: string;
  title: string;
  completed?: boolean;
  sort_order?: number;
}): Promise<CoreSubtask | null> {
  const { data, error } = await supabase
    .from("task_subtasks")
    .upsert([input], { onConflict: "id" })
    .select()
    .single();
  if (error) { console.error("[supabase] upsertCoreSubtask error:", error.message); return null; }
  return data as CoreSubtask;
}

export async function deleteCoreSubtask(id: string): Promise<boolean> {
  const { error } = await supabase.from("task_subtasks").delete().eq("id", id);
  if (error) { console.error("[supabase] deleteCoreSubtask error:", error.message); return false; }
  return true;
}

export async function toggleCoreSubtask(id: string, completed: boolean): Promise<CoreSubtask | null> {
  const { data, error } = await supabase
    .from("task_subtasks")
    .update({ completed })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[supabase] toggleCoreSubtask error:", error.message); return null; }
  return data as CoreSubtask;
}

// ── CORE: Channels ─────────────────────────────────────────────────────────────

export interface CoreChannel {
  id: string;
  vertical_id: string | null;
  name: string;
  type: string;
  description: string | null;
  member_names: string[];
  is_pinned: boolean;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

export async function getChannelsByVertical(verticalId: string): Promise<CoreChannel[]> {
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("vertical_id", verticalId)
    .order("is_pinned", { ascending: false })
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (error) { console.error("[supabase] getChannelsByVertical error:", error.message); return []; }
  return (data as CoreChannel[]) ?? [];
}

// ── CORE: Channel Messages ─────────────────────────────────────────────────────

export interface CoreMessage {
  id: string;
  channel_id: string;
  sender_id: string | null;
  sender_name: string;
  content: string;
  is_me: boolean;
  attachments: unknown[];
  created_at: string;
}

export async function getChannelMessages(channelId: string, limit = 100): Promise<CoreMessage[]> {
  const { data, error } = await supabase
    .from("channel_messages")
    .select("*")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) { console.error("[supabase] getChannelMessages error:", error.message); return []; }
  return (data as CoreMessage[]) ?? [];
}

export async function createChannelMessage(input: {
  channel_id: string;
  sender_name: string;
  content: string;
  is_me?: boolean;
  sender_id?: string;
}): Promise<CoreMessage | null> {
  const { data, error } = await supabase
    .from("channel_messages")
    .insert([input])
    .select()
    .single();
  if (error) { console.error("[supabase] createChannelMessage error:", error.message); return null; }
  await supabase
    .from("channels")
    .update({ last_message: input.content, last_message_at: new Date().toISOString() })
    .eq("id", input.channel_id);
  return data as CoreMessage;
}

// ── CORE: Resources ────────────────────────────────────────────────────────────

export interface CoreResource {
  id: string;
  vertical_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  file_type: string | null;
  tags: string[];
  added_by: string | null;
  added_by_id: string | null;
  file_size: string | null;
  url: string | null;
  storage_path: string | null;
  is_pinned: boolean;
  version: string;
  created_at: string;
}

export async function getCoreResources(verticalId?: string): Promise<CoreResource[]> {
  let q = supabase.from("resources").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
  if (verticalId) q = q.eq("vertical_id", verticalId);
  const { data, error } = await q;
  if (error) { console.error("[supabase] getCoreResources error:", error.message); return []; }
  return (data as CoreResource[]) ?? [];
}

export async function createCoreResource(input: {
  vertical_id?: string;
  title: string;
  description?: string;
  category?: string;
  file_type?: string;
  tags?: string[];
  added_by?: string;
  url?: string;
  file_size?: string;
  is_pinned?: boolean;
}): Promise<CoreResource | null> {
  const { data, error } = await supabase.from("resources").insert([input]).select().single();
  if (error) { console.error("[supabase] createCoreResource error:", error.message); return null; }
  return data as CoreResource;
}

export async function deleteCoreResource(id: string): Promise<boolean> {
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) { console.error("[supabase] deleteCoreResource error:", error.message); return false; }
  return true;
}

// ── CORE: Contacts ─────────────────────────────────────────────────────────────

export interface CoreContact {
  id: string;
  name: string;
  title: string | null;
  organization: string | null;
  category: string | null;
  vertical_ids: string[];
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
  priority: string;
  notes: string | null;
  tags: string[];
  added_by: string | null;
  added_by_id: string | null;
  is_shared: boolean;
  created_at: string;
}

export async function getCoreContacts(verticalId?: string): Promise<CoreContact[]> {
  if (verticalId) {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .contains("vertical_ids", [verticalId])
      .order("name");
    if (error) { console.error("[supabase] getCoreContacts error:", error.message); return []; }
    return (data as CoreContact[]) ?? [];
  }
  const { data, error } = await supabase.from("contacts").select("*").order("name");
  if (error) { console.error("[supabase] getCoreContacts error:", error.message); return []; }
  return (data as CoreContact[]) ?? [];
}

export async function createCoreContact(input: Partial<CoreContact>): Promise<CoreContact | null> {
  const { data, error } = await supabase.from("contacts").insert([input]).select().single();
  if (error) { console.error("[supabase] createCoreContact error:", error.message); return null; }
  return data as CoreContact;
}

export async function updateCoreContact(id: string, patch: Partial<CoreContact>): Promise<CoreContact | null> {
  const { data, error } = await supabase
    .from("contacts")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[supabase] updateCoreContact error:", error.message); return null; }
  return data as CoreContact;
}

export async function deleteCoreContact(id: string): Promise<boolean> {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) { console.error("[supabase] deleteCoreContact error:", error.message); return false; }
  return true;
}

// ── CORE: Notifications ────────────────────────────────────────────────────────

export interface CoreNotification {
  id: string;
  vertical_id: string | null;
  user_id: string | null;
  type: string;
  title: string;
  description: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

export async function getCoreNotifications(verticalId?: string, userId?: string): Promise<CoreNotification[]> {
  let q = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
  if (verticalId) q = q.eq("vertical_id", verticalId);
  if (userId) q = q.or(`user_id.eq.${userId},user_id.is.null`);
  const { data, error } = await q;
  if (error) { console.error("[supabase] getCoreNotifications error:", error.message); return []; }
  return (data as CoreNotification[]) ?? [];
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) { console.error("[supabase] markNotificationRead error:", error.message); return false; }
  return true;
}

export async function markAllNotificationsRead(verticalId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("vertical_id", verticalId)
    .eq("is_read", false);
  if (error) { console.error("[supabase] markAllNotificationsRead error:", error.message); return false; }
  return true;
}
