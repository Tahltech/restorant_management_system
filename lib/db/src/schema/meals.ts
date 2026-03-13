import { pgTable, text, timestamp, boolean, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const mealsTable = pgTable("meals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: text("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  available: boolean("available").notNull().default(true),
  ingredients: text("ingredients").array().notNull().default([]),
  preparationTime: integer("preparation_time").notNull().default(15),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMealSchema = createInsertSchema(mealsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof mealsTable.$inferSelect;
