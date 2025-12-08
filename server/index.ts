import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Parse JSON + keep raw body (Razorpay)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

// Logging helper
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// API logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  let capturedJsonResponse: any = undefined;
  const originalJson = res.json;

  res.json = function (body) {
    capturedJsonResponse = body;
    return originalJson.apply(res, [body]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      let msg = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (capturedJsonResponse) {
        msg += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(msg);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("SERVER ERROR:", err);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
  });

  // Static or Vite dev
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ------------ IMPORTANT FOR RENDER --------------

  // Render assigns PORT automatically
  const port = parseInt(process.env.PORT || "5000", 10);

  // Render must use 0.0.0.0 — Local dev uses 127.0.0.1
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

  httpServer.listen({ port, host }, () => {
    console.log(`🚀 Server running at http://${host}:${port}`);
  });
})();
