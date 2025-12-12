import cors from "cors";
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { storage } from "./storage";
import { insertUserSchema, insertContactMessageSchema, loginSchema, PLAN_PRICING } from "@shared/schema";
import bcrypt from "bcryptjs";
import { randomUUID, createHmac } from "crypto";
import connectPgSimple from "connect-pg-simple";
import { pool, hasDatabase } from "./db";
import nodemailer from "nodemailer";
import { Dropbox } from "dropbox";
import createMemoryStore from "memorystore";
import Razorpay from "razorpay";
import path from "path";
import fs from "fs";
import express from "express";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

function generateLicenseKey(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(
      Math.random().toString(36).substring(2, 6).toUpperCase()
    );
  }
  return segments.join("-");
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Build directory missing: ${distPath}`);
  }

  // Serve static files
  app.use(express.static(distPath));

  // Serve sitemap BEFORE wildcard
  app.get("/sitemap.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml");
    res.sendFile(path.join(distPath, "sitemap.xml"));
  });

  // Serve robots BEFORE wildcard
  app.get("/robots.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.sendFile(path.join(distPath, "robots.txt"));
  });

  // Wildcard fallback
  app.use("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  let sessionStore: session.Store;

  if (hasDatabase && pool) {
    const PgSession = connectPgSimple(session);
    sessionStore = new PgSession({
      pool: pool as any,
      tableName: "user_sessions",
      createTableIfMissing: true,
    });
    console.log("[session] Using PostgreSQL session store");
  } else {
    const MemoryStore = createMemoryStore(session);
    sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    console.log("[session] Using in-memory session store (data will not persist)");
  }

  app.set("trust proxy", 1);

  // --- MIDDLEWARE CONFIGURATION ---
  const isProduction = process.env.NODE_ENV === "production";
  
  // Define allowed origins (Render + Localhost + IP)
  const allowedOrigins = [
    "https://qsecurex-site.onrender.com",
    "http://localhost:5000",
    "http://localhost:3000",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:3000"  
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked Origin:", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "qsecurex-fallback-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        // "false" on localhost (lets you log in), "true" on Render (secure)
        secure: isProduction, 
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax", 
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    })
  );
  // --- END MIDDLEWARE ---

  // Passport configuration
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };

  // ========== AUTH ROUTES ==========

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      // Check if user exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      // Set session
      req.session.userId = user.id;

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.userId = user.id;

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ error: error.message || "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Forgot password - Send reset email via Gmail
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists, just say email was sent
        return res.json({ success: true, message: "If email exists, reset link has been sent" });
      }

      // Check if Gmail credentials are configured
      const gmailUser = process.env.GMAIL_USER;
      const gmailPassword = process.env.GMAIL_PASSWORD;
      if (!gmailUser || !gmailPassword) {
        console.error("Gmail credentials not configured");
        return res.json({ success: true, message: "If email exists, reset link has been sent" });
      }

      // Generate reset token
      const resetToken = randomUUID();
      const resetLink = `${process.env.APP_URL || "http://localhost:5000"}/reset-password?token=${resetToken}`;

      // Create transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
      });

      // Send email
      try {
        await transporter.sendMail({
          from: gmailUser,
          to: email,
          subject: "QSecureX Password Reset",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2>Password Reset Request</h2>
              <p>We received a request to reset your password for your QSecureX account.</p>
              <p>Click the link below to reset your password:</p>
              <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px;">
                Reset Password
              </a>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                This link expires in 24 hours.
              </p>
            </div>
          `,
        });
        console.log("Password reset email sent to:", email);
      } catch (emailError) {
        console.error("Gmail send error:", emailError);
      }

      res.json({ success: true, message: "If email exists, reset link has been sent" });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  // ========== USER ROUTES ==========

  // Get user licenses
  app.get("/api/licenses", requireAuth, async (req, res) => {
    try {
      const licenses = await storage.getLicensesByUserId(req.session.userId!);
      res.json(licenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== CONTACT ROUTES ==========

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(data);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to submit message" });
    }
  });

  // ========== PAYMENT ROUTES (RAZORPAY) ==========

  // Get Razorpay key for frontend
  app.get("/api/payment/key", requireAuth, (req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      return res.status(500).json({ error: "Payment service not configured" });
    }
    res.json({ key: keyId });
  });

  // Create Razorpay order
  app.post("/api/payment/create-order", requireAuth, async (req, res) => {
    try {
      const { plan } = req.body;
      const userId = req.session.userId!;

      if (!plan || !["personal", "pro"].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan selected" });
      }

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        return res.status(500).json({ error: "Payment service not configured" });
      }

      // Check if user already has an active license for this plan
      const existingLicenses = await storage.getLicensesByUserId(userId);
      const hasActiveLicense = existingLicenses.some(l => l.plan === plan && l.status === "active");
      if (hasActiveLicense) {
        return res.status(400).json({ error: `You already have an active ${plan} license` });
      }

      const pricing = PLAN_PRICING[plan as keyof typeof PLAN_PRICING];
      const amount = pricing.price * 100; // Convert to paise

      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const shortUserId = userId.replace(/-/g, '').slice(0, 8);
      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `rcpt_${shortUserId}_${Date.now()}`,
        notes: {
          userId,
          plan,
        },
      });

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        plan,
      });
    } catch (error: any) {
      console.error("Razorpay create order error:", error);
      res.status(500).json({ error: error.message || "Failed to create payment order" });
    }
  });

  // Verify Razorpay payment and create license
  app.post("/api/payment/verify", requireAuth, async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
      const userId = req.session.userId!;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
        return res.status(400).json({ error: "Missing payment details" });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return res.status(500).json({ error: "Payment service not configured" });
      }

      // Verify signature
      const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSign = createHmac("sha256", keySecret)
        .update(sign)
        .digest("hex");

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({ error: "Invalid payment signature" });
      }

      // Payment verified - create license
      const pricing = PLAN_PRICING[plan as keyof typeof PLAN_PRICING];
      const licenseKey = generateLicenseKey();

      // Create the license
      const license = await storage.createLicense({
        userId,
        plan,
        licenseKey,
        maxDevices: pricing.maxDevices,
      });

      // Record the purchase with completed status
      await storage.createPurchase({
        userId,
        plan,
        amount: pricing.price.toString(),
        transactionId: razorpay_payment_id,
      });

      res.json({
        success: true,
        message: "Payment verified successfully",
        license: {
          id: license.id,
          licenseKey: license.licenseKey,
          plan: license.plan,
          maxDevices: license.maxDevices,
        },
      });
    } catch (error: any) {
      console.error("Razorpay verify payment error:", error);
      res.status(500).json({ error: error.message || "Failed to verify payment" });
    }
  });

  // ========== ADMIN ROUTES ==========

  // Get admin stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const [users, licenses, purchases, messages] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllLicenses(),
        storage.getAllPurchases(),
        storage.getAllContactMessages(),
      ]);

      const totalRevenue = purchases
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const newMessages = messages.filter((m) => m.status === "new").length;

      res.json({
        totalUsers: users.length,
        activeLicenses: licenses.filter((l) => l.status === "active").length,
        totalRevenue,
        newMessages,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all users (admin)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(
        users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          createdAt: u.createdAt,
        }))
      );
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete user (admin)
  app.delete("/api/admin/users/:id/delete", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent deleting self
      if (id === req.session.userId) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all licenses (admin)
  app.get("/api/admin/licenses", requireAdmin, async (req, res) => {
    try {
      const licenses = await storage.getAllLicenses();
      res.json(licenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all purchases (admin)
  app.get("/api/admin/purchases", requireAdmin, async (req, res) => {
    try {
      const purchases = await storage.getAllPurchases();
      res.json(purchases);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all messages (admin)
  app.get("/api/admin/messages", requireAdmin, async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update message status (admin)
  app.patch("/api/admin/messages/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const message = await storage.updateContactMessageStatus(id, status);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete message (admin)
  app.delete("/api/admin/messages/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteContactMessage(id);
      if (!deleted) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send license to user (admin)
  app.post("/api/admin/send-license", requireAdmin, async (req, res) => {
    try {
      const { userId, licenseKey, plan } = req.body;

      if (!userId || !licenseKey || !plan) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const license = await storage.createLicense({
        userId,
        plan,
        licenseKey,
        maxDevices: plan === "enterprise" ? 100 : plan === "pro" ? 3 : 1,
        sentAt: new Date(),
      });

      res.json({
        success: true,
        message: "License sent successfully",
        license,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to send license" });
    }
  });

  // Get license history (admin)
  app.get("/api/admin/license-history", requireAdmin, async (req, res) => {
    try {
      const history = await storage.getAllLicenses();
      const allUsers = await storage.getAllUsers();
      const enriched = history
        .filter((l) => l.sentAt)
        .map((l) => {
          const user = allUsers?.find((u: any) => u.id === l.userId);
          return {
            id: l.id,
            licenseKey: l.licenseKey,
            plan: l.plan,
            sentAt: l.sentAt,
            userName: user?.name || "Unknown",
            userEmail: user?.email || "Unknown",
          };
        })
        .sort(
          (a, b) =>
            new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime()
        );
      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== COMMUNITY ROUTES ==========
  
  // Get all community posts
  app.get("/api/community/posts", async (req, res) => {
    try {
      const posts = await storage.getAllCommunityPosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get posts by category
  app.get("/api/community/posts/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const posts = await storage.getCommunityPostsByCategory(category);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create community post
  app.post("/api/community/posts", requireAuth, async (req, res) => {
    try {
      const { insertCommunityPostSchema } = await import("@shared/schema");
      const data = insertCommunityPostSchema.parse(req.body);
      const post = await storage.createCommunityPost({ ...data, userId: req.session.userId! });
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create post" });
    }
  });

  // Upvote post
  app.post("/api/community/posts/:id/upvote", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.upvoteCommunityPost(id);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete community post (admin only)
  app.delete("/api/admin/community/posts/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCommunityPost(id);
      if (!deleted) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all community posts (admin - with user info)
  app.get("/api/admin/community/posts", requireAdmin, async (req, res) => {
    try {
      const posts = await storage.getAllCommunityPosts();
      const users = await storage.getAllUsers();
      const enrichedPosts = posts.map(post => {
        const user = users.find(u => u.id === post.userId);
        return {
          ...post,
          userName: user?.name || "Unknown",
          userEmail: user?.email || "Unknown",
        };
      });
      res.json(enrichedPosts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== ADMIN DOWNLOAD CONTROLS ==========

  // Get download settings (admin)
  app.get("/api/admin/download-settings", requireAdmin, async (req, res) => {
    try {
      const downloadEnabled = await storage.getAdminSetting("free_download_enabled");
      const total = await storage.getTotalFreeDownloads();
      res.json({
        enabled: downloadEnabled !== "false",
        totalDownloads: total,
        limit: 20,
        remaining: Math.max(0, 20 - total),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Toggle download enabled/disabled (admin)
  app.post("/api/admin/download-settings/toggle", requireAdmin, async (req, res) => {
    try {
      const { enabled } = req.body;
      await storage.setAdminSetting("free_download_enabled", enabled ? "true" : "false");
      res.json({ success: true, enabled });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reset free download count (admin)
  app.post("/api/admin/download-settings/reset", requireAdmin, async (req, res) => {
    try {
      const deletedCount = await storage.resetFreeDownloads();
      res.json({ success: true, deletedCount, message: `Reset ${deletedCount} downloads` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== RAZORPAY PAYMENT ROUTES ==========

  // Create Razorpay order
  app.post("/api/payments/create-order", requireAuth, async (req, res) => {
    try {
      const { plan, amount, maxDevices } = req.body;
      const orderId = randomUUID();
      
      res.json({
        orderId,
        amount,
        currency: "INR",
        plan,
        userId: req.session.userId,
        maxDevices: maxDevices || 1,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Verify payment
  app.post("/api/payments/verify", requireAuth, async (req, res) => {
    try {
      const { orderId, paymentId, plan, amount, maxDevices } = req.body;
      const userId = req.session.userId!;
      
      // Create license
      const licenseKey = generateLicenseKey();
      const license = await storage.createLicense({
        userId,
        plan,
        licenseKey,
        maxDevices: maxDevices || 1,
      });

      // Create purchase record
      const purchase = await storage.createPurchase({
        userId,
        plan,
        amount,
        transactionId: paymentId,
      });

      res.json({ 
        success: true, 
        license, 
        purchase,
        message: "License activated successfully",
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== FREE DOWNLOADS ROUTES ==========

  // Record free download
  app.post("/api/downloads/free", async (req, res) => {
    try {
      const { platform, userId } = req.body;
      
      // Check if downloads are disabled by admin
      const downloadEnabled = await storage.getAdminSetting("free_download_enabled");
      if (downloadEnabled === "false") {
        return res.status(403).json({ error: "Free downloads are currently disabled" });
      }
      
      // Check if user already downloaded
      const hasDownloaded = await storage.hasUserDownloadedFree(userId);
      if (hasDownloaded) {
        return res.status(400).json({ error: "You have already downloaded the free version" });
      }

      // Check total downloads
      const total = await storage.getTotalFreeDownloads();
      if (total >= 20) {
        return res.status(400).json({ error: "Free download limit reached (20 downloads)" });
      }

      const download = await storage.recordFreeDownload(userId, platform);
      res.json({ success: true, download });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get free downloads status
  app.get("/api/downloads/status", async (req, res) => {
    try {
      const total = await storage.getTotalFreeDownloads();
      res.json({ totalDownloads: total, limit: 20, remaining: 20 - total });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== FREE LICENSE REQUEST ROUTES ==========

  // Create free license request
  app.post("/api/licenses/free-request", requireAuth, async (req, res) => {
    try {
      const { insertFreeLicenseRequestSchema } = await import("@shared/schema");
      const data = insertFreeLicenseRequestSchema.parse(req.body);
      const request = await storage.createFreeLicenseRequest({
        ...data,
        userId: req.session.userId!,
      });
      res.json({ success: true, request });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user's free license requests
  app.get("/api/licenses/free-requests", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getFreeLicenseRequestsByUserId(req.session.userId!);
      res.json(requests);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin: Get all free license requests
  app.get("/api/admin/licenses/free-requests", requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllFreeLicenseRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin: Approve free license request
  app.post("/api/admin/licenses/free-requests/:id/approve", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getFreeLicenseRequest(id);
      if (!request) return res.status(404).json({ error: "Request not found" });

      const licenseKey = generateLicenseKey();
      await storage.approveFreeLicenseRequest(id, licenseKey);
      
      const license = await storage.createLicense({
        userId: request.userId,
        plan: request.requestedPlan,
        licenseKey,
        maxDevices: request.requestedPlan === "pro" ? 5 : 1,
      });

      res.json({ success: true, license });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== DEVICE ID ROUTES ==========

  // Register device
  app.post("/api/devices", requireAuth, async (req, res) => {
    try {
      const { insertDeviceIdSchema } = await import("@shared/schema");
      const data = insertDeviceIdSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId!);
      const device = await storage.createDeviceId({
        ...data,
        userId: req.session.userId!,
      });

      // Create notification message for admins
      await storage.createContactMessage({
        name: `Device Registration - ${user?.name || "User"}`,
        email: user?.email || "unknown@example.com",
        message: `Device ID: ${data.deviceId}\nDevice Name: ${data.deviceName || "N/A"}\nDevice Type: ${data.deviceType}\nUser: ${user?.name} (${user?.email})`,
      });

      res.json({ success: true, device });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user's devices
  app.get("/api/devices", requireAuth, async (req, res) => {
    try {
      const devices = await storage.getDeviceIdsByUserId(req.session.userId!);
      res.json(devices);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin: Get all devices
  app.get("/api/admin/devices", requireAdmin, async (req, res) => {
    try {
      const devices = await storage.getAllDeviceIds();
      res.json(devices);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== DOWNLOAD ROUTES (FIXED DROPBOX LOGIC) ==========

  // Get remaining free downloads
  app.get("/api/download/remaining", async (req, res) => {
    try {
      const downloadEnabled = await storage.getAdminSetting("free_download_enabled");
      const total = await storage.getTotalFreeDownloads();
      const remaining = Math.max(0, 20 - total);
      res.json({ 
        remaining, 
        total, 
        limit: 20, 
        enabled: downloadEnabled !== "false" 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Check if user already downloaded free version
  app.get("/api/download/user-status", requireAuth, async (req, res) => {
    try {
      const hasDownloaded = await storage.hasUserDownloadedFree(req.session.userId!);
      res.json({ hasDownloaded });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Check eligibility for free download (without recording)
  app.get("/api/download/check-eligibility", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const hasDownloaded = await storage.hasUserDownloadedFree(userId);
      if (hasDownloaded) {
        return res.json({ eligible: false, reason: "Already downloaded" });
      }
      res.json({ eligible: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 1. FREE DOWNLOAD (Refreshed Token Fix)
  app.get("/api/download/macos-dmg", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      const downloadEnabled = await storage.getAdminSetting("free_download_enabled");
      if (downloadEnabled === "false") return res.status(403).json({ error: "Downloads disabled" });
      
      const hasAlreadyDownloaded = await storage.hasUserDownloadedFree(userId);
      if (hasAlreadyDownloaded) return res.status(403).json({ error: "Already downloaded" });

      const total = await storage.getTotalFreeDownloads();
      if (total >= 20) return res.status(429).json({ error: "Limit reached" });

      await storage.recordFreeDownload(userId, "macos");

      // ✅ FIX: Check for Refresh Token, NOT Access Token
      if (!process.env.DROPBOX_REFRESH_TOKEN || !process.env.DROPBOX_CLIENT_ID) {
        console.error("Missing Dropbox Credentials");
        return res.status(500).json({ error: "Download service configuration error" });
      }

      const dbx = new Dropbox({ 
        clientId: process.env.DROPBOX_CLIENT_ID,
        clientSecret: process.env.DROPBOX_CLIENT_SECRET,
        refreshToken: process.env.DROPBOX_REFRESH_TOKEN 
      });
      
      const configuredPath = process.env.DROPBOX_FREE_FILE_PATH || "/QSecureX.dmg";
      const fallbackPath = "/QSecureX.dmg";
      
      console.log("[Download] Free - Attempting primary path:", configuredPath);
      
      try {
        const response = await dbx.filesGetTemporaryLink({ path: configuredPath });
        return res.redirect(response.result.link);
      } catch (firstError: any) {
        console.log("[Download] Primary path failed, trying fallback:", fallbackPath);
        try {
          const response = await dbx.filesGetTemporaryLink({ path: fallbackPath });
          return res.redirect(response.result.link);
        } catch (secondError: any) {
          console.error("Dropbox Error:", JSON.stringify(secondError.error || secondError));
          return res.status(500).json({ error: "File not found in Dropbox. Please check .env paths." });
        }
      }
    } catch (error: any) {
      console.error("Download Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2. PERSONAL DOWNLOAD (Refreshed Token Fix)
  app.get("/api/download/macos-personal", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      const licenses = await storage.getLicensesByUserId(userId);
      const hasPersonalLicense = licenses.some(l => l.plan === "personal" && l.status === "active");
      
      if (!hasPersonalLicense) {
        return res.status(403).json({ error: "Personal license required." });
      }

      // ✅ FIX: Check for Refresh Token
      if (!process.env.DROPBOX_REFRESH_TOKEN || !process.env.DROPBOX_CLIENT_ID) {
        return res.status(500).json({ error: "Download service not configured" });
      }

      const dbx = new Dropbox({ 
        clientId: process.env.DROPBOX_CLIENT_ID,
        clientSecret: process.env.DROPBOX_CLIENT_SECRET,
        refreshToken: process.env.DROPBOX_REFRESH_TOKEN 
      });
      
      const configuredPath = process.env.DROPBOX_PERSONAL_FILE_PATH || "/QSecureX.dmg";
      const fallbackPath = "/QSecureX.dmg";
      
      console.log("[Download] Personal - Attempting path:", configuredPath);
      
      try {
        const response = await dbx.filesGetTemporaryLink({ path: configuredPath });
        return res.redirect(response.result.link);
      } catch (firstError: any) {
        console.log("[Download] Primary path failed, trying fallback:", fallbackPath);
        try {
          const response = await dbx.filesGetTemporaryLink({ path: fallbackPath });
          return res.redirect(response.result.link);
        } catch (secondError: any) {
          console.error("Dropbox Error:", JSON.stringify(secondError.error || secondError));
          return res.status(500).json({ error: "File not found in Dropbox." });
        }
      }
    } catch (error: any) {
      console.error("Download Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 3. PRO DOWNLOAD (Refreshed Token Fix)
  app.get("/api/download/macos-pro", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      const licenses = await storage.getLicensesByUserId(userId);
      const hasProLicense = licenses.some(l => l.plan === "pro" && l.status === "active");
      
      if (!hasProLicense) {
        return res.status(403).json({ error: "Pro license required." });
      }

      // ✅ FIX: Check for Refresh Token
      if (!process.env.DROPBOX_REFRESH_TOKEN || !process.env.DROPBOX_CLIENT_ID) {
        return res.status(500).json({ error: "Download service not configured" });
      }

      const dbx = new Dropbox({ 
        clientId: process.env.DROPBOX_CLIENT_ID,
        clientSecret: process.env.DROPBOX_CLIENT_SECRET,
        refreshToken: process.env.DROPBOX_REFRESH_TOKEN 
      });
      
      const configuredPath = process.env.DROPBOX_PRO_FILE_PATH || "/QSecureX-Installer.dmg";
      const fallbackPath = "/QSecureX-Installer.dmg";
      
      console.log("[Download] Pro - Attempting path:", configuredPath);
      
      try {
        const response = await dbx.filesGetTemporaryLink({ path: configuredPath });
        return res.redirect(response.result.link);
      } catch (firstError: any) {
        console.log("[Download] Primary path failed, trying fallback:", fallbackPath);
        try {
          const response = await dbx.filesGetTemporaryLink({ path: fallbackPath });
          return res.redirect(response.result.link);
        } catch (secondError: any) {
          console.error("Dropbox Error:", JSON.stringify(secondError.error || secondError));
          return res.status(500).json({ error: "File not found in Dropbox." });
        }
      }
    } catch (error: any) {
      console.error("Download Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- TOKEN GENERATOR TOOL ---
  // Access this route to fix your invalid_request error
  // Usage: http://localhost:5000/api/debug/generate-token?code=PASTE_CODE_HERE
  app.get("/api/debug/generate-token", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.send(`
          <h1>Dropbox Token Generator</h1>
          <p>1. Go here: <a href="https://www.dropbox.com/oauth2/authorize?client_id=${process.env.DROPBOX_CLIENT_ID}&token_access_type=offline&response_type=code" target="_blank">Authorize App</a></p>
          <p>2. Copy the code you get.</p>
          <p>3. Paste it in the URL like this: <code>/api/debug/generate-token?code=YOUR_CODE</code></p>
        `);
      }

      const clientId = process.env.DROPBOX_CLIENT_ID; 
      const clientSecret = process.env.DROPBOX_CLIENT_SECRET;

      if (!clientId || !clientSecret) return res.send("Error: Client ID/Secret missing in .env");

      const response = await fetch("https://api.dropbox.com/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        return res.json({ 
          status: "FAILED", 
          message: "Dropbox rejected this code.", 
          dropbox_error: data,
          check_this: "Is your Client Secret in .env correct?" 
        });
      }

      res.json({
        status: "SUCCESS",
        message: "Here is your NEW, WORKING Refresh Token. Copy this into your .env file immediately!",
        NEW_REFRESH_TOKEN: data.refresh_token
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
// --- DEBUG ROUTE: LIST FILES ---
  // Access this at: http://127.0.0.1:5000/api/debug/dropbox-list
  app.get("/api/debug/dropbox-list", async (req, res) => {
    try {
      if (!process.env.DROPBOX_REFRESH_TOKEN) {
        return res.json({ error: "No Refresh Token in .env" });
      }

      const dbx = new Dropbox({ 
        clientId: process.env.DROPBOX_CLIENT_ID,
        clientSecret: process.env.DROPBOX_CLIENT_SECRET,
        refreshToken: process.env.DROPBOX_REFRESH_TOKEN 
      });
      
      // List files in the root folder
      const response = await dbx.filesListFolder({ path: "" });
      
      const files = response.result.entries.map(entry => ({
        name: entry.name,
        path_display: entry.path_display, // <--- THIS is what you need for .env
        type: entry['.tag'] // file or folder?
      }));

      res.json({ 
        message: "SUCCESS: Connected to Dropbox!",
        files: files 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || error });
    }
  });
  return httpServer;
}
