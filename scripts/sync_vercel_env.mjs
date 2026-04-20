import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");

if (!fs.existsSync(envPath)) {
  throw new Error(".env.local was not found.");
}

const required = ["VERCEL_TOKEN", "VERCEL_PROJECT_ID", "VERCEL_ORG_ID"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const projectId = process.env.VERCEL_PROJECT_ID;
const teamId = process.env.VERCEL_ORG_ID;
const token = process.env.VERCEL_TOKEN;

const envMap = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  if (!line || line.startsWith("#") || !line.includes("=")) continue;
  const [key, ...rest] = line.split("=");
  envMap[key] = rest.join("=");
}

const deployEnv = {
  NEXT_PUBLIC_SITE_NAME: envMap.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SITE_URL: envMap.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: envMap.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: envMap.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: envMap.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_PROJECT_ID: envMap.SUPABASE_PROJECT_ID
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Vercel API error ${response.status}: ${text}`);
  }

  return response.status === 204 ? null : response.json();
}

const baseUrl = `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`;
const existing = await request(baseUrl);
const existingByKey = new Map(existing.envs.map((item) => [item.key, item]));

for (const [key, value] of Object.entries(deployEnv)) {
  if (!value) continue;

  const existingItem = existingByKey.get(key);
  if (existingItem) {
    await request(`https://api.vercel.com/v9/projects/${projectId}/env/${existingItem.id}?teamId=${teamId}`, {
      method: "DELETE"
    });
  }

  await request(baseUrl, {
    method: "POST",
    body: JSON.stringify({
      key,
      value,
      type: "encrypted",
      target: ["production", "preview", "development"]
    })
  });

  console.log(`Synced ${key}`);
}

console.log("Vercel environment variables synced.");
