import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest, generateToken } from "../middleware/auth.js";
import bcrypt from "bcrypt";

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

router.post("/", authenticate, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    
    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "Bad Request", message: "Name, email, password, and role are required" });
      return;
    }

    if (!["customer", "kitchen"].includes(role)) {
      res.status(400).json({ error: "Bad Request", message: "Invalid role" });
      return;
    }

    // Check if user already exists
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existingUser) {
      res.status(409).json({ error: "Conflict", message: "User with this email already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || null,
      addresses: [],
      isBlocked: false,
    }).returning();

    res.status(201).json(formatUser(user));
  } catch (err) {
    console.error("Create user error:", err);
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
