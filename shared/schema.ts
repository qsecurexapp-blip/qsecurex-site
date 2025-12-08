import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // 'user' | 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
}).extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Licenses table
export const licenses = pgTable("licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  plan: text("plan").notNull(), // 'personal' | 'pro' | 'enterprise'
  licenseKey: text("license_key").notNull().unique(),
  status: text("status").notNull().default("active"), // 'active' | 'expired' | 'revoked'
  deviceCount: integer("device_count").notNull().default(1),
  maxDevices: integer("max_devices").notNull().default(1),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date"),
  sentAt: timestamp("sent_at"),
});

// License history table - tracks when licenses are sent to users
export const licenseHistory = pgTable("license_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  licenseId: varchar("license_id").notNull().references(() => licenses.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  sentBy: varchar("sent_by").notNull().references(() => users.id),
  plan: text("plan").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const insertLicenseSchema = createInsertSchema(licenses).pick({
  userId: true,
  plan: true,
  licenseKey: true,
  maxDevices: true,
});

export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type License = typeof licenses.$inferSelect;

export type LicenseHistoryEntry = typeof licenseHistory.$inferSelect;

// Purchases table
export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  licenseId: varchar("license_id").references(() => licenses.id),
  plan: text("plan").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("completed"), // 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  userId: true,
  plan: true,
  amount: true,
  transactionId: true,
});

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

// Contact form submissions
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // 'new' | 'read' | 'replied'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  message: true,
}).extend({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Community posts - for complaints, suggestions, feedback
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // 'complaint' | 'suggestion' | 'feedback' | 'bug-report'
  status: text("status").notNull().default("open"), // 'open' | 'in-progress' | 'resolved' | 'closed'
  upvotes: integer("upvotes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).pick({
  title: true,
  content: true,
  category: true,
}).extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  category: z.enum(["complaint", "suggestion", "feedback", "bug-report"]),
});

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

// Device IDs table - tracks device registrations
export const deviceIds = pgTable("device_ids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceId: text("device_id").notNull(),
  deviceName: text("device_name"),
  deviceType: text("device_type").notNull().default("windows"), // 'windows' | 'mac' | 'linux' | 'android'
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const insertDeviceIdSchema = createInsertSchema(deviceIds).pick({
  deviceId: true,
  deviceName: true,
  deviceType: true,
}).extend({
  deviceId: z.string().min(5, "Device ID is required"),
  deviceType: z.enum(["windows", "mac", "linux", "android"]).default("windows"),
});

export type InsertDeviceId = z.infer<typeof insertDeviceIdSchema>;
export type DeviceId = typeof deviceIds.$inferSelect;

// Free downloads tracking
export const freeDownloads = pgTable("free_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: text("platform").notNull(), // 'windows' | 'mac' | 'linux' | 'android'
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
});

export type FreeDownload = typeof freeDownloads.$inferSelect;

// Free license requests
export const freeLicenseRequests = pgTable("free_license_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  requestedPlan: text("requested_plan").notNull(), // 'personal' | 'pro'
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFreeLicenseRequestSchema = createInsertSchema(freeLicenseRequests).pick({
  requestedPlan: true,
}).extend({
  requestedPlan: z.enum(["personal", "pro"]),
});

export type InsertFreeLicenseRequest = z.infer<typeof insertFreeLicenseRequestSchema>;
export type FreeLicenseRequest = typeof freeLicenseRequests.$inferSelect;

// Admin settings table
export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AdminSetting = typeof adminSettings.$inferSelect;

// Plan pricing constants
export const PLAN_PRICING = {
  personal: { price: 1999, originalPrice: 3499, maxDevices: 1 },
  pro: { price: 4999, originalPrice: 9999, maxDevices: 3 },
  enterprise: { price: 0, originalPrice: 0, maxDevices: 100 }, // Custom pricing
} as const;
