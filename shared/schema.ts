import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export enum UserRole {
  ADMIN = "admin",
  SELLER = "seller",
  BUYER = "buyer"
}

export enum SubscriptionTier {
  FREE = "free",
  PREMIUM = "premium",
  VIP = "vip"
}

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default(UserRole.BUYER),
  name: text("name").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

// Define showroom status enum
export enum ShowroomStatus {
  DRAFT = "draft",
  PUBLISHED = "published"
}

// Showroom table for sellers
export const showrooms = pgTable("showrooms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  headerImage: text("header_image"),
  address: text("address"),
  city: text("city").notNull(),
  country: text("country").notNull(),
  phone: text("phone"),
  email: text("email"),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  website: text("website"),
  openingHours: text("opening_hours"),
  status: text("status").default(ShowroomStatus.DRAFT),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShowroomSchema = createInsertSchema(showrooms).omit({
  id: true,
  userId: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
});

// Car listing table
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  showroomId: integer("showroom_id").notNull().references(() => showrooms.id),
  title: text("title").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: integer("price").notNull(),
  mileage: integer("mileage").notNull(),
  color: text("color"),
  vin: text("vin"),
  transmission: text("transmission").notNull(),
  fuelType: text("fuel_type").notNull(),
  category: text("category"),
  description: text("description"),
  features: json("features").$type<string[]>().default([]),
  condition: text("condition"),
  images: json("images").$type<string[]>().default([]),
  isSold: boolean("is_sold").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCarSchema = createInsertSchema(cars).omit({
  id: true, 
  createdAt: true,
});

// Message table for communication between buyers and sellers
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("from_user_id").notNull().references(() => users.id),
  receiverId: integer("to_user_id").notNull().references(() => users.id),
  carId: integer("car_id").references(() => cars.id),
  content: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Favorite cars for buyers
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  carId: integer("car_id").notNull().references(() => cars.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

// Subscription table for sellers
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tier: text("tier").notNull().default(SubscriptionTier.FREE),
  status: text("status").default("active"), // 'active' or 'inactive'
  listingLimit: integer("listing_limit").default(3),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Types for ORM
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Showroom = typeof showrooms.$inferSelect;
export type InsertShowroom = z.infer<typeof insertShowroomSchema>;

export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Extended schemas for validation
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export const carSearchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  priceRange: z.string().optional(),
  category: z.string().optional(),
  year: z.number().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
});

export type CarSearchParams = z.infer<typeof carSearchSchema>;
