import { Router } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { mealId, rating, comment } = req.body;
    if (!mealId || !rating) {
      res.status(400).json({ error: "Bad Request", message: "mealId and rating are required" });
      return;
    }
    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: "Bad Request", message: "Rating must be between 1 and 5" });
      return;
    }
    const [review] = await db.insert(reviewsTable).values({
      userId: req.userId!,
      mealId,
      rating,
      comment: comment || null,
    }).returning();

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    res.status(201).json({
      id: review.id,
      userId: review.userId,
      userName: user?.name ?? null,
      mealId: review.mealId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    });
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:mealId", async (req, res) => {
  try {
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.mealId, req.params.mealId))
      .orderBy(reviewsTable.createdAt);

    const userIds = [...new Set(reviews.map((r) => r.userId))];
    let userMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const users = await db.select().from(usersTable).where(inArray(usersTable.id, userIds));
      userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));
    }

    res.json(reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: userMap[r.userId] ?? null,
      mealId: r.mealId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
