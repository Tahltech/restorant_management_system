import { Router } from "express";
import { db, ordersTable, mealsTable, usersTable } from "@workspace/db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth.js";
import type { OrderItemData } from "@workspace/db";

const router = Router();

function formatOrder(order: typeof ordersTable.$inferSelect, user?: typeof usersTable.$inferSelect) {
  return {
    id: order.id,
    userId: order.userId,
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
    items: order.items,
    totalPrice: parseFloat(order.totalPrice as string),
    status: order.status,
    orderType: order.orderType,
    deliveryAddress: order.deliveryAddress,
    paymentMethod: order.paymentMethod,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { items, orderType, deliveryAddress, paymentMethod, notes } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Bad Request", message: "Items are required" });
      return;
    }
    if (orderType === "delivery" && !deliveryAddress) {
      res.status(400).json({ error: "Bad Request", message: "Delivery address is required for delivery orders" });
      return;
    }

    const mealIds = items.map((i: { mealId: string }) => i.mealId);
    const meals = await db.select().from(mealsTable).where(inArray(mealsTable.id, mealIds));
    const mealMap = new Map(meals.map((m) => [m.id, m]));

    let totalPrice = 0;
    const orderItems: OrderItemData[] = [];
    for (const item of items) {
      const meal = mealMap.get(item.mealId);
      if (!meal) {
        res.status(400).json({ error: "Bad Request", message: `Meal ${item.mealId} not found` });
        return;
      }
      if (!meal.available) {
        res.status(400).json({ error: "Bad Request", message: `${meal.name} is not available` });
        return;
      }
      const itemPrice = parseFloat(meal.price) * item.quantity;
      totalPrice += itemPrice;
      orderItems.push({
        mealId: meal.id,
        mealName: meal.name,
        quantity: item.quantity,
        price: parseFloat(meal.price),
        imageUrl: meal.imageUrl,
      });
    }

    const [order] = await db.insert(ordersTable).values({
      userId: req.userId!,
      items: orderItems,
      totalPrice: totalPrice.toFixed(2),
      status: "pending",
      orderType: orderType || "delivery",
      deliveryAddress: deliveryAddress || null,
      paymentMethod: paymentMethod || "cash",
      notes: notes || null,
    }).returning();

    res.status(201).json(formatOrder(order));
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", authenticate, requireRole("admin", "kitchen"), async (req: AuthRequest, res) => {
  try {
    const { status, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, parseInt(limit as string));
    const offset = (pageNum - 1) * limitNum;

    const where = status ? eq(ordersTable.status, status as "pending" | "preparing" | "ready" | "delivered" | "cancelled") : undefined;

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(where);
    const orders = await db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset);

    const userIds = [...new Set(orders.map((o) => o.userId))];
    let userMap: Record<string, typeof usersTable.$inferSelect> = {};
    if (userIds.length > 0) {
      const users = await db.select().from(usersTable).where(inArray(usersTable.id, userIds));
      userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    }

    res.json({
      orders: orders.map((o) => formatOrder(o, userMap[o.userId])),
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (err) {
    console.error("List all orders error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/my-orders", authenticate, async (req: AuthRequest, res) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, parseInt(limit as string));
    const offset = (pageNum - 1) * limitNum;

    const where = eq(ordersTable.userId, req.userId!);
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(where);
    const orders = await db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset);

    res.json({
      orders: orders.map((o) => formatOrder(o)),
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (err) {
    console.error("List my orders error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.id)).limit(1);
    if (!order) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (req.userRole === "customer" && order.userId !== req.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    let user: typeof usersTable.$inferSelect | undefined;
    if (req.userRole !== "customer") {
      const [u] = await db.select().from(usersTable).where(eq(usersTable.id, order.userId));
      user = u;
    }
    res.json(formatOrder(order, user));
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id/status", authenticate, requireRole("admin", "kitchen"), async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "preparing", "ready", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Bad Request", message: "Invalid status" });
      return;
    }
    const [order] = await db
      .update(ordersTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(ordersTable.id, req.params.id))
      .returning();
    if (!order) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(formatOrder(order));
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id/cancel", authenticate, async (req: AuthRequest, res) => {
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.id)).limit(1);
    if (!order) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (req.userRole === "customer" && order.userId !== req.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (order.status !== "pending") {
      res.status(400).json({ error: "Bad Request", message: "Only pending orders can be cancelled" });
      return;
    }
    const [updated] = await db
      .update(ordersTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(ordersTable.id, req.params.id))
      .returning();
    res.json(formatOrder(updated));
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
