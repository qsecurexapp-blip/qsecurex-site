import {
  type User,
  type InsertUser,
  type License,
  type InsertLicense,
  type Purchase,
  type InsertPurchase,
  type ContactMessage,
  type InsertContactMessage,
  type CommunityPost,
  type InsertCommunityPost,
  type DeviceId,
  type InsertDeviceId,
  type FreeDownload,
  type FreeLicenseRequest,
  type InsertFreeLicenseRequest,
  type AdminSetting,
  users,
  licenses,
  purchases,
  contactMessages,
  communityPosts,
  deviceIds,
  freeDownloads,
  freeLicenseRequests,
  adminSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { role?: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;

  getLicense(id: string): Promise<License | undefined>;
  getLicensesByUserId(userId: string): Promise<License[]>;
  createLicense(license: InsertLicense & { sentAt?: Date }): Promise<License>;
  getAllLicenses(): Promise<License[]>;

  getPurchase(id: string): Promise<Purchase | undefined>;
  getPurchasesByUserId(userId: string): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getAllPurchases(): Promise<Purchase[]>;

  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: string): Promise<boolean>;

  getCommunityPost(id: string): Promise<CommunityPost | undefined>;
  getAllCommunityPosts(): Promise<CommunityPost[]>;
  getCommunityPostsByCategory(category: string): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost & { userId: string }): Promise<CommunityPost>;
  updateCommunityPostStatus(id: string, status: string): Promise<CommunityPost | undefined>;
  upvoteCommunityPost(id: string): Promise<CommunityPost | undefined>;

  createDeviceId(deviceId: InsertDeviceId & { userId: string }): Promise<DeviceId>;
  getDeviceIdsByUserId(userId: string): Promise<DeviceId[]>;
  getAllDeviceIds(): Promise<DeviceId[]>;

  recordFreeDownload(userId: string, platform: string): Promise<FreeDownload>;
  getFreeDownloadsByUserId(userId: string): Promise<FreeDownload[]>;
  getTotalFreeDownloads(): Promise<number>;
  hasUserDownloadedFree(userId: string): Promise<boolean>;

  createFreeLicenseRequest(request: InsertFreeLicenseRequest & { userId: string }): Promise<FreeLicenseRequest>;
  getFreeLicenseRequest(id: string): Promise<FreeLicenseRequest | undefined>;
  getFreeLicenseRequestsByUserId(userId: string): Promise<FreeLicenseRequest[]>;
  getAllFreeLicenseRequests(): Promise<FreeLicenseRequest[]>;
  approveFreeLicenseRequest(id: string, licenseKey: string): Promise<FreeLicenseRequest | undefined>;

  deleteCommunityPost(id: string): Promise<boolean>;
  
  getAdminSetting(key: string): Promise<string | null>;
  setAdminSetting(key: string, value: string): Promise<AdminSetting>;
  resetFreeDownloads(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser & { role?: string }): Promise<User> {
    const [user] = await db!
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || "user",
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db!.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<boolean> {
    // Delete all related records first to avoid foreign key constraint errors
    await db!.delete(freeDownloads).where(eq(freeDownloads.userId, id));
    await db!.delete(freeLicenseRequests).where(eq(freeLicenseRequests.userId, id));
    await db!.delete(communityPosts).where(eq(communityPosts.userId, id));
    await db!.delete(deviceIds).where(eq(deviceIds.userId, id));
    await db!.delete(purchases).where(eq(purchases.userId, id));
    await db!.delete(licenses).where(eq(licenses.userId, id));
    
    // Now delete the user
    const result = await db!.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getLicense(id: string): Promise<License | undefined> {
    const [license] = await db!.select().from(licenses).where(eq(licenses.id, id));
    return license;
  }

  async getLicensesByUserId(userId: string): Promise<License[]> {
    return db!.select().from(licenses).where(eq(licenses.userId, userId));
  }

  async createLicense(insertLicense: InsertLicense & { sentAt?: Date }): Promise<License> {
    const [license] = await db!.insert(licenses).values(insertLicense).returning();
    return license;
  }

  async getAllLicenses(): Promise<License[]> {
    return db!.select().from(licenses).orderBy(desc(licenses.purchaseDate));
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    const [purchase] = await db!.select().from(purchases).where(eq(purchases.id, id));
    return purchase;
  }

  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    return db!.select().from(purchases).where(eq(purchases.userId, userId));
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db!.insert(purchases).values(insertPurchase).returning();
    return purchase;
  }

  async getAllPurchases(): Promise<Purchase[]> {
    return db!.select().from(purchases).orderBy(desc(purchases.createdAt));
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    const [message] = await db!.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return db!.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db!.insert(contactMessages).values(insertMessage).returning();
    return message;
  }

  async updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | undefined> {
    const [message] = await db!
      .update(contactMessages)
      .set({ status })
      .where(eq(contactMessages.id, id))
      .returning();
    return message;
  }

  async deleteContactMessage(id: string): Promise<boolean> {
    const result = await db!.delete(contactMessages).where(eq(contactMessages.id, id)).returning();
    return result.length > 0;
  }

  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const [post] = await db!.select().from(communityPosts).where(eq(communityPosts.id, id));
    return post;
  }

  async getAllCommunityPosts(): Promise<CommunityPost[]> {
    return db!.select().from(communityPosts).orderBy(desc(communityPosts.createdAt));
  }

  async getCommunityPostsByCategory(category: string): Promise<CommunityPost[]> {
    return db!.select().from(communityPosts).where(eq(communityPosts.category, category)).orderBy(desc(communityPosts.createdAt));
  }

  async createCommunityPost(insertPost: InsertCommunityPost & { userId: string }): Promise<CommunityPost> {
    const [post] = await db!.insert(communityPosts).values(insertPost).returning();
    return post;
  }

  async updateCommunityPostStatus(id: string, status: string): Promise<CommunityPost | undefined> {
    const [post] = await db!.update(communityPosts).set({ status }).where(eq(communityPosts.id, id)).returning();
    return post;
  }

  async upvoteCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const [post] = await db!.update(communityPosts).set({ upvotes: sql`upvotes + 1` }).where(eq(communityPosts.id, id)).returning();
    return post;
  }

  async createDeviceId(deviceIdData: InsertDeviceId & { userId: string }): Promise<DeviceId> {
    const [device] = await db!.insert(deviceIds).values(deviceIdData).returning();
    return device;
  }

  async getDeviceIdsByUserId(userId: string): Promise<DeviceId[]> {
    return db!.select().from(deviceIds).where(eq(deviceIds.userId, userId));
  }

  async getAllDeviceIds(): Promise<DeviceId[]> {
    return db!.select().from(deviceIds).orderBy(desc(deviceIds.registeredAt));
  }

  async recordFreeDownload(userId: string, platform: string): Promise<FreeDownload> {
    const [download] = await db!.insert(freeDownloads).values({ userId, platform }).returning();
    return download;
  }

  async getFreeDownloadsByUserId(userId: string): Promise<FreeDownload[]> {
    return db!.select().from(freeDownloads).where(eq(freeDownloads.userId, userId));
  }

  async getTotalFreeDownloads(): Promise<number> {
    const result = await db!.select({ count: sql<number>`count(*)` }).from(freeDownloads);
    return Number(result[0]?.count) || 0;
  }

  async hasUserDownloadedFree(userId: string): Promise<boolean> {
    const result = await db!.select().from(freeDownloads).where(eq(freeDownloads.userId, userId)).limit(1);
    return result.length > 0;
  }

  async createFreeLicenseRequest(request: InsertFreeLicenseRequest & { userId: string }): Promise<FreeLicenseRequest> {
    const [req] = await db!.insert(freeLicenseRequests).values(request).returning();
    return req;
  }

  async getFreeLicenseRequest(id: string): Promise<FreeLicenseRequest | undefined> {
    const [req] = await db!.select().from(freeLicenseRequests).where(eq(freeLicenseRequests.id, id));
    return req;
  }

  async getFreeLicenseRequestsByUserId(userId: string): Promise<FreeLicenseRequest[]> {
    return db!.select().from(freeLicenseRequests).where(eq(freeLicenseRequests.userId, userId)).orderBy(desc(freeLicenseRequests.createdAt));
  }

  async getAllFreeLicenseRequests(): Promise<FreeLicenseRequest[]> {
    return db!.select().from(freeLicenseRequests).orderBy(desc(freeLicenseRequests.createdAt));
  }

  async approveFreeLicenseRequest(id: string, licenseKey: string): Promise<FreeLicenseRequest | undefined> {
    const [req] = await db!.update(freeLicenseRequests).set({ status: "approved", approvedAt: new Date() }).where(eq(freeLicenseRequests.id, id)).returning();
    return req;
  }

  async deleteCommunityPost(id: string): Promise<boolean> {
    const result = await db!.delete(communityPosts).where(eq(communityPosts.id, id)).returning();
    return result.length > 0;
  }

  async getAdminSetting(key: string): Promise<string | null> {
    const [setting] = await db!.select().from(adminSettings).where(eq(adminSettings.key, key));
    return setting?.value ?? null;
  }

  async setAdminSetting(key: string, value: string): Promise<AdminSetting> {
    const existing = await this.getAdminSetting(key);
    if (existing !== null) {
      const [updated] = await db!.update(adminSettings).set({ value, updatedAt: new Date() }).where(eq(adminSettings.key, key)).returning();
      return updated;
    }
    const [setting] = await db!.insert(adminSettings).values({ key, value }).returning();
    return setting;
  }

  async resetFreeDownloads(): Promise<number> {
    const result = await db!.delete(freeDownloads).returning();
    return result.length;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private licenses: Map<string, License> = new Map();
  private purchases: Map<string, Purchase> = new Map();
  private contactMessages: Map<string, ContactMessage> = new Map();
  private communityPosts: Map<string, CommunityPost> = new Map();
  private deviceIds: Map<string, DeviceId> = new Map();
  private freeDownloads: Map<string, FreeDownload> = new Map();
  private freeLicenseRequests: Map<string, FreeLicenseRequest> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async createUser(insertUser: InsertUser & { role?: string }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: insertUser.email,
      password: insertUser.password,
      name: insertUser.name,
      role: insertUser.role || "user",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getLicense(id: string): Promise<License | undefined> {
    return this.licenses.get(id);
  }

  async getLicensesByUserId(userId: string): Promise<License[]> {
    return Array.from(this.licenses.values()).filter((l) => l.userId === userId);
  }

  async createLicense(insertLicense: InsertLicense & { sentAt?: Date }): Promise<License> {
    const id = randomUUID();
    const license: License = {
      id,
      userId: insertLicense.userId,
      plan: insertLicense.plan,
      licenseKey: insertLicense.licenseKey,
      status: "active",
      deviceCount: 0,
      maxDevices: insertLicense.maxDevices || 1,
      purchaseDate: new Date(),
      expiryDate: null,
      sentAt: insertLicense.sentAt || null,
    };
    this.licenses.set(id, license);
    return license;
  }

  async getAllLicenses(): Promise<License[]> {
    return Array.from(this.licenses.values()).sort(
      (a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime()
    );
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter((p) => p.userId === userId);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = randomUUID();
    const purchase: Purchase = {
      id,
      userId: insertPurchase.userId,
      licenseId: null,
      plan: insertPurchase.plan,
      amount: insertPurchase.amount,
      currency: "INR",
      status: "completed",
      paymentMethod: null,
      transactionId: insertPurchase.transactionId || null,
      createdAt: new Date(),
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async getAllPurchases(): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      id,
      name: insertMessage.name,
      email: insertMessage.email,
      message: insertMessage.message,
      status: "new",
      createdAt: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | undefined> {
    const message = this.contactMessages.get(id);
    if (message) {
      message.status = status;
      this.contactMessages.set(id, message);
      return message;
    }
    return undefined;
  }

  async deleteContactMessage(id: string): Promise<boolean> {
    return this.contactMessages.delete(id);
  }

  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }

  async getAllCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getCommunityPostsByCategory(category: string): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values())
      .filter((p) => p.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createCommunityPost(insertPost: InsertCommunityPost & { userId: string }): Promise<CommunityPost> {
    const id = randomUUID();
    const now = new Date();
    const post: CommunityPost = {
      id,
      userId: insertPost.userId,
      title: insertPost.title,
      content: insertPost.content,
      category: insertPost.category,
      status: "open",
      upvotes: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async updateCommunityPostStatus(id: string, status: string): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(id);
    if (post) {
      post.status = status;
      post.updatedAt = new Date();
      this.communityPosts.set(id, post);
      return post;
    }
    return undefined;
  }

  async upvoteCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(id);
    if (post) {
      post.upvotes += 1;
      post.updatedAt = new Date();
      this.communityPosts.set(id, post);
      return post;
    }
    return undefined;
  }

  async createDeviceId(deviceIdData: InsertDeviceId & { userId: string }): Promise<DeviceId> {
    const id = randomUUID();
    const device: DeviceId = {
      id,
      userId: deviceIdData.userId,
      deviceId: deviceIdData.deviceId,
      deviceName: deviceIdData.deviceName || null,
      deviceType: deviceIdData.deviceType,
      registeredAt: new Date(),
    };
    this.deviceIds.set(id, device);
    return device;
  }

  async getDeviceIdsByUserId(userId: string): Promise<DeviceId[]> {
    return Array.from(this.deviceIds.values()).filter((d) => d.userId === userId);
  }

  async getAllDeviceIds(): Promise<DeviceId[]> {
    return Array.from(this.deviceIds.values()).sort(
      (a, b) => b.registeredAt.getTime() - a.registeredAt.getTime()
    );
  }

  async recordFreeDownload(userId: string, platform: string): Promise<FreeDownload> {
    const id = randomUUID();
    const download: FreeDownload = {
      id,
      userId,
      platform,
      downloadedAt: new Date(),
    };
    this.freeDownloads.set(id, download);
    return download;
  }

  async getFreeDownloadsByUserId(userId: string): Promise<FreeDownload[]> {
    return Array.from(this.freeDownloads.values()).filter((d) => d.userId === userId);
  }

  async getTotalFreeDownloads(): Promise<number> {
    return this.freeDownloads.size;
  }

  async hasUserDownloadedFree(userId: string): Promise<boolean> {
    return Array.from(this.freeDownloads.values()).some((d) => d.userId === userId);
  }

  async createFreeLicenseRequest(request: InsertFreeLicenseRequest & { userId: string }): Promise<FreeLicenseRequest> {
    const id = randomUUID();
    const req: FreeLicenseRequest = {
      id,
      userId: request.userId,
      requestedPlan: request.requestedPlan,
      status: "pending",
      createdAt: new Date(),
      approvedAt: null,
    };
    this.freeLicenseRequests.set(id, req);
    return req;
  }

  async getFreeLicenseRequest(id: string): Promise<FreeLicenseRequest | undefined> {
    return this.freeLicenseRequests.get(id);
  }

  async getFreeLicenseRequestsByUserId(userId: string): Promise<FreeLicenseRequest[]> {
    return Array.from(this.freeLicenseRequests.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllFreeLicenseRequests(): Promise<FreeLicenseRequest[]> {
    return Array.from(this.freeLicenseRequests.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async approveFreeLicenseRequest(id: string, licenseKey: string): Promise<FreeLicenseRequest | undefined> {
    const req = this.freeLicenseRequests.get(id);
    if (req) {
      req.status = "approved";
      req.approvedAt = new Date();
      this.freeLicenseRequests.set(id, req);
      return req;
    }
    return undefined;
  }

  async deleteCommunityPost(id: string): Promise<boolean> {
    return this.communityPosts.delete(id);
  }

  async getAdminSetting(key: string): Promise<string | null> {
    return this.adminSettingsMap.get(key) ?? null;
  }

  async setAdminSetting(key: string, value: string): Promise<AdminSetting> {
    this.adminSettingsMap.set(key, value);
    return { id: randomUUID(), key, value, updatedAt: new Date() };
  }

  async resetFreeDownloads(): Promise<number> {
    const count = this.freeDownloads.size;
    this.freeDownloads.clear();
    return count;
  }

  private adminSettingsMap: Map<string, string> = new Map();
}
export const storage = new DatabaseStorage(db);

