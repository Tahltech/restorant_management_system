import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth.js";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    profileImage: user.profileImage,
    addresses: user.addresses,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
  };
}

router.get("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, phone, profileImage, addresses } = req.body;
    const [user] = await db
      .update(usersTable)
      .set({ name, phone, profileImage, addresses, updatedAt: new Date() })
      .where(eq(usersTable.id, req.userId!))
      .returning();
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", authenticate, requireRole("admin"), async (_req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    res.json(users.map(formatUser));
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id/block", authenticate, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { blocked } = req.body;
    const [user] = await db
      .update(usersTable)
      .set({ isBlocked: blocked, updatedAt: new Date() })
      .where(eq(usersTable.id, req.params.id))
      .returning();
    if (!user) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
