import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve sitemap FIRST
  app.get("/sitemap.xml", (_, res) => {
    res.setHeader("Content-Type", "application/xml");
    res.sendFile("sitemap.xml", { root: distPath });
  });

  // Serve robots FIRST
  app.get("/robots.txt", (_, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.sendFile("robots.txt", { root: distPath });
  });

  // Serve static files
  app.use(express.static(distPath));

  // Fallback to index.html
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
