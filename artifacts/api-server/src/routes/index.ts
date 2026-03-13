import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import categoriesRouter from "./categories.js";
import mealsRouter from "./meals.js";
import ordersRouter from "./orders.js";
import usersRouter from "./users.js";
import reviewsRouter from "./reviews.js";
import adminRouter from "./admin.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { seedDatabase } from "../seed.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/categories", categoriesRouter);
router.use("/meals", mealsRouter);
router.use("/orders", ordersRouter);
router.use("/users", usersRouter);
router.use("/reviews", reviewsRouter);
// Public seed endpoint for demo setup (must be before the admin auth middleware)
router.post("/admin/seed", async (_req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: "Database seeded successfully" });
  } catch (err: any) {
    console.error("Seed error:", err);
    res.status(500).json({ error: "Seed failed", message: err.message });
  }
});

router.use("/admin", authenticate, requireRole("admin", "kitchen"), adminRouter);

export default router;
