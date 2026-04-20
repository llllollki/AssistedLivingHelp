import fs from "node:fs";
import path from "node:path";

const projectId = process.env.VERCEL_PROJECT_ID;
const orgId = process.env.VERCEL_ORG_ID;

if (!projectId || !orgId) {
  throw new Error("Missing VERCEL_PROJECT_ID or VERCEL_ORG_ID.");
}

const vercelDir = path.join(process.cwd(), ".vercel");
fs.mkdirSync(vercelDir, { recursive: true });
fs.writeFileSync(
  path.join(vercelDir, "project.json"),
  JSON.stringify(
    {
      projectId,
      orgId
    },
    null,
    2
  )
);

console.log("Wrote .vercel/project.json");
