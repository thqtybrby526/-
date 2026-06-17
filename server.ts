import path from "path";
import dotenv from "dotenv";
import express from "express";
import { createServer as createViteServer } from "vite";
import { app } from "./api/index";

// Load environment variables
dotenv.config();

const PORT = 3000;

// ----------------- Static Asset Serving & Vite Integration -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode with Vite Middleware Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated with Academy server.");
  } else {
    // Production Mode: Serve built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Academy Server running actively on http://0.0.0.0:${PORT}`);
  });
}

startServer();
