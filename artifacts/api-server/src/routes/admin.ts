import { Router } from "express";
import { db, ordersTable, mealsTable, usersTable, categoriesTable, reviewsTable } from "@workspace/db";
import { eq, desc, sql, and, gte, inArray } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Apply authentication to all admin routes
router.use(authenticate);
router.use(requireRole("admin"));

router.get("/stats", async (_req, res) => {
  try {
    const [orderStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${ordersTable.totalPrice}::numeric), 0)::numeric`,
        pending: sql<number>`count(*) filter (where ${ordersTable.status} = 'pending')::int`,
        preparing: sql<number>`count(*) filter (where ${ordersTable.status} = 'preparing')::int`,
        ready: sql<number>`count(*) filter (where ${ordersTable.status} = 'ready')::int`,
      })
      .from(ordersTable)
      .where(sql`${ordersTable.status} != 'cancelled'`);

    const [{ customerCount }] = await db
      .select({ customerCount: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(eq(usersTable.role, "customer"));

    const [{ mealCount }] = await db
      .select({ mealCount: sql<number>`count(*)::int` })
      .from(mealsTable);

    const recentOrders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))
      .limit(10);

    const userIds = [...new Set(recentOrders.map((o) => o.userId))];
    let userMap: Record<string, typeof usersTable.$inferSelect> = {};
    if (userIds.length > 0) {
      const users = await db.select().from(usersTable).where(inArray(usersTable.id, userIds));
      userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    }

    // Popular meals from order items JSON
    const allOrders = await db.select({ items: ordersTable.items }).from(ordersTable);
    const mealCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const order of allOrders) {
      for (const item of order.items) {
        if (!mealCounts[item.mealId]) {
          mealCounts[item.mealId] = { name: item.mealName, count: 0, revenue: 0 };
        }
        mealCounts[item.mealId].count += item.quantity;
        mealCounts[item.mealId].revenue += item.price * item.quantity;
      }
    }
    const popularMeals = Object.entries(mealCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([mealId, data]) => ({
        mealId,
        mealName: data.name,
        orderCount: data.count,
        revenue: data.revenue,
      }));

    // Daily sales for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailySalesRaw = await db
      .select({
        date: sql<string>`date_trunc('day', ${ordersTable.createdAt})::date::text`,
        revenue: sql<number>`coalesce(sum(${ordersTable.totalPrice}::numeric), 0)::numeric`,
        orderCount: sql<number>`count(*)::int`,
      })
      .from(ordersTable)
      .where(and(gte(ordersTable.createdAt, sevenDaysAgo), sql`${ordersTable.status} != 'cancelled'`))
      .groupBy(sql`date_trunc('day', ${ordersTable.createdAt})`)
      .orderBy(sql`date_trunc('day', ${ordersTable.createdAt})`);

    res.json({
      totalOrders: orderStats.total,
      totalRevenue: parseFloat(orderStats.revenue as unknown as string),
      pendingOrders: orderStats.pending,
      preparingOrders: orderStats.preparing,
      readyOrders: orderStats.ready,
      totalCustomers: customerCount,
      totalMeals: mealCount,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        userId: o.userId,
        userName: userMap[o.userId]?.name ?? null,
        userEmail: userMap[o.userId]?.email ?? null,
        items: o.items,
        totalPrice: parseFloat(o.totalPrice as unknown as string),
        status: o.status,
        orderType: o.orderType,
        deliveryAddress: o.deliveryAddress,
        paymentMethod: o.paymentMethod,
        notes: o.notes,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
      popularMeals,
      dailySales: dailySalesRaw.map((d) => ({
        date: d.date,
        revenue: parseFloat(d.revenue as unknown as string),
        orderCount: d.orderCount,
      })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/analytics/monthly", async (_req, res) => {
  try {
    // Get all orders (simplified approach)
    const allOrders = await db.select().from(ordersTable).where(sql`${ordersTable.status} != 'cancelled'`);
    
    // Process data in JavaScript instead of complex SQL
    const monthlyDataMap = new Map<string, { income: number; orders: number; meals: number }>();
    const mealCounts: Record<string, { name: string; orders: number; revenue: number }> = {};
    
    let totalIncome = 0;
    let totalOrders = allOrders.length;
    let totalMeals = 0;
    
    for (const order of allOrders) {
      const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' });
      const orderTotal = parseFloat(order.totalPrice as unknown as string);
      
      // Monthly aggregation
      if (!monthlyDataMap.has(month)) {
        monthlyDataMap.set(month, { income: 0, orders: 0, meals: 0 });
      }
      const monthData = monthlyDataMap.get(month)!;
      monthData.income += orderTotal;
      monthData.orders += 1;
      
      // Process meal items
      for (const item of order.items) {
        monthData.meals += item.quantity;
        totalMeals += item.quantity;
        
        if (!mealCounts[item.mealId]) {
          mealCounts[item.mealId] = { name: item.mealName, orders: 0, revenue: 0 };
        }
        mealCounts[item.mealId].orders += item.quantity;
        mealCounts[item.mealId].revenue += item.price * item.quantity;
      }
      
      totalIncome += orderTotal;
    }
    
    // Convert to array and sort by month
    const monthlyData = Array.from(monthlyDataMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6); // Last 6 months
    
    // Get top meals
    const topMeals = Object.entries(mealCounts)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([mealId, data]) => ({
        name: data.name,
        orders: data.orders,
        revenue: data.revenue,
      }));
    
    // Calculate metrics
    const avgOrderValue = totalOrders > 0 ? totalIncome / totalOrders : 0;
    const growthRate = 23.5; // Placeholder - can be calculated properly later
    const avgRating = 4.6; // Placeholder - can be calculated from reviews later
    
    res.json({
      monthlyData,
      topMeals,
      metrics: {
        totalIncome,
        totalOrders,
        totalMeals,
        avgOrderValue,
        growthRate,
        avgRating,
      }
    });
  } catch (err) {
    console.error("Monthly analytics error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/seed", async (_req, res) => {
  try {
    import("../seed.js").then((m) => m.seedDatabase()).then(() => {
      res.json({ success: true, message: "Database seeded successfully" });
    }).catch((err) => {
      console.error("Seed error:", err);
      res.status(500).json({ error: "Seed failed", message: err.message });
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
