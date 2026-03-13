import { Router } from "express";
import { db, categoriesTable, mealsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
    const mealCounts = await db
      .select({ categoryId: mealsTable.categoryId, count: sql<number>`count(*)::int` })
      .from(mealsTable)
      .where(eq(mealsTable.available, true))
      .groupBy(mealsTable.categoryId);

    const countMap = new Map(mealCounts.map((m) => [m.categoryId, m.count]));

    res.json(
      cats.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        imageUrl: c.imageUrl,
        mealCount: countMap.get(c.id) || 0,
        createdAt: c.createdAt,
      }))
    );
  } catch (err) {
    console.error("List categories error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticate, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    if (!name) {
      res.status(400).json({ error: "Bad Request", message: "Name is required" });
      return;
    }
    const [cat] = await db.insert(categoriesTable).values({ name, description, imageUrl }).returning();
    res.status(201).json({ ...cat, mealCount: 0 });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", authenticate, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    const [cat] = await db
      .update(categoriesTable)
      .set({ name, description, imageUrl, updatedAt: new Date() })
      .where(eq(categoriesTable.id, req.params.id))
      .returning();
    if (!cat) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json({ ...cat, mealCount: 0 });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, req.params.id));
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
