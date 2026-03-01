import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — store lookups will fail");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export async function getStoreCredentials(storeId: string): Promise<{
  app_credentials: string;
  oauth_access_token: string;
} | null> {
  const { data, error } = await supabase
    .schema("faire")
    .from("stores")
    .select("app_credentials, oauth_access_token")
    .eq("id", storeId)
    .eq("active", true)
    .single();

  if (error || !data) return null;
  return data as { app_credentials: string; oauth_access_token: string };
}

export async function listStores(): Promise<{ id: string; name: string; active: boolean }[]> {
  const { data, error } = await supabase
    .schema("faire")
    .from("stores")
    .select("id, name, active")
    .order("name");

  if (error || !data) return [];
  return data as { id: string; name: string; active: boolean }[];
}
