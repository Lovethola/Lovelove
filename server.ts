import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("students.db");
db.exec("CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY, count INTEGER)");
const row = db.prepare("SELECT count FROM stats WHERE id = 1").get() as { count: number } | undefined;
if (!row) {
  db.prepare("INSERT INTO stats (id, count) VALUES (1, 100)").run();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.get("/api/stats", (req, res) => {
    try {
      const stats = db.prepare("SELECT count FROM stats WHERE id = 1").get() as { count: number };
      res.json(stats);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/stats/increment", (req, res) => {
    try {
      db.prepare("UPDATE stats SET count = count + 1 WHERE id = 1").run();
      const stats = db.prepare("SELECT count FROM stats WHERE id = 1").get() as { count: number };
      res.json(stats);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
