import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { all } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "REVIVE", database: "connected" });
});

app.get("/api/feed", (_req, res) => {
  const items = all(
    "SELECT id, title, body, category, created_at AS createdAt FROM feed_items ORDER BY created_at DESC"
  );
  res.json({ items });
});

app.get("/api/dashboard", (_req, res) => {
  const metrics = all(
    "SELECT label, value, unit, recorded_at AS recordedAt FROM dashboard_metrics ORDER BY recorded_at DESC"
  );
  res.json({ metrics });
});

if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
}

app.listen(port, () => {
  console.log(`REVIVE API running at http://localhost:${port}`);
});
