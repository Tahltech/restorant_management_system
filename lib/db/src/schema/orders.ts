import { pgTable, text, timestamp, numeric, pgEnum, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["cash", "card", "online"]);
export const orderTypeEnum = pgEnum("order_type", ["delivery", "pickup"]);

export type OrderItemData = {
  mealId: string;
  mealName: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
};

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  items: json("items").$type<OrderItemData[]>().notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  orderType: orderTypeEnum("order_type").notNull().default("delivery"),
  deliveryAddress: text("delivery_address"),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cash"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
