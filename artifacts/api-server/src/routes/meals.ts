import { Router } from "express";
import { db, mealsTable, categoriesTable, reviewsTable } from "@workspace/db";
import { eq, ilike, and, sql, desc, inArray } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/all", async (req, res) => {
  try {
    const meals = await db
      .select()
      .from(mealsTable)
      .orderBy(desc(mealsTable.createdAt));

    const mealIds = meals.map((m) => m.id);
    let reviewStats: Record<string, { avg: number; count: number }> = {};

    if (mealIds.length > 0) {
      const stats = await db
        .select({
          mealId: reviewsTable.mealId,
          avg: sql<number>`avg(${reviewsTable.rating})::numeric(3,2)`,
          count: sql<number>`count(*)::int`,
        })
        .from(reviewsTable)
        .where(inArray(reviewsTable.mealId, mealIds))
        .groupBy(reviewsTable.mealId);
      reviewStats = Object.fromEntries(stats.map((s) => [s.mealId, { avg: s.avg, count: s.count }]));
    }

    const catIds = [...new Set(meals.map((m) => m.categoryId).filter((id): id is string => !!id))];
    let catMap: Record<string, string> = {};
    if (catIds.length > 0) {
      const cats = await db.select().from(categoriesTable).where(inArray(categoriesTable.id, catIds));
      catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
    }

    res.json(meals.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      categoryId: m.categoryId,
      categoryName: m.categoryId ? catMap[m.categoryId] : null,
      price: parseFloat(m.price),
      imageUrl: m.imageUrl,
      available: m.available,
      ingredients: m.ingredients,
      preparationTime: m.preparationTime,
      averageRating: reviewStats[m.id]?.avg ?? null,
      reviewCount: reviewStats[m.id]?.count ?? 0,
      createdAt: m.createdAt,
    })));
  } catch (err) {
    console.error("List all meals error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { categoryId, search, available, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (categoryId) conditions.push(eq(mealsTable.categoryId, categoryId as string));
    if (search) conditions.push(ilike(mealsTable.name, `%${search}%`));
    if (available !== undefined) conditions.push(eq(mealsTable.available, available === "true"));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(mealsTable)
      .where(whereClause);

    const meals = await db
      .select()
      .from(mealsTable)
      .where(whereClause)
      .orderBy(desc(mealsTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const mealIds = meals.map((m) => m.id);
    let reviewStats: Record<string, { avg: number; count: number }> = {};

    if (mealIds.length > 0) {
      const stats = await db
        .select({
          mealId: reviewsTable.mealId,
          avg: sql<number>`avg(${reviewsTable.rating})::numeric(3,2)`,
          count: sql<number>`count(*)::int`,
        })
        .from(reviewsTable)
        .where(inArray(reviewsTable.mealId, mealIds))
        .groupBy(reviewsTable.mealId);
      reviewStats = Object.fromEntries(stats.map((s) => [s.mealId, { avg: s.avg, count: s.count }]));
    }

    const catIds = [...new Set(meals.map((m) => m.categoryId).filter((id): id is string => !!id))];
    let catMap: Record<string, string> = {};
    if (catIds.length > 0) {
      const cats = await db.select().from(categoriesTable).where(inArray(categoriesTable.id, catIds));
      catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
    }

    res.json({
      meals: meals.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        categoryId: m.categoryId,
        categoryName: m.categoryId ? catMap[m.categoryId] : null,
        price: parseFloat(m.price),
        imageUrl: m.imageUrl,
        available: m.available,
        ingredients: m.ingredients,
        preparationTime: m.preparationTime,
        averageRating: reviewStats[m.id]?.avg ?? null,
        reviewCount: reviewStats[m.id]?.count ?? 0,
        createdAt: m.createdAt,
      })),
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (err) {
    console.error("List meals error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [meal] = await db.select().from(mealsTable).where(eq(mealsTable.id, req.params.id)).limit(1);
    if (!meal) {
      res.status(404).json({ error: "Not Found", message: "Meal not found" });
      return;
    }
    const [stats] = await db
      .select({
        avg: sql<number>`avg(${reviewsTable.rating})::numeric(3,2)`,
        count: sql<number>`count(*)::int`,
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.mealId, meal.id));

    let categoryName: string | null = null;
    if (meal.categoryId) {
      const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, meal.categoryId));
      categoryName = cat?.name ?? null;
    }

    res.json({
      id: meal.id,
      name: meal.name,
      description: meal.description,
      categoryId: meal.categoryId,
      categoryName,
      price: parseFloat(meal.price),
      imageUrl: meal.imageUrl,
      available: meal.available,
      ingredients: meal.ingredients,
      preparationTime: meal.preparationTime,
      averageRating: stats?.avg ?? null,
      reviewCount: stats?.count ?? 0,
      createdAt: meal.createdAt,
    });
  } catch (err) {
    console.error("Get meal error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticate, requireRole("admin", "kitchen"), async (req: AuthRequest, res) => {
  try {
    const { name, description, categoryId, price, imageUrl, available, ingredients, preparationTime } = req.body;
    if (!name || price === undefined) {
      res.status(400).json({ error: "Bad Request", message: "Name and price are required" });
      return;
    }
    const [meal] = await db.insert(mealsTable).values({
      name,
      description,
      categoryId: categoryId || null,
      price: price.toString(),
      imageUrl,
      available: available !== false,
      ingredients: ingredients || [],
      preparationTime: preparationTime || 15,
    }).returning();
    res.status(201).json({ ...meal, price: parseFloat(meal.price), averageRating: null, reviewCount: 0, categoryName: null });
  } catch (err) {
    console.error("Create meal error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", authenticate, requireRole("admin", "kitchen"), async (req: AuthRequest, res) => {
  try {
    const { name, description, categoryId, price, imageUrl, available, ingredients, preparationTime } = req.body;
    const [meal] = await db
      .update(mealsTable)
      .set({
        name,
        description,
        categoryId: categoryId || null,
        price: price?.toString(),
        imageUrl,
        available,
        ingredients,
        preparationTime,
        updatedAt: new Date(),
      })
      .where(eq(mealsTable.id, req.params.id))
      .returning();
    if (!meal) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json({ ...meal, price: parseFloat(meal.price), averageRating: null, reviewCount: 0, categoryName: null });
  } catch (err) {
    console.error("Update meal error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", authenticate, requireRole("admin", "kitchen"), async (req: AuthRequest, res) => {
  try {
    await db.delete(mealsTable).where(eq(mealsTable.id, req.params.id));
    res.json({ success: true, message: "Meal deleted" });
  } catch (err) {
    console.error("Delete meal error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
