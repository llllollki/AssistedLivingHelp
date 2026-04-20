import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=");
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase env vars are missing.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const raw = JSON.parse(fs.readFileSync(path.join(root, "phase1_facilities.json"), "utf8"));

const { data: markets, error: marketsError } = await supabase
  .from("launch_markets")
  .select("id, slug");

if (marketsError) {
  throw marketsError;
}

const marketMap = new Map(markets.map((market) => [market.slug, market.id]));

const rows = [];
for (const facility of raw) {
  for (const marketSlug of facility.launch_markets) {
    const launchMarketId = marketMap.get(marketSlug);
    if (!launchMarketId) continue;

    rows.push({
      source_facility_id: `${facility.source_facility_id}:${marketSlug}`,
      source_dataset: "facilities_ca.sqlite",
      launch_market_id: launchMarketId,
      name: facility.name,
      address: facility.address,
      city: facility.city,
      state: facility.state,
      zip: facility.zip,
      county: facility.county,
      phone: facility.phone,
      license_status: facility.license_status,
      care_category: facility.care_category,
      capacity: facility.capacity,
      public_visibility: true,
      partner_status: "prospect"
    });
  }
}

const chunkSize = 200;
for (let index = 0; index < rows.length; index += chunkSize) {
  const chunk = rows.slice(index, index + chunkSize);
  const { error } = await supabase
    .from("alh_facilities")
    .upsert(chunk, { onConflict: "source_facility_id" });

  if (error) {
    throw error;
  }
}

console.log(`Synced ${rows.length} facility-market rows to Supabase.`);
